"use client"

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ToolIcon } from "./tool-icon"
import type { ToolDefinition } from "./constants"

type ToolsTabProps = {
  tools: ToolDefinition[]
  toggles: { toolId: string; enabled: boolean }[]
  onToggle: (toolId: string) => void
}

export function ToolsTab({ tools, toggles, onToggle }: ToolsTabProps) {
  const isEnabled = (toolId: string) =>
    toggles.find((t) => t.toolId === toolId)?.enabled ?? false

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tools</CardTitle>
          <CardDescription>
            Enable or disable tools your AI can use during conversations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {tools.map((tool, i) => (
            <div key={tool.toolId}>
              <div className="flex items-center justify-between rounded-2xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ToolIcon name={tool.toolId} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tool.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {tool.description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isEnabled(tool.toolId)}
                  onCheckedChange={() => onToggle(tool.toolId)}
                  aria-label={`Toggle ${tool.name}`}
                />
              </div>
              {i < tools.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
