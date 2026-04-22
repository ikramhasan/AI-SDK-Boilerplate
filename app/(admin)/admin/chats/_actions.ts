"use server"

import { fetchQuery } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { clerkClient } from "@clerk/nextjs/server"
import { getCurrentUserConvexToken } from "@/lib/convex/server"

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
  const client = await clerkClient()
  const token = await getCurrentUserConvexToken()

  const chat = await fetchQuery(
    api.chats.getAdmin,
    {
      chatId: chatId as Id<"chats">,
    },
    { token }
  )
  if (!chat) return null

  const messages = await fetchQuery(
    api.messages.listAll,
    {
      chatId: chatId as Id<"chats">,
    },
    { token }
  )

  const clerkUserId = chat.userId.split("|").pop() ?? ""
  let userName = "Unknown"
  let userEmail = ""
  try {
    const user = await client.users.getUser(clerkUserId)
    userName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Unknown"
    userEmail = user.emailAddresses[0]?.emailAddress ?? ""
  } catch {
    userName = "Deleted User"
  }

  return {
    id: chat._id,
    title: chat.title,
    userName,
    userEmail,
    messages,
  }
}

export async function getChats(): Promise<AdminChat[]> {
  const client = await clerkClient()
  const token = await getCurrentUserConvexToken()

  const chats = await fetchQuery(api.chats.listAll, {}, { token })

  // Resolve Clerk user info for each unique userId
  const userIdSet = new Set(chats.map((c) => c.userId))
  const userMap = new Map<string, { name: string; email: string }>()

  for (const tokenId of userIdSet) {
    // tokenIdentifier format: "https://<domain>|<clerk_user_id>"
    const clerkUserId = tokenId.split("|").pop() ?? ""
    try {
      const user = await client.users.getUser(clerkUserId)
      userMap.set(tokenId, {
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || "Unknown",
        email: user.emailAddresses[0]?.emailAddress ?? "",
      })
    } catch {
      userMap.set(tokenId, { name: "Deleted User", email: "" })
    }
  }

  return chats.map((chat) => ({
    id: chat._id,
    title: chat.title,
    userName: userMap.get(chat.userId)?.name ?? "Unknown",
    userEmail: userMap.get(chat.userId)?.email ?? "",
    messageCount: chat.messageCount,
    createdAt: chat._creationTime,
  }))
}
