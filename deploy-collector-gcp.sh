#!/bin/bash

# Google Cloud Run Collector Deployment Script
# This script deploys the Nostr collector as a Cloud Run job

set -e

# Configuration
PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-your-project-id}"
REGION="${GOOGLE_CLOUD_REGION:-us-central1}"
JOB_NAME="rektbot-collector"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${JOB_NAME}"

echo "Deploying Nostr Collector to Google Cloud Run"
echo "Project: ${PROJECT_ID}"
echo "Region: ${REGION}"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "Error: gcloud CLI is not installed"
    echo "Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Build and push the Docker image
echo "Building Docker image..."
docker build -f Dockerfile.collector -t ${IMAGE_NAME}:latest .

echo "Pushing image to Google Container Registry..."
docker push ${IMAGE_NAME}:latest

# Deploy Cloud Run job
echo "Deploying Cloud Run job..."
gcloud run jobs create ${JOB_NAME} \
  --image ${IMAGE_NAME}:latest \
  --region ${REGION} \
  --project ${PROJECT_ID} \
  --task-timeout 15m \
  --max-retries 3 \
  --set-env-vars "INFLUX_URL=${INFLUX_URL}" \
  --set-env-vars "INFLUX_TOKEN=${INFLUX_TOKEN}" \
  --set-env-vars "INFLUX_ORG=${INFLUX_ORG}" \
  --set-env-vars "INFLUX_BUCKET_LONGS=rektBot_longs" \
  --set-env-vars "INFLUX_BUCKET_SHORTS=rektBot_shorts" \
  || gcloud run jobs update ${JOB_NAME} \
  --image ${IMAGE_NAME}:latest \
  --region ${REGION} \
  --project ${PROJECT_ID}

# Create Cloud Scheduler job to run every 20 minutes
echo "Creating Cloud Scheduler job..."
gcloud scheduler jobs create http ${JOB_NAME}-scheduler \
  --location ${REGION} \
  --schedule "*/20 * * * *" \
  --uri "https://${REGION}-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${PROJECT_ID}/jobs/${JOB_NAME}:run" \
  --http-method POST \
  --oauth-service-account-email "${PROJECT_ID}@appspot.gserviceaccount.com" \
  --project ${PROJECT_ID} \
  || gcloud scheduler jobs update http ${JOB_NAME}-scheduler \
  --location ${REGION} \
  --schedule "*/20 * * * *" \
  --project ${PROJECT_ID}

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Test the job: gcloud run jobs execute ${JOB_NAME} --region ${REGION} --project ${PROJECT_ID}"
echo "2. View logs: gcloud logging read \"resource.type=cloud_run_job AND resource.labels.job_name=${JOB_NAME}\" --limit 50 --project ${PROJECT_ID}"
echo "3. View scheduled jobs: gcloud scheduler jobs list --location ${REGION} --project ${PROJECT_ID}"
