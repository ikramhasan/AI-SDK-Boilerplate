"use client"

import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AddKnowledgeDialog } from "./add-knowledge-dialog"

export function KnowledgeTab() {
  const files = useQuery(api.knowledgeFiles.list)
  const removeFile = useMutation(api.knowledgeFiles.remove)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Knowledge base</CardTitle>
              <CardDescription>
                Add files and resources to inform AI responses
              </CardDescription>
            </div>
            <AddKnowledgeDialog />
          </div>
        </CardHeader>
        <CardContent>
          {!files || files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <p className="text-sm">No files uploaded yet</p>
              <p className="text-xs">
                Add documents to give your AI more context
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file._id}
                  className="flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <span className="text-sm font-medium">{file.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={file.status === "ready" ? "secondary" : "outline"}>
                      {file.status === "ready" ? "✓ Ready" : "Processing…"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeFile({ id: file._id })}
                      aria-label={`Remove ${file.name}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
