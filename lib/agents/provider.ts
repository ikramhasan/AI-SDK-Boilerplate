import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createAzure } from "@ai-sdk/azure";
import { createCerebras } from "@ai-sdk/cerebras";
import { createCohere } from "@ai-sdk/cohere";
import { createDeepInfra } from "@ai-sdk/deepinfra";
import { createGateway } from "@ai-sdk/gateway";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createVertex } from "@ai-sdk/google-vertex";
import { createVertexAnthropic } from "@ai-sdk/google-vertex/anthropic";
import { createGroq } from "@ai-sdk/groq";
import { createMistral } from "@ai-sdk/mistral";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createPerplexity } from "@ai-sdk/perplexity";
import { createTogetherAI } from "@ai-sdk/togetherai";
import { createVercel } from "@ai-sdk/vercel";
import { createXai } from "@ai-sdk/xai";
import { createAihubmix } from "@aihubmix/ai-sdk-provider";
import { createSAPAIProvider } from "@jerome-benoit/sap-ai-provider-v2";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createAiGateway } from "ai-gateway-provider";
import { createGitLab } from "gitlab-ai-provider";
import { createVenice } from "venice-ai-sdk-provider";
import type { AgentConfig } from "./config";

/**
 * Resolves the correct environment variable for a provider's API key.
 * Uses the provider's env list from models.dev to find the first set env var.
 */
function resolveApiKey(providerId: string): string {
  // Map of known provider IDs to their env var names
  const ENV_MAP: Record<string, string[]> = {
    google: ["GOOGLE_GENERATIVE_AI_API_KEY", "GEMINI_API_KEY"],
    openai: ["OPENAI_API_KEY"],
    anthropic: ["ANTHROPIC_API_KEY"],
    xai: ["XAI_API_KEY"],
    groq: ["GROQ_API_KEY"],
    deepseek: ["DEEPSEEK_API_KEY"],
    cohere: ["COHERE_API_KEY"],
    mistral: ["MISTRAL_API_KEY"],
    cerebras: ["CEREBRAS_API_KEY"],
    perplexity: ["PERPLEXITY_API_KEY"],
    openrouter: ["OPENROUTER_API_KEY"],
    togetherai: ["TOGETHER_API_KEY"],
    deepinfra: ["DEEPINFRA_API_KEY"],
    fireworks: ["FIREWORKS_API_KEY"],
    "fireworks-ai": ["FIREWORKS_API_KEY"],
    "novita-ai": ["NOVITA_API_KEY"],
    siliconflow: ["SILICONFLOW_API_KEY"],
    "siliconflow-cn": ["SILICONFLOW_CN_API_KEY"],
    nvidia: ["NVIDIA_API_KEY"],
    "github-models": ["GITHUB_TOKEN"],
    "google-vertex": ["GOOGLE_APPLICATION_CREDENTIALS"],
    "google-vertex-anthropic": ["GOOGLE_APPLICATION_CREDENTIALS"],
    "amazon-bedrock": ["AWS_ACCESS_KEY_ID"],
    nebius: ["NEBIUS_API_KEY"],
    scaleway: ["SCALEWAY_API_KEY"],
    vultr: ["VULTR_API_KEY"],
    friendli: ["FRIENDLI_TOKEN"],
    cortecs: ["CORTECS_API_KEY"],
    helicone: ["HELICONE_API_KEY"],
    "perplexity-agent": ["PERPLEXITY_API_KEY"],
    vercel: ["AI_GATEWAY_API_KEY"],
    v0: ["V0_API_KEY"],
    llama: ["LLAMA_API_KEY"],
    "alibaba-cn": ["DASHSCOPE_API_KEY"],
    alibaba: ["DASHSCOPE_API_KEY"],
    zhipuai: ["ZHIPU_API_KEY"],
    zai: ["ZHIPU_API_KEY"],
    stepfun: ["STEPFUN_API_KEY"],
    moonshotai: ["MOONSHOT_API_KEY"],
    "moonshotai-cn": ["MOONSHOT_API_KEY"],
    xiaomi: ["XIAOMI_API_KEY"],
    azure: ["AZURE_API_KEY"],
    "azure-cognitive-services": ["AZURE_API_KEY"],
    gitlab: ["GITLAB_API_KEY"],
    venice: ["VENICE_API_KEY"],
    aihubmix: ["AIHUBMIX_API_KEY"],
    "sap-ai-core": ["SAP_AI_API_KEY"],
    "cloudflare-ai-gateway": ["CLOUDFLARE_API_KEY"],
  };

  const envVars = ENV_MAP[providerId];
  if (envVars) {
    for (const envVar of envVars) {
      const val = process.env[envVar];
      if (val) return val;
    }
  }

  // Fallback: try common patterns
  const upperProvider = providerId.toUpperCase().replace(/-/g, "_");
  const fallbackKeys = [`${upperProvider}_API_KEY`, `${upperProvider}_TOKEN`];

  for (const key of fallbackKeys) {
    const val = process.env[key];
    if (val) return val;
  }

  throw new Error(
    `No API key found for provider "${providerId}". Please set the appropriate environment variable.`
  );
}

