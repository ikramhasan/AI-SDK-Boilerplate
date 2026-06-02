"use client";

import {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtContent,
} from "@/components/ai-elements/chain-of-thought";
import {
  formatThinkingDuration,
  getElapsedThinkingSeconds,
} from "@/app/chat/_components/chat-utils";
import { isToolUIPart, isReasoningUIPart } from "ai";
import { ThinkingIndicator } from "@/components/ui/thinking-indicator";
import { useEffect, useRef, useState } from "react";
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
  messageId: string;
  thinkingDurationSeconds?: number;
  onThinkingDone?: (messageId: string, durationSeconds: number) => void;
}

function getPartKey(part: BackgroundPart, index: number): string {
  if (isToolUIPart(part) && "toolCallId" in part) return part.toolCallId;
  return String(index);
}

export function BackgroundToolsGroup({
  parts,
  isStreaming,
  isResponseStreaming,
  messageId,
  thinkingDurationSeconds,
  onThinkingDone,
}: BackgroundToolsGroupProps) {
  // The duration is simply how long the chain-of-thought was "alive" (expanded)
  // before it auto-closed. We track from mount time (or first streaming) to when
  // isResponseStreaming flips to false. This value never resets mid-session because
  // isResponseStreaming stays true for the entire response, unlike isStreaming which
  // flickers between individual tool calls.
  const mountedAtRef = useRef<number | null>(null);
  const reportedRef = useRef(false);
  const [measuredDurationSeconds, setMeasuredDurationSeconds] = useState<
    number | undefined
  >(undefined);

  useEffect(() => {
    // Capture the start time once on mount
    mountedAtRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (isResponseStreaming) {
      // Still streaming the overall response — nothing to do
      return;
    }

    // Response is done. Report the total duration once.
    if (!reportedRef.current && mountedAtRef.current !== null) {
      reportedRef.current = true;
      const durationSeconds = getElapsedThinkingSeconds(mountedAtRef.current);
      setMeasuredDurationSeconds(durationSeconds);
      onThinkingDone?.(messageId, durationSeconds);
    }
  }, [isResponseStreaming, messageId, onThinkingDone]);

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
  const displayedDurationSeconds =
    thinkingDurationSeconds ?? measuredDurationSeconds;

  return (
    <ChainOfThought isStreaming={isResponseStreaming}>
      <ChainOfThoughtHeader isThinking={isResponseStreaming}>
        {isResponseStreaming ? (
          <ThinkingIndicator />
        ) : displayedDurationSeconds ? (
          `Thought for ${formatThinkingDuration(displayedDurationSeconds)}`
        ) : (
          "Thought for a few seconds"
        )}
      </ChainOfThoughtHeader>
      <ChainOfThoughtContent>{content}</ChainOfThoughtContent>
    </ChainOfThought>
  );
}
