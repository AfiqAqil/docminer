# Roadmap

## Vision

Docminer is a self-hostable web app for schema-driven document extraction. Upload a messy document (PDF, DOCX, image), define a schema for the data you want, and get clean structured JSON back — powered by Docling and LLMs.

Built for developers and small teams who need repeatable, structured extraction without building a pipeline from scratch.

## Success Criteria

- [ ] Extract structured JSON from PDF, DOCX, PPTX, XLSX, HTML, and images using a user-defined schema
- [ ] Full web UI: upload documents, define schemas, run extractions, view results side-by-side
- [ ] Self-hostable with a single `docker compose up`
- [ ] Extraction pipeline runs locally (Docling + Ollama) with no mandatory cloud dependencies
- [ ] End-to-end extraction completes in under 60 seconds for a typical single-page document

## Product Areas

### Extraction Engine

The core pipeline: document in, structured JSON out. Docling converts documents to markdown, then an LLM extracts fields according to the user's schema.

| Priority | Task | Notes |
|----------|------|-------|
| 🔴 Now | Docling integration | Replace vision LLM calls with Docling (document -> markdown) + text LLM (markdown -> JSON) |
| 🔴 Now | Multi-format support | PDF, DOCX, PPTX, XLSX, HTML, images via Docling |
| 🟡 Next | Structured output mode | Use litellm `response_format` for JSON mode |
| 🟡 Next | Update tests | Adapt existing tests for Docling + text LLM pipeline |
| 🟢 Later | Batch extraction | Multiple documents in one job |
| 🟢 Later | Multi-model routing | Cheap model for simple fields, powerful for complex |
| 🟢 Later | Confidence scores | Source grounding per extracted field |
| 🟢 Later | Cost tracking | Token usage + estimated cost per extraction |
| ✅ Done | Custom exceptions, `ExtractionResult` dataclass | |
| ✅ Done | Schema utilities (`from_dict`, `schema_to_prompt`) | |
| ✅ Done | LLM wrapper (litellm integration) | |
| ✅ Done | `Extractor` class with validation + retry logic | |
| ✅ Done | Unit tests for extraction modules | |

### Web Experience

The Next.js frontend and FastAPI backend that make the extraction engine usable.

| Priority | Task | Notes |
|----------|------|-------|
| ✅ Done | Cyberpunk visual redesign | Neon glow system, perspective grid, scan-line effects, Framer Motion transitions |
| ✅ Done | Route restructure | App pages under `/app/*`, landing page at `/` |
| ✅ Done | App interior polish | Per-page cyberpunk treatment: dashboard, documents, schemas, extract |
| ✅ Done | Landing page with 3D hero | R3F crystalline gem scene, feature sections, scroll animations |
| 🔴 Now | Document preview | Display uploaded document (image/PDF) in extract results view |
| 🔴 Now | Results side-by-side view | Document on left, extracted JSON on right |
| 🟡 Next | OpenAPI codegen | Replace hand-written client with generated typed client |
| 🟡 Next | Inline schema creation | Create schema directly from extract page |
| 🟢 Later | Document delete | Endpoint + UI |
| 🟢 Later | Extraction history page | List all past jobs with filters |
| 🟢 Later | Export results | CSV, Excel |
| 🟢 Later | Schema versioning | Migration between schema versions |
| ✅ Done | FastAPI backend (models, routes, SSE, CORS) | |
| ✅ Done | Layout, navigation, sidebar | |
| ✅ Done | Documents page (list, upload) | |
| ✅ Done | Schemas page (list, create, delete) | |
| ✅ Done | Extract page (document/schema selection, job polling) | |
| ✅ Done | Dashboard page (onboarding flow, stats, recent extractions) | |
| ✅ Done | UI foundation (dark theme, violet palette, shadcn components) | |

### Infrastructure

Developer experience, deployment, and CI.

| Priority | Task | Notes |
|----------|------|-------|
| 🟡 Next | Docker Compose | Single command self-hosting |
| 🟡 Next | `make setup` command | One-command dev environment setup |
| 🟢 Later | CI/CD | GitHub Actions for test + lint on PRs |
| 🟢 Later | README polish | Usage examples, screenshots |

## Decision Log

| Date | Decision | Detail |
|------|----------|--------|
| 2026-03-13 | FastAPI + Next.js + SQLite for web stack | [docminer-design.md](docs/plans/2026-03-13-docminer-design.md) |
| 2026-03-16 | Dark theme, violet palette, shadcn/ui component system | [ui-foundation-design.md](docs/plans/2026-03-16-ui-foundation-design.md) |
| 2026-03-17 | Docling over Zerox/LangExtract for document parsing | [extraction-landscape.md](docs/research/2026-03-17-extraction-landscape.md) |
| 2026-03-19 | Flat `backend/` + `frontend/` over monorepo with `packages/` | Simplified structure, core library merged into backend |
| 2026-03-19 | Cyberpunk visual redesign with R3F landing + lightweight in-app effects | [frontend-visual-design.md](docs/plans/2026-03-19-frontend-visual-design.md) |
