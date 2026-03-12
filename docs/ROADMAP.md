# Roadmap

## Vision

Python library + web app for schema-driven document extraction. Messy document (image/PDF) + Pydantic schema in, clean structured JSON out.

### Why docminer?

- Docling (37k stars) does parsing but no schema-driven LLM extraction
- Sparrow/Unstract do extraction but are enterprise-heavy
- Nobody offers a simple one-liner pipeline: document → LLM extract → validate → structured data
- Based on "Page" — a production system built at MindHive deployed across education, logistics, and F&B

### Design Principles

- **Provider-agnostic:** pluggable LLM backends via litellm (OpenAI, Anthropic, Ollama)
- **Schema-first:** schema drives prompts, validation, and output shape
- **Minimal core deps:** heavy deps (OCR, OpenCV) are optional extras
- **Library, not a service:** no web framework in core package

### Pipeline

```
Input (image/PDF)
  → Multimodal LLM (via litellm: Ollama, OpenAI, Anthropic, etc.)
  → Validation (Pydantic schema)
  → Retry with error feedback (if validation fails)
  → ExtractionResult (validated data + metadata)
```

---

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
