import { Composio } from "@composio/core"
import { api } from "@/convex/_generated/api"
import { fetchAuthQuery } from "@/lib/auth-server"
import type {
  ToolkitDetail,
  ToolkitTool,
  ToolParameterSchema,
} from "@/app/settings/integrations/types"
import type { Tool } from "@composio/core"

const composio = new Composio()

export const dynamic = "force-dynamic"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await fetchAuthQuery(api.adminUsers.getCurrentUser, {})
  if (!user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { slug } = await params

  try {
    // Fetch toolkit metadata and connection status in parallel
    const session = await composio.create(user._id, {
      manageConnections: false,
    })

    const [toolkitMeta, connectionInfo] = await Promise.all([
      composio.toolkits.get(slug),
      session.toolkits({ search: slug, limit: 1 }),
    ])

    const toolsCount = toolkitMeta.meta?.toolsCount ?? 100

    const rawTools = await composio.tools.getRawComposioTools({
      toolkits: [slug.toUpperCase()],
      limit: toolsCount,
    })

    // Find the matching toolkit from connection info
    const matchedConnection = connectionInfo.items.find((t) => t.slug === slug)

    const toolkit: ToolkitDetail = {
      slug: toolkitMeta.slug,
      name: toolkitMeta.name,
      description: toolkitMeta.meta?.description,
      logo: toolkitMeta.meta?.logo,
      appUrl: toolkitMeta.meta?.appUrl,
      baseUrl: toolkitMeta.baseUrl,
      categories: toolkitMeta.meta?.categories ?? [],
      toolsCount: toolkitMeta.meta?.toolsCount ?? 0,
      triggersCount: toolkitMeta.meta?.triggersCount ?? 0,
      authSchemes: toolkitMeta.composioManagedAuthSchemes ?? [],
      isConnected: matchedConnection?.connection?.isActive ?? false,
      connectedAccountId: matchedConnection?.connection?.connectedAccount?.id,
      createdAt: toolkitMeta.meta?.createdAt,
      updatedAt: toolkitMeta.meta?.updatedAt,
      availableVersions: toolkitMeta.meta?.availableVersions ?? [],
    }

    const tools: ToolkitTool[] = (rawTools ?? []).map((t: Tool) => ({
      slug: t.slug,
      name: t.name,
      description: t.description,
      tags: t.tags ?? [],
      version: t.version,
      isDeprecated: t.isDeprecated ?? false,
      scopes: t.scopes ?? [],
      inputParameters: t.inputParameters as ToolParameterSchema | undefined,
      outputParameters: t.outputParameters as ToolParameterSchema | undefined,
    }))

    return Response.json({ toolkit, tools })
  } catch (error) {
    console.error(`Failed to fetch toolkit detail for ${slug}:`, error)
    return Response.json(
      { error: "Failed to fetch integration details" },
      { status: 500 }
    )
  }
}
