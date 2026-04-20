import type { RequestHandler } from "@builder.io/qwik-city";
import { getDb, treatmentBeforeAfter } from "~/db";
import { eq } from "drizzle-orm";
import { del } from "@vercel/blob";

export const onDelete: RequestHandler = async (event) => {
  // Auth check
  const session = event.cookie.get("auth_session");
  if (!session || session.value !== "true") {
    event.json(401, { error: "Not authenticated" });
    return;
  }

  const id = Number(event.params.id);
  if (isNaN(id) || id <= 0) {
    event.json(400, { error: "Invalid ID" });
    return;
  }

  const blobToken = event.env.get("BLOB_READ_WRITE_TOKEN");
  if (!blobToken) {
    event.json(500, { error: "BLOB_READ_WRITE_TOKEN is not configured" });
    return;
  }

  const db = getDb(event.env);

  // Find the record
  const [record] = await db
    .select()
    .from(treatmentBeforeAfter)
    .where(eq(treatmentBeforeAfter.id, id))
    .limit(1);

  if (!record) {
    event.json(404, { error: "Before/after record not found" });
    return;
  }

  try {
    // Delete images from Vercel Blob
    await Promise.all([
      del(record.beforeImageUrl, { token: blobToken }),
      del(record.afterImageUrl, { token: blobToken }),
    ]);

    // Delete record from DB
    await db
      .delete(treatmentBeforeAfter)
      .where(eq(treatmentBeforeAfter.id, id));

    event.json(200, { success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    event.json(500, { error: message });
  }
};
