import { type User, type InsertUser, type RektMessage, type InsertRektMessage } from "@shared/schema";
import { db, rektMessages } from "./db";
import { eq, and, gte, lte, asc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  insertRektMessage(message: InsertRektMessage): Promise<RektMessage>;
  getRektMessageByEventId(eventId: string): Promise<RektMessage | undefined>;
  getRektMessagesInRange(startDate: Date, endDate: Date): Promise<RektMessage[]>;
  getAllRektMessages(): Promise<RektMessage[]>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    return undefined; // Not implemented for this app
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return undefined; // Not implemented for this app
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    throw new Error("Not implemented");
  }

  async insertRektMessage(insertMessage: InsertRektMessage): Promise<RektMessage> {
    const [message] = await db.insert(rektMessages).values(insertMessage).returning();
    return message;
  }

  async getRektMessageByEventId(eventId: string): Promise<RektMessage | undefined> {
    const [message] = await db.select()
      .from(rektMessages)
      .where(eq(rektMessages.nostrEventId, eventId))
      .limit(1);
    return message;
  }

  async getRektMessagesInRange(startDate: Date, endDate: Date): Promise<RektMessage[]> {
    const messages = await db.select()
      .from(rektMessages)
      .where(
        and(
          gte(rektMessages.timestamp, startDate),
          lte(rektMessages.timestamp, endDate)
        )
      )
      .orderBy(asc(rektMessages.timestamp));
    return messages;
  }

  async getAllRektMessages(): Promise<RektMessage[]> {
    const messages = await db.select()
      .from(rektMessages)
      .orderBy(asc(rektMessages.timestamp));
    return messages;
  }
}

export const storage = new DbStorage();
