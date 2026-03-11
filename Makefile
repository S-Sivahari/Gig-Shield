# Makefile – Common development commands for GigShield
# Usage: make <target>   e.g.  make up   make test   make lint

.PHONY: up down build restart logs migrate seed test lint fmt clean

## Start all services (build if needed)
up:
docker compose up --build

## Start in detached mode
up-d:
docker compose up --build -d

## Stop all services
down:
docker compose down

## Rebuild all Docker images
build:
docker compose build --no-cache

## Restart a specific service  e.g.  make restart s=auth-service
restart:
docker compose restart $(s)

## Tail logs of all services
logs:
docker compose logs -f

## Run DB migrations for all services
migrate:
@for svc in auth-service policy-service claims-service payout-service fraud-service risk-engine disruption-monitor notification-service analytics-service; do \
echo "Running migrations for $$svc"; \
docker compose exec $$svc alembic upgrade head; \
done

## Seed the database with reference data
seed:
docker compose exec postgres psql -U gigshield -d gigshield -f /seeds/reference_data.sql

## Run all tests
test:
@for svc in auth-service policy-service claims-service payout-service fraud-service risk-engine disruption-monitor notification-service analytics-service; do \
echo "Testing $$svc"; \
docker compose exec $$svc pytest tests/ -v --tb=short; \
done

## Lint Python code (black + isort + flake8)
lint:
black --check services/
isort --check-only services/
flake8 services/

## Auto-format Python code
fmt:
black services/
isort services/

## Remove stopped containers and dangling images
clean:
docker compose down --remove-orphans
docker image prune -f
