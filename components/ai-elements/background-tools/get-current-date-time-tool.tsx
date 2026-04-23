"use client";

import { Clock } from "lucide-react";
import type { ToolComponentProps, ToolConfig } from "./types";

export const getCurrentDateTimeConfig: ToolConfig = {
  label: "Fetched current date & time",
  activeLabel: "Fetching current date & time",
  icon: Clock,
  getDescription: (part) => {
    const output = part.output as { utc?: string } | null;
    return output?.utc;
  },
};

export function GetCurrentDateTimeContent(_props: ToolComponentProps) {
  return null;
}
