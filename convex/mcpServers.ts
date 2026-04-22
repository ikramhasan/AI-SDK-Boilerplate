import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";
import { requireAdmin } from "./auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const servers = await ctx.db.query("mcpServers").order("desc").take(50);

    return servers.map(({ authToken: _authToken, ...server }) => ({
      ...server,
      hasAuthToken: Boolean(_authToken),
    }));
  },
});

export const listRuntime = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("mcpServers").order("desc").take(50);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    url: v.string(),
    transport: v.union(v.literal("http"), v.literal("sse")),
    authType: v.union(
      v.literal("none"),
      v.literal("bearer"),
      v.literal("custom-header")
    ),
    authToken: v.optional(v.string()),
    authHeaderName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    return await ctx.db.insert("mcpServers", {
      name: args.name,
      url: args.url,
      transport: args.transport,
      enabled: true,
      authType: args.authType,
      authToken: args.authToken,
      authHeaderName: args.authHeaderName,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("mcpServers"),
    name: v.string(),
    url: v.string(),
    transport: v.union(v.literal("http"), v.literal("sse")),
    authType: v.union(
      v.literal("none"),
      v.literal("bearer"),
      v.literal("custom-header")
    ),
    authToken: v.optional(v.string()),
    authHeaderName: v.optional(v.string()),
    clearAuthToken: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const server = await ctx.db.get(args.id);
    if (!server) {
      throw new Error("Server not found");
    }

    await ctx.db.patch(args.id, {
      name: args.name,
      url: args.url,
      transport: args.transport,
      authType: args.authType,
      authToken:
        args.clearAuthToken || args.authType === "none"
          ? undefined
          : args.authToken ?? server.authToken,
      authHeaderName:
        args.authType === "custom-header" ? args.authHeaderName : undefined,
    });
  },
});

export const toggleEnabled = mutation({
  args: { id: v.id("mcpServers") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const server = await ctx.db.get(args.id);
    if (!server) throw new Error("Server not found");

    await ctx.db.patch(args.id, { enabled: !server.enabled });
  },
});

export const remove = mutation({
  args: { id: v.id("mcpServers") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    await ctx.db.delete(args.id);
  },
});
