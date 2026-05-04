"use client"

import { useChat } from "@ai-sdk/react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react"
import { ChatConversation } from "@/app/chat/_components/chat-conversation"
import { ChatAppShell } from "@/app/chat/_components/chat-shell"
import {
  chatTransport,
  extractFriendlyError,
  hasChatSubmission,
  toStoredMessages,
  type ChatSubmissionFile,
} from "@/app/chat/_components/chat-utils"

export default function Page() {
  const [chatKey, setChatKey] = useState(() => crypto.randomUUID())
  const handleNewChat = useEffectEvent(() => {
    window.history.replaceState(null, "", "/chat")
    setChatKey(crypto.randomUUID())
  })

  useEffect(() => {
    window.addEventListener("new-chat", handleNewChat)
    return () => window.removeEventListener("new-chat", handleNewChat)
  }, [])

  return (
    <ChatAppShell>
      <NewChatView key={chatKey} />
    </ChatAppShell>
  )
}

function NewChatView() {
  const createChat = useMutation(api.chats.create)
  const saveMessages = useMutation(api.messages.save)
  const chatIdRef = useRef<string | null>(null)
  const [chatId, setChatId] = useState<string | null>(null)
  const titleGeneratedRef = useRef(false)

  const { messages, sendMessage, setMessages, status, stop } = useChat({
    transport: chatTransport,
    onData: (dataPart) => {
      if (dataPart.type !== "data-title") return

      const data = dataPart.data as { chatId?: unknown; title?: unknown }
      if (typeof data.chatId !== "string" || typeof data.title !== "string") {
        return
      }

      window.dispatchEvent(
        new CustomEvent("chat-title-available", {
          detail: { chatId: data.chatId, title: data.title },
        })
      )
    },
    onError: async (error) => {
      const id = chatIdRef.current
      if (!id) return

      const friendlyMessage = extractFriendlyError(error)
      setMessages((prev) => {
        const updated = [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant" as const,
            parts: [{ type: "text" as const, text: friendlyMessage }],
            metadata: { error: true },
          },
        ]
        // Persist with the error message included
        saveMessages({
          chatId: id as Id<"chats">,
          messages: toStoredMessages(updated),
        }).catch((e) => console.error("Failed to save error message:", e))
        return updated
      })
    },
    onFinish: async ({ messages: allMessages }) => {
      const id = chatIdRef.current
      if (!id) return

      try {
        await saveMessages({
          chatId: id as Id<"chats">,
          messages: toStoredMessages(allMessages),
        })
      } catch (error) {
        console.error("Failed to save chat:", error)
      }
    },
  })

  const handleSubmit = useCallback(
    async (text: string, files: ChatSubmissionFile[]) => {
      if (!hasChatSubmission(text, files)) return

      if (!chatIdRef.current) {
        try {
          const id = await createChat({ title: "New chat" })
          chatIdRef.current = id
          setChatId(id)
          titleGeneratedRef.current = false
          window.history.replaceState(null, "", `/chat/${id}`)
        } catch {
          return
        }
      }

      const shouldGenerateTitle =
        Boolean(chatIdRef.current) &&
        !titleGeneratedRef.current &&
        Boolean(text.trim())
      if (shouldGenerateTitle) {
        titleGeneratedRef.current = true
      }

      sendMessage(
        {
          text,
          ...(files.length > 0 ? { files } : {}),
        },
        {
          body: {
            chatId: chatIdRef.current,
            generateTitle: shouldGenerateTitle,
            titleUserMessage: shouldGenerateTitle ? text.trim() : undefined,
          },
        }
      )
    },
    [createChat, sendMessage]
  )

  return (
    <ChatConversation
      autoFocus
      chatId={chatId ?? undefined}
      messages={messages}
      onSubmit={handleSubmit}
      showSuggestions
      status={status}
      stop={stop}
    />
  )
}
