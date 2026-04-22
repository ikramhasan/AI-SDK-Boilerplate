import { tool } from "ai";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCalculatorTool(): Record<string, any> {
  return {
    calculator: tool({
      description:
        "Evaluate a mathematical expression. Supports +, -, *, /, ^ (exponent), parentheses, and common math functions like sqrt, sin, cos, log, etc.",
      inputSchema: z.object({
        expression: z
          .string()
          .describe("The mathematical expression to evaluate, e.g. 2+4*5^2"),
      }),
      execute: async ({ expression }) => {
        const { evaluate } = await import("mathjs");
        try {
          const result = evaluate(expression);
          return { result: Number(result) };
        } catch (e) {
          return { error: `Failed to evaluate: ${(e as Error).message}` };
        }
      },
    }),
  };
}
