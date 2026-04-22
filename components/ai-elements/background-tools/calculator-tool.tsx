"use client";

import { CalculatorIcon } from "lucide-react";
import type { ToolComponentProps, ToolConfig } from "./types";

export const calculatorConfig: ToolConfig = {
  label: "Calculated",
  activeLabel: "Calculating",
  icon: CalculatorIcon,
  getDescription: (part) => {
    const input = part.input as { expression?: string } | undefined;
    const output = part.output as { result?: number } | null;
    if (input?.expression && output?.result !== undefined) {
      return `${input.expression} = ${output.result}`;
    }
    return input?.expression;
  },
};

export function CalculatorContent(_props: ToolComponentProps) {
  return null;
}
