import "server-only";

import { createMCPClient, type MCPClient } from "@ai-sdk/mcp";
import { internal } from "@/convex/_generated/api";
import { runConvexAdminQuery } from "@/lib/convex/server";

export interface MCPResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tools: Record<string, any>;
  clients: MCPClient[];
}

export async function getMCPTools(): Promise<MCPResult> {
  const mcpServers = await runConvexAdminQuery(
    internal.mcpServers.listRuntime,
    {}
  ).catch(() => []);
  const enabledServers = mcpServers.filter((s) => s.enabled);

  const clients: MCPClient[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tools: Record<string, any> = {};

  for (const server of enabledServers) {
    try {
      const headers: Record<string, string> = {};
      if (server.authType === "bearer" && server.authToken) {
        headers["Authorization"] = `Bearer ${server.authToken}`;
      } else if (
        server.authType === "custom-header" &&
        server.authHeaderName &&
        server.authToken
      ) {
        headers[server.authHeaderName] = server.authToken;
      }

      const client = await createMCPClient({
        transport: {
          type: server.transport,
          url: server.url,
          headers: Object.keys(headers).length > 0 ? headers : undefined,
        },
      });
      clients.push(client);
      const serverTools = await client.tools();
      tools = { ...tools, ...serverTools };
    } catch (error) {
      console.error(
        `Failed to connect to MCP server "${server.name}":`,
        error
      );
    }
  }

  return { tools, clients };
}
