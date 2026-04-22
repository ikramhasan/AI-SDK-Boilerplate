"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { DynamicToolUIPart, ToolUIPart } from "ai";
import {
  CheckCircle2Icon,
  ChevronRightIcon,
  CircleDashedIcon,
  CircleDotIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { isValidElement } from "react";

export type ToolProps = ComponentProps<typeof Collapsible>;

export const Tool = ({ className, ...props }: ToolProps) => (
  <Collapsible
    className={cn("group/tool not-prose", className)}
    {...props}
  />
);

export type ToolPart = ToolUIPart | DynamicToolUIPart;

export type ToolHeaderProps = {
  title?: string;
  className?: string;
} & (
  | { type: ToolUIPart["type"]; state: ToolUIPart["state"]; toolName?: never }
  | {
      type: DynamicToolUIPart["type"];
      state: DynamicToolUIPart["state"];
      toolName: string;
    }
);

/** Convert SCREAMING_SNAKE or kebab-case tool names into readable labels */
function humanizeToolName(raw: string): string {
  return raw
    .replace(/^COMPOSIO_/i, "")
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const statusConfig: Record<
  ToolPart["state"],
  { label: string; icon: ReactNode; color: string }
> = {
  "approval-requested": {
    label: "Waiting",
    icon: <CircleDotIcon className="size-3" />,
    color: "text-yellow-600 dark:text-yellow-500",
  },
  "approval-responded": {
    label: "Approved",
    icon: <CheckCircle2Icon className="size-3" />,
    color: "text-blue-600 dark:text-blue-400",
  },
  "input-available": {
    label: "Running",
    icon: <Loader2Icon className="size-3 animate-spin" />,
    color: "text-muted-foreground",
  },
  "input-streaming": {
    label: "Pending",
    icon: <CircleDashedIcon className="size-3 animate-pulse" />,
    color: "text-muted-foreground",
  },
  "output-available": {
    label: "Done",
    icon: <CheckCircle2Icon className="size-3" />,
    color: "text-primary",
  },
  "output-denied": {
    label: "Denied",
    icon: <XCircleIcon className="size-3" />,
    color: "text-orange-600 dark:text-orange-400",
  },
  "output-error": {
    label: "Failed",
    icon: <XCircleIcon className="size-3" />,
    color: "text-destructive",
  },
};

export const getStatusBadge = (status: ToolPart["state"]) => {
  const config = statusConfig[status];
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs", config.color)}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};

export const ToolHeader = ({
  className,
  title,
  type,
  state,
  toolName,
  ...props
}: ToolHeaderProps) => {
  const derivedName =
    type === "dynamic-tool" ? toolName : type.split("-").slice(1).join("-");
  const displayName = title ?? humanizeToolName(derivedName);

  return (
    <CollapsibleTrigger
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted/50",
        className
      )}
      {...props}
    >
      <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/tool:rotate-90" />
      <span className="truncate text-muted-foreground">{displayName}</span>
      {getStatusBadge(state)}
    </CollapsibleTrigger>
  );
};

export type ToolContentProps = ComponentProps<typeof CollapsibleContent>;

export const ToolContent = ({ className, ...props }: ToolContentProps) => (
  <CollapsibleContent
    className={cn(
      "overflow-hidden pl-6 pr-2 text-xs",
      "data-[state=open]:animate-in data-[state=open]:slide-in-from-top-1 data-[state=open]:fade-in-0",
      "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top-1 data-[state=closed]:fade-out-0",
      className
    )}
    {...props}
  />
);

export type ToolInputProps = ComponentProps<"div"> & {
  input: ToolPart["input"];
};

export const ToolInput = ({ className, input, ...props }: ToolInputProps) => (
  <div className={cn("mt-1.5 space-y-1", className)} {...props}>
    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
      Input
    </p>
    <pre className="max-h-40 overflow-auto scrollbar-none rounded-md bg-muted/40 p-2 text-[12px] leading-relaxed text-muted-foreground">
      {JSON.stringify(input, null, 2)}
    </pre>
  </div>
);

export type ToolOutputProps = ComponentProps<"div"> & {
  output: ToolPart["output"];
  errorText: ToolPart["errorText"];
};

export const ToolOutput = ({
  className,
  output,
  errorText,
  ...props
}: ToolOutputProps) => {
  if (!(output || errorText)) return null;

  let rendered: ReactNode;

  if (errorText) {
    rendered = (
      <pre className="max-h-40 overflow-auto scrollbar-none rounded-md bg-destructive/10 p-2 text-[12px] leading-relaxed text-destructive">
        {errorText}
      </pre>
    );
  } else if (typeof output === "object" && !isValidElement(output)) {
    rendered = (
      <pre className="max-h-40 overflow-auto scrollbar-none rounded-md bg-muted/40 p-2 text-[12px] leading-relaxed text-muted-foreground">
        {JSON.stringify(output, null, 2)}
      </pre>
    );
  } else if (typeof output === "string") {
    rendered = (
      <pre className="max-h-40 overflow-auto scrollbar-none rounded-md bg-muted/40 p-2 text-[12px] leading-relaxed text-muted-foreground">
        {output}
      </pre>
    );
  } else {
    rendered = <div className="text-muted-foreground">{output as ReactNode}</div>;
  }

  return (
    <div className={cn("mt-1.5 space-y-1 pb-2", className)} {...props}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
        {errorText ? "Error" : "Output"}
      </p>
      {rendered}
    </div>
  );
};
