import { z } from "zod";

export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;

export interface User {
  id: string;
  username: string;
  password: string;
}

export const insertRektMessageSchema = z.object({
  nostrEventId: z.string(),
  type: z.enum(["long", "short"]),
  content: z.string(),
  timestamp: z.date(),
});

export type InsertRektMessage = z.infer<typeof insertRektMessageSchema>;

export interface RektMessage {
  id?: string;
  nostrEventId: string;
  type: "long" | "short";
  content: string;
  timestamp: Date;
}
