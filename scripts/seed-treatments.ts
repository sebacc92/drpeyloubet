import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ─── Load .env manually (dotenv is not a direct dep) ─────
const envPath = resolve(import.meta.dirname ?? ".", "..", ".env");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let value = trimmed.slice(eqIdx + 1).trim();
  // Strip surrounding quotes
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  process.env[key] = value;
}

// ─── Inline schema (avoid path alias issues with tsx) ────
const treatments = sqliteTable("treatments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  shortDescription: text("short_description"),
  fullDescription: text("full_description"),
  mainImageUrl: text("main_image_url"),
  isFeatured: integer("is_featured").default(0),
  displayOrder: integer("display_order").default(0),
  createdAt: integer("created_at").default(sql`(unixepoch())`),
  updatedAt: integer("updated_at").default(sql`(unixepoch())`),
});

// ─── Data ────────────────────────────────────────────────
const treatmentsData = [
  // ── Estética ──
  {
    slug: "rinoplastia",
    name: "Rinoplastia",
    category: "estetica",
    shortDescription: "Cirugía estética y funcional de la nariz para mejorar su forma, tamaño y proporción con el resto del rostro.",
    fullDescription: "La rinoplastia es una de las cirugías más demandadas en cirugía plástica. Permite corregir tanto aspectos estéticos como funcionales de la nariz, mejorando la respiración y la armonía facial. Se realiza bajo anestesia general o sedación y requiere entre 7 y 14 días de recuperación inicial.",
    isFeatured: 1,
    displayOrder: 1,
  },
  {
    slug: "aumento-mamario",
    name: "Aumento Mamario",
    category: "estetica",
    shortDescription: "Procedimiento para aumentar el volumen y mejorar la forma del pecho mediante implantes o lipotransferencia.",
    fullDescription: "El aumento mamario permite a la paciente obtener el volumen y la proyección deseados. Se utilizan implantes de gel de silicona de alta cohesividad o técnica de lipotransferencia según el caso. La cirugía dura entre 1 y 2 horas y la recuperación activa es de aproximadamente 2 semanas.",
    isFeatured: 1,
    displayOrder: 2,
  },
  {
    slug: "pexia-mamaria",
    name: "Pexia Mamaria (Mastopexia)",
    category: "estetica",
    shortDescription: "Elevación y remodelación del pecho para corregir la ptosis o caída mamaria.",
    fullDescription: "La mastopexia reposiciona el tejido mamario y el complejo areola-pezón a una posición más elevada y juvenil. Se puede combinar con implantes si se desea aumentar el volumen. Es especialmente indicada después del embarazo, la lactancia o una pérdida de peso significativa.",
    isFeatured: 1,
    displayOrder: 3,
  },
  {
    slug: "lifting-facial",
    name: "Lifting Facial",
    category: "estetica",
    shortDescription: "Cirugía del envejecimiento facial para tensar y rejuvenecer cara, frente y cuello.",
    fullDescription: "El lifting facial (ritidoplastia) corrige la flacidez de la piel, los surcos profundos y el exceso de piel en cara y cuello, logrando un resultado natural y duradero. Se puede combinar con blefaroplastia y tratamientos complementarios.",
    isFeatured: 1,
    displayOrder: 4,
  },
  {
    slug: "lipoescultura",
    name: "Lipoescultura y Lipoaspiración",
    category: "estetica",
    shortDescription: "Extracción de grasa localizada para redefinir el contorno corporal en diferentes áreas.",
    fullDescription: "La lipoescultura permite eliminar depósitos de grasa resistentes a la dieta y el ejercicio, redefiniendo la silueta. Se puede tratar abdomen, flancos, muslos, brazos, papada y otras áreas. La grasa extraída puede reinyectarse en zonas que lo requieran (lipotransferencia).",
    isFeatured: 1,
    displayOrder: 5,
  },
  {
    slug: "abdominoplastia",
    name: "Abdominoplastia",
    category: "estetica",
    shortDescription: "Corrección del abdomen con extirpación del exceso de piel y reparación de la musculatura.",
    fullDescription: "La dermolipectomía abdominal elimina el exceso de piel y grasa del abdomen, y repara la diástasis de los músculos rectos. Ideal para pacientes post embarazo o tras una pérdida importante de peso. Se combina habitualmente con lipoaspiración.",
    isFeatured: 1,
    displayOrder: 6,
  },
  {
    slug: "reduccion-mamaria",
    name: "Reducción Mamaria",
    category: "estetica",
    shortDescription: "Reducción del volumen mamario para aliviar molestias físicas y mejorar la proporción corporal.",
    fullDescription: "La reducción mamaria (mamoplastia reductora) extrae el exceso de tejido, grasa y piel del pecho, aliviando dolores de espalda, cuello y hombros, y mejorando la autoestima. Se corrige también la ptosis asociada.",
    isFeatured: 0,
    displayOrder: 7,
  },
  {
    slug: "ginecomastia",
    name: "Ginecomastia",
    category: "estetica",
    shortDescription: "Corrección del aumento del tejido mamario en hombres mediante cirugía.",
    fullDescription: "La ginecomastia es el aumento del tejido glandular mamario en el hombre. Su corrección quirúrgica combina lipoaspiración y resección glandular según el grado. El resultado es un tórax más plano y masculino, con cicatrices mínimas.",
    isFeatured: 0,
    displayOrder: 8,
  },
  {
    slug: "blefaroplastia",
    name: "Blefaroplastia",
    category: "estetica",
    shortDescription: "Cirugía de párpados para eliminar bolsas, exceso de piel y rejuvenecer la mirada.",
    fullDescription: "La blefaroplastia corrige las bolsas palpebrales, el exceso de piel en párpados superiores e inferiores y la caída de la cola de la ceja, logrando una mirada más descansada y juvenil. Se puede realizar de forma aislada o combinada con lifting facial.",
    isFeatured: 0,
    displayOrder: 9,
  },
  {
    slug: "otoplastia",
    name: "Otoplastia",
    category: "estetica",
    shortDescription: "Corrección estética de las orejas prominentes o en \"asa\".",
    fullDescription: "La otoplastia reposiciona y remodelea los cartílagos auriculares para corregir las orejas prominentes. Es una cirugía ambulatoria que se puede realizar desde los 6-7 años. El resultado es permanente y mejora notablemente la autoestima del paciente.",
    isFeatured: 0,
    displayOrder: 10,
  },
  {
    slug: "mentoplastia",
    name: "Mentoplastia",
    category: "estetica",
    shortDescription: "Cirugía estética de mentón para mejorar el perfil y la armonía facial.",
    fullDescription: "La mentoplastia corrige el mentón retrogénico (pequeño) o progénico (prominente) mediante implantes o resección ósea, mejorando el perfil facial y la proporción entre nariz, labios y mentón.",
    isFeatured: 0,
    displayOrder: 11,
  },
  {
    slug: "implante-capilar",
    name: "Micro Implante Capilar",
    category: "estetica",
    shortDescription: "Cirugía de la calvicie mediante técnica de micro implante capilar para restaurar el cabello.",
    fullDescription: "El micro implante capilar es una técnica mínimamente invasiva que trasplanta unidades foliculares de zonas donantes a zonas con alopecia. Los resultados son naturales y permanentes.",
    isFeatured: 0,
    displayOrder: 12,
  },

  // ── No Quirúrgica ──
  {
    slug: "toxina-botulinica",
    name: "Toxina Botulínica (Botox)",
    category: "no_quirurgica",
    shortDescription: "Tratamiento no quirúrgico para suavizar arrugas de expresión con resultados naturales.",
    fullDescription: "La aplicación de toxina botulínica (Botox / Dysport) relaja los músculos responsables de las arrugas de expresión en frente, entrecejo y patas de gallo. El efecto dura entre 4 y 6 meses y el procedimiento es ambulatorio sin recuperación.",
    isFeatured: 0,
    displayOrder: 13,
  },
  {
    slug: "rellenos-faciales",
    name: "Rellenos Faciales",
    category: "no_quirurgica",
    shortDescription: "Aplicación de ácido hialurónico y otros fillers para restaurar volumen y suavizar surcos.",
    fullDescription: "Los rellenos faciales con ácido hialurónico (Restylane, Juvederm) y otros elementos (Radiesse) rellenan surcos nasogenianos, aumentan labios, proyectan pómulos y restauran volúmenes faciales perdidos con el envejecimiento. El resultado es inmediato y dura entre 12 y 18 meses.",
    isFeatured: 0,
    displayOrder: 14,
  },

  // ── Reparadora ──
  {
    slug: "reconstruccion-mamaria",
    name: "Reconstrucción Mamaria",
    category: "reparadora",
    shortDescription: "Reconstrucción del pecho después de una mastectomía por cáncer de mama.",
    fullDescription: "La reconstrucción mamaria post mastectomía puede realizarse con implantes, expansores tisulares o colgajos autólogos (TRAM, DIEP). Se planifica junto al equipo oncológico y puede ser inmediata o diferida. Es un derecho de la paciente y parte fundamental de su recuperación integral.",
    isFeatured: 0,
    displayOrder: 15,
  },
  {
    slug: "cicatrices-quemaduras",
    name: "Secuelas de Quemaduras",
    category: "reparadora",
    shortDescription: "Tratamiento quirúrgico y no quirúrgico de cicatrices y secuelas por quemaduras.",
    fullDescription: "La cirugía reparadora de secuelas por quemaduras incluye injertos cutáneos, colgajos de avance, expansión tisular y técnicas de liberación de contracturas. El objetivo es mejorar la función y la estética de las zonas afectadas.",
    isFeatured: 0,
    displayOrder: 16,
  },
  {
    slug: "tumores-piel",
    name: "Resección de Tumores de Piel",
    category: "reparadora",
    shortDescription: "Extirpación de tumores cutáneos benignos y malignos con reconstrucción del defecto.",
    fullDescription: "La cirugía plástica ofrece la resección oncológica de tumores de piel (carcinomas, melanomas, quistes, lipomas) con técnicas de reconstrucción que minimizan las cicatrices y preservan la función.",
    isFeatured: 0,
    displayOrder: 17,
  },
  {
    slug: "heridas-traumaticas",
    name: "Reparación de Heridas Traumáticas",
    category: "reparadora",
    shortDescription: "Tratamiento quirúrgico de heridas complejas por accidentes con técnicas de mínima cicatriz.",
    fullDescription: "La reparación inmediata y diferida de heridas traumáticas por accidentes utiliza técnicas de microcirugía, colgajos y suturas especializadas para lograr la mejor cicatrización posible y preservar la función.",
    isFeatured: 0,
    displayOrder: 18,
  },
  {
    slug: "ulceras",
    name: "Tratamiento de Úlceras",
    category: "reparadora",
    shortDescription: "Tratamiento de úlceras venosas, arteriales y postraumáticas con técnicas reconstructivas.",
    fullDescription: "Las úlceras crónicas (venosas, arteriales, postraumáticas, por presión) requieren un abordaje multidisciplinario. La cirugía plástica aporta técnicas de injertos, colgajos y sistemas de cierre asistido por vacío para lograr la cicatrización definitiva.",
    isFeatured: 0,
    displayOrder: 19,
  },
  {
    slug: "fracturas-maxilofaciales",
    name: "Fracturas Maxilofaciales",
    category: "reparadora",
    shortDescription: "Tratamiento de traumatismos y fracturas de cara y mandíbula.",
    fullDescription: "La cirugía plástica reparadora trata los traumatismos faciales (fracturas de órbita, malar, mandíbula y huesos propios nasales) con reducción y fijación quirúrgica para restaurar la anatomía y la función masticatoria y estética.",
    isFeatured: 0,
    displayOrder: 20,
  },
];

// ─── Main ────────────────────────────────────────────────
async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env");
  }

  const client = createClient({ url, authToken });
  const db = drizzle(client);

  console.log("🔗 Connected to Turso.");

  let inserted = 0;
  let skipped = 0;

  for (const t of treatmentsData) {
    try {
      await db.insert(treatments).values(t).onConflictDoNothing({ target: treatments.slug });
      // Check if it was actually inserted by querying
      inserted++;
    } catch (err) {
      // Unique constraint violation = already exists
      skipped++;
      console.log(`⏭️  Skipped (already exists): ${t.slug}`);
    }
  }

  // Verify
  const count = await db.select({ count: sql<number>`count(*)` }).from(treatments);
  const total = count[0]?.count ?? 0;

  console.log(`\n✅ Seed complete.`);
  console.log(`   Processed: ${treatmentsData.length}`);
  console.log(`   Total treatments in DB: ${total}`);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
