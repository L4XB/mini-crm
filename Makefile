.PHONY: build run test clean docs docker docker-compose help

# Standardmäßiges Ziel ist die Hilfe
.DEFAULT_GOAL := help

# Konfigurationsvariablen
BINARY_NAME=mini-crm-api
API_PORT=8081
DB_PORT=5432
DOCKER_IMAGE=mini-crm-api
DOCKER_TAG=latest

# Hilfe
help: ## Zeigt diese Hilfe an
	@echo "Mini CRM Makefile"
	@echo ""
	@echo "Nutzung:"
	@echo "  make [Ziel]"
	@echo ""
	@echo "Ziele:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

# Backend-Ziele
build: ## Baut die Anwendung
	cd backend && go build -o $(BINARY_NAME) ./cmd/main.go

run: ## Startet die Anwendung
	cd backend && go run ./cmd/main.go

run-dev: ## Startet die Anwendung im Entwicklungsmodus mit Hot-Reload
	cd backend && go install github.com/cosmtrek/air@latest && air

test: ## Führt alle Tests aus
	cd backend && go test -v ./...

clean: ## Räumt temporäre Dateien und Build-Artefakte auf
	rm -f backend/$(BINARY_NAME)
	rm -rf backend/tmp

# Dokumentations-Ziele
docs: ## Generiert Swagger-Dokumentation
	cd backend && ~/go/bin/swag init

# Docker-Ziele
docker: ## Baut das Docker-Image
	docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) ./backend

docker-compose: ## Startet die Anwendung mit Docker Compose
	docker-compose up -d

docker-compose-build: ## Baut und startet die Anwendung mit Docker Compose
	docker-compose up -d --build

docker-compose-down: ## Stoppt die Docker-Compose-Umgebung
	docker-compose down

# Datenbank-Ziele
db-init: ## Initialisiert die Datenbank
	docker run --name pg-mini-crm -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=mini_crm -p $(DB_PORT):5432 -d postgres:14-alpine

db-stop: ## Stoppt den Datenbank-Container
	docker stop pg-mini-crm

db-start: ## Startet den Datenbank-Container
	docker start pg-mini-crm

db-remove: ## Entfernt den Datenbank-Container
	docker rm -f pg-mini-crm

# Entwicklungsumgebung
dev-setup: ## Richtet die Entwicklungsumgebung ein
	cd backend && go install github.com/cosmtrek/air@latest
	cd backend && go install github.com/swaggo/swag/cmd/swag@latest
	cd backend && go mod tidy
	cd backend && ~/go/bin/swag init
	cp backend/.env.example backend/.env

# Deployment-Ziele
deploy-prod: ## Deployment in die Produktionsumgebung
	$(MAKE) docker
	$(MAKE) docker-compose-build
