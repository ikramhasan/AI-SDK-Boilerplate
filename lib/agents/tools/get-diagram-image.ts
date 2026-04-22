import { tool } from "ai";
import { z } from "zod";
import { uploadImageToConvex } from "./upload-asset";
import { writeFile, readFile, unlink, mkdtemp } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDiagramImageTool(): Record<string, any> {
  return {
    getDiagramImageForDocument: tool({
      description:
        "Render a Mermaid diagram as a PNG image and return its URL. Use this when preparing " +
        "visuals for a createDocument call.",
      inputSchema: z.object({
        title: z.string().optional().describe("Diagram title"),
        diagram: z
          .string()
          .describe("The Mermaid diagram definition string"),
      }),
      execute: async (input) => {
        try {
          const { run } = await import("@mermaid-js/mermaid-cli");

          // Create temp files for input/output
          const tempDir = await mkdtemp(join(tmpdir(), "mermaid-"));
          const inputPath = join(tempDir, "input.mmd");
          const outputPath = join(tempDir, "output.png") as `${string}.png`;

          await writeFile(inputPath, input.diagram, "utf-8");

          // Mermaid CLI config for dark theme
          const configPath = join(tempDir, "config.json");
          await writeFile(
            configPath,
            JSON.stringify({
              theme: "dark",
            }),
            "utf-8"
          );

          await run(inputPath, outputPath, {
            parseMMDOptions: {
              mermaidConfig: {
                theme: "dark",
              },
            },
            puppeteerConfig: {
              headless: true,
              args: ["--no-sandbox", "--disable-setuid-sandbox"],
            },
          });

          const buffer = await readFile(outputPath);
          const url = await uploadImageToConvex(Buffer.from(buffer));

          // Cleanup temp files
          await unlink(inputPath).catch(() => {});
          await unlink(outputPath).catch(() => {});
          await unlink(configPath).catch(() => {});

          return { url, title: input.title };
        } catch (error) {
          return {
            error: `Failed to generate diagram image: ${(error as Error).message}`,
          };
        }
      },
    }),
  };
}
