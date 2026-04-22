import type { UIMessage } from "ai";
import type { LucideIcon } from "lucide-react";

export type ToolUIPart = Extract<
  UIMessage["parts"][number],
  { type: `tool-${string}` } | { type: "dynamic-tool" }
>;

export interface ToolComponentProps {
  part: ToolUIPart;
}

export interface ToolConfig {
  label: string;
  activeLabel: string;
  icon: LucideIcon;
  getDescription: (part: ToolUIPart) => string | undefined;
}

export function getToolName(part: ToolUIPart): string {
  if (part.type === "dynamic-tool") return part.toolName;
  return part.type.replace(/^tool-/, "");
}

export function humanize(name: string): string {
  return name
    .replace(/^COMPOSIO_/i, "")
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function isPartDone(part: ToolUIPart): boolean {
  return (
    part.state === "output-available" ||
    part.state === "output-error" ||
    part.state === "output-denied"
  );
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
