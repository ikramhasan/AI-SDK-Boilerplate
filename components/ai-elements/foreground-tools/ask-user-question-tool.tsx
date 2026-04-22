"use client";

import { KeyboardEvent, useCallback, useState } from "react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckIcon, CornerDownLeftIcon, Loader2Icon, XCircleIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type AskUserQuestionState =
  | "input-available"
  | "input-streaming"
  | "output-available"
  | "output-error"
  | "approval-requested"
  | "approval-responded"
  | "output-denied";

export interface AskUserQuestionOption {
  label: string;
  description: string;
}

export interface AskUserQuestionInput {
  question?: string;
  options?: AskUserQuestionOption[];
  freeformPlaceholder?: string;
}

export interface AskUserQuestionOutput extends AskUserQuestionInput {
  error?: string;
}

const DEFAULT_FREEFORM_PLACEHOLDER = "Something else? Write here...";

export function AskUserQuestion({
  state,
  input,
  output,
  disabled = false,
  submittedReply,
  onSubmit,
}: {
  state: AskUserQuestionState;
  input?: AskUserQuestionInput;
  output?: AskUserQuestionOutput;
  disabled?: boolean;
  submittedReply?: string | null;
  onSubmit: (text: string) => void | Promise<void>;
}) {
  const question = output?.question ?? input?.question;
  const options = output?.options ?? input?.options ?? [];
  const freeformPlaceholder =
    output?.freeformPlaceholder ??
    input?.freeformPlaceholder ??
    DEFAULT_FREEFORM_PLACEHOLDER;
  const error = output?.error;

  const isLoading = state === "input-available" || state === "input-streaming";
  const isError = state === "output-error" || state === "output-denied";

  const [freeformValue, setFreeformValue] = useState("");
  const [localSubmittedReply, setLocalSubmittedReply] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const effectiveSubmittedReply = submittedReply ?? localSubmittedReply;
  const interactionDisabled = disabled || isSubmitting || effectiveSubmittedReply !== null;
  const trimmedFreeformValue = freeformValue.trim();
  const selectedReply =
    trimmedFreeformValue.length > 0
      ? trimmedFreeformValue
      : (options[selectedIndex]?.label ?? "");

  const submitReply = useCallback(
    async (reply: string) => {
      const trimmedReply = reply.trim();
      if (!trimmedReply || interactionDisabled) return;

      setIsSubmitting(true);

      try {
        await onSubmit(trimmedReply);
        setLocalSubmittedReply(trimmedReply);
        setFreeformValue("");
      } finally {
        setIsSubmitting(false);
      }
    },
    [interactionDisabled, onSubmit]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      void submitReply(selectedReply);
    },
    [selectedReply, submitReply]
  );

  if (isLoading && !question) {
    return (
      <div className="not-prose py-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2Icon className="size-3.5 animate-spin" />
          <span>Preparing question…</span>
        </div>
      </div>
    );
  }

  if ((isError || error) && !question) {
    return (
      <div className="not-prose py-2">
        <div className="flex items-center gap-2 text-sm text-destructive">
          <XCircleIcon className="size-3.5" />
          <span>{error ?? "Failed to show question"}</span>
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="not-prose py-2">
      <TooltipProvider>
        <div className="overflow-hidden rounded-[18px] border border-border/70 bg-card text-card-foreground shadow-xl ring-1 ring-black/5 dark:ring-white/5">
          <div className="px-4 pb-2 pt-4 text-[15px] font-semibold tracking-[-0.01em]">
            {question}
          </div>

          <div className="px-3 pb-3">
            <div className="space-y-1">
              {options.map((option, index) => {
                const isSelected =
                  effectiveSubmittedReply === option.label ||
                  (effectiveSubmittedReply === null &&
                    freeformValue.trim().length === 0 &&
                    selectedIndex === index);

                return (
                  <button
                    key={option.label}
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[14px] transition-colors",
                      isSelected
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground hover:bg-muted/70",
                      interactionDisabled && "cursor-not-allowed opacity-70"
                    )}
                    disabled={interactionDisabled}
                    onClick={() => void submitReply(option.label)}
                  >
                    <span className="w-5 shrink-0 text-right text-muted-foreground">
                      {index + 1}.
                    </span>
                    <span className="truncate font-medium">{option.label}</span>
                    {option.description ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex size-4 shrink-0 items-center justify-center text-muted-foreground">
                            <HugeiconsIcon
                              icon={InformationCircleIcon}
                              size={14}
                              strokeWidth={1.8}
                            />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" sideOffset={8}>
                          {option.description}
                        </TooltipContent>
                      </Tooltip>
                    ) : null}
                  </button>
                );
              })}

              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-2 rounded-xl px-3 py-2 text-left text-[14px] transition-colors focus-within:bg-muted/70",
                    trimmedFreeformValue.length > 0
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted/70",
                    interactionDisabled && "opacity-70"
                  )}
                >
                  <span className="w-5 shrink-0 text-right text-muted-foreground">
                    {options.length + 1}.
                  </span>
                  <input
                    className="min-w-0 flex-1 bg-transparent p-0 text-[14px] leading-none text-foreground outline-none placeholder:text-muted-foreground"
                    disabled={interactionDisabled}
                    onChange={(event) => setFreeformValue(event.target.value)}
                    onFocus={() => setSelectedIndex(-1)}
                    onKeyDown={handleKeyDown}
                    placeholder={freeformPlaceholder}
                    type="text"
                    value={freeformValue}
                  />
                </div>
                <button
                  type="button"
                  className={cn(
                    "inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-primary px-4 text-[14px] font-medium text-primary-foreground transition-opacity",
                    "hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                  disabled={interactionDisabled || selectedReply.trim().length === 0}
                  onClick={() => void submitReply(selectedReply)}
                >
                  {isSubmitting ? (
                    <Loader2Icon className="size-3.5 animate-spin" />
                  ) : effectiveSubmittedReply ? (
                    <CheckIcon className="size-3.5" />
                  ) : null}
                  <span>{effectiveSubmittedReply ? "Submitted" : "Submit"}</span>
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-black/10 dark:bg-white/15">
                    <CornerDownLeftIcon className="size-3" />
                  </span>
                </button>
              </div>
            </div>

            {(isError || error) && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
                <XCircleIcon className="size-3.5 shrink-0" />
                <span>{error ?? "Failed to show question"}</span>
              </div>
            )}
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
