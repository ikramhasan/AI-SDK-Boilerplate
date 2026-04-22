"use client";

import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { AttachmentList } from "./attachment-list";
import { useCallback, type KeyboardEvent } from "react";

export function ChatInput({
  onSubmit,
  status,
  stop,
  autoFocus,
}: {
  onSubmit: (text: string, files: { type: "file"; url: string; mediaType: string; filename?: string }[]) => void;
  status: "ready" | "submitted" | "streaming" | "error";
  stop: () => void;
  autoFocus?: boolean;
}) {
  const isGenerating = status === "submitted" || status === "streaming";

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && isGenerating) {
        e.preventDefault();
      }
    },
    [isGenerating]
  );

  return (
    <div className="sticky bottom-0 z-10 w-full bg-background px-4 pb-4">
      <PromptInput
        className="mx-auto max-w-2xl"
        onSubmit={(message) => {
          if (isGenerating) return;
          onSubmit(
            message.text,
            message.files.map((f) => ({
              type: "file" as const,
              url: f.url,
              mediaType: f.mediaType,
              filename: f.filename,
            }))
          );
        }}
      >
        <AttachmentList />
        <PromptInputTextarea autoFocus={autoFocus} onKeyDown={handleKeyDown} />
        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger tooltip="Attach" />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
          </PromptInputTools>
          <PromptInputSubmit status={status} onStop={stop} />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
