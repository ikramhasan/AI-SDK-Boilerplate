import type { MCPClient } from "@ai-sdk/mcp";
import { getWebSearchTools } from "./web-search";
import { getCalculatorTool } from "./calculator";
import { getMCPTools } from "./mcp";
import { getComposioTools } from "./composio";
import { getFetchImagesTool } from "./fetch-images";
import { getCreateChartTool } from "./create-chart";
import { getCreateDocumentTool } from "./create-document";
import { getChartImageTool } from "./get-chart-image";
import { getDiagramImageTool } from "./get-diagram-image";
import { getAskUserQuestionTool } from "./ask-user-question";

export interface ResolvedTools {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tools: Record<string, any>;
  mcpClients: MCPClient[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function resolveTools(config: any, userId: string | null): Promise<ResolvedTools> {
  // Read enabled tool string IDs directly from config
  const enabledToolIds = new Set(
    config?.tools
      ?.filter((t: { enabled: boolean }) => t.enabled)
      .map((t: { toolId: string }) => t.toolId) ?? []
  );
  const configuredToolIds = new Set(
    config?.tools?.map((t: { toolId: string }) => t.toolId) ?? []
  );
  if (!config) enabledToolIds.add("web-search");
  if (!configuredToolIds.has("ask-user-question")) {
    enabledToolIds.add("ask-user-question");
  }

  // Collect built-in tools
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tools: Record<string, any> = {};

  if (enabledToolIds.has("web-search")) {
    tools = { ...tools, ...getWebSearchTools() };
  }
  if (enabledToolIds.has("calculator")) {
    tools = { ...tools, ...getCalculatorTool() };
  }
  if (enabledToolIds.has("fetch-images")) {
    tools = { ...tools, ...getFetchImagesTool() };
  }
  if (enabledToolIds.has("create-chart")) {
    tools = { ...tools, ...getCreateChartTool() };
  }
  if (enabledToolIds.has("create-document")) {
    tools = { ...tools, ...getCreateDocumentTool() };
    // Image generation tools for embedding visuals in documents
    tools = { ...tools, ...getChartImageTool() };
    tools = { ...tools, ...getDiagramImageTool() };
  }
  if (enabledToolIds.has("ask-user-question")) {
    tools = { ...tools, ...getAskUserQuestionTool() };
  }

  // MCP tools
  const { tools: mcpTools, clients: mcpClients } = await getMCPTools();

  // Composio tools
  const composioTools = await getComposioTools(userId);

  return {
    tools: { ...tools, ...mcpTools, ...composioTools },
    mcpClients,
  };
}
