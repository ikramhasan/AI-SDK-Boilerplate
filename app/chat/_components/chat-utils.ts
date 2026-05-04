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
