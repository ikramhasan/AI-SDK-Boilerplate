"use client";

import { ImageIcon } from "lucide-react";
import type { ToolComponentProps, ToolConfig } from "./types";
import { isPartDone } from "./types";

export const fetchImagesConfig: ToolConfig = {
  label: "Searched images",
  activeLabel: "Searching images",
  icon: ImageIcon,
  getDescription: (part) => {
    const input = part.input as { query?: string } | undefined;
    return input?.query ? `"${input.query}"` : undefined;
  },
};

export function FetchImagesContent({ part }: ToolComponentProps) {
  if (!isPartDone(part)) return null;

  const output = part.output as {
    results?: { url: string; thumbnailUrl?: string; title: string }[];
  } | null;

  const images = output?.results ?? [];
  if (images.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none">
      {images.map((img, idx) => (
        <a
          key={idx}
          href={img.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.thumbnailUrl ?? img.url}
            alt={img.title}
            className="size-16 rounded-md border border-border/50 object-cover transition-opacity hover:opacity-80"
            loading="lazy"
          />
        </a>
      ))}
    </div>
  );
}
