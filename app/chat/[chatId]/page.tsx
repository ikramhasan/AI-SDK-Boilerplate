"use client"

import { useChat } from "@ai-sdk/react"
import type { UIMessage } from "ai"
import { useMutation, useQuery } from "convex/react"
import { useSession } from "@better-auth-ui/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect } from "react"
import { ChatConversation } from "@/app/chat/_components/chat-conversation"
import { ChatAppShell, ChatShellLoading } from "@/app/chat/_components/chat-shell"
import {
  chatTransport,
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

  const { messages, sendMessage, status, stop, regenerate } = useChat({
    id: chatId,
    transport: chatTransport,
    messages: initialMessages,
    onFinish: async ({ messages: allMessages }) => {
      try {
        await saveMessages({
          chatId: chatId as Id<"chats">,
          messages: toStoredMessages(allMessages),
        })
      } catch (error) {
        console.error("Failed to save chat:", error)
      }
    },
  })

  const handleSubmit = useCallback(
    (text: string, files: ChatSubmissionFile[]) => {
      if (!hasChatSubmission(text, files)) return

      sendMessage({
        text,
        ...(files.length > 0 ? { files } : {}),
      })
    },
    [sendMessage]
  )

  return (
    <ChatAppShell>
      <ChatConversation
        autoFocus
        chatId={chatId}
        messages={messages}
        onSubmit={handleSubmit}
        reload={regenerate}
        status={status}
        stop={stop}
      />
    </ChatAppShell>
  )
}
