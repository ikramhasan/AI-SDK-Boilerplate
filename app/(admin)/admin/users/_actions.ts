"use server"

import { checkRole } from "@/lib/roles"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { fetchQuery } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import { getCurrentUserConvexToken } from "@/lib/convex/server"

export type SerializedUser = {
  id: string
  name: string
  email: string
  imageUrl: string
  role: "user" | "admin"
  banned: boolean
  createdAt: number
}

function serializeUser(user: {
  id: string
  firstName: string | null
  lastName: string | null
  emailAddresses: { emailAddress: string }[]
  imageUrl: string
  publicMetadata: Record<string, unknown>
  banned: boolean
  createdAt: number
}): SerializedUser {
  const role =
    user.publicMetadata?.role === "admin" ? "admin" : "user"
  return {
    id: user.id,
    name: [user.firstName, user.lastName].filter(Boolean).join(" ") || "Unknown",
    email: user.emailAddresses[0]?.emailAddress ?? "",
    imageUrl: user.imageUrl,
    role,
    banned: user.banned,
    createdAt: user.createdAt,
  }
}

export async function getUsers(query?: string, limit = 100, offset = 0) {
  if (!(await checkRole("admin"))) throw new Error("Unauthorized")
  const client = await clerkClient()
  const { data, totalCount } = await client.users.getUserList({
    orderBy: "-created_at",
    limit,
    offset,
    ...(query ? { query } : {}),
  })
  return { users: data.map(serializeUser), totalCount }
}

export async function banUser(userId: string) {
  if (!(await checkRole("admin"))) throw new Error("Unauthorized")
  const { userId: currentUserId } = await auth()
  if (currentUserId === userId) throw new Error("Cannot ban your own account")
  const client = await clerkClient()
  await client.users.banUser(userId)
}

export async function unbanUser(userId: string) {
  if (!(await checkRole("admin"))) throw new Error("Unauthorized")
  const client = await clerkClient()
  await client.users.unbanUser(userId)
}


export async function makeAdmin(userId: string) {
  if (!(await checkRole("admin"))) throw new Error("Unauthorized")
  const { userId: currentUserId } = await auth()
  if (currentUserId === userId) throw new Error("Cannot modify own role")
  const client = await clerkClient()
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { role: "admin" },
  })
}

export async function removeAdmin(userId: string) {
  if (!(await checkRole("admin"))) throw new Error("Unauthorized")
  const { userId: currentUserId } = await auth()
  if (currentUserId === userId) throw new Error("Cannot remove your own admin access")
  const client = await clerkClient()
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { role: "member" },
  })
}

export async function deleteUser(userId: string) {
  if (!(await checkRole("admin"))) throw new Error("Unauthorized")
  const { userId: currentUserId } = await auth()
  if (currentUserId === userId) throw new Error("Cannot delete your own account")
  const client = await clerkClient()
  await client.users.deleteUser(userId)
}

export type DetailedUser = SerializedUser & {
  phone: string
  lastSignInAt: number | null
  externalAccounts: { provider: string; email: string }[]
  emailVerified: boolean
}

export async function getUser(userId: string): Promise<DetailedUser> {
  if (!(await checkRole("admin"))) throw new Error("Unauthorized")
  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const base = serializeUser(user)
  return {
    ...base,
    phone: user.phoneNumbers[0]?.phoneNumber ?? "",
    lastSignInAt: user.lastSignInAt,
    externalAccounts: user.externalAccounts.map((a) => ({
      provider: a.provider ?? a.verification?.strategy ?? "unknown",
      email: a.emailAddress ?? "",
    })),
    emailVerified:
      user.emailAddresses[0]?.verification?.status === "verified",
  }
}

export type UserChat = {
  id: string
  title: string
  messageCount: number
  createdAt: number
}

export async function getUserChats(clerkUserId: string): Promise<UserChat[]> {
  const token = await getCurrentUserConvexToken()

  const tokenIdentifier = `${process.env.CLERK_FRONTEND_API_URL}|${clerkUserId}`
  const chats = await fetchQuery(
    api.chats.listByUser,
    { userId: tokenIdentifier },
    { token }
  )

  return chats.map((chat) => ({
    id: chat._id,
    title: chat.title,
    messageCount: chat.messageCount,
    createdAt: chat._creationTime,
  }))
}
