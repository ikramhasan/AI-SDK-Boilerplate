"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { ChatMessages } from "@/app/_components/chat-messages"
import { toUIMessages } from "@/app/_components/chat-utils"

export default function SharedChatPage() {
  const params = useParams()
  const chatId = params.chatId as string
  const router = useRouter()

  const chat = useQuery(api.chats.get, {
    chatId: chatId as Id<"chats">,
  })
  const storedMessages = useQuery(api.messages.list, {
    chatId: chatId as Id<"chats">,
  })

  useEffect(() => {
    if (chat === null) {
      router.replace("/chat")
    }
  }, [chat, router])

  if (chat === undefined || storedMessages === undefined || chat === null) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    )
  }

  const messages = toUIMessages(storedMessages)

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex h-12 shrink-0 items-center border-b px-4">
        <h1 className="truncate text-sm font-medium">{chat.title}</h1>
      </header>

      {messages.length > 0 ? (
        <ChatMessages
          messages={messages}
          status="ready"
          onSubmit={() => {}}
          allowToolReplies={false}
        />
      ) : (
        <main className="flex flex-1 flex-col items-center justify-center">
          <p className="text-muted-foreground">No messages in this chat</p>
        </main>
      )}
    </div>
  )
}
