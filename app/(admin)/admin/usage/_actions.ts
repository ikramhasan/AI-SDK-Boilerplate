"use server"

import { fetchQuery } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import { clerkClient } from "@clerk/nextjs/server"
import { getCurrentUserConvexToken } from "@/lib/convex/server"

export type UsageRecord = {
  id: string
  userId: string
  userName: string
  userEmail: string
  source: "chat" | "title"
  chatId: string | undefined
  model: string
  cacheReadTokens: number
  cacheWriteTokens: number
  inputTokens: number
  outputTokens: number
  totalTokens: number
  cost: number
  createdAt: number
}

export async function getUsageRecords(): Promise<UsageRecord[]> {
  const client = await clerkClient()
  const token = await getCurrentUserConvexToken()

  const records = await fetchQuery(api.usage.listAll, {}, { token })

  // Resolve Clerk user info for each unique userId
  const userIdSet = new Set(records.map((r) => r.userId))
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

  return records.map((r) => ({
    id: r._id,
    userId: r.userId,
    userName: userMap.get(r.userId)?.name ?? "Unknown",
    userEmail: userMap.get(r.userId)?.email ?? "",
    source: r.source,
    chatId: r.chatId,
    model: r.model,
    cacheReadTokens: r.cacheReadTokens,
    cacheWriteTokens: r.cacheWriteTokens,
    inputTokens: r.inputTokens,
    outputTokens: r.outputTokens,
    totalTokens: r.totalTokens,
    cost: r.cost,
    createdAt: r._creationTime,
  }))
}
