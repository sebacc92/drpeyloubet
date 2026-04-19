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

  // 2. Seed default categories
  const categoriesDb = await db.select().from(schema.categories);
  if (categoriesDb.length === 0) {
    const defaultCategories = [
      { name: "Quirúrgicos", slug: "quirurgicos", description: "Procedimientos quirúrgicos estéticos y reconstructivos." },
      { name: "Reparadoras", slug: "reparadoras", description: "Cirugías reparadoras y reconstructivas." },
      { name: "No Quirúrgicos", slug: "no-quirurgicos", description: "Tratamientos estéticos no invasivos." },
    ];
    await db.insert(schema.categories).values(defaultCategories);
    console.log(`✅ ${defaultCategories.length} default categories seeded.`);
  } else {
    console.log(`ℹ️  Categories already exist (${categoriesDb.length}).`);
  }

  // 3. Seed dummy services
  const categoriesList = await db.select().from(schema.categories);
  const quirurgicoId = categoriesList.find(c => c.slug === "quirurgicos")?.id;
  const noQuirurgicoId = categoriesList.find(c => c.slug === "no-quirurgicos")?.id;

  const servicesDb = await db.select().from(schema.services);
  if (servicesDb.length === 0 && quirurgicoId && noQuirurgicoId) {
    const defaultServices = [
      {
        slug: "aumento-mamario",
        title: "Aumento Mamario",
        description: "Mejora el volumen y forma de los senos con implantes de última generación.",
        categoryId: quirurgicoId,
        longText: "<p>El aumento mamario es uno de los procedimientos más solicitados en cirugía estética. Utilizamos implantes de la más alta calidad para lograr resultados naturales y armoniosos.</p>",
      },
      {
        slug: "rinoplastia",
        title: "Rinoplastia",
        description: "Remodelación estética y funcional de la nariz.",
        categoryId: quirurgicoId,
        longText: "<p>La rinoplastia permite corregir tanto aspectos estéticos como funcionales de la nariz, mejorando la armonía facial y la respiración.</p>",
      },
      {
        slug: "botox",
        title: "Toxina Botulínica (Botox)",
        description: "Rejuvenecimiento facial no quirúrgico para líneas de expresión.",
        categoryId: noQuirurgicoId,
        longText: "<p>La aplicación de toxina botulínica es un tratamiento rápido y efectivo para suavizar arrugas de expresión en frente, entrecejo y patas de gallo, con resultados visibles en pocos días.</p>",
      }
    ];

    await db.insert(schema.services).values(defaultServices);
    console.log(`✅ ${defaultServices.length} demo services seeded.`);
  } else {
    console.log(`ℹ️  Services already exist (${servicesDb.length}) or categories not found.`);
  }
}

import { sql } from "drizzle-orm";
main().catch(console.error);
