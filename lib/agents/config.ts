import "server-only";

import { internal } from "@/convex/_generated/api";
import { runConvexAdminQuery } from "@/lib/convex/server";

const DEFAULT_SYSTEM_MESSAGE = "You are a helpful assistant.";

export interface AgentConfig {
  modelId: string;
  providerId: string;
  providerName: string;
  providerNpm: string;
  providerApi?: string;
  systemMessage: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw: any;
}

export async function loadConfig(): Promise<AgentConfig> {
  const config = await runConvexAdminQuery(internal.aiConfig.getRuntime, {});

  if (!config?.modelId || !config?.providerId) {
    throw new Error(
      "No model configured. Please select a model in the admin panel."
    );
  }

  return {
    modelId: config.modelId,
    providerId: config.providerId,
    providerName: config.providerName,
    providerNpm: config.providerNpm,
    providerApi: config.providerApi,
    systemMessage: config.systemMessage || DEFAULT_SYSTEM_MESSAGE,
    raw: config,
  };
}
