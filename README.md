# docminer

Schema-driven document extraction web app powered by Docling and LLMs. Upload a document, define a schema, get clean structured JSON.

## What is docminer?

docminer is a web app that extracts structured data from documents (invoices, receipts, certificates, shipping docs). It uses [Docling](https://github.com/DS4SD/docling) (IBM) to convert documents into clean markdown, then sends that text to an LLM with a Pydantic schema to extract exactly the fields you need.

Supports PDF, DOCX, PPTX, XLSX, HTML, and images out of the box — Docling handles the parsing, the LLM handles the understanding.

Based on "Page" — a production system deployed across education, logistics, and F&B.

## Quick Start

```bash
git clone https://github.com/afiq/docminer.git
cd docminer
make setup  # install all dependencies
make dev    # start API + frontend dev servers
```

Open `http://localhost:3000` — upload a document, define a schema, extract structured data.

### Stack

- **Backend:** FastAPI + SQLModel + SQLite, with Docling + litellm for extraction
- **Frontend:** Next.js 15 (App Router) with Tailwind CSS v4 and shadcn/ui
- Dark-only theme with violet accent palette
- Typed API client consuming the FastAPI backend

<!-- TODO: Add screenshots of dashboard and extract page -->

## How It Works

```
Input (PDF, DOCX, PPTX, XLSX, HTML, image)
  -> Docling (document -> structured markdown, runs locally)
  -> LLM (via litellm: Ollama, OpenAI, Anthropic, etc.)
  -> Validation (Pydantic schema)
  -> Retry with error feedback (if validation fails)
  -> ExtractionResult (validated data + metadata)
```

Docling runs locally with no API cost. The LLM only processes text (not images), making extraction significantly cheaper than vision-based approaches.

## Project Structure

```
docminer/
  backend/      FastAPI + extraction engine (single Python package)
  frontend/     Next.js UI
```

- **backend** — API routes, database models, services, and the extraction engine (Docling + litellm + Pydantic validation)
- **frontend** — dark-themed UI for uploading documents, managing schemas, viewing extraction results

## Development Setup

**Prerequisites:** Python 3.12+, uv, Node 20+, pnpm

```bash
git clone https://github.com/afiq/docminer.git
cd docminer
make setup   # installs Python + frontend dependencies
```

**Configure the frontend** — create `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Commands

| Command | Description |
|---|---|
| `make dev` | Start API and frontend dev servers |
| `make dev-api` | Start FastAPI server only (port 8000) |
| `make dev-web` | Start Next.js server only (port 3000) |
| `make test` | Run all Python tests |
| `make lint` | Run Ruff + Biome linters |
| `make format` | Auto-format Python + TypeScript |
| `make codegen` | Regenerate TypeScript API client from OpenAPI spec |

## Roadmap

See [TODO.md](TODO.md).

## License

MIT
