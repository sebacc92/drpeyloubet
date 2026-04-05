import { createClient } from "@libsql/client";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

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
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const schemaPath = path.resolve(__dirname, "../../schema.sql");

  const url = process.env.TURSO_DATABASE_URL || process.env.TURSO_URL || "file:local.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const client = createClient({ url, authToken });

  const schema = await fs.readFile(schemaPath, "utf-8");
  const statements = schema
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const stmt of statements) {
    await client.execute(stmt);
  }
  console.log("✅ Schema created.");

  // Check admin user
  const res = await client.execute("SELECT * FROM users WHERE username = 'admin'");
  if (res.rows.length === 0) {
    const hash = await hashPassword("admin");
    await client.execute({
      sql: "INSERT INTO users (username, password_hash) VALUES (?, ?)",
      args: ["admin", hash],
    });
    console.log("✅ Default admin user created (admin/admin).");
  } else {
    console.log("ℹ️  Admin user already exists.");
  }

  // Seed dummy services
  const servRes = await client.execute("SELECT count(*) as cnt FROM services");
  const count = servRes.rows[0].cnt as number;
  if (count === 0) {
    const services = [
      {
        slug: "aumento-mamario",
        title: "Aumento Mamario",
        description: "Mejora el volumen y forma de los senos con implantes de última generación.",
        category: "Quirúrgicos",
        content_html: "<p>El aumento mamario es uno de los procedimientos más solicitados en cirugía estética. Utilizamos implantes de la más alta calidad para lograr resultados naturales y armoniosos.</p>",
      },
      {
        slug: "rinoplastia",
        title: "Rinoplastia",
        description: "Remodelación estética y funcional de la nariz.",
        category: "Quirúrgicos",
        content_html: "<p>La rinoplastia permite corregir tanto aspectos estéticos como funcionales de la nariz, mejorando la armonía facial y la respiración.</p>",
      },
      {
        slug: "reconstruccion-mamaria",
        title: "Reconstrucción Mamaria",
        description: "Restauración de la mama tras una mastectomía.",
        category: "Reparadoras",
        content_html: "<p>La reconstrucción mamaria devuelve la forma y el aspecto del seno después de una cirugía oncológica, contribuyendo significativamente a la calidad de vida de la paciente.</p>",
      },
      {
        slug: "botox",
        title: "Toxina Botulínica (Botox)",
        description: "Rejuvenecimiento facial no quirúrgico para líneas de expresión.",
        category: "No Quirúrgicos",
        content_html: "<p>La aplicación de toxina botulínica es un tratamiento rápido y efectivo para suavizar arrugas de expresión en frente, entrecejo y patas de gallo, con resultados visibles en pocos días.</p>",
      },
      {
        slug: "acido-hialuronico",
        title: "Ácido Hialurónico",
        description: "Rellenos dérmicos para restaurar volumen y contorno facial.",
        category: "No Quirúrgicos",
        content_html: "<p>Los rellenos con ácido hialurónico permiten restaurar el volumen perdido, definir contornos faciales y suavizar surcos de forma natural y segura.</p>",
      },
    ];

    for (const s of services) {
      await client.execute({
        sql: "INSERT INTO services (slug, title, description, category, content_html) VALUES (?, ?, ?, ?, ?)",
        args: [s.slug, s.title, s.description, s.category, s.content_html],
      });
    }
    console.log(`✅ ${services.length} demo services seeded.`);
  } else {
    console.log(`ℹ️  Services already exist (${count}).`);
  }
}

main().catch(console.error);
