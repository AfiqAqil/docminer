.PHONY: dev dev-api dev-web test lint format codegen setup

dev:
	start "dev-api" cmd /c "$(MAKE)" dev-api
	"$(MAKE)" dev-web

dev-api:
	uv run uvicorn docminer_api.app:app --reload --port 8000

dev-web:
	cd frontend && pnpm dev

test:
	uv run pytest backend/tests -v

lint:
	uv run ruff check backend/
	cd frontend && pnpm biome check src/

format:
	uv run ruff format backend/
	uv run ruff check backend/ --fix
	cd frontend && pnpm biome format src/ --write

codegen:
	cd frontend && pnpm openapi-typescript-codegen generate -i http://localhost:8000/openapi.json -o src/lib/api/generated --client fetch

setup:
	uv sync
	cd frontend && pnpm install
