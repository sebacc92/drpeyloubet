import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

const siteSettings = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
});

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error("Missing Turso credentials");
}

const client = createClient({ url, authToken });
const db = drizzle(client);

async function updateDb() {
  await db.insert(siteSettings).values({ key: "hero_title", value: "Cirugía Plástica, Estética y Reparadora en Mar del Plata" })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value: "Cirugía Plástica, Estética y Reparadora en Mar del Plata" } });

  await db.insert(siteSettings).values({ key: "hero_description", value: "Realza tu bienestar y confianza con la máxima seguridad y experiencia médica." })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value: "Realza tu bienestar y confianza con la máxima seguridad y experiencia médica." } });

  console.log("DB updated successfully");
}

updateDb();
