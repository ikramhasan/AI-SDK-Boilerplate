"use client";

import { WrenchIcon } from "lucide-react";
import type { ToolComponentProps, ToolConfig, ToolUIPart } from "./types";
import { getToolName, humanize } from "./types";

export function getMultiExecuteTools(part: ToolUIPart): { slug: string }[] {
  const name = getToolName(part);
  if (!/multi.?execute/i.test(name) && name !== "COMPOSIO_MULTI_EXECUTE_TOOL")
    return [];
  const input = part.input as { tools?: { tool_slug: string }[] } | undefined;
  return (input?.tools ?? []).map((t) => ({ slug: t.tool_slug }));
}

export const composioMultiExecuteConfig: ToolConfig = {
  label: "Executed tools",
  activeLabel: "Executing tool",
  icon: WrenchIcon,
  getDescription: () => undefined,
};

export function getMultiExecuteLabel(part: ToolUIPart): string {
  const tools = getMultiExecuteTools(part);
  const count = tools.length;
  return count > 0
    ? `Executed ${count} tool${count !== 1 ? "s" : ""}`
    : "Executed tools";
}

export function ComposioMultiExecuteContent({ part }: ToolComponentProps) {
  const tools = getMultiExecuteTools(part);
  if (tools.length === 0) return null;

  return (
    <ul className="space-y-0.5 text-xs text-muted-foreground">
      {tools.map((tool, idx) => (
        <li key={idx} className="flex items-center gap-2">
          <span className="size-1 shrink-0 rounded-full bg-muted-foreground/50" />
          <span>{humanize(tool.slug)}</span>
        </li>
      ))}
    </ul>
  );
}
