import { v } from "convex/values";
import { query, mutation, internalQuery } from "./_generated/server";
import { requireAdmin } from "./auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const models = await ctx.db.query("models").order("asc").take(50);
    return models.map(({ apiKey: _apiKey, ...rest }) => rest);
  },
});

export const getRuntime = internalQuery({
  args: { id: v.id("models") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    modelId: v.string(),
    provider: v.string(),
    baseUrl: v.optional(v.string()),
    apiKey: v.string(),
    costConfig: v.object({
      input: v.number(),
      output: v.number(),
      cacheRead: v.number(),
      cacheWrite: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("models", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("models"),
    name: v.string(),
    modelId: v.string(),
    provider: v.string(),
    baseUrl: v.optional(v.string()),
    apiKey: v.optional(v.string()),
    costConfig: v.object({
      input: v.number(),
      output: v.number(),
      cacheRead: v.number(),
      cacheWrite: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, apiKey, ...fields } = args;
    if (apiKey !== undefined) {
      await ctx.db.patch(id, { ...fields, apiKey });
    } else {
      await ctx.db.patch(id, fields);
    }
  },
});

export const remove = mutation({
  args: { id: v.id("models") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

export const duplicate = mutation({
  args: { id: v.id("models") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const model = await ctx.db.get(args.id);
    if (!model) throw new Error("Model not found");
    const { _id: _docId, _creationTime: _ts, ...fields } = model;
    return await ctx.db.insert("models", {
      ...fields,
      name: `${fields.name} - Copy`,
    });
  },
});
