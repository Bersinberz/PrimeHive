#!/bin/bash
# PrimeHive Production Deployment Script
# Usage: ./scripts/deploy.sh [--rollback]

set -euo pipefail

COMPOSE_FILE="docker-compose.yml"
BACKUP_TAG="backup-$(date +%Y%m%d-%H%M%S)"
LOG_FILE="/var/log/primehive-deploy.log"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"; }

# ── Rollback ──────────────────────────────────────────────────────
if [[ "${1:-}" == "--rollback" ]]; then
    log "🔄 Rolling back to previous images..."
    docker-compose -f "$COMPOSE_FILE" down
    docker tag primehive-server:backup primehive-server:latest 2>/dev/null || true
    docker tag primehive-client:backup primehive-client:latest 2>/dev/null || true
    docker-compose -f "$COMPOSE_FILE" up -d
    log "✅ Rollback complete"
    exit 0
fi

# ── Pre-deploy checks ─────────────────────────────────────────────
log "🔍 Running pre-deploy checks..."

if [ ! -f ".env" ]; then
    log "❌ .env file not found. Copy .env.example and fill in values."
    exit 1
fi

if ! docker info > /dev/null 2>&1; then
    log "❌ Docker is not running."
    exit 1
fi

# ── Backup current images ─────────────────────────────────────────
log "💾 Backing up current images..."
docker tag primehive-server:latest primehive-server:backup 2>/dev/null || true
docker tag primehive-client:latest primehive-client:backup 2>/dev/null || true

# ── Pull latest images ────────────────────────────────────────────
log "📦 Pulling latest images..."
docker-compose -f "$COMPOSE_FILE" pull

# ── Run database migrations / health check ────────────────────────
log "🗄️  Checking MongoDB connection..."
docker-compose -f "$COMPOSE_FILE" run --rm server node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => { console.log('DB OK'); process.exit(0); })
  .catch(e => { console.error('DB FAIL', e.message); process.exit(1); });
" || { log "❌ Database connection failed. Aborting."; exit 1; }

# ── Deploy ────────────────────────────────────────────────────────
log "🚀 Deploying PrimeHive..."
docker-compose -f "$COMPOSE_FILE" up -d --remove-orphans

# ── Health check ──────────────────────────────────────────────────
log "🏥 Waiting for services to be healthy..."
sleep 15

MAX_RETRIES=10
RETRY=0
until curl -sf http://localhost/api/v1/health > /dev/null 2>&1; do
    RETRY=$((RETRY + 1))
    if [ $RETRY -ge $MAX_RETRIES ]; then
        log "❌ Health check failed after $MAX_RETRIES attempts. Rolling back..."
        bash "$0" --rollback
        exit 1
    fi
    log "⏳ Waiting... ($RETRY/$MAX_RETRIES)"
    sleep 5
done

# ── Cleanup ───────────────────────────────────────────────────────
log "🧹 Cleaning up old images..."
docker image prune -f

log "✅ Deployment successful! PrimeHive is live."
