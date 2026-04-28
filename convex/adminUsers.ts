import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent, createAuth, requireAdmin } from "./auth";

type AuthUser = {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
  banned?: boolean | null;
  createdAt: number | string | Date;
  updatedAt?: number | string | Date;
  emailVerified?: boolean;
};

function toTime(value: number | string | Date | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return new Date(value).getTime();
  return value?.getTime() ?? Date.now();
}

function serializeUser(user: AuthUser) {
  const id = user.id ?? user._id;
  if (!id) {
    throw new Error("Auth user is missing an id");
  }

  return {
    id,
    name: user.name || "Unknown",
    email: user.email,
    imageUrl: user.image ?? "",
    role: user.role === "admin" ? "admin" : "user",
    banned: user.banned ?? false,
    createdAt: toTime(user.createdAt),
    emailVerified: user.emailVerified ?? false,
  };
}

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await authComponent.safeGetAuthUser(ctx);
  },
});

export const hasAdminPermission = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    return user?.role === "admin";
  },
});

export const list = query({
  args: {
    query: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    const result = await auth.api.listUsers({
      query: {
        limit: args.limit ?? 100,
        offset: args.offset ?? 0,
        sortBy: "createdAt",
        sortDirection: "desc",
      },
      headers,
    });

    const search = args.query?.trim().toLowerCase();
    const users = (result.users as AuthUser[])
      .map(serializeUser)
      .filter((user) => {
        if (!search) return true;
        return (
          user.name.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search)
        );
      });

    return { users, totalCount: search ? users.length : result.total };
  },
});

export const get = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    const user = (await auth.api.getUser({
      query: { id: args.userId },
      headers,
    })) as AuthUser | null;

    if (!user) return null;

    return {
      ...serializeUser(user),
      phone: "",
      lastSignInAt: null as number | null,
      externalAccounts: [] as { provider: string; email: string }[],
    };
  },
});

export const listByTokenIdentifiers = query({
  args: { tokenIdentifiers: v.array(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const users = await Promise.all(
      args.tokenIdentifiers.map(async (tokenIdentifier) => {
        const authUserId = tokenIdentifier.split("|").pop() ?? tokenIdentifier;
        let user = null;
        try {
          user = await authComponent.getAnyUserById(ctx, authUserId);
        } catch {
          return null;
        }
        return user
          ? [tokenIdentifier, serializeUser(user as unknown as AuthUser)]
          : null;
      })
    );

    return Object.fromEntries(users.filter((entry) => entry !== null));
  },
});

export const ban = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const currentUser = await authComponent.getAuthUser(ctx);
    if (currentUser._id === args.userId) {
      throw new Error("Cannot ban your own account");
    }

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    await auth.api.banUser({
      body: { userId: args.userId },
      headers,
    });
  },
});

export const unban = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    await auth.api.unbanUser({
      body: { userId: args.userId },
      headers,
    });
  },
});

export const setRole = mutation({
  args: {
    userId: v.string(),
    role: v.union(v.literal("user"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const currentUser = await authComponent.getAuthUser(ctx);
    if (currentUser._id === args.userId) {
      throw new Error("Cannot modify your own role");
    }

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    await auth.api.setRole({
      body: args,
      headers,
    });
  },
});

export const remove = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const currentUser = await authComponent.getAuthUser(ctx);
    if (currentUser._id === args.userId) {
      throw new Error("Cannot delete your own account");
    }

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    await auth.api.removeUser({
      body: { userId: args.userId },
      headers,
    });
  },
});
