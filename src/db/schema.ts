import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

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

// ─── Service Categories ─────────────────────────────────
export const serviceCategories = sqliteTable("service_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  description: text("description").default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

// ─── Services ────────────────────────────────────────────
export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  highlights: text("highlights").default(""),
  category: text("category").notNull(),
  contentHtml: text("content_html"),
});

export const servicesRelations = relations(services, ({ many }) => ({
  images: many(serviceImages),
}));

// ─── Service Images ──────────────────────────────────────
export const serviceImages = sqliteTable("service_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  serviceId: integer("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  altText: text("alt_text"),
});

export const serviceImagesRelations = relations(serviceImages, ({ one }) => ({
  service: one(services, {
    fields: [serviceImages.serviceId],
    references: [services.id],
  }),
}));