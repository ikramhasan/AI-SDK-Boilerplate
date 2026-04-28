"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  ModelSelector as ModelSelectorRoot,
  ModelSelectorTrigger,
  ModelSelectorContent,
  ModelSelectorInput,
  ModelSelectorList,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorItem,
  ModelSelectorLogo,
  ModelSelectorName,
} from "@/components/ai-elements/model-selector"
import type {
  AvailableProvider,
} from "@/app/api/models/available/route"

export interface SelectedModel {
  providerId: string
  providerName: string
  providerNpm: string
  providerApi?: string
  modelId: string
  modelName: string
}

type Props = {
  value: SelectedModel | null
  onChange: (model: SelectedModel) => void
}

export function AdminModelSelector({ value, onChange }: Props) {
  const [providers, setProviders] = useState<AvailableProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetch("/api/models/available")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch")
        return res.json()
      })
      .then((data: AvailableProvider[]) => {
        setProviders(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSelect = (providerId: string, modelId: string) => {
    const provider = providers.find((p) => p.id === providerId)
    if (!provider) return

    const model = provider.models.find((m) => m.id === modelId)
    if (!model) return

    onChange({
      providerId: provider.id,
      providerName: provider.name,
      providerNpm: provider.npm,
      providerApi: provider.api,
      modelId: model.id,
      modelName: model.name,
    })
    setOpen(false)
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>Model</Label>
        <div className="flex h-9 items-center rounded-md border px-3 text-sm text-muted-foreground">
          Loading available models…
        </div>
      </div>
    )
  }

  if (providers.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Model</Label>
        <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
          No providers available. Set API keys in your environment to enable
          providers.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label>Model</Label>
      <ModelSelectorRoot open={open} onOpenChange={setOpen}>
        <ModelSelectorTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 font-normal"
          >
            {value ? (
              <>
                <ModelSelectorLogo provider={value.providerId} />
                <ModelSelectorName>{value.modelName}</ModelSelectorName>
                <Badge
                  variant="secondary"
                  className="ml-auto px-1.5 py-0 text-[10px] font-normal capitalize"
                >
                  {value.providerName}
                </Badge>
              </>
            ) : (
              <span className="text-muted-foreground">Select a model…</span>
            )}
          </Button>
        </ModelSelectorTrigger>
        <ModelSelectorContent title="Select a model" showCloseButton={false}>
          <ModelSelectorInput placeholder="Search models…" />
          <ModelSelectorList>
            <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
            {providers.map((provider) => (
              <ModelSelectorGroup
                key={provider.id}
                heading={provider.name}
              >
                {provider.models.map((model) => (
                  <ModelSelectorItem
                    key={`${provider.id}::${model.id}`}
                    value={`${provider.id}::${model.id}::${model.name}`}
                    onSelect={() => handleSelect(provider.id, model.id)}
                    className="flex items-center gap-2"
                  >
                    <ModelSelectorLogo provider={provider.id} />
                    <ModelSelectorName>{model.name}</ModelSelectorName>
                    {model.isFree && (
                      <Badge
                        variant="outline"
                        className="border-green-500/30 bg-green-500/10 px-1.5 py-0 text-[10px] font-medium text-green-600"
                      >
                        Free
                      </Badge>
                    )}
                    {model.reasoning && (
                      <Badge
                        variant="outline"
                        className="px-1.5 py-0 text-[10px] font-normal"
                      >
                        Reasoning
                      </Badge>
                    )}
                  </ModelSelectorItem>
                ))}
              </ModelSelectorGroup>
            ))}
          </ModelSelectorList>
        </ModelSelectorContent>
      </ModelSelectorRoot>
    </div>
  )
}
