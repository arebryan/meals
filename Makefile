# Thin wrappers around docker compose / npm for local Docker dev.
# Usage: make help

COMPOSE ?= docker compose
APP     ?= app

.DEFAULT_GOAL := help

.PHONY: help run stop down logs migrate seed ps

help: ## Show available targets
	@awk 'BEGIN {FS = ":.*##"; printf "Meals local Docker targets:\n\n"} \
		/^[a-zA-Z0-9_-]+:.*?##/ { printf "  %-12s %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@printf "\nPrimary path: copy .env.example → .env, then make run\n"
	@printf "Migrations run automatically on app start (npm run dev:docker).\n"

run: ## Bring up full stack (compose up --build, foreground)
	$(COMPOSE) up --build

stop: ## Stop running containers (keep volumes)
	$(COMPOSE) stop

down: ## Stop and remove containers/network (volumes kept)
	$(COMPOSE) down

logs: ## Tail compose logs
	$(COMPOSE) logs -f

ps: ## List compose services
	$(COMPOSE) ps

migrate: ## Apply Drizzle migrations inside the app container
	$(COMPOSE) exec $(APP) npm run db:migrate

seed: ## Seed first admin (needs SEED_ADMIN_EMAIL in .env or env)
	$(COMPOSE) exec $(APP) npm run db:seed
