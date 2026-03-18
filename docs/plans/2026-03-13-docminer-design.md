# Docminer Design Document

**Date:** 2026-03-13
**Status:** Approved

## Overview

Web app for schema-driven document extraction. Messy document (PDF/DOCX/image) + Pydantic schema in, clean structured JSON out.

Uses [Docling](https://github.com/DS4SD/docling) (IBM) for document-to-markdown conversion, then LLMs for schema-driven extraction from the parsed text. Docling runs locally with no API cost; the LLM only processes text, not images.

Based on "Page" — a production system built at MindHive deployed across education, logistics, and F&B.

> **Architecture decision (2026-03-17):** After researching the extraction landscape (see `docs/research/2026-03-17-extraction-landscape.md`), we chose Docling as the document processing layer + our own LLM extraction logic. LangExtract was considered but rejected due to incompatible schema model (few-shot examples vs our Pydantic approach). Zerox was considered but rejected — same stack as ours (litellm + pdf2image), doesn't add enough value as a dependency.

## Tech Stack

| Component | Choice |
|---|---|
| Package manager | uv |
| Python version | 3.12+ |
| Schema format | Pydantic models (with `from_dict()` utility) |
| Document processing | Docling (PDF, DOCX, PPTX, XLSX, HTML, images -> markdown) |
| LLM integration | litellm (Ollama for local dev) |
| Extraction mode | Text LLM (markdown input from Docling, not vision) |
| Testing | pytest |
| Backend framework | FastAPI |
| ORM | SQLModel |
| Database | SQLite |
| Frontend | Next.js (App Router) |
| Frontend styling | Tailwind CSS + shadcn/ui |
| API communication | REST + OpenAPI codegen (typed TS client) |
| Python linting | Ruff |
| TS linting | Biome |
| Frontend package manager | pnpm |

## Project Structure

> **Refactored (2026-03-19):** Simplified from three-package monorepo to flat `backend/` + `frontend/` layout. Core library merged into backend as `app.extraction` module. Removed `src/` nesting.

```
docminer/
├── backend/
│   ├── pyproject.toml
│   ├── app/                         # Python package
│   │   ├── main.py                  # FastAPI app factory
│   │   ├── config.py                # Pydantic Settings
│   │   ├── database.py              # SQLite connection/session
│   │   ├── models/                  # SQLModel tables
│   │   │   ├── document.py
│   │   │   ├── schema.py
│   │   │   └── extraction.py
│   │   ├── routes/                  # API endpoints
│   │   │   ├── documents.py
│   │   │   ├── schemas.py
│   │   │   └── extract.py
│   │   ├── services/                # Business logic
│   │   │   └── extraction_service.py
│   │   └── extraction/              # Core extraction engine
│   │       ├── extractor.py
│   │       ├── llm.py
│   │       ├── schema.py
│   │       ├── result.py
│   │       └── exceptions.py
│   └── tests/
│       ├── test_api/
│       └── test_extraction/
│
├── frontend/                        # Next.js
│   ├── package.json
│   └── src/
│       ├── app/
│       ├── components/
│       └── lib/api/
│
├── pyproject.toml                   # uv workspace root
├── uv.lock
└── README.md
```

- **uv** at the root points to `backend/` as a workspace member.
- **pnpm** manages the Next.js frontend separately.
- Extraction engine lives inside the backend — no separate library package.

## Extraction Engine

The extraction engine lives in `backend/app/extraction/` and provides the core document-to-JSON pipeline.

### Key decisions

- **Docling preprocessing** — Documents are first converted to markdown by Docling (runs locally, no API cost). The LLM receives structured text, not raw images. This supports PDF, DOCX, PPTX, XLSX, HTML, and images.
- **`model` param** uses litellm's model string format (e.g. `"ollama/llama3.2"`, `"gpt-4o"`). Vision models are no longer required since Docling handles the visual parsing.
- **`extract()` accepts `str | Path | bytes`** — file paths or in-memory data. Docling detects file type and converts to markdown.
- **Validation is automatic** — LLM response parsed and validated against schema. On validation failure, retries once with the error fed back to the LLM. Raises `ExtractionError` if retry also fails.
- **Schema utility** — `from_dict()` creates dynamic Pydantic models from plain dicts, used by the API to convert user-defined schemas into extraction targets.

## FastAPI Backend

### Data Models

```python
class Document(SQLModel, table=True):
    id: int | None = None
    filename: str
    content_type: str       # "application/pdf", "image/png", etc.
    file_path: str          # path on disk
    uploaded_at: datetime

class Schema(SQLModel, table=True):
    id: int | None = None
    name: str
    definition: str         # JSON-serialized Pydantic model definition
    created_at: datetime

class ExtractionJob(SQLModel, table=True):
    id: int | None = None
    document_id: int
    schema_id: int
    status: str             # "pending", "processing", "completed", "failed"
    result: str | None      # JSON-serialized extraction result
    error: str | None
    created_at: datetime
    completed_at: datetime | None
```

### Endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/documents/upload` | Upload document, store to disk |
| `GET` | `/documents` | List all uploaded documents |
| `POST` | `/schemas` | Create a named schema from JSON definition |
| `GET` | `/schemas` | List all saved schemas |
| `POST` | `/extract` | Start extraction (document_id + schema_id) |
| `GET` | `/extract/{job_id}` | Poll job status and result |
| `GET` | `/extract/{job_id}/stream` | SSE for real-time progress |

### Flow

1. User uploads a document -> stored on disk, metadata in SQLite
2. User creates/selects a schema -> stored in SQLite
3. User triggers extraction -> creates ExtractionJob, runs `Extractor.extract()` in background task
4. Frontend polls or subscribes via SSE -> gets result when complete

### Key decisions

- **Background tasks** for extraction (FastAPI BackgroundTasks for MVP).
- **Local file storage** in `data/uploads/`. Abstract for cloud later if needed.
- **SSE for progress** — lightweight, no WebSocket complexity.

## Next.js Frontend

### Pages

| Route | Purpose |
|---|---|
| `/` | Dashboard — recent extractions, quick stats |
| `/extract` | Main workflow — upload, pick schema, extract, view results |
| `/documents` | Document library — browse/manage uploads |
| `/schemas` | Schema manager — create, edit, delete schemas |

### Core Workflow (`/extract`)

1. **Upload or select document** — drag-and-drop or pick from library, with document preview.
2. **Select or create schema** — pick saved schema or define inline with JSON editor.
3. **Extract** — trigger extraction, see loading state with SSE progress.
4. **Results** — side-by-side: document on left, extracted JSON on right. Copy/download JSON.

### Tech within Next.js

- App Router (Next.js 15+)
- Tailwind CSS + shadcn/ui for components
- openapi-typescript-codegen for typed API client
- react-pdf or PDF.js for document preview

## Development & Tooling

### Dev workflow

- `make dev` — starts FastAPI + Next.js dev servers
- `make test` — runs pytest on backend tests
- `make codegen` — regenerates TypeScript API client from OpenAPI spec

### Linting & formatting

- Python: Ruff (replaces black, isort, flake8)
- TypeScript: Biome (replaces ESLint + Prettier)

### Testing strategy

- **Extraction** — unit tests with pytest. Mock litellm responses. Test schema generation, validation, retry logic.
- **API** — integration tests with pytest + FastAPI TestClient. In-memory SQLite.
- **Frontend** — deferred. Playwright e2e tests later if needed.

### Configuration

- Extractor: constructor args (`Extractor(model=..., temperature=...)`)
- API: environment variables via Pydantic Settings:
  - `DOCMINER_MODEL` — default LLM model string
  - `DOCMINER_DB_URL` — SQLite path (default: `data/docminer.db`)
  - `DOCMINER_UPLOAD_DIR` — file storage path (default: `data/uploads/`)

## MVP Build Order

1. Schema utilities (Pydantic model, `from_dict()`)
2. LLM extraction via litellm
3. Wire into Extractor class
4. FastAPI backend (models, endpoints, file storage)
5. Next.js frontend (upload, schema, extract, results)
6. OpenAPI codegen integration
7. README + examples
