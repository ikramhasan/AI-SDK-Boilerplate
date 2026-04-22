import { DefaultChatTransport, type UIMessage } from "ai"
import { serializeMessagesForStorage } from "@/lib/chat-message-storage"

export type StoredChatMessage = {
  _id: string
  role: string
  parts: unknown[]
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
  }))
