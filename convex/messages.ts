import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { hydrateStoredMessageParts } from "../lib/chat-message-storage";
import {
  requireAdmin,
  requireChatOwner,
  requireChatReadAccess,
} from "./auth";

const persistedMessagePartValidator = v.union(
  v.object({
    type: v.literal("text"),
    text: v.string(),
  }),
  v.object({
    type: v.literal("reasoning"),
    text: v.string(),
    state: v.optional(v.string()),
  }),
  v.object({
    type: v.literal("file"),
    url: v.string(),
    mediaType: v.string(),
    filename: v.optional(v.string()),
  }),
  v.object({
    type: v.literal("step-start"),
  }),
  v.object({
    type: v.literal("tool-run-ref"),
    partIndex: v.number(),
  })
);

const persistedToolRunValidator = v.object({
  partIndex: v.number(),
  type: v.string(),
  state: v.string(),
  toolCallId: v.optional(v.string()),
  toolName: v.optional(v.string()),
  errorText: v.optional(v.string()),
  input: v.optional(v.any()),
  output: v.optional(v.any()),
});

function stripToolRunDocumentFields(toolRun: {
  _id?: string;
  messageId?: string;
  partIndex: number;
  type: string;
  state: string;
  toolCallId?: string;
  toolName?: string;
  errorText?: string;
  input?: unknown;
  output?: unknown;
}) {
  return {
    partIndex: toolRun.partIndex,
    type: toolRun.type,
    state: toolRun.state,
    toolCallId: toolRun.toolCallId,
    toolName: toolRun.toolName,
    errorText: toolRun.errorText,
    input: toolRun.input,
    output: toolRun.output,
  };
}

function groupToolRunsByMessageId(
  toolRuns: {
    _id: string;
    messageId: string;
    partIndex: number;
    type: string;
    state: string;
    toolCallId?: string;
    toolName?: string;
    errorText?: string;
    input?: unknown;
    output?: unknown;
  }[]
) {
  const byMessageId = new Map<string, typeof toolRuns>();

  for (const toolRun of toolRuns) {
    const existing = byMessageId.get(toolRun.messageId) ?? [];
    existing.push(toolRun);
    byMessageId.set(toolRun.messageId, existing);
  }

  for (const runs of byMessageId.values()) {
    runs.sort((a, b) => a.partIndex - b.partIndex);
  }

  return byMessageId;
}

function hydrateMessagesWithToolRuns(
  messages: {
    _id: string;
    chatId: string;
    role: string;
    parts: unknown[];
  }[],
  toolRunsByMessageId: Map<string, {
    _id: string;
    messageId: string;
    partIndex: number;
    type: string;
    state: string;
    toolCallId?: string;
    toolName?: string;
    errorText?: string;
    input?: unknown;
    output?: unknown;
  }[]>
) {
  return messages.map((message) => ({
    ...message,
    parts: hydrateStoredMessageParts(
      message.parts,
      (toolRunsByMessageId.get(message._id) ?? []).map(stripToolRunDocumentFields)
    ),
  }));
}

export const save = mutation({
  args: {
    chatId: v.id("chats"),
    messages: v.array(
      v.object({
        role: v.string(),
        parts: v.array(persistedMessagePartValidator),
        toolRuns: v.array(persistedToolRunValidator),
      })
    ),
  },
  handler: async (ctx, args) => {
    await requireChatOwner(ctx, args.chatId);

    const existing = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .take(500);
    const existingToolRuns = await ctx.db
      .query("messageToolRuns")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .take(5000);
    const toolRunsByMessageId = groupToolRunsByMessageId(existingToolRuns);

    // Update any existing messages whose content has changed (e.g. regeneration)
    for (let i = 0; i < existing.length && i < args.messages.length; i++) {
      const incoming = args.messages[i];
      const existingHydratedParts = hydrateStoredMessageParts(
        existing[i].parts,
        (toolRunsByMessageId.get(existing[i]._id) ?? []).map(stripToolRunDocumentFields)
      );
      const incomingHydratedParts = hydrateStoredMessageParts(
        incoming.parts,
        incoming.toolRuns
      );

      if (
        existing[i].role !== incoming.role ||
        JSON.stringify(existingHydratedParts) !== JSON.stringify(incomingHydratedParts)
      ) {
        await ctx.db.patch(existing[i]._id, {
          role: incoming.role,
          parts: incoming.parts,
        });

        for (const toolRun of toolRunsByMessageId.get(existing[i]._id) ?? []) {
          await ctx.db.delete(toolRun._id as never);
        }

        for (const toolRun of incoming.toolRuns) {
          await ctx.db.insert("messageToolRuns", {
            chatId: args.chatId,
            messageId: existing[i]._id,
            ...toolRun,
          });
        }
      }
    }

    // Insert any new messages beyond what already exists
    const newMessages = args.messages.slice(existing.length);

    for (const message of newMessages) {
      const messageId = await ctx.db.insert("messages", {
        chatId: args.chatId,
        role: message.role,
        parts: message.parts,
      });

      for (const toolRun of message.toolRuns) {
        await ctx.db.insert("messageToolRuns", {
          chatId: args.chatId,
          messageId,
          ...toolRun,
        });
      }
    }
  },
});

export const list = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    try {
      await requireChatReadAccess(ctx, args.chatId);
    } catch {
      return [];
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .take(500);
    const toolRuns = await ctx.db
      .query("messageToolRuns")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .take(5000);

    return hydrateMessagesWithToolRuns(
      messages,
      groupToolRunsByMessageId(toolRuns)
    );
  },
});

export const listAll = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const chat = await ctx.db.get(args.chatId);
    if (!chat) return [];

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .take(500);
    const toolRuns = await ctx.db
      .query("messageToolRuns")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .take(5000);

    return hydrateMessagesWithToolRuns(
      messages,
      groupToolRunsByMessageId(toolRuns)
    );
  },
});
