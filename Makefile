# Makefile - Common development commands for GigShield (local only)
# Usage: make <target>   e.g.  make up   make test   make lint

.PHONY: up down build restart logs migrate seed test lint fmt clean

## Start all services in local dev mode (Windows launcher)
up:
start_all.bat

## Alias for local startup
up-d:
start_all.bat dev

## Local mode stop instruction
down:
@echo "Stop services from each opened terminal window with Ctrl+C."

## Local mode has no image build step
build:
@echo "No container build step in local-only mode."

## Restart hint for local mode
restart:
@echo "Restart the service manually in its terminal window."

## Logs are printed in each service terminal window
logs:
@echo "Use the individual terminal windows opened by start_all.bat."

## Run DB migrations for all services (local python env per service)
migrate:
@for svc in identity-service insurance-core intelligence-service platform-service api-gateway; do \
echo "Running migrations for $$svc"; \
(cd services/$$svc && python -m alembic upgrade head) || exit 1; \
done

## Seed the database with reference data (requires local psql)
seed:
psql -U gigshield -d gigshield -f schema/run_all.sql

## Run tests for each local service
test:
@for svc in identity-service insurance-core intelligence-service platform-service api-gateway; do \
echo "Testing $$svc"; \
(cd services/$$svc && python -m pytest tests/ -v --tb=short) || exit 1; \
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
@echo "No container cleanup required in local-only mode."
