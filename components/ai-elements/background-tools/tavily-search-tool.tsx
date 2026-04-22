"use client";

import {
  ChainOfThoughtSearchResults,
  ChainOfThoughtSearchResult,
} from "@/components/ai-elements/chain-of-thought";
import { GlobeIcon } from "lucide-react";
import type { ToolComponentProps, ToolConfig } from "./types";
import { getDomain, isPartDone } from "./types";

export const tavilySearchConfig: ToolConfig = {
  label: "Searched the web",
  activeLabel: "Searching the web",
  icon: GlobeIcon,
  getDescription: (part) => {
    const input = part.input as { query?: string } | undefined;
    return input?.query ? `"${input.query}"` : undefined;
  },
};

export function TavilySearchContent({ part }: ToolComponentProps) {
  if (!isPartDone(part)) return null;

  const output = part.output as {
    results?: { title: string; url: string }[];
  } | null;

  const results = (output?.results ?? []).slice(0, 5).map((r) => ({
    title: r.title,
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
