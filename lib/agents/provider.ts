import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createZhipu } from "zhipu-ai-provider";
import type { AgentConfig } from "./config";

/**
 * Creates the appropriate AI SDK model instance based on the provider field.
 *
 * - "google" → uses @ai-sdk/google native provider
 * - "openai" → uses @ai-sdk/openai native provider
 * - "zhipu"  → uses zhipu-ai-provider (Z.AI / Zhipu BigModel)
 * - anything else (custom) → uses @ai-sdk/openai with a custom baseURL
 */
export function createModel(config: AgentConfig) {
  switch (config.provider) {
    case "google": {
      const provider = createGoogleGenerativeAI({ apiKey: config.apiKey });
      return provider(config.modelId);
    }
    case "openai": {
      const provider = createOpenAI({ apiKey: config.apiKey });
      return provider(config.modelId);
    }
    case "zhipu": {
      const provider = createZhipu({
        apiKey: config.apiKey,
        ...(config.baseUrl ? { baseURL: config.baseUrl } : {}),
      });
      return provider(config.modelId);
    }
    default: {
      // Custom provider — requires baseUrl
      if (!config.baseUrl) {
        throw new Error(
          `Custom provider "${config.provider}" requires a base URL.`
        );
      }
      const provider = createOpenAICompatible({
        baseURL: config.baseUrl,
        apiKey: config.apiKey,
        name: config.provider,
      });
      return provider(config.modelId);
    }
  }
}
