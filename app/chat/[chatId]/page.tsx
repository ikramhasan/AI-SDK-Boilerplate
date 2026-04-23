"use client"

import { useChat } from "@ai-sdk/react"
import type { UIMessage } from "ai"
import { useMutation, useQuery } from "convex/react"
import { useAuth } from "@clerk/nextjs"
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
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/chat")
    }
  }, [isLoaded, isSignedIn, router])

  const chat = useQuery(
    api.chats.get,
    isSignedIn ? { chatId: chatId as Id<"chats"> } : "skip"
  )
  const storedMessages = useQuery(
    api.messages.list,
    isSignedIn ? { chatId: chatId as Id<"chats"> } : "skip"
  )
  const shouldRedirect = isLoaded && !isSignedIn

  useEffect(() => {
    if (chat === null) {
      router.replace("/chat")
    }
  }, [chat, router])

  if (
    !isLoaded ||
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
