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

## Workflow (Tiered)

**Always ask which tier applies before starting. Recommend the appropriate tier but let the user decide.**

### Tier 1 — Large Features
New modules, new pages, architectural changes.

1. **Brainstorm** — skill: `brainstorming` → design doc in `docs/plans/`
2. **Write plan** — skill: `writing-plans` → implementation plan
3. **Execute** — skill: `executing-plans` or `subagent-driven-development` (ask user preference)
4. **Frontend work** — skill: `frontend-design` for any UI tasks during execution
5. **Review** — skill: `requesting-code-review`
6. **Finish** — skill: `finishing-a-development-branch`

### Tier 2 — Small Features / Enhancements
New endpoint, new component, small additions.

1. **Plan** — write plan in plan mode (no design doc)
2. **Execute** — TDD (skill: `test-driven-development`)
3. **Frontend work** — skill: `frontend-design` for any UI tasks
4. **Commit and PR**

### Tier 3 — Bug Fixes
1. **Debug** — skill: `systematic-debugging`
2. **Fix** — TDD (write regression test, then fix)
3. **Commit and PR**

### Always
- Use skill: `verification-before-completion` before claiming work is done
- Use skill: `simplify` after implementation to review for quality

## Available Skills

| Skill | When to use |
|---|---|
| `brainstorming` | Any creative work — new features, modules, architectural changes. Explores intent and design before code. |
| `writing-plans` | After brainstorming or when you have a spec. Creates bite-sized implementation plan with TDD. |
| `executing-plans` | Execute an implementation plan in a separate session with review checkpoints. |
| `subagent-driven-development` | Execute plans with independent tasks using parallel subagents in current session. |
| `frontend-design` | Any UI work — pages, components, layouts. Produces distinctive, polished interfaces. |
| `test-driven-development` | Any implementation. Write failing test first, then implement. |
| `systematic-debugging` | Any bug, test failure, or unexpected behavior. Diagnose before fixing. |
| `requesting-code-review` | After completing features. Verify work meets requirements. |
| `receiving-code-review` | When processing review feedback. Don't blindly agree — verify suggestions. |
| `verification-before-completion` | Before claiming work is done. Run tests, check output, evidence before assertions. |
| `simplify` | After implementation. Review for reuse, quality, efficiency. |
| `finishing-a-development-branch` | When implementation is complete. Guides merge, PR, or cleanup. |
| `dispatching-parallel-agents` | When facing 2+ independent tasks with no shared state. |
| `using-git-worktrees` | When starting feature work that needs isolation from current workspace. |

## Testing

- **TDD always.** Write failing test first, then implement.
- **Core:** pytest. Mock litellm responses — don't call real LLMs in tests.
- **API:** pytest + FastAPI `TestClient`. In-memory SQLite for test DB.
- **Frontend:** Deferred (Playwright e2e later).
- Run `make test` before every commit.

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
