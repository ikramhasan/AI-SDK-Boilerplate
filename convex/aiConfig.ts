import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";
import { requireAdmin } from "./auth";

const toolValidator = v.object({
  toolId: v.string(),
  enabled: v.boolean(),
});

export const getPublic = query({
  args: {},
  handler: async (ctx) => {
    const config = await ctx.db.query("aiConfig").order("desc").first();
    return config ? { name: config.name } : null;
  },
});

export const getAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("aiConfig").order("desc").first();
  },
});

export const getRuntime = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("aiConfig").order("desc").first();
  },
});

export const save = mutation({
  args: {
    name: v.string(),
    providerId: v.string(),
    providerName: v.string(),
    providerNpm: v.string(),
    providerApi: v.optional(v.string()),
    modelId: v.string(),
    modelName: v.string(),
    systemMessage: v.string(),
    tools: v.array(toolValidator),
    knowledgeFileIds: v.array(v.id("knowledgeFiles")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const existing = await ctx.db.query("aiConfig").order("desc").first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        providerId: args.providerId,
        providerName: args.providerName,
        providerNpm: args.providerNpm,
        providerApi: args.providerApi,
        modelId: args.modelId,
        modelName: args.modelName,
        systemMessage: args.systemMessage,
        tools: args.tools,
        knowledgeFileIds: args.knowledgeFileIds,
      });
      return existing._id;
    }

    return await ctx.db.insert("aiConfig", {
      name: args.name,
      providerId: args.providerId,
      providerName: args.providerName,
      providerNpm: args.providerNpm,
      providerApi: args.providerApi,
      modelId: args.modelId,
      modelName: args.modelName,
      systemMessage: args.systemMessage,
      tools: args.tools,
      knowledgeFileIds: args.knowledgeFileIds,
    });
  },
});
