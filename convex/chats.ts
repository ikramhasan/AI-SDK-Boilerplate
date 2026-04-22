import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireAuth, requireChatOwner } from "./auth";

export const create = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);

    return await ctx.db.insert("chats", {
      title: args.title,
      userId: identity.tokenIdentifier,
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireAuth(ctx);

    return await ctx.db
      .query("chats")
      .withIndex("by_userId", (q) => q.eq("userId", identity.tokenIdentifier))
      .order("desc")
      .take(50);
  },
});

export const get = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    if (!chat) return null;

    // Shared chats are publicly viewable
    if (chat.isShared) return chat;

    const identity = await ctx.auth.getUserIdentity();
    if (!identity || chat.userId !== identity.tokenIdentifier) {
      return null;
    }

    return chat;
  },
});

export const getAdmin = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.chatId);
  },
});

export const updateTitle = mutation({
  args: {
    chatId: v.id("chats"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await requireChatOwner(ctx, args.chatId);

    await ctx.db.patch(args.chatId, { title: args.title });
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const chats = await ctx.db.query("chats").order("desc").take(500);

    const chatsWithCounts = await Promise.all(
      chats.map(async (chat) => {
        const messages = await ctx.db
          .query("messages")
          .withIndex("by_chatId", (q) => q.eq("chatId", chat._id))
          .take(500);
        return {
          ...chat,
          messageCount: messages.length,
        };
      })
    );

    return chatsWithCounts;
  },
});

export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const chats = await ctx.db
      .query("chats")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(500);

    const chatsWithCounts = await Promise.all(
      chats.map(async (chat) => {
        const messages = await ctx.db
          .query("messages")
          .withIndex("by_chatId", (q) => q.eq("chatId", chat._id))
          .take(500);
        return {
          ...chat,
          messageCount: messages.length,
        };
      })
    );

    return chatsWithCounts;
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);

    return await ctx.db
      .query("chats")
      .withSearchIndex("search_title", (q) =>
        q.search("title", args.query).eq("userId", identity.tokenIdentifier)
      )
      .take(10);
  },
});

export const remove = mutation({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    await requireChatOwner(ctx, args.chatId);

    // Delete all messages in the chat
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .take(500);

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    await ctx.db.delete(args.chatId);
  },
});

export const share = mutation({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    await requireChatOwner(ctx, args.chatId);

    await ctx.db.patch(args.chatId, { isShared: true });
  },
});

export const unshare = mutation({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    await requireChatOwner(ctx, args.chatId);

    await ctx.db.patch(args.chatId, { isShared: false });
  },
});
