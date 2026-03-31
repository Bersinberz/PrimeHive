.PHONY: help dev prod build push deploy rollback logs clean test

# ── Colors ────────────────────────────────────────────────────────
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RED    := \033[0;31m
NC     := \033[0m

help: ## Show this help
	@echo ""
	@echo "$(GREEN)PrimeHive — Available Commands$(NC)"
	@echo "────────────────────────────────────────"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-18s$(NC) %s\n", $$1, $$2}'
	@echo ""

# ── Development ───────────────────────────────────────────────────
dev: ## Start development environment
	docker-compose -f docker-compose.dev.yml up --build

dev-down: ## Stop development environment
	docker-compose -f docker-compose.dev.yml down

# ── Production ────────────────────────────────────────────────────
prod: ## Start production environment
	docker-compose up -d

prod-down: ## Stop production environment
	docker-compose down

# ── Build ─────────────────────────────────────────────────────────
build: ## Build all Docker images
	docker-compose build --no-cache

build-server: ## Build server image only
	docker build --target production -t primehive-server ./server

build-client: ## Build client image only
	docker build --target production -t primehive-client ./client

# ── Deploy ────────────────────────────────────────────────────────
deploy: ## Deploy to production
	@chmod +x scripts/deploy.sh
	@bash scripts/deploy.sh

rollback: ## Rollback to previous deployment
	@bash scripts/deploy.sh --rollback

# ── Logs ──────────────────────────────────────────────────────────
logs: ## Tail all service logs
	docker-compose logs -f

logs-server: ## Tail server logs
	docker-compose logs -f server

logs-client: ## Tail client logs
	docker-compose logs -f client

logs-nginx: ## Tail nginx logs
	docker-compose logs -f nginx

# ── Tests ─────────────────────────────────────────────────────────
test: ## Run all tests
	cd server && npm test
	cd client && npm test

test-server: ## Run server tests only
	cd server && npm test

test-client: ## Run client tests only
	cd client && npm test

# ── Database ──────────────────────────────────────────────────────
db-shell: ## Open MongoDB shell
	docker-compose exec mongo mongosh -u $$MONGO_ROOT_USER -p $$MONGO_ROOT_PASS primehive

db-backup: ## Backup MongoDB
	@mkdir -p backups
	docker-compose exec mongo mongodump --out /tmp/backup
	docker cp primehive_mongo:/tmp/backup ./backups/backup-$(shell date +%Y%m%d-%H%M%S)
	@echo "$(GREEN)Backup saved to ./backups$(NC)"

# ── Cleanup ───────────────────────────────────────────────────────
clean: ## Remove all containers, images, volumes
	docker-compose down -v --rmi all
	docker system prune -f

clean-images: ## Remove dangling images
	docker image prune -f

# ── Status ────────────────────────────────────────────────────────
status: ## Show running containers
	docker-compose ps

health: ## Check service health
	@curl -sf http://localhost/api/v1/health && echo "$(GREEN)✅ API healthy$(NC)" || echo "$(RED)❌ API unhealthy$(NC)"
