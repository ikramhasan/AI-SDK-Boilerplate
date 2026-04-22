import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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
    modelId: v.id("models"),
    systemMessage: v.string(),
    tools: v.array(
      v.object({
        toolId: v.string(),
        enabled: v.boolean(),
      })
    ),
    knowledgeFileIds: v.array(v.id("knowledgeFiles")),
  }),

  models: defineTable({
    modelId: v.string(),
    name: v.string(),
    provider: v.string(),
    baseUrl: v.optional(v.string()),
    apiKey: v.string(),
    costConfig: v.object({
      input: v.number(),
      output: v.number(),
      cacheRead: v.number(),
      cacheWrite: v.number(),
    }),
  }).index("by_modelId", ["modelId"]),

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
      v.literal("chat"),
      v.literal("title"),
    ),
    chatId: v.optional(v.id("chats")),
    model: v.string(),
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
});
