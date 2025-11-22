import { InfluxDB } from '@influxdata/influxdb-client';

const url = process.env.INFLUX_HOST || 'http://localhost:8086';
const token = process.env.INFLUX_TOKEN || 'dev-token';
const org = process.env.INFLUX_ORG || 'rektbot';

export const influxDB = new InfluxDB({ url, token });
export const writeApi = influxDB.getWriteApi(org, '', 'ns');
export const queryApi = influxDB.getQueryApi(org);

export const BUCKET_LONGS = process.env.INFLUX_BUCKET_LONGS || 'rektBot_longs';
export const BUCKET_SHORTS = process.env.INFLUX_BUCKET_SHORTS || 'rektBot_shorts';

writeApi.useDefaultTags({});
