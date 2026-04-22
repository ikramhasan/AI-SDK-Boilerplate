import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireAuth, requireChatReadAccess } from "./auth";

export const submit = mutation({
  args: {
    chatId: v.id("chats"),
    messageId: v.string(),
    rating: v.union(v.literal("like"), v.literal("dislike")),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);
    await requireChatReadAccess(ctx, args.chatId);

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .take(500);

    const matchesPersistedMessage = messages.some(
      (message) => message._id === args.messageId
    );
    const messageIndex = Number.parseInt(args.messageId, 10);
    const matchesMessageIndex =
      /^\d+$/.test(args.messageId) &&
      Number.isSafeInteger(messageIndex) &&
      messageIndex >= 0 &&
      messageIndex < messages.length;

    if (!matchesPersistedMessage && !matchesMessageIndex) {
      throw new Error("Message not found");
    }

    // Remove existing feedback for this user + message
    const existing = await ctx.db
      .query("feedback")
      .withIndex("by_userId_and_messageId", (q) =>
        q
          .eq("userId", identity.tokenIdentifier)
          .eq("messageId", args.messageId)
      )
      .take(10);

    for (const fb of existing) {
      await ctx.db.delete(fb._id);
    }

    await ctx.db.insert("feedback", {
      chatId: args.chatId,
      messageId: args.messageId,
      userId: identity.tokenIdentifier,
      rating: args.rating,
      comment: args.comment,
    });
  },
});

export const remove = mutation({
  args: {
    messageId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);

    const existing = await ctx.db
      .query("feedback")
      .withIndex("by_userId_and_messageId", (q) =>
        q
          .eq("userId", identity.tokenIdentifier)
          .eq("messageId", args.messageId)
      )
      .take(10);

    for (const fb of existing) {
      await ctx.db.delete(fb._id);
    }
  },
});

export const getForChat = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    if (!chat) {
      return [];
    }

    const identity = await requireAuth(ctx);
    await requireChatReadAccess(ctx, args.chatId);

    const feedbacks = await ctx.db
      .query("feedback")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .take(500);

    return feedbacks.filter((fb) => fb.userId === identity.tokenIdentifier);
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const feedbacks = await ctx.db.query("feedback").order("desc").take(500);

    const enriched = await Promise.all(
      feedbacks.map(async (fb) => {
        const chat = await ctx.db.get(fb.chatId);
        return {
          ...fb,
          chatTitle: chat?.title ?? "Deleted Chat",
        };
      })
    );

    return enriched;
  },
});
