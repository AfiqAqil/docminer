# docminer

Schema-driven document extraction from images and PDFs using multimodal LLMs. Messy document + Pydantic schema in, clean structured JSON out.

## What is docminer?

docminer is a Python library and web app that extracts structured data from documents (invoices, receipts, certificates, shipping docs) by sending them to multimodal LLMs with a schema that defines what to extract. No OCR setup required — the LLM handles it natively.

Based on "Page" — a production system deployed across education, logistics, and F&B.

## Quick Start (Library)

```bash
pip install docminer
```

**With a Pydantic model:**

```python
from pydantic import BaseModel
from docminer import Extractor

class Invoice(BaseModel):
    invoice_no: str
    date: str
    total: float
    line_items: list[dict[str, str]]

extractor = Extractor(model="ollama/llama3.2-vision")
result = extractor.extract("invoice.pdf", schema=Invoice)

print(result.data)  # validated Invoice instance
```

**With a plain dict (no Pydantic required):**

```python
from docminer import Extractor
from docminer.schema import from_dict

schema = from_dict({"invoice_no": "str", "date": "str", "total": "float"})
extractor = Extractor(model="ollama/llama3.2-vision")
result = extractor.extract("invoice.pdf", schema=schema)
```

## Quick Start (Web App)

```bash
git clone https://github.com/afiq/docminer.git
cd docminer
make setup  # install all dependencies
make dev    # start API + frontend dev servers
```

Open `http://localhost:3000` — upload a document, define a schema, extract structured data.

## How It Works

```
Input (image/PDF)
  -> Multimodal LLM (via litellm: Ollama, OpenAI, Anthropic, etc.)
  -> Validation (Pydantic schema)
  -> Retry with error feedback (if validation fails)
  -> ExtractionResult (validated data + metadata)
```

## Project Structure

```
docminer/
  packages/
    core/     Python library (pip install docminer)
    api/      FastAPI backend
    web/      Next.js frontend
```

- **core** — standalone library, zero web dependencies
- **api** — wraps core with persistence, file management, job tracking
- **web** — UI for uploading documents, managing schemas, viewing results

## Development Setup

**Prerequisites:** Python 3.12+, uv, Node 20+, pnpm

```bash
git clone https://github.com/afiq/docminer.git
cd docminer
make setup   # installs Python + frontend dependencies
```

**Configure the web app** — create `packages/web/.env.local`:

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

See [docs/ROADMAP.md](docs/ROADMAP.md).

## License

MIT
