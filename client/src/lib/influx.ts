import { InfluxDB } from '@influxdata/influxdb-client';

// Read-only access - safe to expose in frontend
const url = import.meta.env.VITE_INFLUX_URL || 'https://us-east-1-1.aws.cloud2.influxdata.com';
const token = import.meta.env.VITE_INFLUX_TOKEN || '';
const org = import.meta.env.VITE_INFLUX_ORG || 'rektBotStats';

export const BUCKET_LONGS = import.meta.env.VITE_INFLUX_BUCKET_LONGS || 'rektBot_longs';
export const BUCKET_SHORTS = import.meta.env.VITE_INFLUX_BUCKET_SHORTS || 'rektBot_shorts';

if (!token) {
  console.warn('VITE_INFLUX_TOKEN not set - InfluxDB queries will fail');
}

export const influxDB = new InfluxDB({ url, token });
export const queryApi = influxDB.getQueryApi(org);
