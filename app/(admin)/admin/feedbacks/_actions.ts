"use server"

import { fetchQuery } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import { clerkClient } from "@clerk/nextjs/server"
import { getCurrentUserConvexToken } from "@/lib/convex/server"

export type AdminFeedback = {
  id: string
  chatId: string
  chatTitle: string
  messageId: string
  userName: string
  userEmail: string
  rating: "like" | "dislike"
  comment?: string
  createdAt: number
}

export async function getFeedbacks(): Promise<AdminFeedback[]> {
  const client = await clerkClient()
  const token = await getCurrentUserConvexToken()

  const feedbacks = await fetchQuery(api.feedback.listAll, {}, { token })

  const userIdSet = new Set(feedbacks.map((f) => f.userId))
  const userMap = new Map<string, { name: string; email: string }>()

  for (const tokenId of userIdSet) {
    const clerkUserId = tokenId.split("|").pop() ?? ""
    try {
      const user = await client.users.getUser(clerkUserId)
      userMap.set(tokenId, {
        name:
          [user.firstName, user.lastName].filter(Boolean).join(" ") ||
          "Unknown",
        email: user.emailAddresses[0]?.emailAddress ?? "",
      })
    } catch {
      userMap.set(tokenId, { name: "Deleted User", email: "" })
    }
  }

  return feedbacks.map((fb) => ({
    id: fb._id,
    chatId: fb.chatId,
    chatTitle: fb.chatTitle,
    messageId: fb.messageId,
    userName: userMap.get(fb.userId)?.name ?? "Unknown",
    userEmail: userMap.get(fb.userId)?.email ?? "",
    rating: fb.rating,
    comment: fb.comment,
    createdAt: fb._creationTime,
  }))
}
