"use client"

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Doc, Id } from "@/convex/_generated/dataModel"

type OverviewTabProps = {
  name: string
  onNameChange: (value: string) => void
  modelId: Id<"models"> | null
  onModelIdChange: (value: Id<"models">) => void
  models: Omit<Doc<"models">, "apiKey">[]
  systemMessage: string
  onSystemMessageChange: (value: string) => void
}

export function OverviewTab({
  name, onNameChange,
  modelId, onModelIdChange,
  models,
  systemMessage, onSystemMessageChange,
}: OverviewTabProps) {
  const selectedModel = modelId ? models.find((model) => model._id === modelId) : null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>
            Basic configuration for your AI assistant
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ai-name">Name</Label>
            <Input
              id="ai-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Give your AI a name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select
              value={modelId ?? undefined}
              onValueChange={(id) => onModelIdChange(id as Id<"models">)}
            >
              <SelectTrigger id="model" className="w-full">
                <SelectValue placeholder="Select a model">
                  {selectedModel ? (
                    <span className="flex items-center gap-2">
                      {selectedModel.name}
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal capitalize">
                        {selectedModel.provider}
                      </Badge>
                    </span>
                  ) : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {models.length === 0 ? (
                  <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                    No models configured. Add a model on the Models page.
                  </div>
                ) : (
                  models.map((m) => (
                    <SelectItem key={m._id} value={m._id}>
                      <span className="flex items-center gap-2">
                        {m.name}
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal capitalize">
                          {m.provider}
                        </Badge>
                      </span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
          <CardDescription>
            Define how your AI should behave and respond
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="system-message">System message</Label>
            <Textarea
              id="system-message"
              value={systemMessage}
              onChange={(e) => onSystemMessageChange(e.target.value)}
              placeholder="You are a helpful assistant that..."
              className="min-h-[320px]"
            />
            <p className="text-xs text-muted-foreground">
              This message sets the behavior and personality of your AI.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
