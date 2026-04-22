"use client"

import { useEffect, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OverviewTab } from "./_components/overview-tab"
import { KnowledgeTab } from "./_components/knowledge-tab"
import { ToolsTab } from "./_components/tools-tab"
import { McpTab } from "./_components/mcp-tab"
import { AVAILABLE_TOOLS } from "./_components/constants"
import { getSiteName } from "@/lib/site-data"

type ToolToggle = { toolId: string; enabled: boolean }

export default function AdminPage() {
  const siteName = getSiteName()
  const config = useQuery(api.aiConfig.getAdmin)
  const models = useQuery(api.models.list)
  const knowledgeFiles = useQuery(api.knowledgeFiles.list)
  const saveConfig = useMutation(api.aiConfig.save)

  const [name, setName] = useState("")
  const [modelId, setModelId] = useState<Id<"models"> | null>(null)
  const [systemMessage, setSystemMessage] = useState("")
  const [toolToggles, setToolToggles] = useState<ToolToggle[]>([])
  const [saving, setSaving] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Hydrate local state once both queries are loaded so we don't
  // briefly default to the first model before the saved config arrives.
  useEffect(() => {
    if (hydrated || config === undefined || models === undefined) {
      return
    }

    if (config) {
      const savedModelExists = models.some((model) => model._id === config.modelId)

      setName(config.name)
      setModelId(savedModelExists ? config.modelId : (models[0]?._id ?? null))
      setSystemMessage(config.systemMessage)
      setToolToggles(config.tools)
      setHydrated(true)
      return
    }

    if (models.length > 0) {
      setName("AI Agent")
      setModelId(models[0]._id)
      setToolToggles(AVAILABLE_TOOLS.map((t) => ({ toolId: t.toolId, enabled: false })))
      setHydrated(true)
    }
  }, [config, models, hydrated, siteName])

  // Keep the selected model valid if models are later removed or replaced.
  useEffect(() => {
    if (!hydrated || models === undefined || models.length === 0) {
      return
    }

    const selectedModelExists = modelId ? models.some((model) => model._id === modelId) : false
    if (!selectedModelExists) {
      setModelId(models[0]._id)
    }
  }, [hydrated, models, modelId])

  // Sync toolToggles when new tools appear that aren't tracked yet
  useEffect(() => {
    const tracked = new Set(toolToggles.map((t) => t.toolId))
    const missing = AVAILABLE_TOOLS.filter((t) => !tracked.has(t.toolId))
    if (missing.length > 0) {
      setToolToggles((prev) => [
        ...prev,
        ...missing.map((t) => ({ toolId: t.toolId, enabled: false })),
      ])
    }
  }, [toolToggles])

  const handleSave = async () => {
    if (!modelId) return
    setSaving(true)
    try {
      await saveConfig({
        name,
        modelId,
        systemMessage,
        tools: toolToggles,
        knowledgeFileIds: knowledgeFiles?.map((f) => f._id) ?? [],
      })
    } catch (error) {
      console.error("Failed to save:", error)
    } finally {
      setSaving(false)
    }
  }

  const toggleTool = (toolId: string) => {
    setToolToggles((prev) =>
      prev.map((t) => (t.toolId === toolId ? { ...t, enabled: !t.enabled } : t))
    )
  }

  if (config === undefined || models === undefined) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{siteName}</h1>
          <p className="text-sm text-muted-foreground">
            Configure your AI assistant
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving || !modelId}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="mcp">MCP</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <OverviewTab
            name={name} onNameChange={setName}
            modelId={modelId} onModelIdChange={setModelId}
            models={models ?? []}
            systemMessage={systemMessage} onSystemMessageChange={setSystemMessage}
          />
        </TabsContent>
        <TabsContent value="knowledge">
          <KnowledgeTab />
        </TabsContent>
        <TabsContent value="tools">
          <ToolsTab
            tools={AVAILABLE_TOOLS}
            toggles={toolToggles}
            onToggle={toggleTool}
          />
        </TabsContent>
        <TabsContent value="mcp">
          <McpTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
