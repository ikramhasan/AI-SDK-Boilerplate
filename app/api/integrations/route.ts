import { Composio } from "@composio/core";
import { auth } from "@clerk/nextjs/server";

const composio = new Composio();

export const dynamic = "force-dynamic";

function serializeToolkit(t: {
  slug: string;
  name: string;
  logo?: string;
  isNoAuth?: boolean;
  connection?: {
    isActive?: boolean;
    connectedAccount?: {
      id?: string;
    };
  };
}) {
  return {
    slug: t.slug,
    name: t.name,
    logo: t.logo,
    isConnected: t.connection?.isActive ?? false,
    connectedAccountId: t.connection?.connectedAccount?.id,
  };
}

// List all toolkits with cursor pagination
export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const url = new URL(req.url);
  const nextCursor = url.searchParams.get("nextCursor") || undefined;
  const search = url.searchParams.get("search") || undefined;

  const session = await composio.create(userId, {
    manageConnections: false,
  });

  const connectedItems: Awaited<ReturnType<typeof session.toolkits>>["items"] = [];
  let connectedCursor: string | undefined;

  do {
    const connectedPage = await session.toolkits({
      limit: 50,
      isConnected: true,
      ...(connectedCursor ? { nextCursor: connectedCursor } : {}),
      ...(search ? { search } : {}),
    });

    connectedItems.push(...connectedPage.items);
    connectedCursor = connectedPage.nextCursor ?? undefined;
  } while (connectedCursor);

  const connectedToolkits = connectedItems
    .filter((t) => !t.isNoAuth)
    .map(serializeToolkit);

  const result = await session.toolkits({
    limit: 20,
    isConnected: false,
    ...(nextCursor ? { nextCursor } : {}),
    ...(search ? { search } : {}),
  });

  return Response.json({
    connectedToolkits,
    toolkits: result.items
      .filter((t) => !t.isNoAuth)
      .map(serializeToolkit),
    nextCursor: result.nextCursor ?? null,
    totalPages: result.totalPages ?? null,
  });
}

// Start an OAuth flow for a given toolkit
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { toolkit }: { toolkit: string } = await req.json();
  const origin = new URL(req.url).origin;

  const session = await composio.create(userId, {
    manageConnections: false,
  });
  const connectionRequest = await session.authorize(toolkit, {
    callbackUrl: `${origin}/integrations`,
  });

  return Response.json({ redirectUrl: connectionRequest.redirectUrl });
}
