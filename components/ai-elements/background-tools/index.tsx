"use client";

import {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtContent,
} from "@/components/ai-elements/chain-of-thought";
import { isToolUIPart, isReasoningUIPart } from "ai";
import { Loader2Icon } from "lucide-react";
import type { ToolUIPart } from "./types";
import { ToolStep } from "./tool-step";
import type { ReasoningUIPart } from "./reasoning-step";
import { ReasoningStep } from "./reasoning-step";

export type { ToolUIPart, ReasoningUIPart };

export type BackgroundPart = ToolUIPart | ReasoningUIPart;

export interface BackgroundToolsGroupProps {
  parts: BackgroundPart[];
  isStreaming: boolean;
  isResponseStreaming: boolean;
}

function getPartKey(part: BackgroundPart, index: number): string {
  if (isToolUIPart(part) && "toolCallId" in part) return part.toolCallId;
  return String(index);
}

export function BackgroundToolsGroup({
  parts,
  isStreaming,
  isResponseStreaming,
}: BackgroundToolsGroupProps) {
  const content = parts.map((part, i) => {
    const key = getPartKey(part, i);
    if (isReasoningUIPart(part)) {
      return <ReasoningStep key={key} part={part} />;
    }
    return (
      <ToolStep
        key={key}
        part={part as ToolUIPart}
        isStreaming={isStreaming}
      />
    );
  });

  return (
    <ChainOfThought isStreaming={isResponseStreaming}>
      <ChainOfThoughtHeader>
        {isStreaming ? (
          <span className="flex items-center gap-2">
            <Loader2Icon className="size-3.5 animate-spin" />
            Thinking…
          </span>
        ) : (
          "Chain of Thought"
        )}
      </ChainOfThoughtHeader>
      <ChainOfThoughtContent>{content}</ChainOfThoughtContent>
    </ChainOfThought>
  );
}
