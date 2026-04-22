"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  CalculatorIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  EqualIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";

type CalculatorState =
  | "input-available"
  | "input-streaming"
  | "output-available"
  | "output-error"
  | "approval-requested"
  | "approval-responded"
  | "output-denied";

interface CalculatorInput {
  expression?: string;
}

interface CalculatorOutput {
  result?: number;
  error?: string;
}

export function Calculator({
  state,
  input,
  output,
}: {
  state: CalculatorState;
  input?: CalculatorInput;
  output?: CalculatorOutput;
}) {
  const isLoading = state === "input-available" || state === "input-streaming";
  const isDone = state === "output-available";
  const isError = state === "output-error" || state === "output-denied";

  const expression = input?.expression;
  const result = output?.result;
  const error = output?.error;

  return (
    <Collapsible className="group/tool not-prose">
      <CollapsibleTrigger className="-ml-2 flex w-[calc(100%+0.5rem)] items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted/50">
        <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/tool:rotate-90" />
        <CalculatorIcon className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate text-muted-foreground">
          {isLoading ? "Calculating…" : "Calculated"}
        </span>
        {isLoading && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Loader2Icon className="size-3 animate-spin" />
          </span>
        )}
        {isDone && (
          <span className="inline-flex items-center gap-1 text-xs text-primary">
            <CheckCircle2Icon className="size-3" />
            <span>Done</span>
          </span>
        )}
        {isError && (
          <span className="inline-flex items-center gap-1 text-xs text-destructive">
            <XCircleIcon className="size-3" />
            <span>Failed</span>
          </span>
        )}
      </CollapsibleTrigger>

      <CollapsibleContent
        className={cn(
          "overflow-hidden pl-6 pr-2",
          "data-[state=open]:animate-in data-[state=open]:slide-in-from-top-1 data-[state=open]:fade-in-0",
          "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top-1 data-[state=closed]:fade-out-0"
        )}
      >
        <div className="flex items-center gap-2 py-2 font-mono text-xs text-muted-foreground">
          <span className="truncate">{expression}</span>
          {isDone && result !== undefined && (
            <>
              <EqualIcon className="size-3 shrink-0 text-muted-foreground/50" />
              <span className="font-semibold text-foreground">{result}</span>
            </>
          )}
          {isError && error && (
            <span className="text-destructive">{error}</span>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
