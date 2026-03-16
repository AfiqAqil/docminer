# TODO

High-level feature tracker for docminer.

---

## Phase 1 — Core Library (v0.1) — DONE

- [x] Custom exceptions (`ExtractionError`, `ValidationError`, `SchemaError`)
- [x] `ExtractionResult` dataclass
- [x] Schema utilities (`from_dict`, `schema_to_prompt`)
- [x] LLM wrapper (litellm integration, prompt construction)
- [x] `Extractor` class with validation + retry logic
- [x] Unit tests for all core modules (17 tests)

## Phase 2 — Web App (v0.2) — IN PROGRESS

### API (FastAPI) — DONE

- [x] Database models, config, session management
- [x] Document upload and list endpoints
- [x] Schema CRUD endpoints
- [x] Extraction endpoints with background processing
- [x] SSE streaming for job progress
- [x] CORS and dev environment wiring
- [x] Integration tests (38 tests)

### Frontend (Next.js) — IN PROGRESS

- [x] Layout, navigation, sidebar
- [x] Documents page (list, upload)
- [x] Schemas page (list, create, delete)
- [x] Extract page (document/schema selection, job polling)
- [x] Hand-written typed API client
- [x] **UI foundation** — dark theme, violet palette, sidebar with icons, shared components (design: `docs/plans/2026-03-16-ui-foundation-design.md`)
- [x] **Dashboard page** — onboarding flow (empty), stats + recent extractions (populated)
- [x] **Page rebuilds** — Documents, Schemas, Extract pages with shadcn components, toasts, skeletons, empty states
- [ ] **Document preview** — display uploaded document (image/PDF) in extract results view
- [ ] **Results side-by-side view** — document on left, extracted JSON on right
- [ ] **OpenAPI codegen** — replace hand-written client with generated typed client (`make codegen`)
- [ ] **Inline schema creation** — create schema directly from extract page (not just pick existing)

## Phase 3 — Polish & Publish (v0.3) — NOT STARTED

- [ ] **README polish** — usage examples for both library and web app, screenshots
- [ ] **PyPI packaging** — publish `docminer` core to PyPI
- [ ] **Docker Compose** — single command self-hosting (`docker compose up`)
- [ ] **CI/CD** — GitHub Actions for test + lint on PRs
- [ ] **`make setup` command** — one-command dev environment setup (currently referenced in README but not implemented)

## Future — Backlog

- [ ] OCR backends as optional extras (Docling, Tesseract)
- [ ] Image preprocessing (deskew, normalize) as optional extras
- [ ] CLI (`docminer extract file.pdf --schema schema.json`)
- [ ] Batch extraction (multiple documents in one job)
- [ ] Schema versioning and migration
- [ ] Document delete endpoint + UI
- [ ] Extraction history page (list all past jobs with filters)
- [ ] Export results (CSV, Excel)
