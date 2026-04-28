import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { requireAuth } from "./auth";

function buildAvatarPath(storageId: Id<"_storage">) {
  return `/api/avatars/${storageId}`;
}

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const finalizeUpload = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);
    const file = await ctx.db.system.get("_storage", args.storageId);
    if (!file) {
      throw new Error("Uploaded avatar file not found");
    }

    const existing = await ctx.db
      .query("userAvatars")
      .withIndex("by_userId", (q) => q.eq("userId", identity.tokenIdentifier))
      .unique();

    if (existing && existing.storageId !== args.storageId) {
      await ctx.storage.delete(existing.storageId);
      await ctx.db.patch(existing._id, { storageId: args.storageId });
    } else if (!existing) {
      await ctx.db.insert("userAvatars", {
        userId: identity.tokenIdentifier,
        storageId: args.storageId,
      });
    }

    return {
      imageUrl: buildAvatarPath(args.storageId),
    };
  },
});

export const deleteCurrent = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await requireAuth(ctx);
    const existing = await ctx.db
      .query("userAvatars")
      .withIndex("by_userId", (q) => q.eq("userId", identity.tokenIdentifier))
      .unique();

    if (!existing) {
      return null;
    }

    await ctx.storage.delete(existing.storageId);
    await ctx.db.delete(existing._id);

    return {
      imageUrl: buildAvatarPath(existing.storageId),
    };
  },
});

export const getPublicUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
