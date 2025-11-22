# GitHub Pages Setup Guide

## Overview

This project deploys to GitHub Pages with:
- **Frontend**: Static React app at https://k9ert.github.io/rektBotStats
- **Collector**: GitHub Actions workflow (runs every 20 min)
- **Database**: InfluxDB Cloud

## Setup Steps

### 1. Create Read-Only Token (Frontend)

Create a read-only InfluxDB token for the frontend:

1. Go to https://cloud2.influxdata.com/ → Load Data → API Tokens
2. Click "Generate API Token" → "Custom API Token"
3. Name: "Frontend Read-Only"
4. Permissions:
   - Read: `rektBot_longs` bucket
   - Read: `rektBot_shorts` bucket
5. Copy the token

### 2. Configure GitHub Repository Secrets

Go to https://github.com/k9ert/rektBotStats/settings/secrets/actions

Add these secrets:

**Collector (write access):**
- `INFLUX_URL` = `https://us-east-1-1.aws.cloud2.influxdata.com`
- `INFLUX_TOKEN` = Your write token (All Access token)
- `INFLUX_ORG` = `rektBotStats`

**Frontend (read-only):**
- `VITE_INFLUX_URL` = `https://us-east-1-1.aws.cloud2.influxdata.com`
- `VITE_INFLUX_TOKEN` = Your read-only token (from step 1)
- `VITE_INFLUX_ORG` = `rektBotStats`

### 3. Enable GitHub Pages

1. Go to https://github.com/k9ert/rektBotStats/settings/pages
2. Source: "GitHub Actions"
3. Save

### 4. Configure InfluxDB CORS

1. Go to https://cloud2.influxdata.com/ → Settings → CORS
2. Add allowed origin:
   ```
   https://k9ert.github.io
   ```
3. Save

### 5. Deploy

Push to main branch or manually trigger workflows:

**Deploy Frontend:**
```bash
git add .
git commit -m "Setup GitHub Pages deployment"
git push origin main
```

**Manually trigger workflows:**
- Deploy: https://github.com/k9ert/rektBotStats/actions/workflows/deploy.yml
- Collector: https://github.com/k9ert/rektBotStats/actions/workflows/collector.yml

### 6. Verify

- Frontend: https://k9ert.github.io/rektBotStats
- Check collector logs: https://github.com/k9ert/rektBotStats/actions/workflows/collector.yml

## Workflows

### Deploy Workflow (`.github/workflows/deploy.yml`)
- Triggers: Push to main, manual
- Builds React app
- Deploys to GitHub Pages
- URL: https://k9ert.github.io/rektBotStats

### Collector Workflow (`.github/workflows/collector.yml`)
- Triggers: Every 20 minutes, manual
- Fetches Nostr events from rektbot
- Writes to InfluxDB Cloud
- Timeout: 15 minutes

## Troubleshooting

### Frontend shows "connecting" status
- Check CORS settings in InfluxDB Cloud
- Verify `VITE_INFLUX_TOKEN` has read access to both buckets
- Check browser console for errors

### Collector failing
- Check GitHub Actions logs
- Verify `INFLUX_TOKEN` has write access
- Ensure secrets are set correctly

### Build failing
- Check all `VITE_*` secrets are set
- Verify token format (no extra spaces)

## Local Development

```bash
# Install dependencies
npm install

# Run collector locally
./run-collector.sh

# Run frontend dev server
npm run dev
```

Visit http://localhost:5001

## Architecture

```
┌─────────────────────────────────────────┐
│  GitHub Actions (Every 20 min)         │
│  ┌───────────────────────────────────┐ │
│  │  Nostr Collector                  │ │
│  │  - Fetches events from relays     │ │
│  │  - Writes to InfluxDB Cloud       │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
                    │
                    ▼
        ┌──────────────────────┐
        │  InfluxDB Cloud      │
        │  - rektBot_longs     │
        │  - rektBot_shorts    │
        └──────────────────────┘
                    ▲
                    │
        ┌──────────────────────┐
        │  GitHub Pages        │
        │  - Static React app  │
        │  - Direct queries    │
        └──────────────────────┘
                    ▲
                    │
              Browser (User)
```
