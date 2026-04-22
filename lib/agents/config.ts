import "server-only";

import { internal } from "@/convex/_generated/api";
import { runConvexAdminQuery } from "@/lib/convex/server";
import type { CostConfig } from "@/lib/usage";

const DEFAULT_SYSTEM_MESSAGE = "You are a helpful assistant.";

export interface AgentConfig {
  modelId: string;
  provider: string;
  baseUrl?: string;
  apiKey: string;
  costConfig: CostConfig | null;
  systemMessage: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw: any;
}

export async function loadConfig(): Promise<AgentConfig> {
  const config = await runConvexAdminQuery(internal.aiConfig.getRuntime, {});

  if (!config?.modelId) {
    throw new Error(
      "No model configured. Please add a model in the admin panel."
    );
  }

  const model = await runConvexAdminQuery(internal.models.getRuntime, {
    id: config.modelId,
  });

  if (!model) {
    throw new Error(
      "Selected model not found. Please select a valid model in the admin panel."
    );
  }

  if (!model.apiKey) {
    throw new Error("Model is not properly configured: missing API key.");
  }

  return {
    modelId: model.modelId,
    provider: model.provider,
    baseUrl: model.baseUrl,
    apiKey: model.apiKey,
    costConfig: model.costConfig ?? null,
    systemMessage: config.systemMessage || DEFAULT_SYSTEM_MESSAGE,
    raw: config,
  };
}
