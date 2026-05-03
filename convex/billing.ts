import { Polar } from "@convex-dev/polar"
import { PolarCore } from "@polar-sh/sdk/core.js"
import { customersCreate } from "@polar-sh/sdk/funcs/customersCreate.js"
import { customersList } from "@polar-sh/sdk/funcs/customersList.js"
import { eventsIngest } from "@polar-sh/sdk/funcs/eventsIngest.js"
import { v } from "convex/values"
import {
  internalAction,
  internalMutation,
  mutation,
  query,
} from "./_generated/server"
import { api, components, internal } from "./_generated/api"
import type { DataModel } from "./_generated/dataModel"
import type { MutationCtx, QueryCtx } from "./_generated/server"
import { authComponent, requireAdmin, requireAuth } from "./auth"
import {
  ACTIVE_SUBSCRIPTION_STATUSES,
  BILLING_CREDIT_VALUE_USD,
  BILLING_TRIAL,
  CREDIT_LEDGER_EXTERNAL_ID_PREFIX,
  CREDIT_LEDGER_SOURCE,
  creditsForVendorCost,
  getSubscriptionProductIds,
  POLAR_DEFAULT_SERVER,
  POLAR_ENV,
  POLAR_METADATA_KEYS,
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanKey,
  USAGE_SOURCE,
} from "../lib/billing"

const productIds = getSubscriptionProductIds()

function getPlanByProductId(productId: string) {
  const entry = Object.entries(SUBSCRIPTION_PLANS).find(
    ([key]) => productIds[key as SubscriptionPlanKey] === productId
  )
  if (!entry) return null
  return { key: entry[0] as SubscriptionPlanKey, ...entry[1] }
}

async function getOrCreateBillingState(ctx: MutationCtx, userId: string) {
  const existing = await ctx.db
    .query("userBillingState")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique()

  if (existing) return existing

  const now = Date.now()
  const trialExpiresAt = now + BILLING_TRIAL.days * 24 * 60 * 60 * 1000
  await ctx.db.insert("userBillingState", {
    userId,
    creditBalance: BILLING_TRIAL.credits,
    trialGrantedAt: now,
    trialExpiresAt,
    updatedAt: now,
  })
  await ctx.db.insert("creditLedger", {
    userId,
    source: CREDIT_LEDGER_SOURCE.trialGrant,
    credits: BILLING_TRIAL.credits,
    vendorCostUsd: 0,
    revenueUsd: BILLING_TRIAL.credits * BILLING_CREDIT_VALUE_USD,
    externalId: `${CREDIT_LEDGER_EXTERNAL_ID_PREFIX.trial}:${userId}`,
    metadata: { expiresAt: trialExpiresAt, days: BILLING_TRIAL.days },
  })

  const created = await ctx.db
    .query("userBillingState")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique()
  if (!created) throw new Error("Failed to initialize billing state")
  return created
}

async function requireBillingUser(ctx: QueryCtx | MutationCtx) {
  const identity = await requireAuth(ctx)
  const user = await authComponent.safeGetAuthUser(ctx)
  if (!user?._id) throw new Error("Authenticated user not found")
  return { identity, billingUserId: user._id }
}

export const polar: Polar<DataModel, typeof productIds> = new Polar<
  DataModel,
  typeof productIds
>(components.polar, {
  products: productIds,
  getUserInfo: async (ctx): Promise<{ userId: string; email: string }> => {
    const user = (await ctx.runQuery(api.adminUsers.getCurrentUser, {})) as {
      _id: string
      email?: string
    } | null
    if (!user?.email) throw new Error("Authenticated user is missing email")

    return {
      userId: user._id,
      email: user.email,
    }
  },
})

export const {
  changeCurrentSubscription,
  cancelCurrentSubscription,
  getConfiguredProducts,
  listAllProducts,
  listAllSubscriptions,
  generateCheckoutLink,
  generateCustomerPortalUrl,
} = polar.api()

