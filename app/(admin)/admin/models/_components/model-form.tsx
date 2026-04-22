"use client"

import type { Doc } from "@/convex/_generated/dataModel"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const PROVIDERS = [
  { value: "google", label: "Google" },
  { value: "openai", label: "OpenAI" },
  { value: "zhipu", label: "Z.AI (Zhipu)" },
  { value: "custom", label: "Custom" },
] as const

export type ProviderType = (typeof PROVIDERS)[number]["value"]

const KNOWN_PROVIDERS = new Set<ProviderType>(["google", "openai", "zhipu"])

export type ModelFormState = {
  name: string
  modelId: string
  providerType: ProviderType
  customProvider: string
  baseUrl: string
  apiKey: string
  costInput: string
  costOutput: string
  costCacheRead: string
  costCacheWrite: string
}

export const createEmptyModelFormState = (): ModelFormState => ({
  name: "",
  modelId: "",
  providerType: "google",
  customProvider: "",
  baseUrl: "",
  apiKey: "",
  costInput: "0",
  costOutput: "0",
  costCacheRead: "0",
  costCacheWrite: "0",
})

export const resolveProviderType = (provider: string): ProviderType =>
  KNOWN_PROVIDERS.has(provider as ProviderType)
    ? (provider as ProviderType)
    : "custom"

export const createModelFormState = (
  model?: Omit<Doc<"models">, "apiKey">
): ModelFormState => {
  if (!model) {
    return createEmptyModelFormState()
  }

  const providerType = resolveProviderType(model.provider)

  return {
    name: model.name,
    modelId: model.modelId,
    providerType,
    customProvider: providerType === "custom" ? model.provider : "",
    baseUrl: model.baseUrl ?? "",
    apiKey: "",
    costInput: String(model.costConfig.input),
    costOutput: String(model.costConfig.output),
    costCacheRead: String(model.costConfig.cacheRead),
    costCacheWrite: String(model.costConfig.cacheWrite),
  }
}

export const getModelProvider = (form: ModelFormState) =>
  form.providerType === "custom"
    ? form.customProvider.trim()
    : form.providerType

export const getModelCostConfig = (form: ModelFormState) => ({
  input: Number.parseFloat(form.costInput) || 0,
  output: Number.parseFloat(form.costOutput) || 0,
  cacheRead: Number.parseFloat(form.costCacheRead) || 0,
  cacheWrite: Number.parseFloat(form.costCacheWrite) || 0,
})

export const isModelFormValid = (
  form: ModelFormState,
  { requireApiKey }: { requireApiKey: boolean }
) =>
  Boolean(
    form.name.trim() &&
    form.modelId.trim() &&
    (!requireApiKey || form.apiKey.trim()) &&
    (form.providerType !== "custom" ||
      (form.customProvider.trim() && form.baseUrl.trim()))
  )

export type ModelFormField = keyof ModelFormState

type ModelFormFieldsProps = {
  form: ModelFormState
  idPrefix: string
  apiKeyPlaceholder: string
  onFieldChange: (field: ModelFormField, value: string) => void
}

export function ModelFormFields({
  form,
  idPrefix,
  apiKeyPlaceholder,
  onFieldChange,
}: ModelFormFieldsProps) {
  const isCustom = form.providerType === "custom"

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-name`}>Name</Label>
        <Input
          id={`${idPrefix}-name`}
          onChange={(event) => onFieldChange("name", event.target.value)}
          placeholder="e.g. GPT-4o"
          value={form.name}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-model-id`}>Model identifier</Label>
        <Input
          id={`${idPrefix}-model-id`}
          onChange={(event) => onFieldChange("modelId", event.target.value)}
          placeholder="e.g. gpt-4o, gemini-2.5-flash"
          value={form.modelId}
        />
      </div>

      <div className="space-y-2">
        <Label>Provider</Label>
        <Select
          onValueChange={(value) =>
            onFieldChange("providerType", value as ProviderType)
          }
          value={form.providerType}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROVIDERS.map((provider) => (
              <SelectItem key={provider.value} value={provider.value}>
                {provider.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isCustom ? (
        <>
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-custom-provider`}>Provider name</Label>
            <Input
              id={`${idPrefix}-custom-provider`}
              onChange={(event) =>
                onFieldChange("customProvider", event.target.value)
              }
              placeholder="e.g. OpenRouter, Ollama"
              value={form.customProvider}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-base-url`}>Base URL</Label>
            <Input
              id={`${idPrefix}-base-url`}
              onChange={(event) => onFieldChange("baseUrl", event.target.value)}
              placeholder="https://openrouter.ai/api/v1"
              value={form.baseUrl}
            />
          </div>
        </>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-api-key`}>API key</Label>
        <Input
          id={`${idPrefix}-api-key`}
          onChange={(event) => onFieldChange("apiKey", event.target.value)}
          placeholder={apiKeyPlaceholder}
          type="password"
          value={form.apiKey}
        />
      </div>

      <div className="space-y-2">
        <Label>Cost config (USD per 1M tokens)</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label
              className="text-xs text-muted-foreground"
              htmlFor={`${idPrefix}-cost-input`}
            >
              Input
            </Label>
            <Input
              id={`${idPrefix}-cost-input`}
              min="0"
              onChange={(event) =>
                onFieldChange("costInput", event.target.value)
              }
              step="0.01"
              type="number"
              value={form.costInput}
            />
          </div>

          <div className="space-y-1">
            <Label
              className="text-xs text-muted-foreground"
              htmlFor={`${idPrefix}-cost-output`}
            >
              Output
            </Label>
            <Input
              id={`${idPrefix}-cost-output`}
              min="0"
              onChange={(event) =>
                onFieldChange("costOutput", event.target.value)
              }
              step="0.01"
              type="number"
              value={form.costOutput}
            />
          </div>

          <div className="space-y-1">
            <Label
              className="text-xs text-muted-foreground"
              htmlFor={`${idPrefix}-cost-cache-read`}
            >
              Cache read
            </Label>
            <Input
              id={`${idPrefix}-cost-cache-read`}
              min="0"
              onChange={(event) =>
                onFieldChange("costCacheRead", event.target.value)
              }
              step="0.01"
              type="number"
              value={form.costCacheRead}
            />
          </div>

          <div className="space-y-1">
            <Label
              className="text-xs text-muted-foreground"
              htmlFor={`${idPrefix}-cost-cache-write`}
            >
              Cache write
            </Label>
            <Input
              id={`${idPrefix}-cost-cache-write`}
              min="0"
              onChange={(event) =>
                onFieldChange("costCacheWrite", event.target.value)
              }
              step="0.01"
              type="number"
              value={form.costCacheWrite}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
