import { tool } from "ai";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getFetchImagesTool(): Record<string, any> {
  return {
    fetchImages: tool({
      description:
        "Search for images on the web using Google Custom Search. Returns a list of image results with URLs, titles, and metadata.",
      inputSchema: z.object({
        query: z
          .string()
          .describe("The search query to find images for, e.g. 'sunset over mountains'"),
      }),
      execute: async ({ query }) => {
        const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
        const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

        if (!apiKey || !searchEngineId) {
          return {
            error:
              "GOOGLE_SEARCH_API_KEY or GOOGLE_SEARCH_ENGINE_ID environment variable is not set",
          };
        }

        const params = new URLSearchParams({
          key: apiKey,
          cx: searchEngineId,
          q: query.trim(),
          searchType: "image",
          num: "5",
        });

        try {
          const response = await fetch(
            `https://www.googleapis.com/customsearch/v1?${params.toString()}`
          );

          if (!response.ok) {
            return {
              error: `Google Custom Search API returned status ${response.status}`,
            };
          }

          const data = await response.json();
          const items = data.items ?? [];

          if (items.length === 0) {
            return { error: `No images found for query: ${query}` };
          }

          return {
            results: items.map(
              (item: {
                link?: string;
                title?: string;
                snippet?: string;
                image?: {
                  contextLink?: string;
                  width?: number;
                  height?: number;
                  thumbnailLink?: string;
                };
              }) => ({
                url: item.link,
                title: item.title,
                snippet: item.snippet,
                contextLink: item.image?.contextLink,
                width: item.image?.width,
                height: item.image?.height,
                thumbnailUrl: item.image?.thumbnailLink,
              })
            ),
          };
        } catch (error) {
          return {
            error: `Failed to fetch images: ${(error as Error).message}`,
          };
        }
      },
    }),
  };
}
