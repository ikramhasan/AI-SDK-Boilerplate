"use client";

import { TerminalSquareIcon } from "lucide-react";
import type { ToolComponentProps, ToolConfig, ToolUIPart } from "./types";
import { isPartDone } from "./types";

interface RemoteBashInput {
  command?: string;
  session_id?: string;
}

interface RemoteBashOutput {
  data?: unknown;
  error?: string;
  successful?: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function compactValue(value: unknown, depth = 0): unknown {
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "number"
  ) {
    return value;
  }

  if (typeof value === "string") {
    return value.length > 800 ? `${value.slice(0, 800).trimEnd()}...` : value;
  }

  if (Array.isArray(value)) {
    const items = value.slice(0, 6).map((item) => compactValue(item, depth + 1));
    if (value.length > 6) {
      items.push(`... +${value.length - 6} more`);
    }
    return items;
  }

  if (!isRecord(value)) return undefined;
  if (depth >= 2) return Object.keys(value);

  const compacted = Object.fromEntries(
    Object.entries(value)
      .slice(0, 10)
      .map(([key, entryValue]) => [key, compactValue(entryValue, depth + 1)] as const)
      .filter(([, entryValue]) => entryValue !== undefined)
  );

  if (Object.keys(value).length > 10) {
    compacted._summary = `+${Object.keys(value).length - 10} more fields`;
  }

  return compacted;
}

function getRemoteBashInput(part: ToolUIPart): RemoteBashInput {
  return (part.input as RemoteBashInput | undefined) ?? {};
}

function getRemoteBashOutput(part: ToolUIPart): RemoteBashOutput | null {
  if (!isPartDone(part)) return null;
  return (part.output as RemoteBashOutput | null) ?? null;
}

function getOutputText(output: RemoteBashOutput | null): string | undefined {
  if (!output) return undefined;
  if (output.error) return output.error;

  const data = output.data;
  if (typeof data === "string") return data;
  if (!isRecord(data)) {
    const compacted = compactValue(data);
    return compacted === undefined ? undefined : JSON.stringify(compacted, null, 2);
  }

  const stdout = typeof data.stdout === "string" ? data.stdout : "";
  const stderr = typeof data.stderr === "string" ? data.stderr : "";
  const results = typeof data.results === "string" ? data.results : "";
  const combined = [stdout, stderr, results].filter(Boolean).join("\n");

  if (combined) return combined;

  const compacted = compactValue(data);
  return compacted === undefined ? undefined : JSON.stringify(compacted, null, 2);
}

export const composioRemoteBashConfig: ToolConfig = {
  label: "Remote Bash",
  activeLabel: "Running Remote Bash",
  icon: TerminalSquareIcon,
  getDescription: () => undefined,
};

export function ComposioRemoteBashContent({ part }: ToolComponentProps) {
  const input = getRemoteBashInput(part);
  const output = getRemoteBashOutput(part);
  const outputText = getOutputText(output);

  if (!input.command && !outputText && output?.successful === undefined) {
    return null;
  }

  return (
    <div className="space-y-1.5 text-xs text-muted-foreground">
      {output?.successful !== undefined && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>
            Status:{" "}
            <span className={output.successful ? "text-green-600 dark:text-green-400" : "text-destructive"}>
              {output.successful ? "successful" : "failed"}
            </span>
          </span>
        </div>
      )}

      {input.command && (
        <div className="space-y-1">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
            Command
          </div>
          <pre className="scrollbar-none max-h-40 overflow-auto rounded-md bg-muted/40 p-2 text-[12px] leading-relaxed text-muted-foreground">
            {input.command}
          </pre>
        </div>
      )}

      {outputText && (
        <div className="space-y-1">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
            Output
          </div>
          <pre className="scrollbar-none max-h-48 overflow-auto rounded-md bg-muted/40 p-2 text-[12px] leading-relaxed text-muted-foreground">
            {outputText}
          </pre>
        </div>
      )}
    </div>
  );
}
