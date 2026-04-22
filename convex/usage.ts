import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireAuth } from "./auth";

const usageSourceValidator = v.union(
  v.literal("chat"),
  v.literal("title"),
);

export const record = mutation({
  args: {
    source: usageSourceValidator,
    chatId: v.optional(v.id("chats")),
    model: v.string(),
    cacheReadTokens: v.number(),
    cacheWriteTokens: v.number(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    totalTokens: v.number(),
    cost: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);

    if (args.chatId) {
      const chat = await ctx.db.get(args.chatId);
      if (!chat || chat.userId !== identity.tokenIdentifier) {
        throw new Error("Chat not found");
      }
    }

    return await ctx.db.insert("usage", {
      ...args,
      userId: identity.tokenIdentifier,
    });
  },
});

export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("usage")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(200);
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("usage")
      .order("desc")
      .take(500);
  },
});
