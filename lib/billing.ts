export const BILLING_CREDIT_VALUE_USD = 0.01
export const MAX_VENDOR_COST_PER_CREDIT_USD = 0.0015

export const BILLING_TRIAL = {
  credits: 100,
  days: 30,
} as const

export const BILLING_INTERVAL = {
  monthly: "monthly",
  yearly: "yearly",
} as const

export type BillingInterval =
  (typeof BILLING_INTERVAL)[keyof typeof BILLING_INTERVAL]

export const YEARLY_SUBSCRIPTION_DISCOUNT = 0.2

export const BILLING_GENERATION_GUARD = {
  minimumCreditsBeforeGeneration: 1,
} as const

export const POLAR_ENV = {
  organizationToken: "POLAR_ORGANIZATION_TOKEN",
  webhookSecret: "POLAR_WEBHOOK_SECRET",
  server: "POLAR_SERVER",
} as const

export const POLAR_DEFAULT_SERVER = "sandbox"

/**
 * Required scopes for the Polar Organization Access Token.
 * Per @convex-dev/polar docs, plus events:write for usage ingestion.
 * Ensure your token has ALL of these enabled in the Polar dashboard.
 */
export const POLAR_TOKEN_SCOPES = [
  "checkouts:read",
  "checkouts:write",
  "checkout_links:read",
  "checkout_links:write",
  "customer_portal:read",
  "customer_portal:write",
  "customer_sessions:write",
  "customers:read",
  "customers:write",
  "events:write",
  "products:read",
  "products:write",
  "subscriptions:read",
  "subscriptions:write",
] as const

export const POLAR_METADATA_KEYS = {
  userId: "userId",
} as const

export const POLAR_WEBHOOK_EVENTS = {
  subscriptionCreated: "subscription.created",
  subscriptionUpdated: "subscription.updated",
  productCreated: "product.created",
  productUpdated: "product.updated",
} as const

export const CREDIT_LEDGER_EXTERNAL_ID_PREFIX = {
  trial: "trial",
  usage: "usage",
  tool: "tool",
  subscription: "subscription",
} as const

export const POLAR_PRODUCT_ENV = {
  basic: "POLAR_BASIC_PRODUCT_ID",
  basicYearly: "POLAR_BASIC_YEARLY_PRODUCT_ID",
  starter: "POLAR_STARTER_PRODUCT_ID",
  starterYearly: "POLAR_STARTER_YEARLY_PRODUCT_ID",
  plus: "POLAR_PLUS_PRODUCT_ID",
  plusYearly: "POLAR_PLUS_YEARLY_PRODUCT_ID",
  pro: "POLAR_PRO_PRODUCT_ID",
  proYearly: "POLAR_PRO_YEARLY_PRODUCT_ID",
  scale: "POLAR_SCALE_PRODUCT_ID",
  scaleYearly: "POLAR_SCALE_YEARLY_PRODUCT_ID",
} as const

export const SUBSCRIPTION_PLANS = {
  basic: {
    name: "Basic",
    tier: "basic",
    interval: BILLING_INTERVAL.monthly,
    env: POLAR_PRODUCT_ENV.basic,
    priceUsd: 10,
    monthlyPriceUsd: 10,
    credits: 1_000,
  },
  basicYearly: {
    name: "Basic",
    tier: "basic",
    interval: BILLING_INTERVAL.yearly,
    env: POLAR_PRODUCT_ENV.basicYearly,
    priceUsd: 96,
    monthlyPriceUsd: 8,
    credits: 12_000,
  },
  starter: {
    name: "Starter",
    tier: "starter",
    interval: BILLING_INTERVAL.monthly,
    env: POLAR_PRODUCT_ENV.starter,
    priceUsd: 20,
    monthlyPriceUsd: 20,
    credits: 2_000,
  },
  starterYearly: {
    name: "Starter",
    tier: "starter",
    interval: BILLING_INTERVAL.yearly,
    env: POLAR_PRODUCT_ENV.starterYearly,
    priceUsd: 192,
    monthlyPriceUsd: 16,
    credits: 24_000,
  },
  plus: {
    name: "Plus",
    tier: "plus",
    interval: BILLING_INTERVAL.monthly,
    env: POLAR_PRODUCT_ENV.plus,
    priceUsd: 50,
    monthlyPriceUsd: 50,
    credits: 5_000,
  },
  plusYearly: {
    name: "Plus",
    tier: "plus",
    interval: BILLING_INTERVAL.yearly,
    env: POLAR_PRODUCT_ENV.plusYearly,
    priceUsd: 480,
    monthlyPriceUsd: 40,
    credits: 60_000,
  },
  pro: {
    name: "Pro",
    tier: "pro",
    interval: BILLING_INTERVAL.monthly,
    env: POLAR_PRODUCT_ENV.pro,
    priceUsd: 100,
    monthlyPriceUsd: 100,
    credits: 10_000,
  },
  proYearly: {
    name: "Pro",
    tier: "pro",
    interval: BILLING_INTERVAL.yearly,
    env: POLAR_PRODUCT_ENV.proYearly,
    priceUsd: 960,
    monthlyPriceUsd: 80,
    credits: 120_000,
  },
  scale: {
    name: "Scale",
    tier: "scale",
    interval: BILLING_INTERVAL.monthly,
    env: POLAR_PRODUCT_ENV.scale,
    priceUsd: 250,
    monthlyPriceUsd: 250,
    credits: 25_000,
  },
  scaleYearly: {
    name: "Scale",
    tier: "scale",
    interval: BILLING_INTERVAL.yearly,
    env: POLAR_PRODUCT_ENV.scaleYearly,
    priceUsd: 2_400,
    monthlyPriceUsd: 200,
    credits: 300_000,
  },
} as const