export const syncProducts = internalAction({
  args: {},
  handler: async (ctx) => {
    await polar.syncProducts(ctx)
  },
})

export const getStatus = query({
  args: {},
  handler: async (ctx) => {
    const { billingUserId } = await requireBillingUser(ctx)
    const state = await ctx.db
      .query("userBillingState")
      .withIndex("by_userId", (q) => q.eq("userId", billingUserId))
      .unique()

    let subscription = null
    try {
      subscription = await polar.getCurrentSubscription(ctx, {
        userId: billingUserId,
      })
    } catch (error) {
      // Product may not be synced yet — log but don't crash the page.
      // Run billing:syncProducts to fix.
      console.error("Failed to fetch subscription (run syncProducts):", error)
    }

    return {
      billingUserId,
      creditBalance: state?.creditBalance ?? 0,
      trialExpiresAt: state?.trialExpiresAt ?? null,
      subscription,
      plans: Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => ({
        key,
        name: plan.name,
        productId: productIds[key as SubscriptionPlanKey] ?? null,
        priceUsd: plan.priceUsd,
        credits: plan.credits,
      })),
    }
  },
})

export const listLedger = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { billingUserId } = await requireBillingUser(ctx)
    return await ctx.db
      .query("creditLedger")
      .withIndex("by_userId", (q) => q.eq("userId", billingUserId))
      .order("desc")
      .take(Math.min(args.limit ?? 100, 500))
  },
})

export const listLedgerByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    return await ctx.db
      .query("creditLedger")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(500)
  },
})

export const ensureReadyForPaidAction = mutation({
  args: {},
  handler: async (ctx) => {
    const { billingUserId } = await requireBillingUser(ctx)
    const state = await getOrCreateBillingState(ctx, billingUserId)
    const now = Date.now()

    if (
      state.trialExpiresAt &&
      state.trialExpiresAt <= now &&
      !state.activeSubscriptionId
    ) {
      throw new Error(
        "Your trial credits have expired. Choose a subscription to continue."
      )
    }

    if (state.creditBalance <= 0) {
      throw new Error(
        "You are out of credits. Choose a subscription to continue."
      )
    }

    return { creditBalance: state.creditBalance }
  },
})

