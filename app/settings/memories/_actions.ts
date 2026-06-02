"use server"

import { revalidatePath } from "next/cache"
import Supermemory from "supermemory"
import { getUserMemoryContainerTag } from "@/lib/agents/supermemory"
import { requireCurrentUserConvexAuth } from "@/lib/convex/server"

export type MemoryRecord = {
  id: string
  content: string
  createdAt: string
  source: "ai" | "manual"
  status: string
  summary: string | null
  title: string | null
  updatedAt: string
}

type MemoryActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string }

function getSupermemoryClient() {
  const apiKey = process.env.SUPERMEMORY_API_KEY
  if (!apiKey) {
    throw new Error("SUPERMEMORY_API_KEY is not configured.")
  }

  return new Supermemory({ apiKey })
}

function friendlyError(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong."
}

function getMemorySource(metadata: unknown): MemoryRecord["source"] {
  return typeof metadata === "object" &&
    metadata !== null &&
    !Array.isArray(metadata) &&
    "source" in metadata &&
    metadata.source === "manual"
    ? "manual"
    : "ai"
}

async function assertMemoryBelongsToUser(
  client: Supermemory,
  id: string,
  containerTag: string
) {
  const memory = await client.memories.get(id)
  if (!memory.containerTags?.includes(containerTag)) {
    throw new Error("Memory not found.")
  }
}

export async function listMemories(): Promise<
  MemoryActionResult<MemoryRecord[]>
> {
  try {
    const { userId } = await requireCurrentUserConvexAuth()
    const client = getSupermemoryClient()
    const containerTag = getUserMemoryContainerTag(userId)
    const memories: MemoryRecord[] = []
    let page = 1
    let totalPages = 1

    do {
      const response = await client.memories.list({
        containerTags: [containerTag],
        includeContent: true,
        limit: 100,
        order: "desc",
        page,
        sort: "updatedAt",
      })

      memories.push(
        ...response.memories.map((memory) => ({
          id: memory.id,
          content: memory.content ?? memory.summary ?? memory.title ?? "",
          createdAt: memory.createdAt,
          source: getMemorySource(memory.metadata),
          status: memory.status,
          summary: memory.summary,
          title: memory.title,
          updatedAt: memory.updatedAt,
        }))
      )

      totalPages = response.pagination.totalPages
      page += 1
    } while (page <= totalPages)

    return { ok: true, data: memories }
  } catch (error) {
    return { ok: false, error: friendlyError(error) }
  }
}

export async function addMemory(content: string): Promise<MemoryActionResult> {
  try {
    const trimmed = content.trim()
    if (!trimmed) {
      return { ok: false, error: "Memory cannot be empty." }
    }

    const { userId } = await requireCurrentUserConvexAuth()
    const client = getSupermemoryClient()

    await client.add({
      content: trimmed,
      containerTag: getUserMemoryContainerTag(userId),
      metadata: { source: "manual" },
    })

    revalidatePath("/settings/memories")
    return { ok: true, data: undefined }
  } catch (error) {
    return { ok: false, error: friendlyError(error) }
  }
}

export async function updateMemory(
  id: string,
  content: string
): Promise<MemoryActionResult> {
  try {
    const trimmed = content.trim()
    if (!trimmed) {
      return { ok: false, error: "Memory cannot be empty." }
    }

    const { userId } = await requireCurrentUserConvexAuth()
    const client = getSupermemoryClient()
    const containerTag = getUserMemoryContainerTag(userId)

    await assertMemoryBelongsToUser(client, id, containerTag)

    await client.memories.update(id, {
      content: trimmed,
      containerTag,
    })

    revalidatePath("/settings/memories")
    return { ok: true, data: undefined }
  } catch (error) {
    return { ok: false, error: friendlyError(error) }
  }
}

export async function deleteMemory(id: string): Promise<MemoryActionResult> {
  try {
    const { userId } = await requireCurrentUserConvexAuth()
    const client = getSupermemoryClient()
    await assertMemoryBelongsToUser(
      client,
      id,
      getUserMemoryContainerTag(userId)
    )
    await client.memories.delete(id)

    revalidatePath("/settings/memories")
    return { ok: true, data: undefined }
  } catch (error) {
    return { ok: false, error: friendlyError(error) }
  }
}
