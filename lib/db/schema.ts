/**
 * Database tables. Every content table is editable from the admin panel
 * (see lib/admin/sections.ts). Table and column names match the earlier
 * Python version of the site, so its data can be copied across if needed.
 */
import {
  boolean,
  customType,
  date,
  doublePrecision,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer; driverData: Buffer | Uint8Array }>({
  dataType: () => "bytea",
  fromDriver: (v) => (Buffer.isBuffer(v) ? v : Buffer.from(v)),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 80 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
});

/** Single values used across the site: company name, contact details, page intros. */
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 80 }).notNull().unique(),
  label: varchar("label", { length: 120 }).notNull(),
  group: varchar("group", { length: 60 }).notNull().default("General"),
  kind: varchar("kind", { length: 20 }).notNull().default("text"), // text | textarea | bool
  value: text("value").notNull().default(""),
  sort: integer("sort").notNull().default(0),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  grade: varchar("grade", { length: 40 }).notNull(),
  physicalForm: varchar("physical_form", { length: 40 }).notNull().default(""),
  particleSize: varchar("particle_size", { length: 120 }).notNull().default(""),
  acidValue: varchar("acid_value", { length: 40 }).notNull().default(""),
  amineValue: varchar("amine_value", { length: 40 }).notNull().default(""),
  meltingPoint: varchar("melting_point", { length: 40 }).notNull().default(""),
  color: varchar("color", { length: 60 }).notNull().default(""),
  packing: text("packing").notNull().default(""),
  bestFor: text("best_for").notNull().default(""),
  sort: integer("sort").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description").notNull().default(""),
  sort: integer("sort").notNull().default(0),
});

export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  year: varchar("year", { length: 10 }).notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description").notNull().default(""),
  sort: integer("sort").notNull().default(0),
});

export const advantages = pgTable("advantages", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description").notNull().default(""),
  sort: integer("sort").notNull().default(0),
});

/* ---- Performance figures. Shown only on the Performance page. ---- */

export const yearlyStats = pgTable("yearly_stats", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull().unique(),
  productionTons: doublePrecision("production_tons").notNull().default(0),
  salesTons: doublePrecision("sales_tons").notNull().default(0),
  salesUsd: doublePrecision("sales_usd").notNull().default(0),
});

export const monthlyStats = pgTable("monthly_stats", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  productionTons: doublePrecision("production_tons").notNull().default(0),
  salesTons: doublePrecision("sales_tons").notNull().default(0),
  salesUsd: doublePrecision("sales_usd").notNull().default(0),
});

export const markets = pgTable("markets", {
  id: serial("id").primaryKey(),
  country: varchar("country", { length: 80 }).notNull(),
  sharePct: doublePrecision("share_pct").notNull().default(0),
  note: varchar("note", { length: 200 }).notNull().default(""),
  sort: integer("sort").notNull().default(0),
});

/* ---- Other content ---- */

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  country: varchar("country", { length: 80 }).notNull().default(""),
  sector: varchar("sector", { length: 120 }).notNull().default(""),
  sort: integer("sort").notNull().default(0),
});

export const certifications = pgTable("certifications", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  scope: text("scope").notNull().default(""),
  since: varchar("since", { length: 20 }).notNull().default(""),
  sort: integer("sort").notNull().default(0),
});

export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  category: varchar("category", { length: 60 }).notNull().default("Company"),
  publishedOn: date("published_on", { mode: "string" }).notNull(),
  summary: text("summary").notNull().default(""),
  body: text("body").notNull().default(""),
  imageUrl: varchar("image_url", { length: 300 }).notNull().default(""),
  isPublished: boolean("is_published").notNull().default(true),
});

/** Messages sent from the partnership form on the public site. */
export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  name: varchar("name", { length: 120 }).notNull(),
  company: varchar("company", { length: 160 }).notNull(),
  email: varchar("email", { length: 160 }).notNull(),
  country: varchar("country", { length: 80 }).notNull().default(""),
  interest: varchar("interest", { length: 80 }).notNull().default(""),
  grade: varchar("grade", { length: 40 }).notNull().default(""),
  volume: varchar("volume", { length: 80 }).notNull().default(""),
  message: text("message").notNull().default(""),
  status: varchar("status", { length: 20 }).notNull().default("New"),
});

/** Uploaded images, stored in the database so they survive redeploys. */
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  filename: varchar("filename", { length: 200 }).notNull(),
  contentType: varchar("content_type", { length: 80 }).notNull(),
  data: bytea("data").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export type Product = typeof products.$inferSelect;
export type NewsPost = typeof news.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;
export type YearlyStat = typeof yearlyStats.$inferSelect;
export type MonthlyStat = typeof monthlyStats.$inferSelect;
export type Market = typeof markets.$inferSelect;
