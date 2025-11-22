import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { nostrService } from "./nostr-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Start Nostr service on server startup
  setTimeout(() => {
    nostrService.start().catch(console.error);
  }, 1000);

  // Get statistics for a given time range
  app.get("/api/stats", async (req, res) => {
    try {
      const { range = "24h" } = req.query;
      
      const now = new Date();
      let startDate: Date;
      
      switch (range) {
        case "24h":
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      const messages = await storage.getRektMessagesInRange(startDate, now);
      
      const longCount = messages.filter(m => m.type === "long").length;
      const shortCount = messages.filter(m => m.type === "short").length;
      const ratio = shortCount > 0 ? longCount / shortCount : 0;

      res.json({
        totalLong: longCount,
        totalShort: shortCount,
        ratio: parseFloat(ratio.toFixed(2)),
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // Get time series data
  app.get("/api/timeseries", async (req, res) => {
    try {
      const { range = "24h" } = req.query;
      
      const now = new Date();
      let startDate: Date;
      let bucketSize: number; // in milliseconds
      
      switch (range) {
        case "24h":
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          bucketSize = 60 * 60 * 1000; // 1 hour buckets
          break;
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          bucketSize = 6 * 60 * 60 * 1000; // 6 hour buckets
          break;
        case "30d":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          bucketSize = 24 * 60 * 60 * 1000; // 1 day buckets
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          bucketSize = 60 * 60 * 1000;
      }

      const messages = await storage.getRektMessagesInRange(startDate, now);
      
      // Create time buckets
      const buckets = new Map<number, { long: number; short: number }>();
      
      // Initialize all buckets
      const numBuckets = Math.ceil((now.getTime() - startDate.getTime()) / bucketSize);
      for (let i = 0; i < numBuckets; i++) {
        const bucketStart = startDate.getTime() + i * bucketSize;
        buckets.set(bucketStart, { long: 0, short: 0 });
      }
      
      // Fill buckets with data
      messages.forEach(msg => {
        const bucketStart = Math.floor((msg.timestamp.getTime() - startDate.getTime()) / bucketSize) * bucketSize + startDate.getTime();
        const bucket = buckets.get(bucketStart);
        if (bucket) {
          if (msg.type === "long") {
            bucket.long++;
          } else {
            bucket.short++;
          }
        }
      });
      
      // Convert to array format
      const data = Array.from(buckets.entries()).map(([timestamp, counts]) => ({
        timestamp: new Date(timestamp),
        long: counts.long,
        short: counts.short,
      }));

      res.json(data);
    } catch (error) {
      console.error("Error fetching time series:", error);
      res.status(500).json({ error: "Failed to fetch time series data" });
    }
  });

  // Get connection status
  app.get("/api/status", async (req, res) => {
    try {
      const allMessages = await storage.getAllRektMessages();
      res.json({
        status: allMessages.length > 0 ? "live" : "connecting",
        messageCount: allMessages.length,
      });
    } catch (error) {
      console.error("Error fetching status:", error);
      res.status(500).json({ error: "Failed to fetch status" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
