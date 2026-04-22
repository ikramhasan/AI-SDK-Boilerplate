import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";
import { requireAdmin } from "./auth";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    return await ctx.db.insert("knowledgeFiles", {
      name: args.name,
      storageId: args.storageId,
      status: "ready",
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("knowledgeFiles").order("desc").take(100);
  },
});

export const getWithUrls = internalQuery({
  args: { ids: v.array(v.id("knowledgeFiles")) },
  handler: async (ctx, args) => {
    const results = [];
    for (const id of args.ids) {
      const file = await ctx.db.get(id);
      if (file && file.status === "ready") {
        const url = await ctx.storage.getUrl(file.storageId);
        if (url) {
          results.push({ name: file.name, url });
        }
      }
    }
    return results;
  },
});

export const remove = mutation({
  args: { id: v.id("knowledgeFiles") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const file = await ctx.db.get(args.id);
    if (!file) throw new Error("File not found");

    await ctx.storage.delete(file.storageId);
    await ctx.db.delete(args.id);
  },
});
