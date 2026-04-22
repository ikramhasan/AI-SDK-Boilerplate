import { Composio } from "@composio/core";
import { VercelProvider } from "@composio/vercel";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getComposioTools(userId: string | null): Promise<Record<string, any>> {
  if (!userId) return {};

  try {
    const composio = new Composio({ provider: new VercelProvider() });
    const session = await composio.create(userId);
    return await session.tools();
  } catch (error) {
    console.error("Failed to load Composio tools:", error);
    return {};
  }
}
