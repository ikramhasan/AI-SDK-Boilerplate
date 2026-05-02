import type {
  ToolkitDetail,
  ToolkitListItem,
  ToolkitTool,
} from "@/app/settings/integrations/types"

// ── List toolkits ──────────────────────────────────────────────────────────

export interface ToolkitsListResponse {
  connectedToolkits: ToolkitListItem[]
  toolkits: ToolkitListItem[]
  nextCursor: string | null
  totalPages: number | null
}

export async function fetchToolkits(opts?: {
  cursor?: string
  search?: string
}): Promise<ToolkitsListResponse> {
  const params = new URLSearchParams()
  if (opts?.cursor) params.set("nextCursor", opts.cursor)
  if (opts?.search) params.set("search", opts.search)

  const res = await fetch(`/api/integrations?${params}`)
  if (!res.ok) throw new Error("Failed to fetch integrations")
  return res.json()
}

// ── Toolkit detail ─────────────────────────────────────────────────────────

export interface ToolkitDetailResponse {
  toolkit: ToolkitDetail
  tools: ToolkitTool[]
}

export async function fetchToolkitDetail(
  slug: string
): Promise<ToolkitDetailResponse> {
  const res = await fetch(`/api/integrations/${slug}`)
  if (!res.ok) throw new Error("Failed to fetch integration details")
  return res.json()
}

// ── Mutations ──────────────────────────────────────────────────────────────

export async function connectToolkit(
  slug: string
): Promise<{ redirectUrl?: string }> {
  const res = await fetch("/api/integrations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ toolkit: slug }),
  })
  if (!res.ok) throw new Error("Failed to connect integration")
  return res.json()
}

export async function disconnectToolkit(
  connectedAccountId: string
): Promise<{ success: boolean }> {
  const res = await fetch("/api/integrations/disconnect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ connectedAccountId }),
  })
  if (!res.ok) throw new Error("Failed to disconnect integration")
  return res.json()
}
