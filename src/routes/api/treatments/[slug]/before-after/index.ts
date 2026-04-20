import type { RequestHandler } from "@builder.io/qwik-city";
import { getDb, treatments, treatmentBeforeAfter } from "~/db";
import { eq } from "drizzle-orm";
import { put } from "@vercel/blob";

export const onPost: RequestHandler = async (event) => {
  // Auth check
  const session = event.cookie.get("auth_session");
  if (!session || session.value !== "true") {
    event.json(401, { error: "Not authenticated" });
    return;
  }

  const slug = event.params.slug;
  if (!slug || typeof slug !== "string") {
    event.json(400, { error: "Invalid slug" });
    return;
  }

  const blobToken = event.env.get("BLOB_READ_WRITE_TOKEN");
  if (!blobToken) {
    event.json(500, { error: "BLOB_READ_WRITE_TOKEN is not configured" });
    return;
  }

  const db = getDb(event.env);

  // Verify treatment exists
  const [treatment] = await db
    .select({ id: treatments.id })
    .from(treatments)
    .where(eq(treatments.slug, slug))
    .limit(1);

  if (!treatment) {
    event.json(404, { error: "Treatment not found" });
    return;
  }

  try {
    const formData = await event.request.formData();
    const beforeFile = formData.get("before") as File | null;
    const afterFile = formData.get("after") as File | null;
    const caption = (formData.get("caption") as string) || null;

    if (!beforeFile || !(beforeFile instanceof File) || !afterFile || !(afterFile instanceof File)) {
      event.json(400, { error: "Both 'before' and 'after' files are required" });
      return;
    }

    // Validate file types
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!allowedTypes.includes(beforeFile.type) || !allowedTypes.includes(afterFile.type)) {
      event.json(400, { error: "Invalid file type. Allowed: jpeg, png, webp, avif" });
      return;
    }

    // Validate file sizes (10MB each)
    if (beforeFile.size > 10 * 1024 * 1024 || afterFile.size > 10 * 1024 * 1024) {
      event.json(400, { error: "Files too large. Maximum: 10MB each" });
      return;
    }

    const timestamp = Date.now();
    const beforeExt = beforeFile.name.split(".").pop() || "webp";
    const afterExt = afterFile.name.split(".").pop() || "webp";

    const beforePath = `treatments/${slug}/before-after/${timestamp}-before.${beforeExt}`;
    const afterPath = `treatments/${slug}/before-after/${timestamp}-after.${afterExt}`;

    const [beforeBlob, afterBlob] = await Promise.all([
      put(beforePath, beforeFile, { access: "public", token: blobToken }),
      put(afterPath, afterFile, { access: "public", token: blobToken }),
    ]);

    // Get the next display_order
    const existing = await db
      .select({ displayOrder: treatmentBeforeAfter.displayOrder })
      .from(treatmentBeforeAfter)
      .where(eq(treatmentBeforeAfter.treatmentId, treatment.id));

    const maxOrder = existing.reduce((max, row) => Math.max(max, row.displayOrder ?? 0), 0);

    const [inserted] = await db
      .insert(treatmentBeforeAfter)
      .values({
        treatmentId: treatment.id,
        beforeImageUrl: beforeBlob.url,
        afterImageUrl: afterBlob.url,
        caption,
        displayOrder: maxOrder + 1,
      })
      .returning();

    event.json(200, inserted);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    event.json(500, { error: message });
  }
};
