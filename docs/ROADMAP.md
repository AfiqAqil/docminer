# Roadmap

## Phase 1 — Core Library (v0.1)

- [ ] Custom exceptions (`ExtractionError`, `ValidationError`, `SchemaError`)
- [ ] `ExtractionResult` dataclass
- [ ] Schema utilities (`from_dict`, `schema_to_prompt`)
- [ ] LLM wrapper (litellm integration, prompt construction)
- [ ] `Extractor` class with validation + retry logic
- [ ] Unit tests for all core modules

## Phase 2 — Web App (v0.2)

- [ ] FastAPI backend: database models, config, session management
- [ ] Document upload and list endpoints
- [ ] Schema CRUD endpoints
- [ ] Extraction endpoints with background processing
- [ ] SSE streaming for job progress
- [ ] Next.js frontend: layout, navigation, dashboard
- [ ] Extract page (upload, schema picker, results view)
- [ ] Documents and schemas management pages
- [ ] OpenAPI codegen for typed TypeScript API client
- [ ] CORS and dev environment wiring

## Phase 3 — Polish & Publish (v0.3)

- [ ] README with usage examples (library + web app)
- [ ] PyPI packaging for `docminer` core
- [ ] Docker Compose for self-hosting
- [ ] CI/CD with GitHub Actions (test + lint)

## Next Up

- OCR backends as optional extras (Docling, Tesseract)
- Image preprocessing (deskew, normalize) as optional extras
- CLI (`docminer extract file.pdf --schema schema.json`)
- Batch extraction (multiple documents in one job)
- Schema versioning and migration
