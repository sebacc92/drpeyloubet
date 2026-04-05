import { createClient, type Client } from "@libsql/client/web";

export function getDbClient(env: any): Client {
  const url =
    env.get?.("TURSO_DATABASE_URL") ||
    env.get?.("TURSO_URL") ||
    "";
  const authToken =
    env.get?.("TURSO_AUTH_TOKEN") || "";

  if (!url) {
    throw new Error("TURSO_DATABASE_URL no está configurada. Revisá tu .env.local");
  }

  return createClient({
    url,
    authToken,
  });
}
