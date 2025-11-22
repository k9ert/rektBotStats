# RektBot Stats Deployment Guide

## Architecture

```
Nostr Relays → Collector (Node.js) → InfluxDB Cloud
                                           ↑
                                      Frontend (Browser)
```

- **Collector**: Standalone Node.js service that fetches Nostr events and writes to InfluxDB
- **Frontend**: Static React app that queries InfluxDB directly from browser
- **Server**: Optional, only needed for dev or serving static files

## Setup

### 1. InfluxDB Cloud

1. Go to https://cloud2.influxdata.com/
2. Create two buckets:
   - `rektBot_longs`
   - `rektBot_shorts`
3. Create two API tokens:
   - **Write token** (for collector): All Access or write-only to both buckets
   - **Read token** (for frontend): Read-only access to both buckets
4. Note your organization name

### 2. Environment Variables

Create `.env` file:

```bash
# Collector credentials (write access)
INFLUX_URL=https://us-east-1-1.aws.cloud2.influxdata.com
INFLUX_TOKEN=<write-token>
INFLUX_ORG=<your-org>
INFLUX_BUCKET_LONGS=rektBot_longs
INFLUX_BUCKET_SHORTS=rektBot_shorts

# Frontend credentials (read-only token)
VITE_INFLUX_URL=https://us-east-1-1.aws.cloud2.influxdata.com
VITE_INFLUX_TOKEN=<read-only-token>
VITE_INFLUX_ORG=<your-org>
VITE_INFLUX_BUCKET_LONGS=rektBot_longs
VITE_INFLUX_BUCKET_SHORTS=rektBot_shorts
```

### 3. InfluxDB CORS Configuration

Enable CORS in InfluxDB Cloud to allow browser requests:

1. Go to Settings → CORS
2. Add your frontend domain (e.g., `https://yourdomain.com`)
3. For local dev, add `http://localhost:5001`

## Development

```bash
# Install dependencies
npm install

# Run collector (fetches Nostr events)
npm run collector

# Run dev server (frontend)
npm run dev
```

## Production Deployment

### Option 1: Separate Services

**Collector (long-running service):**
```bash
npm run collector:build
npm run collector:start
```

Run as systemd service, Docker container, or cron job (every 10 min).

**Frontend (static site):**
```bash
npm run build
# Serve dist/ folder via nginx, Vercel, Netlify, etc.
```

### Option 2: Single Server

```bash
npm run build
npm run start
```

Server serves static files + no API routes.

### Systemd Service (Collector)

Create `/etc/systemd/system/rektbot-collector.service`:

```ini
[Unit]
Description=RektBot Nostr Collector
After=network.target

[Service]
Type=simple
User=rektbot
WorkingDirectory=/opt/rektbot
Environment="NODE_ENV=production"
EnvironmentFile=/opt/rektbot/.env
ExecStart=/usr/bin/node /opt/rektbot/dist/collector.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
systemctl enable rektbot-collector
systemctl start rektbot-collector
```

### Cron Job (Collector)

Run every 10 minutes:

```cron
*/10 * * * * cd /opt/rektbot && /usr/bin/node dist/collector.js >> /var/log/rektbot.log 2>&1
```

## Security

- **Frontend token**: Use read-only token (exposed in browser bundle)
- **Collector token**: Keep write token secret (server-side only)
- **CORS**: Only whitelist your frontend domain in InfluxDB Cloud
- **Rate limiting**: InfluxDB Cloud free tier has limits, monitor usage

## Monitoring

Check collector logs:
```bash
journalctl -u rektbot-collector -f
```

InfluxDB Cloud metrics:
- Go to Settings → Usage to monitor API requests and storage
