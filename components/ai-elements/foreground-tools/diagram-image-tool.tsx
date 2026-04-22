"use client";

import { Loader2Icon, XCircleIcon } from "lucide-react";

type DiagramImageState =
  | "input-available"
  | "input-streaming"
  | "output-available"
  | "output-error"
  | "approval-requested"
  | "approval-responded"
  | "output-denied";

export interface DiagramImageInput {
  title?: string;
  diagram?: string;
}

export interface DiagramImageOutput {
  url?: string;
  title?: string;
  error?: string;
}

export function DiagramImage({
  state,
  input,
  output,
}: {
  state: DiagramImageState;
  input?: DiagramImageInput;
  output?: DiagramImageOutput;
}) {
  const isLoading = state === "input-available" || state === "input-streaming";
  const isDone = state === "output-available";
  const isError = state === "output-error" || state === "output-denied";

  const title = output?.title ?? input?.title;
  const error = output?.error;

  return (
    <div className="not-prose py-2">
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2Icon className="size-3.5 animate-spin" />
          <span>Generating diagram image…</span>
        </div>
      )}
      {isDone && output?.url && !error && (
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={output.url}
            alt={title ?? "Diagram"}
            className="max-w-full rounded-md border border-border/50 object-contain"
            loading="lazy"
          />
          {title && (
            <p className="mt-2 text-center text-sm font-medium text-foreground">
              {title}
            </p>
          )}
        </div>
      )}
      {(isError || error) && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <XCircleIcon className="size-3.5" />
          <span>{error ?? "Failed to generate diagram image"}</span>
        </div>
      )}
    </div>
  );
}
