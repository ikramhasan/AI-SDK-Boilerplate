import "server-only";

// Types for the models.dev API response
export interface ModelCost {
  input: number;
  output: number;
  cache_read?: number;
  cache_write?: number;
  context_over_200k?: {
    input: number;
    output: number;
    cache_read?: number;
  };
}

export interface ModelInfo {
  id: string;
  name: string;
  family?: string;
  attachment?: boolean;
  reasoning?: boolean;
  tool_call?: boolean;
  structured_output?: boolean;
  temperature?: boolean;
  knowledge?: string;
  release_date?: string;
  last_updated?: string;
  modalities?: {
    input: string[];
    output: string[];
  };
  open_weights?: boolean;
  cost?: ModelCost;
  limit?: {
    context: number;
    output: number;
    input?: number;
  };
}

export interface ProviderInfo {
  id: string;
  env: string[];
  npm: string;
  api?: string;
  name: string;
  doc?: string;
  models: Record<string, ModelInfo>;
}

export type ModelsApiResponse = Record<string, ProviderInfo>;

const MODELS_API_URL = "https://models.dev/api.json";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let cachedData: { data: ModelsApiResponse; timestamp: number } | null = null;

async function fetchFromApi(): Promise<ModelsApiResponse | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const res = await fetch(MODELS_API_URL, {
      signal: controller.signal,
      next: { revalidate: 300 },
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    return (await res.json()) as ModelsApiResponse;
  } catch {
    return null;
  }
}

async function loadFallback(): Promise<ModelsApiResponse> {
  // Dynamic import of the local fallback JSON
  const data = await import("@/app/(admin)/admin/_data/models.json");
  return data.default as unknown as ModelsApiResponse;
}

/**
 * Get the full models data, using API with fallback to local JSON.
 */
export async function getModelsData(): Promise<ModelsApiResponse> {
  // Check in-memory cache
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL_MS) {
    return cachedData.data;
  }

  const apiData = await fetchFromApi();
  if (apiData) {
    cachedData = { data: apiData, timestamp: Date.now() };
    return apiData;
  }

  // Fallback to local JSON
  const fallback = await loadFallback();
  cachedData = { data: fallback, timestamp: Date.now() };
  return fallback;
}

/**
 * Get cost config for a specific model, checking context_over_200k when applicable.
 */
export function getModelCostForUsage(
  model: ModelInfo,
  totalInputTokens: number
): ModelCost | null {
  if (!model.cost) return null;

  const THRESHOLD = 200_000;
  if (
    totalInputTokens > THRESHOLD &&
    model.cost.context_over_200k
  ) {
    return {
      input: model.cost.context_over_200k.input,
      output: model.cost.context_over_200k.output,
      cache_read: model.cost.context_over_200k.cache_read ?? model.cost.cache_read,
      cache_write: model.cost.cache_write,
    };
  }

  return model.cost;
}

/**
 * Check if a model is free (input and output cost are both 0).
 */
export function isModelFree(model: ModelInfo): boolean {
  if (!model.cost) return false;
  return model.cost.input === 0 && model.cost.output === 0;
}
