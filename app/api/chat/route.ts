import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  streamText,
  UIMessage,
  stepCountIs,
} from "ai"
import { fetchMutation } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { extractUsage } from "@/lib/usage"
import { loadConfig } from "@/lib/agents/config"
import { createModel } from "@/lib/agents/provider"
import { loadKnowledge, buildSystemMessage } from "@/lib/agents/knowledge"
import { resolveTools } from "@/lib/agents/tools"
import { requireCurrentUserConvexAuth } from "@/lib/convex/server"
import {
  BILLING_GENERATION_GUARD,
  getToolCallCharge,
  USAGE_SOURCE,
} from "@/lib/billing"

export const maxDuration = 30

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

async function recordToolLedgerEntries({
  steps,
  activeChatId,
  convexToken,
}: {
  steps: Array<{ toolCalls?: unknown[]; toolResults?: unknown[] }>
  activeChatId?: string
  convexToken: string
}) {
  const resultsById = new Map<string, unknown>()
  for (const step of steps) {
    for (const result of step.toolResults ?? []) {
      if (!isRecord(result) || typeof result.toolCallId !== "string") continue
      resultsById.set(result.toolCallId, result)
    }
  }

  for (const step of steps) {
    for (const call of step.toolCalls ?? []) {
      if (
        !isRecord(call) ||
        typeof call.toolName !== "string" ||
        typeof call.toolCallId !== "string"
      ) {
        continue
      }

      const result = resultsById.get(call.toolCallId)
      const output = isRecord(result) ? result.output : undefined
      const pricing = getToolCallCharge(call.toolName, call.input, output)

      await fetchMutation(
        api.billing.recordToolCall,
        {
          chatId: activeChatId ? (activeChatId as Id<"chats">) : undefined,
          toolCallId: call.toolCallId,
          toolName: call.toolName,
          vendorCostUsd: pricing.vendorCostUsd,
          credits: pricing.credits,
          metadata: {
            ...pricing.metadata,
            input: call.input,
          },
        },
        { token: convexToken }
      )
    }
  }
}

export async function POST(req: Request) {
  let userId: string
  let convexToken: string

  try {
    ;({ userId, token: convexToken } = await requireCurrentUserConvexAuth())
  } catch {
    return Response.json({ error: "Not authenticated" }, { status: 401 })
  }

  const {
    messages,
    chatId,
    id,
    generateTitle,
    titleUserMessage,
  }: {
    messages: UIMessage[]
    chatId?: string
    id?: string
    generateTitle?: boolean
    titleUserMessage?: string
  } = await req.json()
  const activeChatId = chatId ?? id

  try {
    const status = await fetchMutation(
      api.billing.ensureReadyForPaidAction,
      {},
      { token: convexToken }
    )
    if (
      status.creditBalance <
      BILLING_GENERATION_GUARD.minimumCreditsBeforeGeneration
    ) {
      return Response.json(
        {
          error: "You're out of credits. Please upgrade your plan to continue chatting.",
        },
        { status: 402 }
      )
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Billing check failed"

    // Extract user-friendly message from Convex errors
    const friendlyMessage = message.includes("out of credits")
      ? "You're out of credits. Please upgrade your plan to continue chatting."
      : message.includes("trial credits have expired")
        ? "Your trial has expired. Choose a subscription to continue."
        : "Something went wrong. Please try again later."

    return Response.json(
      { error: friendlyMessage },
      { status: 402 }
    )
  }

  // Title generation can run alongside the heavier chat setup.
  const config = await loadConfig()
  const model = createModel(config)

  const titlePromise =
    generateTitle && activeChatId && titleUserMessage?.trim()
      ? generateText({
          model,
          system:
            "Generate a short chat title (max 6 words) for the given user message. Return only the title, no quotes or punctuation at the end.",
          prompt: titleUserMessage.trim(),
        }).catch((error) => {
          console.error("Failed to generate title:", error)
          return null
        })
      : null

  const { textChunks, fileParts } = await loadKnowledge(
    config.raw?.knowledgeFileIds
  )
  const { tools, mcpClients } = await resolveTools(config.raw, userId)

  const systemMessage = buildSystemMessage(config.systemMessage, textChunks)

  // Inject binary knowledge files (PDFs, etc.) as an initial context message
  const convertedMessages = await convertToModelMessages(messages)
  if (fileParts.length > 0) {
    convertedMessages.unshift({
      role: "user" as const,
      content: [
        {
          type: "text" as const,
          text: "The following files are from the knowledge base. Use them as context for all responses:",
        },
        ...fileParts,
      ],
    })
  }

  const result = streamText({
    model,
    system: systemMessage,
    messages: convertedMessages,
    tools,
    ...(config.providerId === "google"
      ? {
          providerOptions: {
            google: { thinkingConfig: { includeThoughts: true } },
          },
        }
      : {}),
    stopWhen: stepCountIs(10),
    onFinish: async ({ totalUsage: tokenUsage, steps }) => {
      for (const client of mcpClients) {
        await client.close().catch(() => {})
      }

      try {
        const usage = await extractUsage(
          tokenUsage,
          config.providerId,
          config.modelId
        )
        await fetchMutation(
          api.billing.recordAiUsage,
          {
            source: USAGE_SOURCE.chat,
            chatId: activeChatId ? (activeChatId as Id<"chats">) : undefined,
            model: config.modelId,
            providerId: config.providerId,
            ...usage,
          },
          { token: convexToken }
        )
      } catch (error) {
        console.error("Failed to record usage:", error)
      }

      try {
        await recordToolLedgerEntries({ steps, activeChatId, convexToken })
      } catch (error) {
        console.error("Failed to record tool usage:", error)
      }
    },
  })

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.merge(
        result.toUIMessageStream({
          sendReasoning: true,
        })
      )

      if (!titlePromise || !activeChatId) return

      try {
        const titleResult = await titlePromise
        if (!titleResult) return

        const { text, usage: titleUsage } = titleResult
        const title = text.trim()

        if (!title) return

        await fetchMutation(
          api.chats.updateTitle,
          {
            chatId: activeChatId as Id<"chats">,
            title,
          },
          { token: convexToken }
        )

        writer.write({
          type: "data-title",
          id: "chat-title",
          data: { chatId: activeChatId, title },
          transient: true,
        })

        try {
          const usage = await extractUsage(
            titleUsage,
            config.providerId,
            config.modelId
          )
          await fetchMutation(
            api.billing.recordAiUsage,
            {
              source: USAGE_SOURCE.title,
              chatId: activeChatId as Id<"chats">,
              model: config.modelId,
              providerId: config.providerId,
              ...usage,
            },
            { token: convexToken }
          )
        } catch (error) {
          console.error("Failed to record title usage:", error)
        }
      } catch (error) {
        console.error("Failed to update title:", error)
      }
    },
  })

  return createUIMessageStreamResponse({ stream })
}
