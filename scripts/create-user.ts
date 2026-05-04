import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// ─── Load .env manually ──────────────────────────────────
const envPath = resolve(import.meta.dirname ?? ".", "..", ".env");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let value = trimmed.slice(eqIdx + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  process.env[key] = value;
}

// ─── Inline schema ───────────────────────────────────────
const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  lastLogin: integer("last_login", { mode: "timestamp" }),
});

// ─── Hashing Logic (copied from src/lib/auth.ts) ─────────
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
  
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  const saltHex = saltArray.map(b => b.toString(16).padStart(2, "0")).join("");
  
  return `${saltHex}:${hashHex}`;
}

// ─── Main ────────────────────────────────────────────────
async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env");
  }

  const client = createClient({ url, authToken });
  const db = drizzle(client);

  const username = "seba";
  const password = "password123";

  console.log(`Creating user "${username}"...`);
  const passwordHash = await hashPassword(password);

  try {
    await db.insert(users).values({
      username,
      passwordHash,
    });
    console.log(`✅ User "${username}" created successfully!`);
  } catch (err: any) {
    if (err.message?.includes("UNIQUE constraint failed")) {
      console.log(`⚠️  User "${username}" already exists.`);
    } else {
      console.error("❌ Error creating user:", err);
    }
  }
}

main().catch((err) => {
  console.error("❌ Script failed:", err);
  process.exit(1);
});
