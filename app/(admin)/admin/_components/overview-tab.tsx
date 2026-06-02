"use client"

import { type Ref, useEffect, useRef, useState } from "react"
import { Maximize2Icon, Minimize2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
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
  const [isSystemMessageFullScreen, setIsSystemMessageFullScreen] = useState(false)
  const fullScreenTextareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!isSystemMessageFullScreen) {
      return
    }

    fullScreenTextareaRef.current?.focus()
  }, [isSystemMessageFullScreen])

  const systemMessageTextarea = (
    className?: string,
    ref?: Ref<HTMLTextAreaElement>
  ) => (
    <Textarea
      id="system-message"
      ref={ref}
      value={systemMessage}
      onChange={(e) => onSystemMessageChange(e.target.value)}
      placeholder="You are a helpful assistant that..."
      className={cn("min-h-[320px]", className)}
    />
  )

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
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="system-message">System message</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-pressed={isSystemMessageFullScreen}
                    onClick={() => setIsSystemMessageFullScreen((value) => !value)}
                  >
                    <Maximize2Icon />
                    <span className="sr-only">Open system message full screen</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" sideOffset={8}>
                  Full screen
                </TooltipContent>
              </Tooltip>
            </div>
            {isSystemMessageFullScreen ? (
              <div className="min-h-[320px] rounded-2xl bg-input/30" />
            ) : (
              systemMessageTextarea()
            )}
            <p className="text-xs text-muted-foreground">
              This message sets the behavior and personality of your AI.
            </p>
          </div>
        </CardContent>
      </Card>

      {isSystemMessageFullScreen && (
        <div
          role="dialog"
          aria-labelledby="system-message-full-screen-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex flex-col gap-4 bg-background p-4 text-foreground sm:p-6"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsSystemMessageFullScreen(false)
            }
          }}
        >
          <div className="flex shrink-0 items-center justify-between gap-3">
            <div className="space-y-1">
              <h2
                id="system-message-full-screen-title"
                className="text-lg font-medium"
              >
                System message
              </h2>
              <p className="text-sm text-muted-foreground">
                This message sets the behavior and personality of your AI.
              </p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  aria-pressed={isSystemMessageFullScreen}
                  onClick={() => setIsSystemMessageFullScreen(false)}
                >
                  <Minimize2Icon />
                  <span className="sr-only">Close system message full screen</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" sideOffset={8}>
                Exit full screen
              </TooltipContent>
            </Tooltip>
          </div>
          {systemMessageTextarea(
            "min-h-0 flex-1 resize-none rounded-3xl p-5 text-base leading-7 md:text-base",
            fullScreenTextareaRef
          )}
        </div>
      )}
    </div>
  )
}
