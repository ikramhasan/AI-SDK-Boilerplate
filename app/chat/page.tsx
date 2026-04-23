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

  const { messages, sendMessage, status, stop } = useChat({
    transport: chatTransport,
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

      // Fire-and-forget title generation on first message
      if (chatIdRef.current && !titleGeneratedRef.current && text.trim()) {
        titleGeneratedRef.current = true
        fetch("/api/generate-title", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatId: chatIdRef.current,
            userMessage: text.trim(),
          }),
        }).catch(console.error)
      }

      sendMessage({
        text,
        ...(files.length > 0 ? { files } : {}),
      })
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
