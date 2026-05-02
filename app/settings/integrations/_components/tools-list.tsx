"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Wrench, Tag, ChevronDown } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import type { ToolkitTool, ToolParameterProperty } from "../types"

export function ToolsList({ tools }: { tools: ToolkitTool[] }) {
  const [search, setSearch] = useState("")

  const filtered = search
    ? tools.filter((t) => {
        const q = search.toLowerCase()
        return (
          t.name.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
        )
      })
    : tools

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground">
        Available Tools ({tools.length})
      </h2>

      {tools.length > 0 && (
        <Input
          placeholder="Filter tools…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      {tools.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No tools found for this integration.
        </p>
      ) : filtered.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No tools match &ldquo;{search}&rdquo;
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      )}
    </section>
  )
}

function ToolCard({ tool }: { tool: ToolkitTool }) {
  const [expanded, setExpanded] = useState(false)
  const [animating, setAnimating] = useState(false)

  const inputProps = tool.inputParameters?.properties
    ? Object.entries(tool.inputParameters.properties)
    : []
  const requiredInputs = new Set(tool.inputParameters?.required ?? [])

  const outputProps = tool.outputParameters?.properties
    ? Object.entries(tool.outputParameters.properties)
    : []

  const hasDetails = inputProps.length > 0 || outputProps.length > 0
  const showTopOnly = expanded || animating

  return (
    <div className="rounded-lg border">
      <button
        type="button"
        className={`flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-muted/50 ${
          showTopOnly ? "rounded-t-lg" : "rounded-lg"
        }`}
        onClick={() => {
          if (!hasDetails) return
          if (!expanded) setAnimating(true)
          setExpanded(!expanded)
        }}
        disabled={!hasDetails}
      >
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Wrench className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate text-sm font-medium">{tool.name}</span>
            {tool.isDeprecated && (
              <Badge variant="destructive" className="text-xs">
                Deprecated
              </Badge>
            )}
          </div>
          {tool.description && (
            <p className="line-clamp-2 pl-5.5 text-xs text-muted-foreground">
              {tool.description}
            </p>
          )}
          {tool.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 pl-5.5">
              <Tag className="size-3 shrink-0 text-muted-foreground" />
              {tool.tags.slice(0, 5).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="px-1.5 py-0 text-[10px]"
                >
                  {tag}
                </Badge>
              ))}
              {tool.tags.length > 5 && (
                <span className="text-[10px] text-muted-foreground">
                  +{tool.tags.length - 5} more
                </span>
              )}
            </div>
          )}
        </div>
        {hasDetails && (
          <ChevronDown
            className={`ml-2 size-4 shrink-0 text-muted-foreground transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      <AnimatePresence
        initial={false}
        onExitComplete={() => setAnimating(false)}
      >
        {expanded && hasDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-3 border-t px-3 pt-2 pb-3">
              {inputProps.length > 0 && (
                <ParameterTable
                  title="Input Parameters"
                  properties={inputProps}
                  requiredFields={requiredInputs}
                />
              )}
              {outputProps.length > 0 && (
                <ParameterTable
                  title="Output Parameters"
                  properties={outputProps}
                  requiredFields={new Set()}
                />
              )}
              {tool.scopes.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Required Scopes
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {tool.scopes.map((scope) => (
                      <Badge
                        key={scope}
                        variant="outline"
                        className="font-mono text-[10px]"
                      >
                        {scope}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ParameterTable({
  title,
  properties,
  requiredFields,
}: {
  title: string
  properties: [string, ToolParameterProperty][]
  requiredFields: Set<string>
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      <div className="rounded-md border text-xs">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-2 py-1.5 text-left font-medium">Name</th>
              <th className="px-2 py-1.5 text-left font-medium">Type</th>
              <th className="px-2 py-1.5 text-left font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {properties.map(([name, prop]) => (
              <tr key={name} className="border-b last:border-0">
                <td className="px-2 py-1.5 font-mono whitespace-nowrap">
                  {name}
                  {requiredFields.has(name) && (
                    <span className="ml-0.5 text-red-500">*</span>
                  )}
                </td>
                <td className="px-2 py-1.5 whitespace-nowrap text-muted-foreground">
                  {prop.type ?? "—"}
                </td>
                <td className="px-2 py-1.5 text-muted-foreground">
                  {prop.description ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
