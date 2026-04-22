import { tool } from "ai";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCreateDocumentTool(): Record<string, any> {
  return {
    createDocument: tool({
      description:
        "Create a document with markdown content. Use this when the user wants to generate a final " +
        "document, report, summary, or any structured written output from the conversation. " +
        "The markdown content will be streamed and rendered live for the user.",
      inputSchema: z.object({
        title: z.string().describe("Document title"),
        content: z
          .string()
          .describe(
            "The full document content in markdown format. Write comprehensive, well-structured markdown."
          ),
      }),
      execute: async (input) => {
        return {
          title: input.title,
          content: input.content,
        };
      },
    }),
  };
}
