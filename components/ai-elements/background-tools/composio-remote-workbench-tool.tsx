"use client";

import { TerminalSquareIcon } from "lucide-react";
import type { ToolComponentProps, ToolConfig, ToolUIPart } from "./types";
import { humanize, isPartDone } from "./types";

interface RemoteWorkbenchInput {
  code_to_execute?: string;
  thought?: string;
  session_id?: string;
  current_step?: string;
  current_step_metric?: string;
}

interface RemoteWorkbenchOutput {
  data?: unknown;
  error?: string;
  successful?: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function summarizeStep(input: RemoteWorkbenchInput): string | undefined {
  if (!input.current_step) return undefined;

  const step = humanize(input.current_step);
  return input.current_step_metric
    ? `${step} (${input.current_step_metric})`
    : step;
}

function truncate(text: string, max = 240): string {
  return text.length > max ? `${text.slice(0, max).trimEnd()}...` : text;
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
    return truncate(value, 500);
  }

  if (Array.isArray(value)) {
    const items = value.slice(0, 4).map((item) => compactValue(item, depth + 1));
    if (value.length > 4) {
      items.push(`... +${value.length - 4} more`);
    }
    return items;
  }

  if (!isRecord(value)) return undefined;
  if (depth >= 2) return Object.keys(value);

  const entries = Object.entries(value).slice(0, 8);
  const compacted = Object.fromEntries(
    entries
      .map(([key, entryValue]) => [key, compactValue(entryValue, depth + 1)] as const)
      .filter(([, entryValue]) => entryValue !== undefined)
  );

  if (Object.keys(value).length > 8) {
    compacted._summary = `+${Object.keys(value).length - 8} more fields`;
  }

  return compacted;
}

function getOutputPreview(output: RemoteWorkbenchOutput | null | undefined): string | undefined {
  if (!output) return undefined;

  if (output.error) return truncate(output.error, 500);
  if (output.data === undefined) return undefined;

  const compacted = compactValue(output.data);
  if (compacted === undefined) return undefined;

  return JSON.stringify(compacted, null, 2);
}

function getRemoteWorkbenchInput(part: ToolUIPart): RemoteWorkbenchInput {
  return (part.input as RemoteWorkbenchInput | undefined) ?? {};
}

function getRemoteWorkbenchOutput(part: ToolUIPart): RemoteWorkbenchOutput | null {
  if (!isPartDone(part)) return null;
  return (part.output as RemoteWorkbenchOutput | null) ?? null;
}

export const composioRemoteWorkbenchConfig: ToolConfig = {
  label: "Remote Workbench",
  activeLabel: "Running Remote Workbench",
  icon: TerminalSquareIcon,
  getDescription: (part) => {
    const input = getRemoteWorkbenchInput(part);
    return (
      input.thought ??
      summarizeStep(input) ??
      "Runs Python code in Composio's persistent remote sandbox."
    );
  },
};

export function ComposioRemoteWorkbenchContent({ part }: ToolComponentProps) {
  const input = getRemoteWorkbenchInput(part);
  const output = getRemoteWorkbenchOutput(part);
  const outputPreview = getOutputPreview(output);

  if (
    !input.current_step &&
    !input.thought &&
    !input.code_to_execute &&
    !outputPreview &&
    output?.successful === undefined
  ) {
    return null;
  }

  return (
    <div className="space-y-1.5 text-xs text-muted-foreground">
      {(input.current_step || output?.successful !== undefined) && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {input.current_step && (
            <span>
              Step: <span className="text-foreground">{summarizeStep(input)}</span>
            </span>
          )}
          {output?.successful !== undefined && (
            <span>
              Status:{" "}
              <span className={output.successful ? "text-green-600 dark:text-green-400" : "text-destructive"}>
                {output.successful ? "successful" : "failed"}
              </span>
            </span>
          )}
        </div>
      )}

      {input.code_to_execute && (
        <div className="space-y-1">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
            Code
          </div>
          <pre className="scrollbar-none max-h-56 overflow-auto rounded-md bg-muted/40 p-2 text-[12px] leading-relaxed text-muted-foreground">
            {input.code_to_execute}
          </pre>
        </div>
      )}

      {outputPreview && (
        <div className="space-y-1">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
            Output
          </div>
          <pre className="scrollbar-none max-h-40 overflow-auto rounded-md bg-muted/40 p-2 text-[12px] leading-relaxed text-muted-foreground">
            {outputPreview}
          </pre>
        </div>
      )}
    </div>
  );
}
