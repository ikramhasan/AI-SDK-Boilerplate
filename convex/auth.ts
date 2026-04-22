import type { Doc, Id } from "./_generated/dataModel";
import type {
  MutationCtx,
  QueryCtx,
} from "./_generated/server";

type AuthenticatedCtx = QueryCtx | MutationCtx;

export async function requireAuth(ctx: AuthenticatedCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity;
}

export async function requireAdmin(ctx: AuthenticatedCtx) {
  const identity = await requireAuth(ctx);
  const role = (identity.metadata as { role?: unknown } | undefined)?.role;

  if (role !== "admin") {
    throw new Error("Unauthorized");
  }

  return identity;
}

export async function requireChatOwner(
  ctx: AuthenticatedCtx,
  chatId: Id<"chats">
): Promise<{ identity: Awaited<ReturnType<typeof requireAuth>>; chat: Doc<"chats"> }> {
  const identity = await requireAuth(ctx);
  const chat = await ctx.db.get(chatId);

  if (!chat || chat.userId !== identity.tokenIdentifier) {
    throw new Error("Chat not found");
  }

  return { identity, chat };
}

export async function requireChatReadAccess(
  ctx: AuthenticatedCtx,
  chatId: Id<"chats">
) {
  const chat = await ctx.db.get(chatId);
  if (!chat) {
    throw new Error("Chat not found");
  }

  if (chat.isShared) {
    return { identity: null, chat };
  }

  const identity = await requireAuth(ctx);
  if (chat.userId !== identity.tokenIdentifier) {
    throw new Error("Chat not found");
  }

  return { identity, chat };
}
