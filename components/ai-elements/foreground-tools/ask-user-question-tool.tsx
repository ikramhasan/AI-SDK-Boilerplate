"use client";

import { useCallback, useMemo, useState } from "react";
import { Loader2Icon, XCircleIcon } from "lucide-react";
import {
  AskUserQuestions,
  type AskUserAnswer,
  type AskUserOption,
  type AskUserQuestion as AskUserQuestionItem,
} from "@/components/ui/ask-user-questions";
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
  id?: string;
  title?: string;
  description?: string;
}

export interface AskUserQuestionInput {
  questions?: AskUserQuestionItem[];
  skipLabel?: string;
}

export interface AskUserQuestionOutput extends AskUserQuestionInput {
  error?: string;
}

function optionId(option: AskUserOption, index: number) {
  return option.id ?? `o-${index}`;
}

function questionId(question: AskUserQuestionItem, index: number) {
  return question.id ?? `q-${index}`;
}

function normalizeQuestions(
  source: AskUserQuestionInput | AskUserQuestionOutput | undefined
): AskUserQuestionItem[] {
  if (!source) return [];

  if (Array.isArray(source.questions) && source.questions.length > 0) {
    return source.questions.map((question, questionIndex) => ({
      ...question,
      id: question.id ?? `q-${questionIndex}`,
      options: (question.options ?? []).map((option, optionIndex) => ({
        id: option.id ?? `o-${optionIndex}`,
        title: option.title,
        description: option.description,
      })),
    }));
  }

  return [];
}

function formatAnswers(
  questions: AskUserQuestionItem[],
  answers: Record<string, AskUserAnswer>
) {
  return questions
    .map((question, questionIndex) => {
      const qId = questionId(question, questionIndex);
      const answer = answers[qId];

      if (!answer || answer.skipped) {
        return "Skipped";
      }

      const selectedTitles = (question.options ?? [])
        .filter((option, optionIndex) =>
          answer.selectedIds.includes(optionId(option, optionIndex))
        )
        .map((option) => option.title);

      const values = [...selectedTitles];
      const otherText = answer.otherText?.trim();
      if (otherText) {
        values.push(
          selectedTitles.length > 0 ? `Other: ${otherText}` : otherText
        );
      }

      return values.length > 0 ? values.join(", ") : "No answer";
    })
    .join("\n");
}

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
  const source = output ?? input;
  const questions = useMemo(() => normalizeQuestions(source), [source]);
  const error = output?.error;
  const skipLabel = source?.skipLabel ?? "Skip";

  const isLoading = state === "input-available" || state === "input-streaming";
  const isError = state === "output-error" || state === "output-denied";

  const [localSubmittedReply, setLocalSubmittedReply] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const effectiveSubmittedReply = submittedReply ?? localSubmittedReply;
  const interactionDisabled =
    disabled || isSubmitting || effectiveSubmittedReply !== null;

  const handleComplete = useCallback(
    async (answers: Record<string, AskUserAnswer>) => {
      if (interactionDisabled) return;

      const reply = formatAnswers(questions, answers).trim();
      if (!reply) return;

      setIsSubmitting(true);
      try {
        await onSubmit(reply);
        setLocalSubmittedReply(reply);
      } finally {
        setIsSubmitting(false);
      }
    },
    [interactionDisabled, onSubmit, questions]
  );

  if (isLoading && questions.length === 0) {
    return (
      <div className="not-prose py-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2Icon className="size-3.5 animate-spin" />
          <span>Preparing question...</span>
        </div>
      </div>
    );
  }

  if ((isError || error) && questions.length === 0) {
    return (
      <div className="not-prose py-2">
        <div className="flex items-center gap-2 text-sm text-destructive">
          <XCircleIcon className="size-3.5" />
          <span>{error ?? "Failed to show question"}</span>
        </div>
      </div>
    );
  }

  if (questions.length === 0) return null;

  return (
    <div className="not-prose py-2">
      <div
        className={cn(
          "relative",
          interactionDisabled && "pointer-events-none opacity-75"
        )}
        aria-busy={isSubmitting}
        aria-disabled={interactionDisabled}
      >
        <AskUserQuestions
          questions={questions}
          onComplete={handleComplete}
          skipLabel={skipLabel}
        />
      </div>

      {effectiveSubmittedReply ? (
        <p className="mt-2 text-[12px] text-muted-foreground">
          Submitted response
        </p>
      ) : null}

      {(isError || error) && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
          <XCircleIcon className="size-3.5 shrink-0" />
          <span>{error ?? "Failed to show question"}</span>
        </div>
      )}
    </div>
  );
}
