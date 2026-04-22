"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Doc } from "@/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

type AuthType = "none" | "bearer" | "custom-header"
type Transport = "http" | "sse"
type ServerListItem = Omit<Doc<"mcpServers">, "authToken"> & {
  hasAuthToken?: boolean
}

type Props = {
  server?: ServerListItem
  trigger?: React.ReactNode
}

export function AddMcpServerDialog({ server, trigger }: Props) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState(server?.name ?? "")
  const [url, setUrl] = useState(server?.url ?? "")
  const [transport, setTransport] = useState<Transport>(server?.transport ?? "http")
  const [authType, setAuthType] = useState<AuthType>(server?.authType ?? "none")
  const [authToken, setAuthToken] = useState("")
  const [authHeaderName, setAuthHeaderName] = useState(server?.authHeaderName ?? "")

  const createServer = useMutation(api.mcpServers.create)
  const updateServer = useMutation(api.mcpServers.update)

  const resetForm = () => {
    if (server) {
      setName(server.name)
      setUrl(server.url)
      setTransport(server.transport)
      setAuthType(server.authType)
      setAuthToken("")
      setAuthHeaderName(server.authHeaderName ?? "")
      return
    }

    setName("")
    setUrl("")
    setTransport("http")
    setAuthType("none")
    setAuthToken("")
    setAuthHeaderName("")
  }

  const handleSave = async () => {
    if (!name.trim() || !url.trim()) return
    setSaving(true)
    try {
      const args = {
        name: name.trim(),
        url: url.trim(),
        transport,
        authType,
        authToken: authType !== "none" && authToken ? authToken : undefined,
        authHeaderName: authType === "custom-header" ? authHeaderName : undefined,
      }
      if (server) {
        await updateServer({
          id: server._id,
          ...args,
          clearAuthToken: authType === "none",
        })
      } else {
        await createServer(args)
      }
      resetForm()
      setOpen(false)
    } catch (error) {
      console.error("Failed to save MCP server:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Add server
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{server ? "Edit MCP server" : "Add MCP server"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mcp-name">Name</Label>
            <Input id="mcp-name" placeholder="e.g. My MCP Server" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mcp-url">Server URL</Label>
            <Input id="mcp-url" placeholder="https://your-server.com/mcp" value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Transport</Label>
            <Select value={transport} onValueChange={(v) => setTransport(v as Transport)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="http">HTTP (Recommended)</SelectItem>
                <SelectItem value="sse">SSE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Authentication</Label>
            <Select value={authType} onValueChange={(v) => setAuthType(v as AuthType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="bearer">Bearer token</SelectItem>
                <SelectItem value="custom-header">Custom header</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {authType === "custom-header" && (
            <div className="space-y-2">
              <Label htmlFor="mcp-header-name">Header name</Label>
              <Input id="mcp-header-name" placeholder="X-API-Key" value={authHeaderName} onChange={(e) => setAuthHeaderName(e.target.value)} />
            </div>
          )}
          {authType !== "none" && (
            <div className="space-y-2">
              <Label htmlFor="mcp-token">{authType === "bearer" ? "Bearer token" : "Header value"}</Label>
              <Input
                id="mcp-token"
                type="password"
                placeholder={server?.hasAuthToken ? "Leave blank to keep existing" : "••••••••"}
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || !url.trim() || saving}>
            {saving ? "Saving…" : server ? "Update" : "Add server"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
