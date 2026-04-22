import { convertToModelMessages, streamText, UIMessage, stepCountIs } from "ai";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { extractUsage } from "@/lib/usage";
import { loadConfig } from "@/lib/agents/config";
import { createModel } from "@/lib/agents/provider";
import { loadKnowledge, buildSystemMessage } from "@/lib/agents/knowledge";
import { resolveTools } from "@/lib/agents/tools";
import { requireCurrentUserConvexAuth } from "@/lib/convex/server";

export const maxDuration = 30;

export async function POST(req: Request) {
  let userId: string;
  let convexToken: string;

  try {
    ({ userId, token: convexToken } = await requireCurrentUserConvexAuth());
  } catch {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { messages, chatId }: { messages: UIMessage[]; chatId?: string } =
    await req.json();

  // Load config, knowledge, and tools in parallel
  const config = await loadConfig();
  const { textChunks, fileParts } = await loadKnowledge(config.raw?.knowledgeFileIds);
  const { tools, mcpClients } = await resolveTools(config.raw, userId);

  const systemMessage = buildSystemMessage(config.systemMessage, textChunks);

  // Inject binary knowledge files (PDFs, etc.) as an initial context message
  const convertedMessages = await convertToModelMessages(messages);
  if (fileParts.length > 0) {
    convertedMessages.unshift({
      role: "user" as const,
      content: [
        {
          type: "text" as const,
          text: "The following files are from the knowledge base. Use them as context for all responses:",
        },
        ...fileParts,
      ],
    });
  }

  const model = createModel(config);

  const result = streamText({
    model,
    system: systemMessage,
    messages: convertedMessages,
    tools,
    ...(config.provider === "google"
      ? { providerOptions: { google: { thinkingConfig: { includeThoughts: true } } } }
      : {}),
    stopWhen: stepCountIs(10),
    onFinish: async ({ usage: tokenUsage }) => {
      for (const client of mcpClients) {
        await client.close().catch(() => {});
      }

      try {
        const usage = extractUsage(tokenUsage, config.costConfig);
        await fetchMutation(
          api.usage.record,
          {
            source: "chat" as const,
            chatId: chatId ? (chatId as Id<"chats">) : undefined,
            model: config.modelId,
            ...usage,
          },
          { token: convexToken }
        );
      } catch (error) {
        console.error("Failed to record usage:", error);
      }
    },
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
  });
}
