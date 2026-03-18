# CLAUDE.md

## Project

**docminer** — Schema-driven document extraction web app powered by Docling and LLMs.

Two top-level directories:
- `backend/` — FastAPI + extraction engine. Python package: `app`.
- `frontend/` — Next.js UI. Consumes API via typed OpenAPI client.

## Tech Stack

- **Python 3.12+**, **uv**, **Pydantic**, **Docling**, **litellm**
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
uv run pytest backend/tests/test_extraction -v   # Extraction tests only
uv run pytest backend/tests/test_api -v          # API tests only
uv run pytest path/to/test.py::test_name -v      # Single test
uv sync                                          # Sync Python dependencies
cd frontend && pnpm install                      # Sync frontend dependencies
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
| `feat(api)` | New feature in backend |
| `feat(web)` | New feature in frontend |
| `fix(scope)` | Bug fix |
| `test(scope)` | Adding/updating tests |
| `chore` | Tooling, config, deps |
| `docs` | Documentation only |
| `refactor` | Code restructuring |

Examples:
- `feat(api): add schema validation retry logic`
- `fix(api): handle missing document file on extraction`
- `chore: configure Ruff and Biome`

## Branching

**GitHub Flow.** `main` is always deployable.

- Branch off `main` for all work
- Branch naming: `feat/<name>`, `fix/<name>`, `chore/<name>`
- PR to merge back into `main`
- No broken commits on `main`

## Claude Code Modes

| Mode | When | How |
|---|---|---|
| **Normal** | Questions, small single-file edits | Default |
| **Plan mode** | Any multi-step or multi-file work | Use `EnterPlanMode`, present plan, wait for approval, then `ExitPlanMode` |
| **Editing mode** | Implementing an approved plan | Default edit/write tools after plan approval |

## Workflow

Use the correct tier and invoke the matching skills:

| Tier | Skill chain |
|---|---|
| **Large feature** | `superpowers:brainstorming` → `superpowers:writing-plans` → `superpowers:executing-plans` |
| **Small feature** | `superpowers:writing-plans` in Plan mode → TDD → commit |
| **Bug fix** | `superpowers:systematic-debugging` → TDD → commit |

- **Always:** run `superpowers:verification-before-completion` before marking done, `simplify` after implementation
- **Planning:** save plan to `docs/plans/YYYY-MM-DD-<topic>.md` and commit it
- **Tasks:** use `TaskCreate`/`TaskUpdate` to track progress on any multi-step work

## Testing

- **TDD always.** Write failing test first, then implement.
- **Extraction:** pytest. Mock litellm responses — don't call real LLMs in tests.
- **API:** pytest + FastAPI `TestClient`. In-memory SQLite for test DB.
- **Frontend:** Deferred (Playwright e2e later).
- Run `make test` before every commit.

## Shell Commands

- **No compound commands:** Don't use `cd /path && command`. The working directory is always the repo root — run commands directly (e.g., `git log --oneline -10`, not `cd /repo && git log --oneline -10`).
- **No `$()` substitution in commit messages:** Claude Code flags `$()` command substitution as a potential injection risk even with broad permissions. Pass commit messages directly: `git commit -m "type(scope): description"` — no heredoc needed.

## Gotchas

- **Docling** handles document-to-markdown conversion (PDF, DOCX, PPTX, XLSX, HTML, images). LLM receives text, not images.
- **litellm model strings** are provider-prefixed: `ollama/llama3.2-vision`, not `llama3.2-vision`
- **SQLModel `Schema` table** may conflict with SQLAlchemy internals — use explicit `__tablename__` if issues arise
- **uv workspace:** always run `uv run` commands from repo root, not from package dirs
- **OpenAPI codegen:** API server must be running for `make codegen` to fetch the spec
- **pnpm** is not installed globally by default — run `npm install -g pnpm` on fresh setup

## Backend Structure

```
backend/
├── pyproject.toml
├── app/                    # Python package
│   ├── main.py             # FastAPI factory
│   ├── config.py           # Settings
│   ├── database.py         # SQLite session
│   ├── models/             # SQLModel tables (document, schema, extraction)
│   ├── routes/             # API endpoints (documents, schemas, extract)
│   ├── services/           # Business logic (extraction_service)
│   └── extraction/         # Core extraction engine
│       ├── extractor.py    # Docling + LLM orchestration
│       ├── llm.py          # litellm wrapper
│       ├── schema.py       # Pydantic utilities
│       ├── result.py       # ExtractionResult
│       └── exceptions.py   # Custom exceptions
└── tests/
    ├── test_api/           # Integration tests (FastAPI TestClient)
    └── test_extraction/    # Unit tests (extraction engine)
```

## Frontend Conventions

- **Theme:** Dark only. `.dark` class on `<html>`. No light mode toggle.
- **Palette:** Violet accent (`--primary`). Emerald for success. Red for destructive. Neutral for muted/secondary.
- **Components:** Use shadcn/ui components (base-nova style). Never use raw `<input>`, `<select>` — use shadcn `Input`, `Select`.
- **Custom components:** `PageHeader` (title + action), `EmptyState` (icon + title + CTA), `StatusBadge` (extraction status).
- **Icons:** Lucide React. 18px default. Muted foreground default, violet when active.
- **Loading:** Skeleton components, not "Loading..." text.
- **Errors/Success:** Sonner toasts, not inline `<p>` tags.
- **Layout:** Compact sidebar (icons + labels) + main content area with `max-w-6xl`.

## Key Files

- `docs/plans/2026-03-13-docminer-design.md` — approved design document
- `docs/plans/2026-03-16-ui-foundation-design.md` — approved UI foundation design
- `docs/research/2026-03-17-extraction-landscape.md` — extraction library landscape research
- `TODO.md` — feature tracker and project status
