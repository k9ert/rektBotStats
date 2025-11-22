import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // No API routes - frontend queries InfluxDB directly
  // Server only serves static files in production

  const httpServer = createServer(app);

  return httpServer;
}
