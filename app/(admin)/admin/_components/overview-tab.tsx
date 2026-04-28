"use client"

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AdminModelSelector, type SelectedModel } from "./model-selector"

type OverviewTabProps = {
  name: string
  onNameChange: (value: string) => void
  selectedModel: SelectedModel | null
  onModelChange: (model: SelectedModel) => void
  systemMessage: string
  onSystemMessageChange: (value: string) => void
}

export function OverviewTab({
  name, onNameChange,
  selectedModel, onModelChange,
  systemMessage, onSystemMessageChange,
}: OverviewTabProps) {
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
          <AdminModelSelector
            value={selectedModel}
            onChange={onModelChange}
          />
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
