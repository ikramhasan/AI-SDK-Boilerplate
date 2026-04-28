import type { LanguageModelUsage } from "ai";
import { getModelsData, getModelCostForUsage, type ModelCost } from "@/lib/models-api";

const PER_MILLION = 1_000_000;

export interface UsageDetails {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  totalTokens: number;
  cost: number;
}

function calculateCost(
  inputTokens: number,
  outputTokens: number,
  cacheReadTokens: number,
  cacheWriteTokens: number,
  costConfig: ModelCost
): number {
  const regularInputTokens = Math.max(
    0,
    inputTokens - cacheReadTokens - cacheWriteTokens
  );

  let cost =
    (regularInputTokens * costConfig.input) / PER_MILLION +
    (outputTokens * costConfig.output) / PER_MILLION;

  if (costConfig.cache_read && cacheReadTokens > 0) {
    cost += (cacheReadTokens * costConfig.cache_read) / PER_MILLION;
  }
  if (costConfig.cache_write && cacheWriteTokens > 0) {
    cost += (cacheWriteTokens * costConfig.cache_write) / PER_MILLION;
  }

  return cost;
}

/**
 * Extract usage details and calculate cost by fetching live pricing
 * from models.dev API. Falls back to zero cost if model not found.
 */
export async function extractUsage(
  usage: LanguageModelUsage,
  providerId: string,
  modelId: string
): Promise<UsageDetails> {
  const inputTokens = usage.inputTokens ?? 0;
  const outputTokens = usage.outputTokens ?? 0;
  const totalTokens = usage.totalTokens ?? 0;
  const cacheReadTokens = usage.inputTokenDetails?.cacheReadTokens ?? 0;
  const cacheWriteTokens = usage.inputTokenDetails?.cacheWriteTokens ?? 0;

  let cost = 0;

  try {
    const allProviders = await getModelsData();
    const provider = allProviders[providerId];

    if (provider) {
      const model = provider.models[modelId];
      if (model) {
        const costConfig = getModelCostForUsage(model, inputTokens);
        if (costConfig) {
          cost = calculateCost(
            inputTokens,
            outputTokens,
            cacheReadTokens,
            cacheWriteTokens,
            costConfig
          );
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch model pricing, cost will be 0:", error);
  }

  return {
    inputTokens,
    outputTokens,
    cacheReadTokens,
    cacheWriteTokens,
    totalTokens,
    cost,
  };
}
