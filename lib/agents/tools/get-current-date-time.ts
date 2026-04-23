import { tool } from "ai";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCurrentDateTimeTool(): Record<string, any> {
  return {
    getCurrentDateTime: tool({
      description:
        "Get the current date and time in UTC. The returned time is always in UTC, not the user's local timezone.",
      inputSchema: z.object({}),
      execute: async () => {
        const now = new Date();
        return {
          utc: now.toUTCString(),
          iso: now.toISOString(),
        };
      },
    }),
  };
}
