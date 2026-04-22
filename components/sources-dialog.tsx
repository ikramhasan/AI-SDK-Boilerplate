"use client";

import type { UIMessage } from "ai";
import { useState, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ExternalLinkIcon } from "lucide-react";

interface SourceItem {
  title: string;
  url: string;
  content: string;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function getFavicon(url: string): string {
  try {
    const domain = new URL(url).origin;
    return `${domain}/favicon.ico`;
  } catch {
    return "";
  }
}

function extractSources(message: UIMessage): SourceItem[] {
  const sources: SourceItem[] = [];
  const seenUrls = new Set<string>();

  for (const part of message.parts) {
    const p = part as Record<string, unknown>;

    // Tavily Search results
    const isSearch =
      p.type === "tool-tavilySearch" ||
      (p.type === "dynamic-tool" && p.toolName === "tavilySearch");
    if (isSearch && p.state === "output-available" && p.output) {
      const output = p.output as { results?: { title: string; url: string; content: string }[] };
      if (output.results) {
        for (const r of output.results) {
          if (!seenUrls.has(r.url)) {
            seenUrls.add(r.url);
            sources.push({ title: r.title, url: r.url, content: r.content });
          }
        }
      }
    }

    // Tavily Extract results
    const isExtract =
      p.type === "tool-tavilyExtract" ||
      (p.type === "dynamic-tool" && p.toolName === "tavilyExtract");
    if (isExtract && p.state === "output-available" && p.output) {
      const output = p.output as { results?: { url: string; rawContent: string }[] };
      if (output.results) {
        for (const r of output.results) {
          if (!seenUrls.has(r.url)) {
            seenUrls.add(r.url);
            sources.push({
              title: getDomain(r.url),
              url: r.url,
              content: r.rawContent.slice(0, 500),
            });
          }
        }
      }
    }
  }
  return sources;
}

export function SourcesChip({ message }: { message: UIMessage }) {
  const [open, setOpen] = useState(false);
  const sources = useMemo(() => extractSources(message), [message]);

  if (sources.length === 0) return null;

  const previewSources = sources.slice(0, 3);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <span className="flex items-center -space-x-1.5">
          {previewSources.map((source, i) => (
            <img
              key={i}
              src={getFavicon(source.url)}
              alt=""
              className="size-4 rounded-full border border-background bg-background"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ))}
        </span>
        <span>
          {sources.length} source{sources.length !== 1 ? "s" : ""}
        </span>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Sources ({sources.length})</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 overflow-y-auto px-6 pb-6">
            {sources.map((source, i) => (
              <a
                key={i}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-1.5 rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={getFavicon(source.url)}
                    alt=""
                    className="size-4 shrink-0 rounded-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {getDomain(source.url)}
                  </span>
                  <ExternalLinkIcon className="ml-auto size-3 shrink-0 text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <span className="text-sm font-medium leading-snug text-foreground">
                  {source.title}
                </span>
                <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                  {source.content}
                </p>
              </a>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
