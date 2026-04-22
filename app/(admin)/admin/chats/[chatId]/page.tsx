"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ChatMessages } from "@/app/_components/chat-messages"
import { toUIMessages } from "@/app/_components/chat-utils"
import { getChatDetail, type AdminChatDetail } from "../_actions"

export default function AdminChatDetailPage() {
  const params = useParams()
  const chatId = params.chatId as string
  const router = useRouter()

  const [chat, setChat] = useState<AdminChatDetail | null | undefined>(
    undefined
  )

  useEffect(() => {
    let cancelled = false
    async function fetchChat() {
      const data = await getChatDetail(chatId)
      if (!cancelled) setChat(data)
    }
    fetchChat()
    return () => {
      cancelled = true
    }
  }, [chatId])

  if (chat === undefined) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (chat === null) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground">Chat not found</p>
        <Button variant="ghost" onClick={() => router.push("/admin/chats")}>
          <ArrowLeft className="mr-2 size-4" />
          Back to chats
        </Button>
      </div>
    )
  }

  const messages = toUIMessages(chat.messages)

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/admin/chats")}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-medium">{chat.title}</h1>
          <p className="truncate text-xs text-muted-foreground">
            {chat.userName} · {chat.userEmail}
          </p>
        </div>
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
