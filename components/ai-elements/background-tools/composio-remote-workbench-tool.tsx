"use client";

import { TerminalSquareIcon } from "lucide-react";
import type { ToolComponentProps, ToolConfig, ToolUIPart } from "./types";
import { humanize, isPartDone } from "./types";
import {
  Sandbox,
  SandboxHeader,
  SandboxContent,
  SandboxTabs,
  SandboxTabsBar,
  SandboxTabsList,
  SandboxTabsTrigger,
  SandboxTabContent,
} from "@/components/ai-elements/sandbox";
import { CodeBlockContent } from "@/components/ai-elements/code-block";
import type { BundledLanguage } from "shiki";

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

function buildSandboxTitle(input: RemoteWorkbenchInput): string {
  const step = summarizeStep(input);
  if (step) return step;
  if (input.thought) return truncate(input.thought, 60);
  return "Execution";
}

function detectOutputLanguage(text: string): BundledLanguage {
  const trimmed = text.trimStart();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch {
      // not valid JSON, fall through
    }
  }
  // shiki's internal highlighter falls back gracefully for unknown langs
  return "log" as BundledLanguage;
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
  const done = isPartDone(part);

  const hasCode = !!input.code_to_execute;
  const hasOutput = !!outputPreview || output?.successful !== undefined;

  if (!hasCode && !hasOutput) {
    return null;
  }

  const defaultTab = hasOutput ? "output" : "input";

  return (
    <Sandbox>
      <SandboxHeader title={buildSandboxTitle(input)} state={part.state} />
      <SandboxContent>
        <SandboxTabs defaultValue={defaultTab}>
          <SandboxTabsBar>
            <SandboxTabsList>
              {hasCode && (
                <SandboxTabsTrigger value="input">Input</SandboxTabsTrigger>
              )}
              <SandboxTabsTrigger value="output" disabled={!done}>
                Output
              </SandboxTabsTrigger>
            </SandboxTabsList>
          </SandboxTabsBar>

          {hasCode && (
            <SandboxTabContent value="input">
              <div className="max-h-72 overflow-auto text-[12px]">
                <CodeBlockContent
                  code={input.code_to_execute!}
                  language="python"
                />
              </div>
            </SandboxTabContent>
          )}

          <SandboxTabContent value="output">
            {outputPreview ? (
              <div className="max-h-72 overflow-auto text-[12px]">
                <CodeBlockContent
                  code={outputPreview}
                  language={detectOutputLanguage(outputPreview)}
                />
              </div>
            ) : done ? (
              <p className="p-3 text-xs text-muted-foreground">
                No output returned.
              </p>
            ) : (
              <p className="p-3 text-xs text-muted-foreground">
                Waiting for execution to complete…
              </p>
            )}
          </SandboxTabContent>
        </SandboxTabs>
      </SandboxContent>
    </Sandbox>
  );
}
