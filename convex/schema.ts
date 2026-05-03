import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { CREDIT_LEDGER_SOURCE, USAGE_SOURCE } from "../lib/billing"

export default defineSchema({
  chats: defineTable({
    title: v.string(),
    userId: v.string(),
    isShared: v.optional(v.boolean()),
  })
    .index("by_userId", ["userId"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["userId"],
    }),

  messages: defineTable({
    chatId: v.id("chats"),
    role: v.string(),
    parts: v.array(v.any()),
    metadata: v.optional(v.any()),
  }).index("by_chatId", ["chatId"]),

  messageToolRuns: defineTable({
    chatId: v.id("chats"),
    messageId: v.id("messages"),
    partIndex: v.number(),
    type: v.string(),
    state: v.string(),
    toolCallId: v.optional(v.string()),
    toolName: v.optional(v.string()),
    errorText: v.optional(v.string()),
    input: v.optional(v.any()),
    output: v.optional(v.any()),
  })
    .index("by_chatId", ["chatId"])
    .index("by_messageId", ["messageId"])
    .index("by_chatId_and_messageId", ["chatId", "messageId"]),

  aiConfig: defineTable({
    name: v.string(),
    providerId: v.string(),
    providerName: v.string(),
    providerNpm: v.string(),
    providerApi: v.optional(v.string()),
    modelId: v.string(),
    modelName: v.string(),
    systemMessage: v.string(),
    tools: v.array(
      v.object({
        toolId: v.string(),
        enabled: v.boolean(),
      })
    ),
    knowledgeFileIds: v.array(v.id("knowledgeFiles")),
  }),

  feedback: defineTable({
    chatId: v.id("chats"),
    messageId: v.string(),
    userId: v.string(),
    rating: v.union(v.literal("like"), v.literal("dislike")),
    comment: v.optional(v.string()),
  })
    .index("by_chatId", ["chatId"])
    .index("by_messageId", ["messageId"])
    .index("by_userId_and_messageId", ["userId", "messageId"]),

  knowledgeFiles: defineTable({
    name: v.string(),
    storageId: v.id("_storage"),
    status: v.union(
      v.literal("processing"),
      v.literal("ready"),
      v.literal("error")
    ),
  }),

  mcpServers: defineTable({
    name: v.string(),
    url: v.string(),
    transport: v.union(v.literal("http"), v.literal("sse")),
    enabled: v.boolean(),
    authType: v.union(
      v.literal("none"),
      v.literal("bearer"),
      v.literal("custom-header")
    ),
    authToken: v.optional(v.string()),
    authHeaderName: v.optional(v.string()),
  }),

  usage: defineTable({
    userId: v.string(),
    source: v.union(
      v.literal(USAGE_SOURCE.chat),
      v.literal(USAGE_SOURCE.title),
      v.literal(USAGE_SOURCE.toolCall)
    ),
    chatId: v.optional(v.id("chats")),
    model: v.optional(v.string()),
    providerId: v.optional(v.string()),
    toolName: v.optional(v.string()),
    cacheReadTokens: v.number(),
    cacheWriteTokens: v.number(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    totalTokens: v.number(),
    cost: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_source", ["source"])
    .index("by_userId_and_source", ["userId", "source"]),

  creditLedger: defineTable({
    userId: v.string(),
    source: v.union(
      v.literal(CREDIT_LEDGER_SOURCE.aiChat),
      v.literal(CREDIT_LEDGER_SOURCE.aiTitle),
      v.literal(CREDIT_LEDGER_SOURCE.toolCall),
      v.literal(CREDIT_LEDGER_SOURCE.creditPurchase),
      v.literal(CREDIT_LEDGER_SOURCE.subscriptionGrant),
      v.literal(CREDIT_LEDGER_SOURCE.trialGrant),
      v.literal(CREDIT_LEDGER_SOURCE.manualAdjustment),
      v.literal(CREDIT_LEDGER_SOURCE.refund)
    ),
    credits: v.number(),
    vendorCostUsd: v.number(),
    revenueUsd: v.number(),
    margin: v.union(v.number(), v.null()),
    chatId: v.optional(v.id("chats")),
    messageId: v.optional(v.id("messages")),
    toolName: v.optional(v.string()),
    model: v.optional(v.string()),
    externalId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  })
    .index("by_userId", ["userId"])
    .index("by_source", ["source"])
    .index("by_externalId", ["externalId"])
    .index("by_userId_and_source", ["userId", "source"]),

  userBillingState: defineTable({
    userId: v.string(),
    creditBalance: v.number(),
    trialGrantedAt: v.optional(v.number()),
    trialExpiresAt: v.optional(v.number()),
    lastSubscriptionGrantKey: v.optional(v.string()),
    activeSubscriptionId: v.optional(v.string()),
    activeSubscriptionProductId: v.optional(v.string()),
    activeSubscriptionStatus: v.optional(v.string()),
    activeSubscriptionCurrentPeriodEnd: v.optional(v.string()),
    polarCustomerId: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  userAvatars: defineTable({
    userId: v.string(),
    storageId: v.id("_storage"),
  }).index("by_userId", ["userId"]),
})
