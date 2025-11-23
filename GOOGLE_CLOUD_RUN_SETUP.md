# Google Cloud Run Collector Setup Guide

This guide shows you how to deploy the Nostr collector to Google Cloud Run as a scheduled job.

## Why Google Cloud Run?

- **100% Free** for this use case (well within free tier limits)
- Automatic scaling and job management
- Built-in logging and monitoring
- No server maintenance required

## Prerequisites

1. **Google Cloud Account** - Sign up at https://cloud.google.com/
2. **Google Cloud SDK (gcloud)** - Install from https://cloud.google.com/sdk/docs/install
3. **Docker** - Install from https://docs.docker.com/get-docker/
4. **InfluxDB credentials** - You already have these

## Setup Steps

### 1. Create a Google Cloud Project

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project (or use existing)
gcloud projects create rektbot-stats --name="RektBot Statistics"

# Set as default project
gcloud config set project rektbot-stats

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable cloudscheduler.googleapis.com
```

### 2. Set Environment Variables

Create a `.env.gcp` file with your InfluxDB credentials:

```bash
# Copy from your .env file
export INFLUX_URL="https://us-east-1-1.aws.cloud2.influxdata.com"
export INFLUX_TOKEN="your-write-token-here"
export INFLUX_ORG="rektBotStats"
export GOOGLE_CLOUD_PROJECT="rektbot-stats"
export GOOGLE_CLOUD_REGION="us-central1"
```

Then load them:

```bash
source .env.gcp
```

### 3. Configure Docker for Google Container Registry

```bash
# Authenticate Docker with Google Cloud
gcloud auth configure-docker
```

### 4. Deploy the Collector

Make the deployment script executable and run it:

```bash
chmod +x deploy-collector-gcp.sh
./deploy-collector-gcp.sh
```

The script will:
1. Build the Docker image
2. Push it to Google Container Registry
3. Create a Cloud Run job
4. Set up a Cloud Scheduler to run it every 20 minutes

### 5. Verify Deployment

Test the job manually:

```bash
gcloud run jobs execute rektbot-collector \
  --region us-central1
```

View the logs:

```bash
gcloud logging read \
  "resource.type=cloud_run_job AND resource.labels.job_name=rektbot-collector" \
  --limit 50 \
  --format json
```

Or use the Cloud Console:
https://console.cloud.google.com/run/jobs

## Manual Deployment (Alternative)

If you prefer to deploy manually:

### Build and Push Image

```bash
# Set variables
PROJECT_ID="rektbot-stats"
IMAGE_NAME="gcr.io/${PROJECT_ID}/rektbot-collector"

# Build
docker build -f Dockerfile.collector -t ${IMAGE_NAME}:latest .

# Push
docker push ${IMAGE_NAME}:latest
```

### Create Cloud Run Job

```bash
gcloud run jobs create rektbot-collector \
  --image gcr.io/rektbot-stats/rektbot-collector:latest \
  --region us-central1 \
  --task-timeout 15m \
  --max-retries 3 \
  --set-env-vars "INFLUX_URL=${INFLUX_URL}" \
  --set-env-vars "INFLUX_TOKEN=${INFLUX_TOKEN}" \
  --set-env-vars "INFLUX_ORG=${INFLUX_ORG}" \
  --set-env-vars "INFLUX_BUCKET_LONGS=rektBot_longs" \
  --set-env-vars "INFLUX_BUCKET_SHORTS=rektBot_shorts"
```

### Create Scheduler

```bash
gcloud scheduler jobs create http rektbot-collector-scheduler \
  --location us-central1 \
  --schedule "*/20 * * * *" \
  --uri "https://us-central1-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/rektbot-stats/jobs/rektbot-collector:run" \
  --http-method POST \
  --oauth-service-account-email "rektbot-stats@appspot.gserviceaccount.com"
```

## Monitoring

### View Logs

Cloud Console:
https://console.cloud.google.com/logs/query

Or via CLI:

```bash
# Recent logs
gcloud logging read \
  "resource.type=cloud_run_job" \
  --limit 100 \
  --format "table(timestamp,textPayload)"

# Follow logs in real-time
gcloud logging tail \
  "resource.type=cloud_run_job"
```

### Check Job History

```bash
# List executions
gcloud run jobs executions list \
  --job rektbot-collector \
  --region us-central1

# Describe specific execution
gcloud run jobs executions describe EXECUTION_NAME \
  --region us-central1
```

### Monitor Scheduler

```bash
# List scheduled jobs
gcloud scheduler jobs list --location us-central1

# View scheduler logs
gcloud logging read \
  "resource.type=cloud_scheduler_job" \
  --limit 50
```

## Cost Estimate

With the free tier:
- **Cloud Run**: 180,000 vCPU-seconds/month (you'll use ~2,160)
- **Cloud Scheduler**: 3 free jobs/month (you'll use 1)
- **Container Registry**: 5 GB free storage
- **Logging**: 50 GB/month free

**Expected cost: $0.00/month** ✅

## Updating the Collector

When you make changes to the collector code:

```bash
# Simply run the deployment script again
./deploy-collector-gcp.sh
```

Or manually:

```bash
# Rebuild and push image
docker build -f Dockerfile.collector -t gcr.io/rektbot-stats/rektbot-collector:latest .
docker push gcr.io/rektbot-stats/rektbot-collector:latest

# Update job
gcloud run jobs update rektbot-collector \
  --image gcr.io/rektbot-stats/rektbot-collector:latest \
  --region us-central1
```

## Troubleshooting

### "Permission denied" errors

Enable required APIs:

```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable cloudscheduler.googleapis.com
```

### Job fails immediately

Check environment variables are set correctly:

```bash
gcloud run jobs describe rektbot-collector \
  --region us-central1 \
  --format "value(template.template.containers[0].env)"
```

### No data in InfluxDB

1. Check the job logs for errors
2. Verify InfluxDB token has write permissions
3. Test collector locally first with `./run-collector.sh`

### Scheduler not triggering

Verify scheduler is created and enabled:

```bash
gcloud scheduler jobs describe rektbot-collector-scheduler \
  --location us-central1
```

## Cleanup

To remove everything:

```bash
# Delete scheduler
gcloud scheduler jobs delete rektbot-collector-scheduler \
  --location us-central1 \
  --quiet

# Delete Cloud Run job
gcloud run jobs delete rektbot-collector \
  --region us-central1 \
  --quiet

# Delete images (optional)
gcloud container images delete gcr.io/rektbot-stats/rektbot-collector:latest \
  --quiet
```

## Additional Resources

- [Cloud Run Jobs Documentation](https://cloud.google.com/run/docs/create-jobs)
- [Cloud Scheduler Documentation](https://cloud.google.com/scheduler/docs)
- [Cloud Run Pricing](https://cloud.google.com/run/pricing)
