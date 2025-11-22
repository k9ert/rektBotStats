import { Point } from '@influxdata/influxdb-client';
import { type User, type InsertUser, type RektMessage, type InsertRektMessage } from "@shared/schema";
import { influxDB, queryApi, BUCKET_LONGS, BUCKET_SHORTS } from "./db";

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
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    throw new Error("Not implemented");
  }

  async insertRektMessage(insertMessage: InsertRektMessage): Promise<RektMessage> {
    const bucket = insertMessage.type === 'long' ? BUCKET_LONGS : BUCKET_SHORTS;
    const org = process.env.INFLUX_ORG || 'rektbot';
    const writeApi = influxDB.getWriteApi(org, bucket, 'ns');

    const point = new Point('rekt_event')
      .tag('type', insertMessage.type)
      .stringField('nostrEventId', insertMessage.nostrEventId)
      .stringField('content', insertMessage.content)
      .timestamp(insertMessage.timestamp);

    writeApi.writePoint(point);
    await writeApi.close();

    return {
      nostrEventId: insertMessage.nostrEventId,
      type: insertMessage.type,
      content: insertMessage.content,
      timestamp: insertMessage.timestamp,
    };
  }

  async getRektMessageByEventId(eventId: string): Promise<RektMessage | undefined> {
    const query = `
      from(bucket: "${BUCKET_LONGS}")
        |> range(start: 0)
        |> filter(fn: (r) => r._measurement == "rekt_event")
        |> filter(fn: (r) => r.nostrEventId == "${eventId}")
        |> last()
    `;

    const queryShorts = `
      from(bucket: "${BUCKET_SHORTS}")
        |> range(start: 0)
        |> filter(fn: (r) => r._measurement == "rekt_event")
        |> filter(fn: (r) => r.nostrEventId == "${eventId}")
        |> last()
    `;

    const results: RektMessage[] = [];

    for await (const { values, tableMeta } of queryApi.iterateRows(query)) {
      const row = tableMeta.toObject(values);
      results.push({
        nostrEventId: row.nostrEventId,
        type: 'long',
        content: row.content,
        timestamp: new Date(row._time),
      });
    }

    if (results.length > 0) return results[0];

    for await (const { values, tableMeta } of queryApi.iterateRows(queryShorts)) {
      const row = tableMeta.toObject(values);
      results.push({
        nostrEventId: row.nostrEventId,
        type: 'short',
        content: row.content,
        timestamp: new Date(row._time),
      });
    }

    return results.length > 0 ? results[0] : undefined;
  }

  async getRektMessagesInRange(startDate: Date, endDate: Date): Promise<RektMessage[]> {
    const query = `
      from(bucket: "${BUCKET_LONGS}")
        |> range(start: ${startDate.toISOString()}, stop: ${endDate.toISOString()})
        |> filter(fn: (r) => r._measurement == "rekt_event")
        |> filter(fn: (r) => r._field == "nostrEventId" or r._field == "content")
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    `;

    const queryShorts = `
      from(bucket: "${BUCKET_SHORTS}")
        |> range(start: ${startDate.toISOString()}, stop: ${endDate.toISOString()})
        |> filter(fn: (r) => r._measurement == "rekt_event")
        |> filter(fn: (r) => r._field == "nostrEventId" or r._field == "content")
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    `;

    const results: RektMessage[] = [];

    for await (const { values, tableMeta } of queryApi.iterateRows(query)) {
      const row = tableMeta.toObject(values);
      results.push({
        nostrEventId: row.nostrEventId,
        type: 'long',
        content: row.content,
        timestamp: new Date(row._time),
      });
    }

    for await (const { values, tableMeta } of queryApi.iterateRows(queryShorts)) {
      const row = tableMeta.toObject(values);
      results.push({
        nostrEventId: row.nostrEventId,
        type: 'short',
        content: row.content,
        timestamp: new Date(row._time),
      });
    }

    return results.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async getAllRektMessages(): Promise<RektMessage[]> {
    const query = `
      from(bucket: "${BUCKET_LONGS}")
        |> range(start: 0)
        |> filter(fn: (r) => r._measurement == "rekt_event")
        |> filter(fn: (r) => r._field == "nostrEventId" or r._field == "content")
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    `;

    const queryShorts = `
      from(bucket: "${BUCKET_SHORTS}")
        |> range(start: 0)
        |> filter(fn: (r) => r._measurement == "rekt_event")
        |> filter(fn: (r) => r._field == "nostrEventId" or r._field == "content")
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    `;

    const results: RektMessage[] = [];

    for await (const { values, tableMeta } of queryApi.iterateRows(query)) {
      const row = tableMeta.toObject(values);
      results.push({
        nostrEventId: row.nostrEventId,
        type: 'long',
        content: row.content,
        timestamp: new Date(row._time),
      });
    }

    for await (const { values, tableMeta } of queryApi.iterateRows(queryShorts)) {
      const row = tableMeta.toObject(values);
      results.push({
        nostrEventId: row.nostrEventId,
        type: 'short',
        content: row.content,
        timestamp: new Date(row._time),
      });
    }

    return results.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
}

export const storage = new DbStorage();
