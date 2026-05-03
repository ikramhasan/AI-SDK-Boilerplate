import { createClient, type GenericCtx } from "@convex-dev/better-auth"
import { convex } from "@convex-dev/better-auth/plugins"
import { betterAuth, type BetterAuthOptions } from "better-auth/minimal"
import { admin } from "better-auth/plugins"
import type { Doc, Id } from "./_generated/dataModel"
import { components, internal } from "./_generated/api"
import type { DataModel } from "./_generated/dataModel"
import type { MutationCtx, QueryCtx } from "./_generated/server"
import authConfig from "./auth.config"
import authSchema from "./betterAuth/schema"

const siteUrl =
  process.env.SITE_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  "http://localhost:3000"

type CreatedAuthUser = {
  id?: string
  _id?: string
  email?: string
  name?: string | null
}

export const createAuthOptions = (ctx: GenericCtx<DataModel>) =>
  ({
    baseURL: siteUrl,
    secret: process.env.BETTER_AUTH_SECRET,
    database: authComponent.adapter(ctx),
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },
    databaseHooks: {
      user: {
        create: {
          after: async (user: CreatedAuthUser) => {
            const userId = user.id ?? user._id
            if (!userId || !user.email || !("runAction" in ctx)) return

            await ctx.runAction(internal.billing.ensurePolarCustomerForUser, {
              userId,
              email: user.email,
              name: user.name ?? undefined,
            })
          },
        },
      },
    },
    plugins: [
      admin({
        defaultRole: "user",
        adminRoles: ["admin"],
      }),
      convex({ authConfig }),
    ],
  }) satisfies BetterAuthOptions

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth(createAuthOptions(ctx))
}

export const authComponent = createClient<DataModel, typeof authSchema>(
  components.betterAuth,
  {
    local: {
      schema: authSchema,
    },
  }
)

type AuthenticatedCtx = QueryCtx | MutationCtx

export async function requireAuth(ctx: AuthenticatedCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error("Not authenticated")
  }
  return identity
}

export async function requireAdmin(ctx: AuthenticatedCtx) {
  await requireAuth(ctx)

  const user = await authComponent.safeGetAuthUser(ctx)
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized")
  }
}

export async function requireChatOwner(
  ctx: AuthenticatedCtx,
  chatId: Id<"chats">
): Promise<{
  identity: Awaited<ReturnType<typeof requireAuth>>
  chat: Doc<"chats">
}> {
  const identity = await requireAuth(ctx)
  const chat = await ctx.db.get(chatId)

  if (!chat || chat.userId !== identity.tokenIdentifier) {
    throw new Error("Chat not found")
  }

  return { identity, chat }
}

export async function requireChatReadAccess(
  ctx: AuthenticatedCtx,
  chatId: Id<"chats">
) {
  const chat = await ctx.db.get(chatId)
  if (!chat) {
    throw new Error("Chat not found")
  }

  if (chat.isShared) {
    return { identity: null, chat }
  }

  const identity = await requireAuth(ctx)
  if (chat.userId !== identity.tokenIdentifier) {
    throw new Error("Chat not found")
  }

  return { identity, chat }
}

export const { getAuthUser } = authComponent.clientApi()
