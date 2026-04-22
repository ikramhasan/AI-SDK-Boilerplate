import { tool } from "ai";
import { z } from "zod";

const questionOptionSchema = z.object({
  label: z
    .string()
    .describe("Short option text shown on the button and sent back when selected."),
  description: z
    .string()
    .describe("A brief explanation of what choosing this option means."),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getAskUserQuestionTool(): Record<string, any> {
  return {
    askUserQuestion: tool({
      description:
        "Ask the user a focused question with multiple choice options in the foreground UI. " +
        "Use this when progress depends on the user's preference, decision, or confirmation. " +
        "Provide 2-5 concise options with descriptions. The UI will also show a freeform " +
        "\"Something else? Write here...\" input. After calling this tool, wait for the user's reply.",
      inputSchema: z.object({
        question: z.string().describe("The question to show to the user."),
        options: z
          .array(questionOptionSchema)
          .min(1)
          .max(5)
          .describe("Selectable options shown to the user."),
        freeformPlaceholder: z
          .string()
          .optional()
          .describe(
            "Optional placeholder for the freeform input. Defaults to 'Something else? Write here...'."
          ),
      }),
      execute: async (input) => ({
        question: input.question,
        options: input.options,
        freeformPlaceholder:
          input.freeformPlaceholder ?? "Something else? Write here...",
      }),
    }),
  };
}
