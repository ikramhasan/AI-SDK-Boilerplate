"use client";

import { WrenchIcon } from "lucide-react";
import type { ToolComponentProps, ToolConfig } from "./types";
import { humanize, getToolName } from "./types";

export function getDefaultConfig(part: ToolComponentProps["part"]): ToolConfig {
  const name = getToolName(part);
  return {
    label: humanize(name),
    activeLabel: `Running ${humanize(name)}`,
    icon: WrenchIcon,
    getDescription: () => undefined,
  };
}

export function DefaultToolContent(_props: ToolComponentProps) {
  return null;
}
