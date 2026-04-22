"use client";

import {
  ChainOfThoughtSearchResults,
  ChainOfThoughtSearchResult,
} from "@/components/ai-elements/chain-of-thought";
import { FileTextIcon } from "lucide-react";
import type { ToolComponentProps, ToolConfig } from "./types";
import { getDomain, isPartDone } from "./types";

export const tavilyExtractConfig: ToolConfig = {
  label: "Extracted content",
  activeLabel: "Extracting content",
  icon: FileTextIcon,
  getDescription: () => undefined,
};

export function TavilyExtractContent({ part }: ToolComponentProps) {
  if (!isPartDone(part)) return null;

  const output = part.output as {
    results?: { url: string }[];
  } | null;

  const results = (output?.results ?? []).map((r) => ({
    title: getDomain(r.url),
    domain: getDomain(r.url),
  }));

  if (results.length === 0) return null;

  return (
    <ChainOfThoughtSearchResults>
      {results.map((r, i) => (
        <ChainOfThoughtSearchResult key={`${r.domain}-${i}`}>
          {r.domain}
        </ChainOfThoughtSearchResult>
      ))}
    </ChainOfThoughtSearchResults>
  );
}
