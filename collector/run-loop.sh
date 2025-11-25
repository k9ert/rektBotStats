#!/bin/bash

# Default to 20 minutes if not set
INTERVAL_MINUTES=${COLLECTION_INTERVAL_MINUTES:-20}
INTERVAL_SECONDS=$((INTERVAL_MINUTES * 60))

echo "Starting collector loop (running every ${INTERVAL_MINUTES} minutes)"

while true; do
  echo "----------------------------------------"
  echo "Running collector at $(date)"
  echo "----------------------------------------"

  npx tsx /app/collector/index.ts

  EXIT_CODE=$?
  if [ $EXIT_CODE -ne 0 ]; then
    echo "ERROR: Collector failed with exit code $EXIT_CODE"
  else
    echo "✓ Collector completed successfully"
  fi

  echo "Next run in ${INTERVAL_MINUTES} minutes (at $(date -d "+${INTERVAL_MINUTES} minutes" 2>/dev/null || date -v +${INTERVAL_MINUTES}M))"
  sleep $INTERVAL_SECONDS
done
