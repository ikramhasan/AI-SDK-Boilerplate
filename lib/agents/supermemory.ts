import {
  addMemoryTool,
  searchMemoriesTool,
} from "@supermemory/tools/ai-sdk"
import type { ToolSet } from "ai"

export function getUserMemoryContainerTag(userId: string) {
  return `user:${userId}`
}

export function getUserMemoryTools(userId: string): ToolSet {
  const apiKey = process.env.SUPERMEMORY_API_KEY

  if (!apiKey) {
    return {}
  }

  return {
    searchMemories: searchMemoriesTool(apiKey, {
      containerTags: [getUserMemoryContainerTag(userId)],
      strict: true,
    }) as unknown as ToolSet[string],
    addMemory: addMemoryTool(apiKey, {
      containerTags: [getUserMemoryContainerTag(userId)],
      strict: true,
    }) as unknown as ToolSet[string],
  }
}
