import type { RequestHandler } from "@builder.io/qwik-city";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

export const onPost: RequestHandler = async (event) => {
  const body = (await event.request.json()) as HandleUploadBody;
  const blobToken = event.env.get("BLOB_READ_WRITE_TOKEN");

  if (!blobToken) {
    event.json(500, { error: "BLOB_READ_WRITE_TOKEN is not configured" });
    return;
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request: event.request,
      onBeforeGenerateToken: async (_pathname) => {
        // Auth check — the plugin@auth middleware already protects /admin,
        // but the upload endpoint is at /api/upload which is public.
        // Verify the cookie here too.
        const session = event.cookie.get("auth_session");
        if (!session || session.value !== "true") {
          throw new Error("Not authenticated");
        }

        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/avif",
          ],
          maximumSizeInBytes: 10 * 1024 * 1024, // 10MB
          tokenPayload: JSON.stringify({}),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // This callback runs on the server after the upload finishes.
        // We could save to DB here, but we'll let the client handle it
        // via a separate server$ call for more control.
        console.log("Upload completed:", blob.url);
      },
    });

    event.json(200, jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    event.json(400, { error: message });
  }
};
