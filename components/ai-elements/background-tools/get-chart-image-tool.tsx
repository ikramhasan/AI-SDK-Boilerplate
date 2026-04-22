"use client";

import { BarChartIcon } from "lucide-react";
import type { ToolComponentProps, ToolConfig } from "./types";
import { isPartDone } from "./types";

export const getChartImageConfig: ToolConfig = {
  label: "Generated chart image",
  activeLabel: "Generating chart image",
  icon: BarChartIcon,
  getDescription: (part) => {
    const input = part.input as { title?: string; chartType?: string } | undefined;
    if (input?.title) return input.title;
    if (input?.chartType) return `${input.chartType} chart`;
    return undefined;
  },
};

export function GetChartImageContent({ part }: ToolComponentProps) {
  if (!isPartDone(part)) return null;

  const output = part.output as { url?: string; title?: string; error?: string } | null;
  if (!output?.url) return null;

  return (
    <div className="py-1">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={output.url}
        alt={output.title ?? "Chart"}
        className="max-h-48 rounded-md border border-border/50 object-contain"
        loading="lazy"
      />
    </div>
  );
}
