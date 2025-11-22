import { InfluxDB } from '@influxdata/influxdb-client';

const url = process.env.INFLUX_URL;
const token = process.env.INFLUX_TOKEN;
const org = process.env.INFLUX_ORG;

if (!url || !token || !org) {
  throw new Error('Missing InfluxDB config: INFLUX_URL, INFLUX_TOKEN, INFLUX_ORG required');
}

export const influxDB = new InfluxDB({ url, token });
export const writeApi = influxDB.getWriteApi(org, '', 'ns');
export const queryApi = influxDB.getQueryApi(org);

export const BUCKET_LONGS = process.env.INFLUX_BUCKET_LONGS || 'rektBot_longs';
export const BUCKET_SHORTS = process.env.INFLUX_BUCKET_SHORTS || 'rektBot_shorts';

writeApi.useDefaultTags({});
