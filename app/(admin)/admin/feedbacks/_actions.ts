"use server"

import { api } from "@/convex/_generated/api"
import { fetchAuthQuery } from "@/lib/auth-server"

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
  const feedbacks = await fetchAuthQuery(api.feedback.listAll, {})

  const userIdSet = new Set(feedbacks.map((f) => f.userId))
  const userMap = await fetchAuthQuery(api.adminUsers.listByTokenIdentifiers, {
    tokenIdentifiers: [...userIdSet],
  })

  return feedbacks.map((fb) => ({
    id: fb._id,
    chatId: fb.chatId,
    chatTitle: fb.chatTitle,
    messageId: fb.messageId,
    userName: userMap[fb.userId]?.name ?? "Unknown",
    userEmail: userMap[fb.userId]?.email ?? "",
    rating: fb.rating,
    comment: fb.comment,
    createdAt: fb._creationTime,
  }))
}
