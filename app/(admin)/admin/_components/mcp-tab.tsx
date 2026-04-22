"use client"

import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { AddMcpServerDialog } from "./add-mcp-server-dialog"

export function McpTab() {
  const servers = useQuery(api.mcpServers.list)
  const toggleEnabled = useMutation(api.mcpServers.toggleEnabled)
  const removeServer = useMutation(api.mcpServers.remove)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>MCP Servers</CardTitle>
              <CardDescription>
                Connect external tool servers via the Model Context Protocol
              </CardDescription>
            </div>
            <AddMcpServerDialog />
          </div>
        </CardHeader>
        <CardContent>
          {!servers || servers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <p className="text-sm">No MCP servers configured</p>
              <p className="text-xs">
                Add a server to give your AI access to external tools
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {servers.map((server, i) => (
                <div key={server._id}>
                  <div className="flex items-center justify-between rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                          <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                          <line x1="6" y1="6" x2="6.01" y2="6" />
                          <line x1="6" y1="18" x2="6.01" y2="18" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{server.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {server.url}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {server.transport.toUpperCase()}
                      </Badge>
                      {server.authType !== "none" && (
                        <Badge variant="secondary" className="text-xs">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                          Auth
                        </Badge>
                      )}
                      {server.hasAuthToken && (
                        <Badge variant="outline" className="text-xs">
                          Secret set
                        </Badge>
                      )}
                      <AddMcpServerDialog
                        server={server}
                        trigger={
                          <Button variant="ghost" size="icon-sm" aria-label={`Edit ${server.name}`}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </Button>
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeServer({ id: server._id })}
                        aria-label={`Remove ${server.name}`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </Button>
                      <Switch
                        checked={server.enabled}
                        onCheckedChange={() => toggleEnabled({ id: server._id })}
                        aria-label={`Toggle ${server.name}`}
                      />
                    </div>
                  </div>
                  {i < servers.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
