"use client"

import { useChat } from "@ai-sdk/react"
import type { UIMessage } from "ai"
import { useMutation, useQuery } from "convex/react"
import { useSession } from "@better-auth-ui/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useRef } from "react"
import { ChatConversation } from "@/app/chat/_components/chat-conversation"
import { ChatAppShell, ChatShellLoading } from "@/app/chat/_components/chat-shell"
import {
  addThinkingDurationToLastAssistantMessage,
  chatTransport,
  extractFriendlyError,
  getElapsedThinkingSeconds,
  hasChatSubmission,
  toStoredMessages,
  toUIMessages,
  type ChatSubmissionFile,
} from "@/app/chat/_components/chat-utils"

export default function ChatPage() {
  const params = useParams()
  const chatId = params.chatId as string
  const { data: session, isPending: isLoading } = useSession()
  const isAuthenticated = Boolean(session)
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/chat")
    }
  }, [isLoading, isAuthenticated, router])

  const chat = useQuery(
    api.chats.get,
    isAuthenticated ? { chatId: chatId as Id<"chats"> } : "skip"
  )
  const storedMessages = useQuery(
    api.messages.list,
    isAuthenticated ? { chatId: chatId as Id<"chats"> } : "skip"
  )
  const shouldRedirect = !isLoading && !isAuthenticated

  useEffect(() => {
    if (chat === null) {
      router.replace("/chat")
    }
  }, [chat, router])

  if (
    isLoading ||
    shouldRedirect ||
    chat === undefined ||
    storedMessages === undefined ||
    chat === null
  ) {
    return <ChatShellLoading />
  }

  return (
    <ChatView
      key={chatId}
      chatId={chatId}
      initialMessages={toUIMessages(storedMessages)}
    />
  )
}

function ChatView({
  chatId,
  initialMessages,
}: {
  chatId: string
  initialMessages: UIMessage[]
}) {
  const saveMessages = useMutation(api.messages.save)
  const thinkingStartedAtRef = useRef<number | null>(null)
  const thinkingDurationsRef = useRef(new Map<string, number>())

  const { messages, sendMessage, setMessages, status, stop, regenerate } = useChat({
    id: chatId,
    transport: chatTransport,
    messages: initialMessages,
    onError: async (error) => {
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
        saveMessages({
          chatId: chatId as Id<"chats">,
          messages: toStoredMessages(updated),
        }).catch((e) => console.error("Failed to save error message:", e))
        return updated
      })
    },
    onFinish: async ({ messages: allMessages }) => {
      const assistantMessageId = allMessages.findLast(
        (message) => message.role === "assistant"
      )?.id
      const thinkingDurationSeconds =
        (assistantMessageId
          ? thinkingDurationsRef.current.get(assistantMessageId)
          : undefined) ??
        getElapsedThinkingSeconds(thinkingStartedAtRef.current)
      thinkingStartedAtRef.current = null
      if (assistantMessageId) {
        thinkingDurationsRef.current.delete(assistantMessageId)
      }
      const messagesWithDuration = addThinkingDurationToLastAssistantMessage(
        allMessages,
        thinkingDurationSeconds
      )
      setMessages(messagesWithDuration)

      try {
        await saveMessages({
          chatId: chatId as Id<"chats">,
          messages: toStoredMessages(messagesWithDuration),
        })
      } catch (error) {
        console.error("Failed to save chat:", error)
      }
    },
  })

  const handleSubmit = useCallback(
    (text: string, files: ChatSubmissionFile[]) => {
      if (!hasChatSubmission(text, files)) return

      thinkingStartedAtRef.current = Date.now()
      thinkingDurationsRef.current.clear()

      sendMessage({
        text,
        ...(files.length > 0 ? { files } : {}),
      })
    },
    [sendMessage]
  )

  const handleRegenerate = useCallback(() => {
    thinkingStartedAtRef.current = Date.now()
    thinkingDurationsRef.current.clear()
    regenerate()
  }, [regenerate])

  const handleThinkingDone = useCallback(
    (messageId: string, durationSeconds: number) => {
      thinkingDurationsRef.current.set(messageId, durationSeconds)
    },
    []
  )

  return (
    <ChatAppShell>
      <ChatConversation
        autoFocus
        chatId={chatId}
        messages={messages}
        onThinkingDone={handleThinkingDone}
        onSubmit={handleSubmit}
        reload={handleRegenerate}
        status={status}
        stop={stop}
      />
    </ChatAppShell>
  )
}
