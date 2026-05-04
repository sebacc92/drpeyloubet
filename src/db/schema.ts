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


// ─── Appointments ────────────────────────────────────────
export const appointments = sqliteTable("appointments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  patientName: text("patient_name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  treatmentId: integer("treatment_id").references(() => treatments.id, { onDelete: "set null" }),
  type: text("type", { enum: ["presencial", "virtual"] }).notNull().default("presencial"),
  status: text("status", { enum: ["pending", "confirmed", "completed", "cancelled"] }).default("pending").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  treatment: one(treatments, {
    fields: [appointments.treatmentId],
    references: [treatments.id],
  }),
}));

// ─── Chat Sessions & Messages ──────────────────────────────
export const chatSessions = sqliteTable("chat_sessions", {
  id: text("id").primaryKey(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  lastActive: integer("last_active", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

export const chatMessages = sqliteTable("chat_messages", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").references(() => chatSessions.id, { onDelete: "cascade" }).notNull(),
  role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

export const chatSessionsRelations = relations(chatSessions, ({ many }) => ({
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
}));

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
  appointments: many(appointments),
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