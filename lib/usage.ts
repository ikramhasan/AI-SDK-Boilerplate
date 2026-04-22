import type { LanguageModelUsage } from "ai";

export interface CostConfig {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
}

const PER_MILLION = 1_000_000;

export interface UsageDetails {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  totalTokens: number;
  cost: number;
}

export function extractUsage(usage: LanguageModelUsage, costConfig: CostConfig | null): UsageDetails {
  const inputTokens = usage.inputTokens ?? 0;
  const outputTokens = usage.outputTokens ?? 0;
  const totalTokens = usage.totalTokens ?? 0;
  const cacheReadTokens = usage.inputTokenDetails?.cacheReadTokens ?? 0;
  const cacheWriteTokens = usage.inputTokenDetails?.cacheWriteTokens ?? 0;

  let cost = 0;
  if (costConfig) {
    const regularInputTokens = Math.max(0, inputTokens - cacheReadTokens - cacheWriteTokens);
    cost =
      (regularInputTokens * costConfig.input) / PER_MILLION +
      (cacheReadTokens * costConfig.cacheRead) / PER_MILLION +
      (cacheWriteTokens * costConfig.cacheWrite) / PER_MILLION +
      (outputTokens * costConfig.output) / PER_MILLION;
  }

  return { inputTokens, outputTokens, cacheReadTokens, cacheWriteTokens, totalTokens, cost };
}
