import { queryApi, BUCKET_LONGS, BUCKET_SHORTS } from './influx';

export interface RektStats {
  totalLong: number;
  totalShort: number;
  ratio: number;
  totalLongUSD: number;
  totalShortUSD: number;
}

export interface TimeSeriesData {
  timestamp: Date;
  long: number;
  short: number;
}

export async function fetchStats(range: string = '24h'): Promise<RektStats> {
  const now = new Date();
  let startDate: Date;

  switch (range) {
    case '24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }

  const queryLongs = `
    from(bucket: "${BUCKET_LONGS}")
      |> range(start: ${startDate.toISOString()})
      |> filter(fn: (r) => r._measurement == "rekt_event")
      |> count()
  `;

  const queryShorts = `
    from(bucket: "${BUCKET_SHORTS}")
      |> range(start: ${startDate.toISOString()})
      |> filter(fn: (r) => r._measurement == "rekt_event")
      |> count()
  `;

  const queryLongsUSD = `
    from(bucket: "${BUCKET_LONGS}")
      |> range(start: ${startDate.toISOString()})
      |> filter(fn: (r) => r._measurement == "rekt_event" and r._field == "usd_amount")
      |> sum()
  `;

  const queryShortsUSD = `
    from(bucket: "${BUCKET_SHORTS}")
      |> range(start: ${startDate.toISOString()})
      |> filter(fn: (r) => r._measurement == "rekt_event" and r._field == "usd_amount")
      |> sum()
  `;

  let totalLong = 0;
  let totalShort = 0;
  let totalLongUSD = 0;
  let totalShortUSD = 0;

  for await (const { values, tableMeta } of queryApi.iterateRows(queryLongs)) {
    const row = tableMeta.toObject(values);
    totalLong = row._value || 0;
  }

  for await (const { values, tableMeta } of queryApi.iterateRows(queryShorts)) {
    const row = tableMeta.toObject(values);
    totalShort = row._value || 0;
  }

  for await (const { values, tableMeta } of queryApi.iterateRows(queryLongsUSD)) {
    const row = tableMeta.toObject(values);
    totalLongUSD = row._value || 0;
  }

  for await (const { values, tableMeta } of queryApi.iterateRows(queryShortsUSD)) {
    const row = tableMeta.toObject(values);
    totalShortUSD = row._value || 0;
  }

  const ratio = totalShort > 0 ? totalLong / totalShort : 0;

  return {
    totalLong,
    totalShort,
    ratio: parseFloat(ratio.toFixed(2)),
    totalLongUSD,
    totalShortUSD,
  };
}

export async function fetchTimeSeries(range: string = '24h'): Promise<TimeSeriesData[]> {
  const now = new Date();
  let startDate: Date;
  let windowPeriod: string;

  switch (range) {
    case '24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      windowPeriod = '1h';
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      windowPeriod = '6h';
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      windowPeriod = '1d';
      break;
    default:
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      windowPeriod = '1h';
  }

  const queryLongs = `
    from(bucket: "${BUCKET_LONGS}")
      |> range(start: ${startDate.toISOString()})
      |> filter(fn: (r) => r._measurement == "rekt_event")
      |> aggregateWindow(every: ${windowPeriod}, fn: count, createEmpty: true)
      |> yield(name: "longs")
  `;

  const queryShorts = `
    from(bucket: "${BUCKET_SHORTS}")
      |> range(start: ${startDate.toISOString()})
      |> filter(fn: (r) => r._measurement == "rekt_event")
      |> aggregateWindow(every: ${windowPeriod}, fn: count, createEmpty: true)
      |> yield(name: "shorts")
  `;

  const dataMap = new Map<number, { long: number; short: number }>();

  for await (const { values, tableMeta } of queryApi.iterateRows(queryLongs)) {
    const row = tableMeta.toObject(values);
    const timestamp = new Date(row._time).getTime();
    const count = row._value || 0;

    if (!dataMap.has(timestamp)) {
      dataMap.set(timestamp, { long: 0, short: 0 });
    }
    dataMap.get(timestamp)!.long = count;
  }

  for await (const { values, tableMeta } of queryApi.iterateRows(queryShorts)) {
    const row = tableMeta.toObject(values);
    const timestamp = new Date(row._time).getTime();
    const count = row._value || 0;

    if (!dataMap.has(timestamp)) {
      dataMap.set(timestamp, { long: 0, short: 0 });
    }
    dataMap.get(timestamp)!.short = count;
  }

  return Array.from(dataMap.entries())
    .map(([timestamp, counts]) => ({
      timestamp: new Date(timestamp),
      long: counts.long,
      short: counts.short,
    }))
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

export async function fetchMessageCount(): Promise<number> {
  const queryLongs = `
    from(bucket: "${BUCKET_LONGS}")
      |> range(start: 0)
      |> filter(fn: (r) => r._measurement == "rekt_event")
      |> count()
  `;

  const queryShorts = `
    from(bucket: "${BUCKET_SHORTS}")
      |> range(start: 0)
      |> filter(fn: (r) => r._measurement == "rekt_event")
      |> count()
  `;

  let count = 0;

  for await (const { values, tableMeta } of queryApi.iterateRows(queryLongs)) {
    const row = tableMeta.toObject(values);
    count += row._value || 0;
  }

  for await (const { values, tableMeta } of queryApi.iterateRows(queryShorts)) {
    const row = tableMeta.toObject(values);
    count += row._value || 0;
  }

  return count;
}
