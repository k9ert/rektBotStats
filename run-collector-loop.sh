#!/bin/bash

# Run collector in a loop every 20 minutes
# This script runs the collector locally (not in Docker)

set -a
source .env
set +a

INTERVAL_MINUTES=20
INTERVAL_SECONDS=$((INTERVAL_MINUTES * 60))

echo "Starting collector loop (running every ${INTERVAL_MINUTES} minutes)"
echo "Press Ctrl+C to stop"
echo ""

while true; do
  echo "========================================"
  echo "Running collector at $(date)"
  echo "========================================"

  npm run collector

  EXIT_CODE=$?
  if [ $EXIT_CODE -ne 0 ]; then
    echo "ERROR: Collector failed with exit code $EXIT_CODE"
  else
    echo "✓ Collector completed successfully"
  fi

  NEXT_RUN=$(date -v +${INTERVAL_MINUTES}M +"%Y-%m-%d %H:%M:%S" 2>/dev/null || date -d "+${INTERVAL_MINUTES} minutes" +"%Y-%m-%d %H:%M:%S")
  echo "Next run at $NEXT_RUN"
  echo ""

  sleep $INTERVAL_SECONDS
done
