import { type User, type InsertUser, type RektMessage, type InsertRektMessage } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  insertRektMessage(message: InsertRektMessage): Promise<RektMessage>;
  getRektMessageByEventId(eventId: string): Promise<RektMessage | undefined>;
  getRektMessagesInRange(startDate: Date, endDate: Date): Promise<RektMessage[]>;
  getAllRektMessages(): Promise<RektMessage[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private rektMessages: Map<string, RektMessage>;

  constructor() {
    this.users = new Map();
    this.rektMessages = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async insertRektMessage(insertMessage: InsertRektMessage): Promise<RektMessage> {
    const id = randomUUID();
    const message: RektMessage = { ...insertMessage, id };
    this.rektMessages.set(id, message);
    return message;
  }

  async getRektMessageByEventId(eventId: string): Promise<RektMessage | undefined> {
    return Array.from(this.rektMessages.values()).find(
      (msg) => msg.nostrEventId === eventId,
    );
  }

  async getRektMessagesInRange(startDate: Date, endDate: Date): Promise<RektMessage[]> {
    return Array.from(this.rektMessages.values()).filter(
      (msg) => msg.timestamp >= startDate && msg.timestamp <= endDate,
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async getAllRektMessages(): Promise<RektMessage[]> {
    return Array.from(this.rektMessages.values()).sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
  }
}

export const storage = new MemStorage();
