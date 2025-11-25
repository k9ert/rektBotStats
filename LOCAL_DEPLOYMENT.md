# Local Deployment Guide

The collector works perfectly when run locally (outside Docker). Docker has network restrictions that block WebSocket connections to Nostr relays.

## Quick Start

### Option 1: Run in Background Loop (Recommended)

Start the collector loop:
```bash
./run-collector-loop.sh &
```

This runs the collector every 20 minutes in the background. Stop it with:
```bash
pkill -f run-collector-loop
```

### Option 2: Run Once

Test manually:
```bash
./run-collector.sh
```

### Option 3: Cron Job

Edit crontab:
```bash
crontab -e
```

Add this line:
```bash
*/20 * * * * cd /Users/kim/pubsrc/rektBotStats && ./run-collector.sh >> /tmp/rektbot.log 2>&1
```

## What It Does

1. **Fetches events** from Nostr relays (last 7 days)
2. **Parses liquidation messages** (Long Rekt vs Short Rekt)
3. **Writes to InfluxDB** (rektBot_longs and rektBot_shorts buckets)
4. **Dashboard displays data** at https://k9ert.github.io/rektBotStats/

## Expected Output

```
Nostr Collector started
Rektbot pubkey: 1c6cb22996baabe921bcd45c8b6213b2dab096f88e4ba5678d43d195a1868551
Fetching historical messages...
Trying last 7 days...
Fetched 764 events from last 7 days
Stored long rekt: 6d8ff387
Stored short rekt: 9631a4ac
...
Historical messages processed
✓ Collector completed successfully
```

## Monitoring

### View logs (if using cron):
```bash
tail -f /tmp/rektbot.log
```

### View logs (if using loop script):
```bash
# Logs are printed to stdout
# Run in foreground to see logs:
./run-collector-loop.sh
```

### Check InfluxDB data:
Visit https://cloud2.influxdata.com/ and query:
```flux
from(bucket: "rektBot_longs")
  |> range(start: -1h)
  |> limit(n: 10)
```

### Check dashboard:
Visit https://k9ert.github.io/rektBotStats/

## Troubleshooting

### "Missing InfluxDB config" error

Make sure `.env` file exists with:
```bash
INFLUX_URL=https://us-east-1-1.aws.cloud2.influxdata.com
INFLUX_TOKEN=your-token-here
INFLUX_ORG=rektBotStats
INFLUX_BUCKET_LONGS=rektBot_longs
INFLUX_BUCKET_SHORTS=rektBot_shorts
```

### "0 events fetched"

- Check your internet connection
- Verify Nostr relays are accessible:
  ```bash
  curl -I https://relay.nostr.band
  ```

### Collector running but no data in dashboard

1. Check InfluxDB Cloud console for data
2. Verify frontend is querying correct buckets
3. Check browser console for errors at https://k9ert.github.io/rektBotStats/

## Why Not Docker?

Docker (especially on macOS) runs in a VM with network restrictions that block WebSocket connections to external Nostr relays. The collector works perfectly when run directly on your machine.

## Cost

**$0.00** - Everything runs locally for free!

## Auto-Start on Boot

### macOS LaunchAgent

Create `~/Library/LaunchAgents/com.rektbot.collector.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.rektbot.collector</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/Users/kim/pubsrc/rektBotStats/run-collector-loop.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/rektbot-collector.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/rektbot-collector.log</string>
    <key>WorkingDirectory</key>
    <string>/Users/kim/pubsrc/rektBotStats</string>
</dict>
</plist>
```

Load it:
```bash
launchctl load ~/Library/LaunchAgents/com.rektbot.collector.plist
```

Unload it:
```bash
launchctl unload ~/Library/LaunchAgents/com.rektbot.collector.plist
```

## Summary

1. **Start collector**: `./run-collector-loop.sh &`
2. **Check it's running**: `ps aux | grep run-collector-loop`
3. **Stop collector**: `pkill -f run-collector-loop`
4. **View dashboard**: https://k9ert.github.io/rektBotStats/

That's it! The collector will run every 20 minutes and keep your dashboard updated.
