import { generateText } from "ai";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { extractUsage } from "@/lib/usage";
import { loadConfig } from "@/lib/agents/config";
import { createModel } from "@/lib/agents/provider";
import { requireCurrentUserConvexAuth } from "@/lib/convex/server";

export async function POST(req: Request) {
  let convexToken: string;

  try {
    ({ token: convexToken } = await requireCurrentUserConvexAuth());
  } catch {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { chatId, userMessage } = await req.json();

  const config = await loadConfig();
  const model = createModel(config);

  const { text, usage } = await generateText({
    model,
    system:
      "Generate a short chat title (max 6 words) for the given user message. Return only the title, no quotes or punctuation at the end.",
    prompt: userMessage,
  });

  await fetchMutation(
    api.chats.updateTitle,
    {
      chatId: chatId as Id<"chats">,
      title: text.trim(),
    },
    { token: convexToken }
  );

  try {
    const { inputTokens, outputTokens, cacheReadTokens, cacheWriteTokens, totalTokens, cost } =
      extractUsage(usage, config.costConfig);
    await fetchMutation(
      api.usage.record,
      {
        source: "title" as const,
        chatId: chatId as Id<"chats">,
        model: config.modelId,
        cacheReadTokens,
        cacheWriteTokens,
        inputTokens,
        outputTokens,
        totalTokens,
        cost,
      },
      { token: convexToken }
    );
  } catch (error) {
    console.error("Failed to record title usage:", error);
  }

  return Response.json({ title: text.trim() });
}
