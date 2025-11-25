# Docker Local Deployment Guide

This guide shows you how to run the Nostr collector locally using Docker.

## Why Docker?

- **Isolated environment**: No conflicts with your local Node.js setup
- **Easy to start/stop**: Single command to manage the collector
- **Automatic restarts**: Container restarts automatically if it crashes
- **Clean logs**: Centralized logging with rotation
- **Portable**: Same setup works on any machine with Docker

## Prerequisites

1. **Docker Desktop** installed and running
   - macOS: https://docs.docker.com/desktop/install/mac-install/
   - Already installed at `/Users/kim/.docker/config.json`

2. **Environment variables** in `.env` file (already configured)

## Quick Start

### 1. Build and Start

```bash
cd /Users/kim/pubsrc/rektBotStats
docker-compose up -d
```

The collector will:
- Build the Docker image
- Start running in the background
- Collect events every 20 minutes
- Automatically restart if it crashes

### 2. View Logs

See real-time logs:
```bash
docker-compose logs -f collector
```

See last 100 lines:
```bash
docker-compose logs --tail=100 collector
```

### 3. Check Status

```bash
docker-compose ps
```

Should show:
```
NAME                  STATUS         PORTS
rektbot-collector     Up 2 minutes
```

## Detailed Commands

### Start the Collector

Start in background (detached mode):
```bash
docker-compose up -d
```

Start with logs visible:
```bash
docker-compose up
```

### Stop the Collector

Stop the container:
```bash
docker-compose down
```

Stop and remove all data:
```bash
docker-compose down -v
```

### Restart the Collector

```bash
docker-compose restart
```

### Rebuild After Code Changes

If you modify collector code:
```bash
docker-compose up -d --build
```

Or rebuild manually:
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Run Collector Once (for testing)

Run a single collection without starting the loop:
```bash
docker-compose run --rm collector npx tsx /app/collector/index.ts
```

## Monitoring

### View Logs with Timestamps

```bash
docker-compose logs -f --timestamps collector
```

### Follow Logs for Specific Pattern

Watch for errors:
```bash
docker-compose logs -f collector | grep -i error
```

Watch for successful writes:
```bash
docker-compose logs -f collector | grep "Wrote"
```

### Check Container Resource Usage

```bash
docker stats rektbot-collector
```

Shows CPU, memory, and network usage in real-time.

### Inspect Container

View detailed container info:
```bash
docker inspect rektbot-collector
```

View environment variables:
```bash
docker exec rektbot-collector env | grep INFLUX
```

## Configuration

### Change Collection Interval

Edit `docker-compose.yml` and change:
```yaml
environment:
  - COLLECTION_INTERVAL_MINUTES=20  # Change this value
```

Then restart:
```bash
docker-compose up -d --force-recreate
```

### Update InfluxDB Credentials

Edit `.env` file, then:
```bash
docker-compose up -d --force-recreate
```

## Troubleshooting

### Container Exits Immediately

Check logs for errors:
```bash
docker-compose logs collector
```

Common issues:
- Missing environment variables
- InfluxDB credentials incorrect
- Network connectivity issues

### "Cannot connect to Docker daemon"

Make sure Docker Desktop is running:
```bash
open -a Docker
```

### Container Running But No Data in InfluxDB

1. **Check logs for errors:**
   ```bash
   docker-compose logs --tail=200 collector
   ```

2. **Run collector manually to see full output:**
   ```bash
   docker-compose run --rm collector npx tsx /app/collector/index.ts
   ```

3. **Verify network connectivity from container:**
   ```bash
   docker-compose exec collector curl -I https://relay.nostr.band
   ```

### Out of Disk Space

Docker images can accumulate. Clean up:

```bash
# Remove unused images
docker image prune -a

# Remove all stopped containers
docker container prune

# Remove everything unused
docker system prune -a
```

### Logs Growing Too Large

Logs are automatically rotated (max 10MB per file, 3 files kept).

To clear logs manually:
```bash
docker-compose down
rm -f $(docker inspect --format='{{.LogPath}}' rektbot-collector)
docker-compose up -d
```

## Advanced Usage

### Run in Specific Network

If you have other Docker services:

```yaml
services:
  collector:
    # ... existing config
    networks:
      - rektbot-network

networks:
  rektbot-network:
    driver: bridge
```

### Custom Logging Configuration

Edit `docker-compose.yml`:

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "50m"    # Increase log file size
    max-file: "5"      # Keep more log files
    compress: "true"   # Compress rotated logs
```

### Health Checks

Add health check to `docker-compose.yml`:

```yaml
services:
  collector:
    # ... existing config
    healthcheck:
      test: ["CMD", "test", "-f", "/tmp/healthy"]
      interval: 5m
      timeout: 10s
      retries: 3
```

Then modify `run-loop.sh` to touch `/tmp/healthy` after successful runs.

## Automatic Startup

### Start on Boot (Docker Desktop)

Docker Desktop settings:
- Open Docker Desktop
- Preferences → General
- Enable "Start Docker Desktop when you log in"

The container will auto-start because of `restart: unless-stopped` in docker-compose.yml.

### Verify Auto-Start Works

```bash
# Stop container
docker-compose down

# Restart Docker Desktop
# (Close and reopen Docker Desktop app)

# Wait 30 seconds, then check
docker-compose ps
```

Should show the container running automatically.

## Comparison with Other Approaches

| Approach | Pros | Cons |
|----------|------|------|
| **Docker (this guide)** | Isolated, portable, auto-restart | Requires Docker Desktop running |
| **Cron** | Native, no dependencies | Harder to debug, logs scattered |
| **LaunchAgent** | macOS native, auto-start | macOS-specific, complex plist |
| **Google Cloud Run** | Fully managed, free tier | Network restrictions block Nostr |
| **GitHub Actions** | Fully managed, free | Network restrictions block Nostr |

## Expected Behavior

Once running:

1. **Immediate**: Container starts and runs first collection
2. **Every 20 minutes**: Collector fetches events from last 7 days
3. **Continuous**: Runs indefinitely until stopped
4. **Auto-recovery**: Restarts automatically if it crashes
5. **Data in InfluxDB**: Within seconds of each run
6. **Frontend updated**: Dashboard shows new data immediately

## Stop Everything

```bash
# Stop collector
docker-compose down

# Stop Docker Desktop
# (Quit Docker Desktop app)
```

## Cost

**$0.00** - Everything runs locally for free!

## Next Steps

1. Start the collector: `docker-compose up -d`
2. Watch logs: `docker-compose logs -f collector`
3. Verify data appears in dashboard: https://k9ert.github.io/rektBotStats/
4. Let it run continuously!
