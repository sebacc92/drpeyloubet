import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

// ─── Users ───────────────────────────────────────────────
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  lastLogin: integer("last_login", { mode: "timestamp" }),
});

// ─── Site Settings (key-value) ───────────────────────────
export const siteSettings = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
});

// ─── Categories ─────────────────────────────────────────
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  services: many(services),
}));

// ─── Services ────────────────────────────────────────────
export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  longText: text("long_text"),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  ctaText: text("cta_text").default("Agendar Turno").notNull(),
});

export const servicesRelations = relations(services, ({ one, many }) => ({
  category: one(categories, {
    fields: [services.categoryId],
    references: [categories.id],
  }),
  beforeAfterCases: many(beforeAfterCases),
  appointments: many(appointments),
}));

// ─── Before & After Cases ────────────────────────────────
export const beforeAfterCases = sqliteTable("before_after_cases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  serviceId: integer("service_id").references(() => services.id, { onDelete: "cascade" }),
  description: text("description"),
  imageBeforeUrl: text("image_before_url").notNull(),
  imageAfterUrl: text("image_after_url").notNull(),
  isFeatured: integer("is_featured", { mode: "boolean" }).default(false),
});

export const beforeAfterCasesRelations = relations(beforeAfterCases, ({ one }) => ({
  service: one(services, {
    fields: [beforeAfterCases.serviceId],
    references: [services.id],
  }),
}));

// ─── Appointments ────────────────────────────────────────
export const appointments = sqliteTable("appointments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  patientName: text("patient_name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  serviceId: integer("service_id").references(() => services.id, { onDelete: "set null" }),
  type: text("type", { enum: ["presencial", "virtual"] }).notNull().default("presencial"),
  status: text("status", { enum: ["pending", "confirmed", "completed", "cancelled"] }).default("pending").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
}));

// ─── Chat Logs (OpenAI) ──────────────────────────────────
export const chatLogs = sqliteTable("chat_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("session_id").notNull(),
  userMessage: text("user_message").notNull(),
  botResponse: text("bot_response").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// ─── Treatments ──────────────────────────────────────────
export const treatments = sqliteTable("treatments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category", { enum: ["estetica", "reparadora", "no_quirurgica"] }).notNull(),
  shortDescription: text("short_description"),
  fullDescription: text("full_description"),
  mainImageUrl: text("main_image_url"),
  isFeatured: integer("is_featured", { mode: "boolean" }).default(false),
  displayOrder: integer("display_order").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const treatmentsRelations = relations(treatments, ({ many }) => ({
  beforeAfterImages: many(treatmentBeforeAfter),
}));

// ─── Treatment Before & After Images ─────────────────────
export const treatmentBeforeAfter = sqliteTable("treatment_before_after", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  treatmentId: integer("treatment_id").notNull().references(() => treatments.id, { onDelete: "cascade" }),
  beforeImageUrl: text("before_image_url").notNull(),
  afterImageUrl: text("after_image_url").notNull(),
  caption: text("caption"),
  displayOrder: integer("display_order").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const treatmentBeforeAfterRelations = relations(treatmentBeforeAfter, ({ one }) => ({
  treatment: one(treatments, {
    fields: [treatmentBeforeAfter.treatmentId],
    references: [treatments.id],
  }),
}));