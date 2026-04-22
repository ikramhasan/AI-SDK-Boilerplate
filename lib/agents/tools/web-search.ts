import { tavilySearch, tavilyExtract } from "@tavily/ai-sdk";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getWebSearchTools(): Record<string, any> {
  return {
    tavilySearch: tavilySearch({
      searchDepth: "advanced",
      includeAnswer: true,
    }),
    tavilyExtract: tavilyExtract(),
  };
}
