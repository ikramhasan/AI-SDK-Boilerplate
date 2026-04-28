"use server"

import { api } from "@/convex/_generated/api"
import { fetchAuthQuery } from "@/lib/auth-server"

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
  const records = await fetchAuthQuery(api.usage.listAll, {})

  const userIdSet = new Set(records.map((r) => r.userId))
  const userMap = await fetchAuthQuery(api.adminUsers.listByTokenIdentifiers, {
    tokenIdentifiers: [...userIdSet],
  })

  return records.map((r) => ({
    id: r._id,
    userId: r.userId,
    userName: userMap[r.userId]?.name ?? "Unknown",
    userEmail: userMap[r.userId]?.email ?? "",
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
