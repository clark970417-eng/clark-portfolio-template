import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
  position: integer("position").notNull().default(0),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const photos = sqliteTable("photos", {
  id: text("id").primaryKey(),
  eventId: text("event_id").notNull(),
  objectKey: text("object_key").notNull(),
  alt: text("alt").notNull().default(""),
  width: integer("width"),
  height: integer("height"),
  position: integer("position").notNull().default(0),
  createdAt: integer("created_at").notNull(),
});
