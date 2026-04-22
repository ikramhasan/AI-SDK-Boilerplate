import "server-only";

import { internal } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { runConvexAdminMutation, runConvexAdminQuery } from "@/lib/convex/server";

/**
 * Upload a buffer as an image to Convex storage and return a signed URL.
 */
export async function uploadImageToConvex(
  buffer: Buffer,
  contentType: string = "image/png"
): Promise<string> {
  // Get a signed upload URL from Convex
  const uploadUrl = await runConvexAdminMutation(
    internal.documentAssets.generateUploadUrl,
    {}
  );

  // Upload the image
  const uint8 = new Uint8Array(buffer);
  const blob = new Blob([uint8], { type: contentType });
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": contentType },
    body: blob,
  });

  if (!res.ok) {
    throw new Error(`Failed to upload image to Convex: ${res.statusText}`);
  }

  const { storageId } = (await res.json()) as { storageId: Id<"_storage"> };

  // Get a signed URL via Convex query
  const url = await runConvexAdminQuery(
    internal.documentAssets.getUrl,
    { storageId }
  );
  if (!url) {
    throw new Error("Failed to get URL for uploaded image");
  }

  return url;
}
