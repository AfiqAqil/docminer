.PHONY: dev dev-api dev-web test lint format codegen setup

dev:
	$(MAKE) dev-api & $(MAKE) dev-web

dev-api:
	uv run uvicorn docminer_api.app:app --reload --port 8000

dev-web:
	cd packages/web && pnpm dev

test:
	uv run pytest packages/core/tests packages/api/tests -v

lint:
	uv run ruff check packages/
	cd packages/web && pnpm biome check src/

format:
	uv run ruff format packages/
	uv run ruff check packages/ --fix
	cd packages/web && pnpm biome format src/ --write

codegen:
	cd packages/web && pnpm openapi-typescript-codegen generate -i http://localhost:8000/openapi.json -o src/lib/api/generated --client fetch

setup:
	uv sync
	cd packages/web && pnpm install
