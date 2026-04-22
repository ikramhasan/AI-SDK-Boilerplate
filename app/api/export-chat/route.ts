import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserConvexToken } from "@/lib/convex/server";

export async function GET(req: NextRequest) {
  const chatId = req.nextUrl.searchParams.get("chatId");
  if (!chatId) {
    return NextResponse.json({ error: "Missing chatId" }, { status: 400 });
  }

  try {
    const token = await getCurrentUserConvexToken();
    const messages = await fetchQuery(
      api.messages.list,
      {
        chatId: chatId as Id<"chats">,
      },
      { token }
    );
    return NextResponse.json(messages);
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
