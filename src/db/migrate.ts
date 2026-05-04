import { createClient } from "@libsql/client";
import * as schema from "./schema";
import { drizzle } from "drizzle-orm/libsql";

// Replicate the hash logic inline to avoid tsc path alias issues
async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const saltArray = Array.from(salt);
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  const saltHex = saltArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${saltHex}:${hashHex}`;
}

async function main() {
  const url = process.env.TURSO_DATABASE_URL || process.env.TURSO_URL || "file:local.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const client = createClient({ url, authToken });
  const db = drizzle(client, { schema });

  console.log("Conectado a la base de datos.");

  // 1. Check admin user
  const admins = await db.select().from(schema.users).where(sql`username = 'admin'`);
  if (admins.length === 0) {
    const hash = await hashPassword("admin");
    await db.insert(schema.users).values({
      username: "admin",
      passwordHash: hash
    });
    console.log("✅ Default admin user created (admin/admin).");
  } else {
    console.log("ℹ️  Admin user already exists.");
  }

  // 2. (Removed categories and services seeding as they are no longer in schema)
}

import { sql } from "drizzle-orm";
main().catch(console.error);
