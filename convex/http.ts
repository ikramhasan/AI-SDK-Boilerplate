import { httpRouter } from "convex/server"
import type { WebhookEventHandlers } from "@convex-dev/polar"
import { authComponent, createAuth } from "./auth"
import { internal } from "./_generated/api"
import { polar } from "./billing"
import { POLAR_METADATA_KEYS, POLAR_WEBHOOK_EVENTS } from "../lib/billing"

const http = httpRouter()

const subscriptionHandlers = {
  [POLAR_WEBHOOK_EVENTS.subscriptionCreated]: async (ctx, event) => {
    const userId =
      event.data.metadata[POLAR_METADATA_KEYS.userId] ??
      event.data.customer.metadata[POLAR_METADATA_KEYS.userId]
    if (typeof userId !== "string") return

    await ctx.runMutation(internal.billing.grantSubscriptionCredits, {
      userId,
      subscriptionId: event.data.id,
      productId: event.data.productId,
      status: event.data.status,
      currentPeriodStart: event.data.currentPeriodStart.toISOString(),
      currentPeriodEnd: event.data.currentPeriodEnd?.toISOString() ?? null,
    })
  },
  [POLAR_WEBHOOK_EVENTS.subscriptionUpdated]: async (ctx, event) => {
    const userId =
      event.data.metadata[POLAR_METADATA_KEYS.userId] ??
      event.data.customer.metadata[POLAR_METADATA_KEYS.userId]
    if (typeof userId !== "string") return

    await ctx.runMutation(internal.billing.grantSubscriptionCredits, {
      userId,
      subscriptionId: event.data.id,
      productId: event.data.productId,
      status: event.data.status,
      currentPeriodStart: event.data.currentPeriodStart.toISOString(),
      currentPeriodEnd: event.data.currentPeriodEnd?.toISOString() ?? null,
    })
  },
} satisfies WebhookEventHandlers

authComponent.registerRoutes(http, createAuth)
polar.registerRoutes(http, {
  events: subscriptionHandlers,
})

export default http
