"use client";

import { cn } from "@/lib/utils";
import { SearchIcon, WrenchIcon, ZapIcon } from "lucide-react";
import type { ToolComponentProps, ToolConfig, ToolUIPart } from "./types";
import { humanize, isPartDone, getToolName } from "./types";

interface ComposioSearchData {
  useCase?: string;
  primaryTools: string[];
  connections: { toolkit: string; connected: boolean }[];
}

function parseComposioSearchData(part: ToolComponentProps["part"]): ComposioSearchData | null {
  if (!isPartDone(part)) return null;
  if (getToolName(part) !== "COMPOSIO_SEARCH_TOOLS") return null;

  const output = part.output as {
    data?: {
      results?: {
        use_case: string;
        primary_tool_slugs: string[];
      }[];
      toolkit_connection_statuses?: {
        toolkit: string;
        has_active_connection: boolean;
      }[];
    };
  } | null;

  const first = output?.data?.results?.[0];
  if (!first) return null;

  return {
    useCase: first.use_case,
    primaryTools: first.primary_tool_slugs ?? [],
    connections: (output?.data?.toolkit_connection_statuses ?? []).map((c) => ({
      toolkit: c.toolkit,
      connected: c.has_active_connection,
    })),
  };
}

export function getComposioSearchLabel(part: ToolUIPart): string {
  const data = parseComposioSearchData(part);
  if (!data) return "Searched tools";
  const count = data.primaryTools.length;
  if (count === 0) return "Searched tools";
  return `Found ${count} tool${count !== 1 ? "s" : ""}`;
}

export const composioSearchConfig: ToolConfig = {
  label: "Searched tools",
  activeLabel: "Searching tools",
  icon: SearchIcon,
  getDescription: () => undefined,
};

export function ComposioSearchContent({ part }: ToolComponentProps) {
  const data = parseComposioSearchData(part);
  if (!data) return null;

  return (
    <div className="space-y-1.5 text-xs text-muted-foreground">
      {data.primaryTools.map((slug, idx) => {
        const conn = data.connections.find(
          (c) => slug.toLowerCase().startsWith(c.toolkit.toLowerCase())
        );
        return (
          <div key={idx} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <WrenchIcon className="size-3 shrink-0 text-muted-foreground/50" />
              <span>{humanize(slug)}</span>
            </span>
            {conn && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                  conn.connected
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                )}
              >
                <ZapIcon className="size-2.5" />
                {humanize(conn.toolkit)} {conn.connected ? "connected" : "disconnected"}
              </span>
            )}
          </div>
        );
      })}
      {data.connections
        .filter((conn) => !data.primaryTools.some(
          (slug) => slug.toLowerCase().startsWith(conn.toolkit.toLowerCase())
        ))
        .map((conn, idx) => (
          <div key={`conn-${idx}`} className="flex items-center justify-end">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                conn.connected
                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
              )}
            >
              <ZapIcon className="size-2.5" />
              {humanize(conn.toolkit)} {conn.connected ? "connected" : "disconnected"}
            </span>
          </div>
        ))}
    </div>
  );
}
