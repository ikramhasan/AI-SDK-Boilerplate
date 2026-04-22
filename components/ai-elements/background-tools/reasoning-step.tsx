"use client";

import { ChainOfThoughtStep } from "@/components/ai-elements/chain-of-thought";
import { BrainIcon } from "lucide-react";
import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import { Streamdown } from "streamdown";
import type { UIMessage } from "ai";

export type ReasoningUIPart = Extract<
  UIMessage["parts"][number],
  { type: "reasoning" }
>;

export interface ReasoningStepProps {
  part: ReasoningUIPart;
}

const streamdownPlugins = { cjk, code, math, mermaid };

export function ReasoningStep({ part }: ReasoningStepProps) {
  const isStreaming = part.state === "streaming";

  return (
    <ChainOfThoughtStep
      icon={BrainIcon}
      label="Reasoning"
      status={isStreaming ? "active" : "complete"}
    >
      {part.text.length > 0 && (
        <div className="text-muted-foreground text-sm">
          <Streamdown plugins={streamdownPlugins}>{part.text}</Streamdown>
        </div>
      )}
    </ChainOfThoughtStep>
  );
}
