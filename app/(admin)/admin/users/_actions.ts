"use server"

import { fetchAuthMutation, fetchAuthQuery } from "@/lib/auth-server"
import { api } from "@/convex/_generated/api"

export type SerializedUser = {
  id: string
  name: string
  email: string
  imageUrl: string
  role: "user" | "admin"
  banned: boolean
  createdAt: number
}

export async function getUsers(
  query?: string,
  limit = 100,
  offset = 0
): Promise<{ users: SerializedUser[]; totalCount: number }> {
  const result = await fetchAuthQuery(api.adminUsers.list, {
    query,
    limit,
    offset,
  })

  return {
    ...result,
    users: result.users.map((user) => ({
      ...user,
      role: user.role === "admin" ? ("admin" as const) : ("user" as const),
    })),
  }
}

export async function banUser(userId: string) {
  await fetchAuthMutation(api.adminUsers.ban, { userId })
}

export async function unbanUser(userId: string) {
  await fetchAuthMutation(api.adminUsers.unban, { userId })
}

export async function makeAdmin(userId: string) {
  await fetchAuthMutation(api.adminUsers.setRole, { userId, role: "admin" })
}

export async function removeAdmin(userId: string) {
  await fetchAuthMutation(api.adminUsers.setRole, { userId, role: "user" })
}

export async function deleteUser(userId: string) {
  await fetchAuthMutation(api.adminUsers.remove, { userId })
}

export type DetailedUser = SerializedUser & {
  phone: string
  lastSignInAt: number | null
  externalAccounts: { provider: string; email: string }[]
  emailVerified: boolean
}

export async function getUser(userId: string): Promise<DetailedUser | null> {
  const user = await fetchAuthQuery(api.adminUsers.get, { userId })
  if (!user) return null

  return {
    ...user,
    role: user.role === "admin" ? "admin" : "user",
  }
}

export type UserChat = {
  id: string
  title: string
  messageCount: number
  createdAt: number
}

export async function getUserChats(authUserId: string): Promise<UserChat[]> {
  const chats = await fetchAuthQuery(api.chats.listByAuthUser, { authUserId })

  return chats.map((chat) => ({
    id: chat._id,
    title: chat.title,
    messageCount: chat.messageCount,
    createdAt: chat._creationTime,
  }))
}
