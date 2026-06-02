"use client";

import { BrainCircuit, Sparkles } from "lucide-react";
import type { ToolComponentProps, ToolConfig } from "./types";
import { isPartDone } from "./types";

function getMemoryText(part: ToolComponentProps["part"]) {
  const input = part.input as { memory?: string } | undefined;
  return input?.memory?.trim();
}

function getOutput(part: ToolComponentProps["part"]) {
  return part.output as
    | { success?: boolean; error?: string; memory?: { id?: string } }
    | null
    | undefined;
}

export const addMemoryConfig: ToolConfig = {
  label: "Saved memory",
  activeLabel: "Saving memory",
  icon: BrainCircuit,
  getDescription: (part) => {
    const output = getOutput(part);
    if (output?.success === false) {
      return output.error ?? "Memory could not be saved";
    }

    return undefined;
  },
};

export function getAddMemoryLabel(part: ToolComponentProps["part"]) {
  const output = getOutput(part);
  if (output?.success === false) return "Memory not saved";

  return addMemoryConfig.label;
}

export function AddMemoryContent({ part }: ToolComponentProps) {
  const memory = getMemoryText(part);
  const output = getOutput(part);

  if (!isPartDone(part)) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <Sparkles className="size-3.5" />
        Checking whether this should become long-term context
      </div>
    );
  }

  if (output?.success === false) {
    return (
      <div className="max-w-xl rounded-md bg-destructive/10 px-3 py-2 text-destructive text-xs shadow-sm">
        {output.error ?? "Supermemory could not save this memory."}
      </div>
    );
  }

  if (!memory) return null;

  return (
    <div className="max-w-xl rounded-md bg-muted/60 px-3 py-2 text-xs shadow-sm">
      <p className="text-foreground/90 text-pretty">{`"${memory}"`}</p>
    </div>
  );
}
