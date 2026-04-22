import { Composio } from "@composio/core";
import { auth } from "@clerk/nextjs/server";

const composio = new Composio();

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { connectedAccountId }: { connectedAccountId: string } =
    await req.json();

  const session = await composio.create(userId, {
    manageConnections: false,
  });

  let ownsAccount = false;
  let nextCursor: string | undefined;

  do {
    const result = await session.toolkits({
      limit: 50,
      isConnected: true,
      ...(nextCursor ? { nextCursor } : {}),
    });

    ownsAccount = result.items.some(
      (toolkit) => toolkit.connection?.connectedAccount?.id === connectedAccountId
    );
    nextCursor = result.nextCursor ?? undefined;
  } while (!ownsAccount && nextCursor);

  if (!ownsAccount) {
    return Response.json({ error: "Integration not found" }, { status: 404 });
  }

  await composio.connectedAccounts.delete(connectedAccountId);

  return Response.json({ success: true });
}
