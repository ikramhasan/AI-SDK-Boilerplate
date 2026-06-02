import { tool } from "ai";
import { z } from "zod";

const questionOptionSchema = z.object({
  id: z
    .string()
    .optional()
    .describe("Optional stable id for this option. Use short kebab-case when useful."),
  title: z
    .string()
    .describe("Short option text shown in the foreground UI."),
  description: z
    .string()
    .optional()
    .describe("Optional brief explanation of what choosing this option means."),
});

const askUserQuestionSchema = z.object({
  id: z
    .string()
    .optional()
    .describe("Optional stable id for this question. Use short kebab-case when useful."),
  title: z.string().describe("The question to show to the user."),
  options: z
    .array(questionOptionSchema)
    .min(1)
    .max(9)
    .describe("Selectable options shown to the user."),
  multiSelect: z
    .boolean()
    .optional()
    .describe("Set true when the user may select more than one option."),
  allowOther: z
    .boolean()
    .optional()
    .describe("Set true to include an Other text field."),
  otherPlaceholder: z
    .string()
    .optional()
    .describe("Placeholder for the Other text field."),
  skippable: z
    .boolean()
    .optional()
    .describe("Set false when the user must answer this question before continuing."),
  nextLabel: z
    .string()
    .optional()
    .describe("Optional label for the multi-select Continue/Finish button."),
  layout: z
    .enum(["inline", "stacked"])
    .optional()
    .describe("Use stacked when option descriptions are long enough to wrap."),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getAskUserQuestionTool(): Record<string, any> {
  return {
    askUserQuestion: tool({
      description:
        "Ask the user one or more focused questions in the foreground UI. " +
        "Use this when progress depends on the user's preference, decision, or confirmation. " +
        "Prefer the questions array. Each question can be single-select or multi-select, " +
        "can allow an Other text answer, can be skippable or required, and can use inline " +
        "or stacked option layout. After calling this tool, wait for the user's reply.",
      inputSchema: z.object({
        questions: z
          .array(askUserQuestionSchema)
          .min(1)
          .max(8)
          .describe("Questions to present to the user."),
        skipLabel: z
          .string()
          .optional()
          .describe("Optional global label for skip buttons. Defaults to 'Skip'."),
      }),
      execute: async (input) => input,
    }),
  };
}
