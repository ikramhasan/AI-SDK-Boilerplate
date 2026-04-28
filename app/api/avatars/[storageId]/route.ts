import { fetchQuery } from "convex/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ storageId: string }> }
) {
  const { storageId } = await params;
  const url = await fetchQuery(api.userAvatars.getPublicUrl, {
    storageId: storageId as Id<"_storage">,
  });

  if (!url) {
    return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
  }

  return NextResponse.redirect(url);
}
