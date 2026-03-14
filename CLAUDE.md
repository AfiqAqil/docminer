# CLAUDE.md

## Project

**docminer** — Schema-driven document extraction from images/PDFs using multimodal LLMs.

Monorepo with three packages:
- `packages/core` — Python library (`pip install docminer`). Zero web deps.
- `packages/api` — FastAPI backend. Depends on core.
- `packages/web` — Next.js frontend. Consumes API via typed OpenAPI client.

## Tech Stack

- **Python 3.12+**, **uv** (workspaces), **Pydantic**, **litellm**
- **FastAPI**, **SQLModel**, **SQLite**
- **Next.js 15** (App Router), **Tailwind CSS**, **shadcn/ui**, **pnpm**
- **Ruff** (Python lint/format), **Biome** (TS lint/format)

## Commands

```bash
make dev          # Start API (port 8000) + frontend (port 3000)
make dev-api      # FastAPI only
make dev-web      # Next.js only
make test         # Run all Python tests
make lint         # Ruff + Biome check
make format       # Ruff + Biome format
make codegen      # Regenerate TS API client from OpenAPI spec
uv run pytest packages/core/tests -v          # Core tests only
uv run pytest packages/api/tests -v           # API tests only
uv run pytest path/to/test.py::test_name -v   # Single test
uv sync           # Sync Python dependencies
cd packages/web && pnpm install               # Sync frontend dependencies
```

## Code Conventions

- **Python:** Ruff enforced. Type hints required on all public APIs. Use `from __future__ import annotations` if needed.
- **TypeScript:** Biome enforced. Strict mode.
- **Imports:** Ruff handles sorting (isort rules). Biome handles TS imports.
- **No unnecessary changes:** Don't add docstrings, comments, or type annotations to code you didn't modify.

## Commit Convention

Conventional Commits. Format: `type(scope): description`

| Type | When |
|---|---|
| `feat(core)` | New feature in core library |
| `feat(api)` | New feature in API |
| `feat(web)` | New feature in frontend |
| `fix(scope)` | Bug fix |
| `test(scope)` | Adding/updating tests |
| `chore` | Tooling, config, deps |
| `docs` | Documentation only |

Examples:
- `feat(core): add schema validation retry logic`
- `fix(api): handle missing document file on extraction`
- `chore: configure Ruff and Biome`

## Branching

**GitHub Flow.** `main` is always deployable.

- Branch off `main` for all work
- Branch naming: `feat/<name>`, `fix/<name>`, `chore/<name>`
- PR to merge back into `main`
- No broken commits on `main`

## Workflow

ECC skills are installed and auto-trigger. Tiers:
- **Large feature:** brainstorm → plan → execute → review → finish
- **Small feature:** plan → TDD → commit
- **Bug fix:** debug → TDD → commit
- **Always:** `verification-before-completion` before done, `simplify` after implementation

## Testing

- **TDD always.** Write failing test first, then implement.
- **Core:** pytest. Mock litellm responses — don't call real LLMs in tests.
- **API:** pytest + FastAPI `TestClient`. In-memory SQLite for test DB.
- **Frontend:** Deferred (Playwright e2e later).
- Run `make test` before every commit.

## Shell Commands

- **No compound commands:** Don't use `cd /path && command`. The working directory is always the repo root — run commands directly (e.g., `git log --oneline -10`, not `cd /repo && git log --oneline -10`).
- **No `$()` substitution in commit messages:** Claude Code flags `$()` command substitution as a potential injection risk even with broad permissions. Pass commit messages directly: `git commit -m "type(scope): description"` — no heredoc needed.

## Gotchas

- **litellm model strings** are provider-prefixed: `ollama/llama3.2-vision`, not `llama3.2-vision`
- **SQLModel `Schema` table** may conflict with SQLAlchemy internals — use explicit `__tablename__` if issues arise
- **uv workspace:** always run `uv run` commands from repo root, not from package dirs
- **OpenAPI codegen:** API server must be running for `make codegen` to fetch the spec
- **pnpm** is not installed globally by default — run `npm install -g pnpm` on fresh setup

## Key Files

- `docs/plans/2026-03-13-docminer-design.md` — approved design document
- `docs/ROADMAP.md` — project roadmap and milestones
- `project.md` — original project spec and motivation
