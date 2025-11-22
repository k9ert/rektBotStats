import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const rektMessages = pgTable("rekt_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nostrEventId: text("nostr_event_id").notNull().unique(),
  type: text("type", { enum: ["long", "short"] }).notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull(),
});

export const insertRektMessageSchema = createInsertSchema(rektMessages).omit({
  id: true,
});

export type InsertRektMessage = z.infer<typeof insertRektMessageSchema>;
export type RektMessage = typeof rektMessages.$inferSelect;
