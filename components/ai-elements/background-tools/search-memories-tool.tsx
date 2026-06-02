"use client";

import {
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
} from "@/components/ai-elements/chain-of-thought";
import { Search } from "lucide-react";
import type { ToolComponentProps, ToolConfig } from "./types";
import { isPartDone } from "./types";

type MemorySearchResult = {
  title?: string;
  content?: string;
  summary?: string;
  text?: string;
  memory?: string;
  chunks?: Array<{ content?: string }>;
};

function getQuery(part: ToolComponentProps["part"]) {
  const input = part.input as { informationToGet?: string } | undefined;
  return input?.informationToGet?.trim();
}

function getOutput(part: ToolComponentProps["part"]) {
  return part.output as
    | {
        success?: boolean;
        error?: string;
        count?: number;
        results?: MemorySearchResult[];
      }
    | null
    | undefined;
}

function previewResult(result: MemorySearchResult) {
  return (
    result.title?.trim() ||
    result.memory?.trim() ||
    result.summary?.trim() ||
    result.content?.trim() ||
    result.text?.trim() ||
    result.chunks?.find((chunk) => chunk.content?.trim())?.content?.trim() ||
    "Memory"
  );
}

export const searchMemoriesConfig: ToolConfig = {
  label: "Searched memories",
  activeLabel: "Searching memories",
  icon: Search,
  getDescription: (part) => {
    const output = getOutput(part);
    if (output?.success === false) {
      return output.error ?? "Memory search failed";
    }

    return undefined;
  },
};

export function getSearchMemoriesLabel(part: ToolComponentProps["part"]) {
  const query = getQuery(part);
  return query ? `Searched memories: "${query}"` : searchMemoriesConfig.label;
}

export function SearchMemoriesContent({ part }: ToolComponentProps) {
  if (!isPartDone(part)) return null;

  const output = getOutput(part);
  if (output?.success === false) {
    return (
      <div className="max-w-xl rounded-md bg-destructive/10 px-3 py-2 text-destructive text-xs shadow-sm">
        {output.error ?? "Supermemory could not search memories."}
      </div>
    );
  }

  const results = (output?.results ?? []).slice(0, 5).map(previewResult);
  if (results.length === 0) return null;

  return (
    <ChainOfThoughtSearchResults>
      {results.map((result, index) => (
        <ChainOfThoughtSearchResult key={`${result}-${index}`}>
          {result}
        </ChainOfThoughtSearchResult>
      ))}
    </ChainOfThoughtSearchResults>
  );
}
