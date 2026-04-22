import "server-only";

import { internal } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { runConvexAdminQuery } from "@/lib/convex/server";

const MEDIA_TYPE_MAP: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
};

export interface KnowledgeContext {
  textChunks: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fileParts: any[];
}

export async function loadKnowledge(
  knowledgeFileIds: Id<"knowledgeFiles">[] | undefined
): Promise<KnowledgeContext> {
  const textChunks: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fileParts: any[] = [];

  if (!knowledgeFileIds || knowledgeFileIds.length === 0) {
    return { textChunks, fileParts };
  }

  try {
    const knowledgeFiles = await runConvexAdminQuery(
      internal.knowledgeFiles.getWithUrls,
      { ids: knowledgeFileIds }
    );

    for (const file of knowledgeFiles) {
      try {
        const isText =
          file.name.endsWith(".txt") ||
          file.name.endsWith(".csv") ||
          file.name.endsWith(".md");

        if (isText) {
          const response = await fetch(file.url);
          if (!response.ok) continue;
          const textContent = await response.text();
          textChunks.push(
            `--- Knowledge Base File: ${file.name} ---\n${textContent}\n--- End of ${file.name} ---`
          );
        } else {
          const ext = file.name.split(".").pop()?.toLowerCase();
          fileParts.push({
            type: "file" as const,
            data: new URL(file.url),
            mediaType: MEDIA_TYPE_MAP[ext ?? ""] || "application/octet-stream",
          });
        }
      } catch (error) {
        console.error(`Failed to fetch knowledge file "${file.name}":`, error);
      }
    }
  } catch (error) {
    console.error("Failed to load knowledge files:", error);
  }

  return { textChunks, fileParts };
}

export function buildSystemMessage(
  baseMessage: string,
  textChunks: string[]
): string {
  return textChunks.length > 0
    ? baseMessage + "\n\n" + textChunks.join("\n\n")
    : baseMessage;
}
