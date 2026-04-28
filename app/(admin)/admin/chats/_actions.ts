"use server"

import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { fetchAuthQuery } from "@/lib/auth-server"

export type AdminChat = {
  id: string  
  title: string
  userName: string
  userEmail: string
  messageCount: number
  createdAt: number
}

export type AdminChatDetail = {
  id: string
  title: string
  userName: string
  userEmail: string
  messages: { _id: string; role: string; parts: unknown[] }[]
}

export async function getChatDetail(chatId: string): Promise<AdminChatDetail | null> {
  const chat = await fetchAuthQuery(
    api.chats.getAdmin,
    {
      chatId: chatId as Id<"chats">,
    }
  )
  if (!chat) return null

  const messages = await fetchAuthQuery(
    api.messages.listAll,
    {
      chatId: chatId as Id<"chats">,
    }
  )

  const users = await fetchAuthQuery(api.adminUsers.listByTokenIdentifiers, {
    tokenIdentifiers: [chat.userId],
  })
  const user = users[chat.userId]

  return {
    id: chat._id,
    title: chat.title,
    userName: user?.name ?? "Deleted User",
    userEmail: user?.email ?? "",
    messages,
  }
}

export async function getChats(): Promise<AdminChat[]> {
  const chats = await fetchAuthQuery(api.chats.listAll, {})

  const userIdSet = new Set(chats.map((c) => c.userId))
  const userMap = await fetchAuthQuery(api.adminUsers.listByTokenIdentifiers, {
    tokenIdentifiers: [...userIdSet],
  })

  return chats.map((chat) => ({
    id: chat._id,
    title: chat.title,
    userName: userMap[chat.userId]?.name ?? "Unknown",
    userEmail: userMap[chat.userId]?.email ?? "",
    messageCount: chat.messageCount,
    createdAt: chat._creationTime,
  }))
}
