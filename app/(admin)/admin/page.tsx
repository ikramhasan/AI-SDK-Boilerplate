"use client"

import { useEffect, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OverviewTab } from "./_components/overview-tab"
import { KnowledgeTab } from "./_components/knowledge-tab"
import { ToolsTab } from "./_components/tools-tab"
import { McpTab } from "./_components/mcp-tab"
import { AVAILABLE_TOOLS } from "./_components/constants"
import { getSiteName } from "@/lib/site-data"
import type { SelectedModel } from "./_components/model-selector"

type ToolToggle = { toolId: string; enabled: boolean }

export default function AdminPage() {
  const siteName = getSiteName()
  const config = useQuery(api.aiConfig.getAdmin)
  const knowledgeFiles = useQuery(api.knowledgeFiles.list)
  const saveConfig = useMutation(api.aiConfig.save)

  const [name, setName] = useState("")
  const [selectedModel, setSelectedModel] = useState<SelectedModel | null>(null)
  const [systemMessage, setSystemMessage] = useState("")
  const [toolToggles, setToolToggles] = useState<ToolToggle[]>([])
  const [saving, setSaving] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Hydrate local state once config is loaded
  useEffect(() => {
    if (hydrated || config === undefined) return

    if (config) {
      setName(config.name)
      setSelectedModel(
        config.modelId
          ? {
              providerId: config.providerId,
              providerName: config.providerName,
              providerNpm: config.providerNpm,
              providerApi: config.providerApi,
              modelId: config.modelId,
              modelName: config.modelName,
            }
          : null
      )
      setSystemMessage(config.systemMessage)
      setToolToggles(config.tools)
      setHydrated(true)
      return
    }

    // No config yet — set defaults
    setName("AI Agent")
    setToolToggles(AVAILABLE_TOOLS.map((t) => ({ toolId: t.toolId, enabled: false })))
    setHydrated(true)
  }, [config, hydrated, siteName])

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
    if (!selectedModel) return
    setSaving(true)
    try {
      await saveConfig({
        name,
        providerId: selectedModel.providerId,
        providerName: selectedModel.providerName,
        providerNpm: selectedModel.providerNpm,
        providerApi: selectedModel.providerApi,
        modelId: selectedModel.modelId,
        modelName: selectedModel.modelName,
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

  if (config === undefined) {
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
        <Button onClick={handleSave} disabled={saving || !selectedModel}>
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
            name={name}
            onNameChange={setName}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            systemMessage={systemMessage}
            onSystemMessageChange={setSystemMessage}
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