export const recordAiUsage = mutation({
  args: {
    source: v.union(
      v.literal(USAGE_SOURCE.chat),
      v.literal(USAGE_SOURCE.title),
      v.literal(USAGE_SOURCE.toolCall)
    ),
    chatId: v.optional(v.id("chats")),
    model: v.string(),
    providerId: v.optional(v.string()),
    cacheReadTokens: v.number(),
    cacheWriteTokens: v.number(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    totalTokens: v.number(),
    cost: v.number(),
  },
  handler: async (ctx, args) => {
    const { identity, billingUserId } = await requireBillingUser(ctx)

    if (args.chatId) {
      const chat = await ctx.db.get(args.chatId)
      if (!chat || chat.userId !== identity.tokenIdentifier) {
        throw new Error("Chat not found")
      }
    }

    const state = await getOrCreateBillingState(ctx, billingUserId)
    const cost = Math.max(0, args.cost)
    const credits = creditsForVendorCost(cost)

    const usageId = await ctx.db.insert("usage", {
      ...args,
      cost,
      userId: billingUserId,
    })

    if (credits > 0) {
      await ctx.db.patch(state._id, {
        creditBalance: Math.max(0, state.creditBalance - credits),
        updatedAt: Date.now(),
      })
    }

    await ctx.db.insert("creditLedger", {
      userId: billingUserId,
      source:
        args.source === USAGE_SOURCE.chat
          ? CREDIT_LEDGER_SOURCE.aiChat
          : CREDIT_LEDGER_SOURCE.aiTitle,
      credits: -credits,
      vendorCostUsd: cost,
      revenueUsd: credits * BILLING_CREDIT_VALUE_USD,
      chatId: args.chatId,
      model: args.model,
      externalId: `${CREDIT_LEDGER_EXTERNAL_ID_PREFIX.usage}:${usageId}`,
      metadata: {
        cacheReadTokens: args.cacheReadTokens,
        cacheWriteTokens: args.cacheWriteTokens,
        inputTokens: args.inputTokens,
        outputTokens: args.outputTokens,
        totalTokens: args.totalTokens,
        uncoveredCredits: Math.max(0, credits - state.creditBalance),
      },
    })

    await ctx.scheduler.runAfter(0, internal.billing.ingestPolarUsageEvent, {
      userId: billingUserId,
      eventName: "ai_usage",
      externalId: `${CREDIT_LEDGER_EXTERNAL_ID_PREFIX.usage}:${usageId}`,
      costAmountCents: cost * 100,
      llm: {
        vendor: args.providerId ?? args.model.split("/")[0] ?? "unknown",
        model: args.model,
        inputTokens: args.inputTokens,
        cachedInputTokens: args.cacheReadTokens,
        outputTokens: args.outputTokens,
        totalTokens: args.totalTokens,
      },
    })

    return usageId
  },
})

export const recordToolCall = mutation({
  args: {
    chatId: v.optional(v.id("chats")),
    toolCallId: v.optional(v.string()),
    toolName: v.string(),
    vendorCostUsd: v.number(),
    credits: v.number(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { identity, billingUserId } = await requireBillingUser(ctx)

    if (args.chatId) {
      const chat = await ctx.db.get(args.chatId)
      if (!chat || chat.userId !== identity.tokenIdentifier) {
        throw new Error("Chat not found")
      }
    }

    const credits = Math.max(0, args.credits)
    const vendorCostUsd = Math.max(0, args.vendorCostUsd)

    const state = await getOrCreateBillingState(ctx, billingUserId)
    if (credits > 0) {
      await ctx.db.patch(state._id, {
        creditBalance: Math.max(0, state.creditBalance - credits),
        updatedAt: Date.now(),
      })
    }

    const metadata =
      typeof args.metadata === "object" &&
      args.metadata !== null &&
      !Array.isArray(args.metadata)
        ? args.metadata
        : args.metadata === undefined
          ? {}
          : { value: args.metadata }

    const ledgerExternalId = args.toolCallId
      ? `${CREDIT_LEDGER_EXTERNAL_ID_PREFIX.tool}:${args.toolCallId}`
      : undefined

    await ctx.db.insert("usage", {
      userId: billingUserId,
      source: USAGE_SOURCE.toolCall,
      chatId: args.chatId,
      toolName: args.toolName,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      cost: vendorCostUsd,
    })

    const ledgerId = await ctx.db.insert("creditLedger", {
      userId: billingUserId,
      source: CREDIT_LEDGER_SOURCE.toolCall,
      credits: -credits,
      vendorCostUsd,
      revenueUsd: credits * BILLING_CREDIT_VALUE_USD,
      chatId: args.chatId,
      toolName: args.toolName,
      ...(ledgerExternalId ? { externalId: ledgerExternalId } : {}),
      metadata: {
        ...metadata,
        uncoveredCredits: Math.max(0, credits - state.creditBalance),
      },
    })

    if (credits > 0) {
      await ctx.scheduler.runAfter(0, internal.billing.ingestPolarUsageEvent, {
        userId: billingUserId,
        eventName: "tool_call",
        externalId: ledgerExternalId ?? `tool:${ledgerId}`,
        costAmountCents: vendorCostUsd * 100,
        extraMetadata: {
          tool_name: args.toolName,
          credits,
        },
      })
    }

    return ledgerId
  },
})

export const grantSubscriptionCredits = internalMutation({
  args: {
    userId: v.string(),
    subscriptionId: v.string(),
    productId: v.string(),
    status: v.string(),
    currentPeriodStart: v.string(),
    currentPeriodEnd: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const plan = getPlanByProductId(args.productId)
    if (!plan) return null

    const state = await getOrCreateBillingState(ctx, args.userId)
    const grantKey = `${args.subscriptionId}:${args.currentPeriodStart}`
    const now = Date.now()
    const isActive = ACTIVE_SUBSCRIPTION_STATUSES.includes(
      args.status as (typeof ACTIVE_SUBSCRIPTION_STATUSES)[number]
    )

    await ctx.db.patch(
      state._id,
      isActive
        ? {
            activeSubscriptionId: args.subscriptionId,
            activeSubscriptionProductId: args.productId,
            activeSubscriptionStatus: args.status,
            ...(args.currentPeriodEnd
              ? { activeSubscriptionCurrentPeriodEnd: args.currentPeriodEnd }
              : {}),
            updatedAt: now,
          }
        : {
            activeSubscriptionStatus: args.status,
            updatedAt: now,
          }
    )

    if (!isActive || state.lastSubscriptionGrantKey === grantKey) {
      return null
    }

    await ctx.db.patch(state._id, {
      creditBalance: state.creditBalance + plan.credits,
      lastSubscriptionGrantKey: grantKey,
      updatedAt: now,
    })

    return await ctx.db.insert("creditLedger", {
      userId: args.userId,
      source: CREDIT_LEDGER_SOURCE.subscriptionGrant,
      credits: plan.credits,
      vendorCostUsd: 0,
      revenueUsd: plan.priceUsd,
      externalId: `${CREDIT_LEDGER_EXTERNAL_ID_PREFIX.subscription}:${grantKey}`,
      metadata: {
        planKey: plan.key,
        planName: plan.name,
        productId: args.productId,
        subscriptionId: args.subscriptionId,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        status: args.status,
      },
    })
  },
})

export const setPolarCustomerId = internalMutation({
  args: {
    userId: v.string(),
    polarCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    const state = await getOrCreateBillingState(ctx, args.userId)
    await ctx.db.patch(state._id, {
      polarCustomerId: args.polarCustomerId,
      updatedAt: Date.now(),
    })
  },
})

export const ensurePolarCustomerForUser = internalAction({
  args: {
    userId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingComponentCustomer = await ctx.runQuery(
      components.polar.lib.getCustomerByUserId,
      { userId: args.userId }
    )

    if (existingComponentCustomer) {
      await ctx.runMutation(internal.billing.setPolarCustomerId, {
        userId: args.userId,
        polarCustomerId: existingComponentCustomer.id,
      })
      return existingComponentCustomer.id
    }

    const polarClient = new PolarCore({
      accessToken: process.env[POLAR_ENV.organizationToken] ?? "",
      server:
        (process.env[POLAR_ENV.server] as "sandbox" | "production") ??
        POLAR_DEFAULT_SERVER,
    })

    const matchingCustomers = await customersList(polarClient, {
      email: args.email,
      limit: 1,
    })
    if (!matchingCustomers.ok) {
      throw matchingCustomers.error
    }

    const existingPolarCustomer = matchingCustomers.value.result.items[0]
    const customer =
      existingPolarCustomer ??
      (await customersCreate(polarClient, {
        email: args.email,
        externalId: args.userId,
        name: args.name,
        metadata: { [POLAR_METADATA_KEYS.userId]: args.userId },
      }).then((result) => {
        if (!result.ok) throw result.error
        return result.value
      }))

    await ctx.runMutation(components.polar.lib.insertCustomer, {
      id: customer.id,
      userId: args.userId,
      metadata: {
        [POLAR_METADATA_KEYS.userId]: args.userId,
        email: args.email,
      },
    })
    await ctx.runMutation(internal.billing.setPolarCustomerId, {
      userId: args.userId,
      polarCustomerId: customer.id,
    })

    return customer.id
  },
})

export const ingestPolarUsageEvent = internalAction({
  args: {
    userId: v.string(),
    eventName: v.string(),
    externalId: v.optional(v.string()),
    costAmountCents: v.number(),
    llm: v.optional(
      v.object({
        vendor: v.string(),
        model: v.string(),
        inputTokens: v.number(),
        cachedInputTokens: v.optional(v.number()),
        outputTokens: v.number(),
        totalTokens: v.number(),
      })
    ),
    extraMetadata: v.optional(v.any()),
  },
  handler: async (_ctx, args) => {
    const accessToken = process.env[POLAR_ENV.organizationToken] ?? ""
    if (!accessToken) {
      console.warn("Polar access token not configured, skipping event ingestion")
      return
    }

    const polarClient = new PolarCore({
      accessToken,
      server:
        (process.env[POLAR_ENV.server] as "sandbox" | "production") ??
        POLAR_DEFAULT_SERVER,
    })

    const metadata: Record<string, unknown> = {
      _cost: {
        amount: Math.round(args.costAmountCents * 1e10) / 1e10,
        currency: "usd",
      },
    }

    if (args.llm) {
      metadata._llm = {
        vendor: args.llm.vendor,
        model: args.llm.model,
        inputTokens: args.llm.inputTokens,
        cachedInputTokens: args.llm.cachedInputTokens,
        outputTokens: args.llm.outputTokens,
        totalTokens: args.llm.totalTokens,
      }
    }

    if (args.extraMetadata && typeof args.extraMetadata === "object") {
      for (const [key, value] of Object.entries(
        args.extraMetadata as Record<string, unknown>
      )) {
        metadata[key] = value
      }
    }

    const result = await eventsIngest(polarClient, {
      events: [
        {
          name: args.eventName,
          externalCustomerId: args.userId,
          ...(args.externalId ? { externalId: args.externalId } : {}),
          metadata: metadata as Record<string, never>,
        },
      ],
    })

    if (!result.ok) {
      console.error("Failed to ingest event to Polar:", result.error)
    }
  },
})

export const recordManualAdjustment = mutation({
  args: {
    userId: v.string(),
    credits: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    const state = await getOrCreateBillingState(ctx, args.userId)
    await ctx.db.patch(state._id, {
      creditBalance: state.creditBalance + args.credits,
      updatedAt: Date.now(),
    })
    return await ctx.db.insert("creditLedger", {
      userId: args.userId,
      source: CREDIT_LEDGER_SOURCE.manualAdjustment,
      credits: args.credits,
      vendorCostUsd: 0,
      revenueUsd: args.credits * BILLING_CREDIT_VALUE_USD,
      metadata: { reason: args.reason },
    })
  },
})

/**
 * Reconciliation: verify that SUM(creditLedger.credits) matches
 * userBillingState.creditBalance for each user. Logs mismatches
 * so they can be investigated. Designed to run on a cron schedule.
 *
 * Processes one user per invocation to stay within Convex's single-paginate
 * limit. Schedules itself to continue with the next user until done.
 */
export const reconcileCreditBalances = internalMutation({
  args: {
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Paginate one user at a time
    const page = await ctx.db
      .query("userBillingState")
      .paginate({ numItems: 1, cursor: args.cursor ?? null })

    const state = page.page[0]
    if (!state) {
      console.log("[billing-reconciliation] Finished — no more users to check")
      return
    }

    // Sum all ledger entries for this user using async iteration (no paginate)
    let ledgerSum = 0
    for await (const entry of ctx.db
      .query("creditLedger")
      .withIndex("by_userId", (q) => q.eq("userId", state.userId))) {
      ledgerSum += entry.credits
    }

    const drift = state.creditBalance - ledgerSum
    if (Math.abs(drift) > 0.001) {
      console.error(
        `[billing-reconciliation] MISMATCH userId=${state.userId} ` +
          `stateBalance=${state.creditBalance} ledgerSum=${ledgerSum} drift=${drift}`
      )
    }

    // Schedule next user if there are more
    if (!page.isDone) {
      await ctx.scheduler.runAfter(
        0,
        internal.billing.reconcileCreditBalances,
        { cursor: page.continueCursor }
      )
    } else {
      console.log("[billing-reconciliation] All users reconciled")
    }
  },
})
