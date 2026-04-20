import type { RequestHandler } from "@builder.io/qwik-city";
import { getDb, treatments } from "~/db";
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
    const file = formData.get("file") as File | null;

    if (!file || !(file instanceof File)) {
      event.json(400, { error: "No file provided" });
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!allowedTypes.includes(file.type)) {
      event.json(400, { error: "Invalid file type. Allowed: jpeg, png, webp, avif" });
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      event.json(400, { error: "File too large. Maximum: 10MB" });
      return;
    }

    const ext = file.name.split(".").pop() || "webp";
    const pathname = `treatments/${slug}/main.${ext}`;

    const blob = await put(pathname, file, {
      access: "public",
      token: blobToken,
      addRandomSuffix: false,
    });

    // Update treatment with new image URL
    await db
      .update(treatments)
      .set({ mainImageUrl: blob.url })
      .where(eq(treatments.slug, slug));

    event.json(200, { url: blob.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    event.json(500, { error: message });
  }
};
