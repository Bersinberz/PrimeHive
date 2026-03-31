# PrimeHive — Deployment Guide

## Prerequisites

- Ubuntu 22.04+ server
- Docker 24+ and Docker Compose v2
- Domain name with DNS pointing to your server
- SSL certificate (Let's Encrypt recommended)

---

## Quick Start

### 1. Clone and configure

```bash
git clone https://github.com/your-username/primehive.git
cd primehive

# Root env (MongoDB + Redis passwords)
cp .env.example .env
nano .env

# Server production env
cp server/.env.production.example server/.env.production
nano server/.env.production
```

### 2. SSL certificates

```bash
sudo certbot certonly --standalone -d yourdomain.com
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem   nginx/ssl/
```

Update `nginx/nginx.conf` — replace `yourdomain.com` with your actual domain.

### 3. Deploy

```bash
make deploy
# or
bash scripts/deploy.sh
```

### 4. Verify

```bash
make health
make status
make logs
```

---

## CI/CD with Jenkins

1. Install Jenkins with Docker and SSH plugins
2. Add credentials:
   - `docker-registry-url` — your registry URL
   - `docker-hub-credentials` — username/password
   - `deploy-host` — server IP
   - `deploy-user` — SSH username
   - `deploy-ssh-key` — SSH private key
   - `vite-api-url` — `https://yourdomain.com/api/v1`
3. Create a Pipeline job pointing to this repo's `Jenkinsfile`

## CI/CD with GitHub Actions

Add these secrets to your GitHub repository:
- `VITE_API_URL` — `https://yourdomain.com/api/v1`
- `DEPLOY_HOST` — server IP
- `DEPLOY_USER` — SSH username
- `DEPLOY_SSH_KEY` — SSH private key

Push to `main` branch to trigger automatic deployment.

---

## Useful Commands

```bash
make help          # Show all commands
make dev           # Start development
make prod          # Start production
make logs          # Tail all logs
make logs-server   # Server logs only
make db-backup     # Backup MongoDB
make rollback      # Rollback to previous version
make clean         # Remove everything
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Min 64 chars random string |
| `CLIENT_URL` | ✅ | Frontend URL for CORS |
| `SMTP_USER` | ✅ | Email sender address |
| `SMTP_PASS` | ✅ | Email app password |
| `CLOUDINARY_*` | ✅ | Image storage credentials |
| `RAZORPAY_KEY_ID` | ✅ | Razorpay live key |
| `RAZORPAY_KEY_SECRET` | ✅ | Razorpay live secret |
| `REDIS_URL` | ⚡ | Redis for session cache |
| `SENTRY_DSN` | 📊 | Error monitoring |

---

## Architecture

```
Internet
    │
    ▼
Nginx (443/80)
    ├── /api/* ──► Node.js Server (5000)
    │                   ├── MongoDB (27017)
    │                   └── Redis   (6379)
    └── /*     ──► React Client (80)
```
