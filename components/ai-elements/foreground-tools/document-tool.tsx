"use client";

import { Loader2Icon, XCircleIcon, DownloadIcon, CopyIcon, CheckIcon, FileTextIcon } from "lucide-react";
import { useState, useCallback } from "react";
import { MessageResponse } from "@/components/ai-elements/message";
import {
  exportMessageAsMarkdown,
  exportMessageAsDocx,
  exportMessageAsPdf,
} from "@/lib/export-chat";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Artifact,
  ArtifactHeader,
  ArtifactTitle,
  ArtifactActions,
  ArtifactAction,
  ArtifactContent,
} from "@/components/ai-elements/artifact";

type DocumentState =
  | "input-available"
  | "input-streaming"
  | "output-available"
  | "output-error"
  | "approval-requested"
  | "approval-responded"
  | "output-denied";

export interface DocumentInput {
  title?: string;
  content?: string;
}

export interface DocumentOutput {
  title: string;
  content: string;
  error?: string;
}

export function Document({
  state,
  input,
  output,
}: {
  state: DocumentState;
  input?: DocumentInput;
  output?: DocumentOutput;
}) {
  const isStreaming = state === "input-streaming";
  const isLoading = state === "input-available";
  const isDone = state === "output-available";
  const isError = state === "output-error" || state === "output-denied";

  const title = output?.title ?? input?.title;
  const content = output?.content ?? input?.content;
  const error = output?.error;

  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  if (isLoading && !content) {
    return (
      <div className="not-prose py-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2Icon className="size-3.5 animate-spin" />
          <span>Generating document…</span>
        </div>
      </div>
    );
  }

  if ((isError || error) && !content) {
    return (
      <div className="not-prose py-2">
        <div className="flex items-center gap-2 text-sm text-destructive">
          <XCircleIcon className="size-3.5" />
          <span>{error ?? "Failed to create document"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="not-prose py-2">
      <Artifact>
        <ArtifactHeader>
          <div className="flex items-center gap-2">
            <FileTextIcon className="size-4 text-muted-foreground" />
            <ArtifactTitle>{title ?? "Document"}</ArtifactTitle>
          </div>
          {isDone && content && (
            <ArtifactActions>
              <ArtifactAction
                tooltip="Copy markdown"
                label="Copy"
                icon={copied ? CheckIcon : CopyIcon}
                onClick={handleCopy}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <ArtifactAction
                    tooltip="Download"
                    label="Download"
                    icon={DownloadIcon}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onSelect={() => exportMessageAsMarkdown(content)}
                  >
                    Markdown
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => exportMessageAsDocx(content)}
                  >
                    Word (.docx)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => exportMessageAsPdf(content)}
                  >
                    PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </ArtifactActions>
          )}
        </ArtifactHeader>
        <ArtifactContent className="max-h-[500px] max-w-none">
          <MessageResponse isAnimating={isStreaming}>
            {content ?? ""}
          </MessageResponse>
        </ArtifactContent>
      </Artifact>
    </div>
  );
}
