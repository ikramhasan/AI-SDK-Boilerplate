import { NextResponse } from "next/server";
import { fetchAuthQuery, getToken } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";
import {
  getModelsData,
  isModelFree,
  type ModelInfo,
} from "@/lib/models-api";

export interface AvailableModel {
  id: string;
  name: string;
  family?: string;
  isFree: boolean;
  reasoning: boolean;
  toolCall: boolean;
  contextLimit: number;
  outputLimit: number;
  cost: {
    input: number;
    output: number;
    cacheRead?: number;
    cacheWrite?: number;
    contextOver200k?: {
      input: number;
      output: number;
      cacheRead?: number;
    };
  } | null;
}

export interface AvailableProvider {
  id: string;
  name: string;
  npm: string;
  api?: string;
  models: AvailableModel[];
}

function checkEnvVars(envList: string[]): boolean {
  return envList.some((envVar) => {
    const val = process.env[envVar];
    return val !== undefined && val !== "";
  });
}

export async function GET() {
  // Admin guard
  try {
    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const isAdmin = await fetchAuthQuery(
      api.adminUsers.hasAdminPermission,
      {}
    );
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const allProviders = await getModelsData();
    const available: AvailableProvider[] = [];

    for (const [providerId, provider] of Object.entries(allProviders)) {
      if (providerId.includes("coding-plan")) continue;
      if (!checkEnvVars(provider.env)) continue;

      const models: AvailableModel[] = Object.values(provider.models)
        .filter((m: ModelInfo) => {
          const hasTextInput = m.modalities?.input?.includes("text") ?? true;
          const hasTextOutput = m.modalities?.output?.includes("text") ?? true;
          return hasTextInput && hasTextOutput;
        })
        .map((m: ModelInfo) => ({
          id: m.id,
          name: m.name,
          family: m.family,
          isFree: isModelFree(m),
          reasoning: m.reasoning ?? false,
          toolCall: m.tool_call ?? false,
          contextLimit: m.limit?.context ?? 0,
          outputLimit: m.limit?.output ?? 0,
          cost: m.cost
            ? {
                input: m.cost.input,
                output: m.cost.output,
                cacheRead: m.cost.cache_read,
                cacheWrite: m.cost.cache_write,
                contextOver200k: m.cost.context_over_200k
                  ? {
                      input: m.cost.context_over_200k.input,
                      output: m.cost.context_over_200k.output,
                      cacheRead: m.cost.context_over_200k.cache_read,
                    }
                  : undefined,
              }
            : null,
        }));

      if (models.length === 0) continue;

      available.push({
        id: providerId,
        name: provider.name,
        npm: provider.npm,
        api: provider.api,
        models,
      });
    }

    return NextResponse.json(available);
  } catch (error) {
    console.error("Failed to fetch available models:", error);
    return NextResponse.json([], { status: 500 });
  }
}
