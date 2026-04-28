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

export const maxDuration = 30

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
    ...(config.provider === "google"
      ? {
          providerOptions: {
            google: { thinkingConfig: { includeThoughts: true } },
          },
        }
      : {}),
    stopWhen: stepCountIs(10),
    onFinish: async ({ usage: tokenUsage }) => {
      for (const client of mcpClients) {
        await client.close().catch(() => {})
      }

      try {
        const usage = extractUsage(tokenUsage, config.costConfig)
        await fetchMutation(
          api.usage.record,
          {
            source: "chat" as const,
            chatId: activeChatId ? (activeChatId as Id<"chats">) : undefined,
            model: config.modelId,
            ...usage,
          },
          { token: convexToken }
        )
      } catch (error) {
        console.error("Failed to record usage:", error)
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
          const usage = extractUsage(titleUsage, config.costConfig)
          await fetchMutation(
            api.usage.record,
            {
              source: "title" as const,
              chatId: activeChatId as Id<"chats">,
              model: config.modelId,
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