export type SubscriptionPlanKey = keyof typeof SUBSCRIPTION_PLANS

export const CREDIT_LEDGER_SOURCE = {
  aiChat: "ai_chat",
  aiTitle: "ai_title",
  toolCall: "tool_call",
  creditPurchase: "credit_purchase",
  subscriptionGrant: "subscription_grant",
  trialGrant: "trial_grant",
  manualAdjustment: "manual_adjustment",
  refund: "refund",
} as const

export const USAGE_SOURCE = {
  chat: "chat",
  title: "title",
  toolCall: "tool_call",
} as const

export const TOOL_NAMES = {
  tavilySearch: "tavilySearch",
  tavilyExtract: "tavilyExtract",
  fetchImages: "fetchImages",
  composioPrefix: "COMPOSIO_",
} as const

export const TOOL_PRICING = {
  tavilySearch: {
    basic: { credits: 6, vendorCostUsd: 0.008 },
    advanced: { credits: 11, vendorCostUsd: 0.016 },
  },
  tavilyExtract: {
    basic: { creditsPerResult: 2, vendorCostUsdPerResult: 0.0016 },
    advanced: { creditsPerResult: 3, vendorCostUsdPerResult: 0.0032 },
  },
  fetchImages: {
    credits: 4,
    vendorCostUsd: 0.005,
    service: "google_custom_search",
  },
  composio: {
    credits: 1,
    vendorCostUsd: 0.000897,
    service: "composio",
    premiumAssumption: true,
  },
  internal: {
    credits: 0,
    vendorCostUsd: 0,
  },
} as const

export const ACTIVE_SUBSCRIPTION_STATUSES = [
  "active",
  "trialing",
  "past_due",
] as const

export function getSubscriptionProductIds() {
  return Object.fromEntries(
    Object.entries(SUBSCRIPTION_PLANS)
      .map(([key, plan]) => [key, process.env[plan.env] ?? ""])
      .filter(([, productId]) => productId)
  ) as Record<SubscriptionPlanKey, string>
}

export function creditsForVendorCost(vendorCostUsd: number) {
  if (vendorCostUsd <= 0) return 0
  return Math.max(1, Math.ceil(vendorCostUsd / MAX_VENDOR_COST_PER_CREDIT_USD))
}

export function calculateBillingMargin(
  revenueUsd: number,
  vendorCostUsd: number
) {
  if (revenueUsd <= 0) return null
  return (revenueUsd - vendorCostUsd) / revenueUsd
}

export function getToolCallCharge(
  toolName: string,
  input: unknown,
  output: unknown
) {
  const inputRecord =
    typeof input === "object" && input !== null && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {}
  const outputRecord =
    typeof output === "object" && output !== null && !Array.isArray(output)
      ? (output as Record<string, unknown>)
      : {}

  if (toolName === TOOL_NAMES.tavilySearch) {
    const depth = inputRecord.searchDepth === "basic" ? "basic" : "advanced"
    return {
      ...TOOL_PRICING.tavilySearch[depth],
      metadata: { depth },
    }
  }

  if (toolName === TOOL_NAMES.tavilyExtract) {
    const resultCount = Array.isArray(outputRecord.results)
      ? outputRecord.results.length
      : 0
    const depth = inputRecord.extractDepth === "advanced" ? "advanced" : "basic"
    const pricing = TOOL_PRICING.tavilyExtract[depth]
    return {
      credits: resultCount * pricing.creditsPerResult,
      vendorCostUsd: resultCount * pricing.vendorCostUsdPerResult,
      metadata: { depth, resultCount },
    }
  }

  if (toolName === TOOL_NAMES.fetchImages) {
    return {
      credits: TOOL_PRICING.fetchImages.credits,
      vendorCostUsd: TOOL_PRICING.fetchImages.vendorCostUsd,
      metadata: { service: TOOL_PRICING.fetchImages.service },
    }
  }

  if (toolName.startsWith(TOOL_NAMES.composioPrefix)) {
    return {
      credits: TOOL_PRICING.composio.credits,
      vendorCostUsd: TOOL_PRICING.composio.vendorCostUsd,
      metadata: {
        service: TOOL_PRICING.composio.service,
        premiumAssumption: TOOL_PRICING.composio.premiumAssumption,
      },
    }
  }

  return {
    credits: TOOL_PRICING.internal.credits,
    vendorCostUsd: TOOL_PRICING.internal.vendorCostUsd,
    metadata: { internal: true },
  }
}
