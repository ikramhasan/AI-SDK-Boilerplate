import { DefaultChatTransport, type UIMessage } from "ai"
import { serializeMessagesForStorage } from "@/lib/chat-message-storage"
import { isRecord } from "@/lib/utils"

export type StoredChatMessage = {
  _id: string
  role: string
  parts: unknown[]
  metadata?: unknown
}

export type ChatSubmissionFile = {
  type: "file"
  url: string
  mediaType: string
  filename?: string
}

export type ChatStatus = "ready" | "submitted" | "streaming" | "error"

export const chatTransport = new DefaultChatTransport({ api: "/api/chat" })

export const hasChatSubmission = (text: string, files: ChatSubmissionFile[]) =>
  text.trim().length > 0 || files.length > 0

export const toStoredMessages = (messages: UIMessage[]) =>
  serializeMessagesForStorage(messages)

export const toUIMessages = (messages: StoredChatMessage[]): UIMessage[] =>
  messages.map((message) => ({
    id: message._id,
    role: message.role as UIMessage["role"],
    parts: message.parts as UIMessage["parts"],
    ...(isRecord(message.metadata) ? { metadata: message.metadata } : {}),
  }))

export function formatThinkingDuration(totalSeconds: number): string {
  const seconds = Math.max(1, Math.round(totalSeconds))

  if (seconds < 60) {
    return `${seconds} ${seconds === 1 ? "second" : "seconds"}`
  }

  const minutes = Math.round(seconds / 60)
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`
  }

  const hours = Math.round(minutes / 60)
  return `${hours} ${hours === 1 ? "hour" : "hours"}`
}

export function getElapsedThinkingSeconds(startedAt: number | null): number {
  if (startedAt === null) return 1

  return Math.max(1, Math.ceil((Date.now() - startedAt) / 1000))
}

export function getThinkingDurationSeconds(message: UIMessage): number | undefined {
  const metadata = (message as UIMessage & { metadata?: unknown }).metadata
  if (!isRecord(metadata)) return undefined

  const value = metadata.thinkingDurationSeconds
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : undefined
}

export function addThinkingDurationToLastAssistantMessage(
  messages: UIMessage[],
  thinkingDurationSeconds: number
): UIMessage[] {
  const assistantIndex = messages.findLastIndex(
    (message) => message.role === "assistant"
  )

  if (assistantIndex === -1) return messages

  return messages.map((message, index) => {
    if (index !== assistantIndex) return message

    const metadata = (message as UIMessage & { metadata?: unknown }).metadata
    return {
      ...message,
      metadata: {
        ...(isRecord(metadata) ? metadata : {}),
        thinkingDurationSeconds,
      },
    }
  })
}

export function extractFriendlyError(error: Error): string {
  const msg = error.message || ""

  if (msg.includes("out of credits"))
    return "You're out of credits. Please upgrade your plan to continue chatting."
  if (msg.includes("trial credits have expired"))
    return "Your trial has expired. Choose a subscription to continue."
  if (msg.includes("at least") && msg.includes("credits"))
    return "You're out of credits. Please upgrade your plan to continue chatting."

  return "Something went wrong. Please try again."
}