/**
 * Creates the appropriate AI SDK model instance based on the npm package field
 * from the models.dev API.
 */
export function createModel(config: AgentConfig) {
  const apiKey = resolveApiKey(config.providerId);
  const npm = config.providerNpm;

  switch (npm) {
    // ── Native first-party providers ──────────────────────────────────
    case "@ai-sdk/google": {
      const provider = createGoogleGenerativeAI({ apiKey });
      return provider(config.modelId);
    }
    case "@ai-sdk/openai": {
      const opts: Parameters<typeof createOpenAI>[0] = { apiKey };
      if (config.providerApi) opts.baseURL = config.providerApi;
      const provider = createOpenAI(opts);
      return provider(config.modelId);
    }
    case "@ai-sdk/anthropic": {
      const opts: Parameters<typeof createAnthropic>[0] = { apiKey };
      if (config.providerApi) opts.baseURL = config.providerApi;
      const provider = createAnthropic(opts);
      return provider(config.modelId);
    }
    case "@ai-sdk/azure": {
      const provider = createAzure({ apiKey });
      return provider(config.modelId);
    }
    case "@ai-sdk/amazon-bedrock": {
      const provider = createAmazonBedrock();
      return provider(config.modelId);
    }
    case "@ai-sdk/google-vertex": {
      const provider = createVertex();
      return provider(config.modelId);
    }
    case "@ai-sdk/google-vertex/anthropic": {
      const provider = createVertexAnthropic();
      return provider(config.modelId);
    }
    case "@ai-sdk/groq": {
      const provider = createGroq({ apiKey });
      return provider(config.modelId);
    }
    case "@ai-sdk/mistral": {
      const provider = createMistral({ apiKey });
      return provider(config.modelId);
    }
    case "@ai-sdk/cohere": {
      const provider = createCohere({ apiKey });
      return provider(config.modelId);
    }
    case "@ai-sdk/cerebras": {
      const provider = createCerebras({ apiKey });
      return provider(config.modelId);
    }
    case "@ai-sdk/xai": {
      const provider = createXai({ apiKey });
      return provider(config.modelId);
    }
    case "@ai-sdk/perplexity": {
      const provider = createPerplexity({ apiKey });
      return provider(config.modelId);
    }
    case "@ai-sdk/togetherai": {
      const provider = createTogetherAI({ apiKey });
      return provider(config.modelId);
    }
    case "@ai-sdk/deepinfra": {
      const provider = createDeepInfra({ apiKey });
      return provider(config.modelId);
    }
    case "@ai-sdk/gateway": {
      const provider = createGateway({ apiKey });
      return provider(config.modelId);
    }
    case "@ai-sdk/vercel": {
      const provider = createVercel({ apiKey });
      return provider(config.modelId);
    }

    // ── Third-party / community providers ─────────────────────────────
    case "@openrouter/ai-sdk-provider": {
      const provider = createOpenRouter({ apiKey });
      return provider(config.modelId);
    }
    case "@aihubmix/ai-sdk-provider": {
      const provider = createAihubmix({ apiKey });
      return provider(config.modelId);
    }
    case "@jerome-benoit/sap-ai-provider-v2": {
      const provider = createSAPAIProvider();
      return provider(config.modelId);
    }
    case "ai-gateway-provider": {
      // Cloudflare AI Gateway requires accountId + gateway name from env
      const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
      const gateway = process.env.CLOUDFLARE_AI_GATEWAY_ID;
      if (!accountId || !gateway) {
        throw new Error(
          `Cloudflare AI Gateway requires CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_AI_GATEWAY_ID environment variables.`
        );
      }
      const aiGateway = createAiGateway({ accountId, gateway, apiKey });
      // ai-gateway-provider wraps other model instances; fall back to openai-compatible
      const inner = createOpenAICompatible({
        baseURL: config.providerApi || "https://api.cloudflare.com/client/v4",
        apiKey,
        name: config.providerName,
      });
      return aiGateway(inner(config.modelId));
    }
    case "gitlab-ai-provider": {
      const provider = createGitLab({ apiKey });
      return provider(config.modelId);
    }
    case "venice-ai-sdk-provider": {
      const provider = createVenice({ apiKey });
      return provider(config.modelId);
    }

    // ── OpenAI-compatible (catch-all) ─────────────────────────────────
    case "@ai-sdk/openai-compatible": {
      if (!config.providerApi) {
        throw new Error(
          `Provider "${config.providerId}" uses openai-compatible but has no API base URL.`
        );
      }
      const provider = createOpenAICompatible({
        baseURL: config.providerApi,
        apiKey,
        name: config.providerName,
      });
      return provider(config.modelId);
    }

    // ── Fallback for unknown npm values ───────────────────────────────
    default: {
      if (config.providerApi) {
        const provider = createOpenAICompatible({
          baseURL: config.providerApi,
          apiKey,
          name: config.providerName,
        });
        return provider(config.modelId);
      }
      const provider = createOpenAI({ apiKey });
      return provider(config.modelId);
    }
  }
}
