# Document Extraction Landscape Research

**Date:** 2026-03-17
**Purpose:** Evaluate existing libraries and tools to inform docminer's backend design.

---

## Executive Summary

The document extraction space has matured rapidly in 2025-2026. Three distinct architectural approaches have emerged:

1. **ML/CV Pipeline** (Docling) — Traditional layout analysis + OCR + table recognition using specialized models. High accuracy on structured documents, runs on commodity hardware, no LLM costs.
2. **Vision LLM-first** (Zerox, docminer) — Send document images directly to multimodal LLMs. Simple architecture, excellent at unstructured/messy documents, but higher per-page cost.
3. **Hybrid** (Sparrow, Unstract) — OCR/preprocessing layer feeds structured text to LLMs. Balances cost and accuracy.

**Recommendation for docminer:** Stay vision-LLM-first (our differentiator is simplicity), but adopt key patterns from the landscape: Pydantic-native schemas (already done), structured output enforcement, chunked multi-page processing, and optional OCR preprocessing for cost optimization.

---

## Library Deep Dives

### 1. Docling (IBM DS4SD)

**GitHub:** [DS4SD/docling](https://github.com/DS4SD/docling) | 37k+ stars | MIT License

**What it does:** Converts unstructured documents (PDF, DOCX, PPTX, XLSX, HTML, images) into structured JSON/Markdown using specialized AI models — no LLMs required.

**Architecture:**
- **DocLayNet** — Layout analysis model (titles, paragraphs, tables, figures)
- **TableFormer** — Table structure recognition
- **Heron** (Dec 2025) — RT-DETRv2-based layout model, 23.5% mAP improvement
- **Granite-Docling-258M** (Early 2026) — Small VLM using DocTags markup, handles charts/tables/forms/equations in a single pass
- Modular: `docling-core` (types), `docling-parse` (PDF parser), `docling-serve` (FastAPI), `docling-ibm-models`

**Key strengths:**
- Runs on commodity hardware (laptop-friendly), no LLM API costs
- Unified `DoclingDocument` representation exports to Markdown, JSON, HTML
- Native integrations with LangChain, LlamaIndex, CrewAI, Haystack
- Donated to Linux Foundation's Agentic AI Foundation (AAIF) in early 2026
- Massive scale proof: processed 2.1M PDFs from Common Crawl

**Key weaknesses:**
- Not schema-driven — converts entire documents, doesn't extract specific fields
- No structured JSON extraction to a user-defined schema out of the box
- Requires post-processing (LLM or code) to get targeted data from its output
- Heavier dependency footprint (ML models, torch)

**Relevance to docminer:** Docling solves a *different problem* — document-to-markdown conversion, not schema-driven extraction. However, it could serve as an **optional preprocessing layer**: Docling converts PDF to clean markdown, then our LLM extracts specific fields from that markdown (cheaper than sending images). This is the hybrid approach.

---

### 2. LangExtract (Google)

**GitHub:** [google/langextract](https://github.com/google/langextract) | Apache 2.0

**What it does:** Extracts structured information from unstructured *text* using LLMs with precise source grounding and interactive visualization.

**Architecture:**
- Few-shot example-driven: you provide 2-3 examples of what you want extracted
- Text chunking + parallel processing + multi-pass for high recall on long docs
- Source grounding: maps every extraction to exact character offsets in source text
- Outputs to `.jsonl`, can generate interactive HTML visualization

**Key strengths:**
- Source grounding is excellent for auditability (highlight where data came from)
- Optimized for long documents (chunking + multi-pass overcomes needle-in-haystack)
- Multi-provider: Gemini, OpenAI, Anthropic, Ollama
- Domain-flexible: clinical notes, finance, legal, research — no fine-tuning needed

**Key weaknesses:**
- Text-only — no vision/image support (requires OCR preprocessing for scanned docs)
- Schema defined via few-shot examples, not Pydantic models or JSON Schema
- Google/Gemini-optimized (controlled generation works best with Gemini)
- Relatively new (Aug 2025), smaller community

**Relevance to docminer:** The source grounding pattern is worth studying. For docminer, we could add optional "evidence" fields that point to which part of the document a value was extracted from. The multi-pass strategy for long documents is also directly applicable for multi-page PDFs.

---

### 3. Zerox (OmniAI)

**GitHub:** [getomni-ai/zerox](https://github.com/getomni-ai/zerox) | 12.2k stars

**What it does:** OCR and document extraction using vision models. Converts documents to markdown or extracts structured data via JSON Schema.

**Architecture:**
- PDF -> images (via graphicsmagick/ghostscript or poppler) -> vision LLM per page -> markdown or structured JSON
- Uses **litellm** under the hood for multi-provider support
- Supports separate models for OCR vs extraction steps
- Per-page or whole-document extraction modes

**Key strengths:**
- Very close to docminer's approach — validates our architecture
- JSON Schema-based structured extraction (`extractOnly: true` + schema)
- Multi-provider via litellm (OpenAI, Anthropic, Gemini, Azure, Bedrock)
- Both Node.js and Python SDKs
- Large community (12k+ stars), active maintenance

**Key weaknesses:**
- Requires system dependencies (graphicsmagick, ghostscript, poppler)
- litellm vision model detection issues with local Ollama models
- No Pydantic-native schema definition (uses JSON Schema directly)
- No retry/validation loop on schema mismatch

**Relevance to docminer:** Zerox is our closest competitor. Key differences where docminer can differentiate:
- We use **Pydantic models** for schema (more Pythonic, better DX)
- We have **retry with error feedback** on validation failure (Zerox doesn't)
- We have a **full web UI** for non-technical users
- We should adopt their per-page extraction pattern for multi-page PDFs

---

### 4. Sparrow (KatanaML)

**GitHub:** [katanaml/sparrow](https://github.com/katanaml/sparrow) | GPL 3.0

**What it does:** Structured data extraction and instruction calling with ML, LLM, and Vision LLM.

**Architecture:**
- Pluggable pipelines: **Sparrow Parse** (VLM extraction), **Sparrow Instructor** (text-based), **Sparrow Agents** (multi-step workflows)
- Multiple backends: MLX (Apple Silicon), Ollama, vLLM, Docker, HuggingFace
- JSON schema-based extraction with automatic validation
- API-first design with RESTful APIs
- Visual monitoring via Prefect dashboard

**Key strengths:**
- Most feature-complete open-source extraction tool
- Agent workflows for classification -> extraction -> validation pipelines
- Supports local models (Mistral, QwenVL, DeepSeek OCR)
- Built-in schema validation

**Key weaknesses:**
- GPL 3.0 license (restrictive for commercial use unless <$5M revenue)
- Complex setup with many moving parts
- Heavier than needed for simple extraction tasks

**Relevance to docminer:** Sparrow's agent workflow pattern (classify -> extract -> validate) is worth adopting for Phase 3. The multi-backend support via pluggable pipelines is also a good architectural pattern.

---

### 5. ContextGem

**GitHub:** [shcherbak-ai/contextgem](https://github.com/shcherbak-ai/contextgem) | Apache 2.0

**What it does:** LLM framework for extracting structured data and insights from documents with minimal code.

**Architecture:**
- Define extraction pipelines with nested contexts and role-specific LLMs
- Built-in DOCX converter (paragraphs, tables, images, headers, etc.)
- Multi-LLM orchestration: cost-effective model for simple fields, powerful model for complex analysis
- LiteLLM integration for multi-provider support

**Key strengths:**
- Multi-LLM routing: use cheap models for easy fields, expensive for hard ones
- Built-in cost tracking (tokens, API costs per workflow)
- Retry mechanisms and fallback LLM configuration
- Concurrency built-in for parallel extraction

**Key weaknesses:**
- Text-focused (DOCX conversion, not vision-based)
- Recommends gpt-4o-mini minimum (smaller models struggle)
- Single-document focus, no batch/corpus processing

**Relevance to docminer:** The multi-LLM routing pattern is very interesting. For docminer, we could allow users to specify a "fast model" for simple fields and a "powerful model" for complex ones. The cost tracking feature is also valuable for the web UI.

---

### 6. Unstract + LLMWhisperer

**GitHub:** [Zipstack/unstract](https://github.com/Zipstack/unstract)

**What it does:** LLM-driven extraction of unstructured data, built for API deployments and ETL pipelines.

**Architecture:**
- **LLMWhisperer** — Advanced OCR that preserves document layout for LLM consumption
- **Prompt Studio** — Define extraction schemas with natural language
- Deployment modes: REST API or ETL pipeline (S3 -> process -> warehouse)
- MCP Server support for AI agent integration

**Key strengths:**
- Layout-preserving OCR is a unique differentiator (LLMs work better with preserved layout)
- Enterprise-grade: ETL pipelines, warehouse integration, MCP server
- AI-stack agnostic (any LLM provider)
- 300+ language OCR support

**Key weaknesses:**
- Commercial product with freemium model (100 pages/day free)
- Complex enterprise architecture, overkill for simple use cases

**Relevance to docminer:** The layout-preserving OCR concept is valuable. If we add an OCR preprocessing layer, preserving spatial layout in the text representation helps LLMs understand document structure better.

---

## Comparative Matrix

| Feature | docminer (current) | Zerox | Docling | LangExtract | Sparrow | ContextGem |
|---|---|---|---|---|---|---|
| **Approach** | Vision LLM | Vision LLM | ML/CV Pipeline | Text LLM | Hybrid | Text LLM |
| **Schema definition** | Pydantic | JSON Schema | N/A | Few-shot | JSON | Code-based |
| **Vision support** | Yes | Yes | Yes (VLM) | No | Yes | No |
| **Multi-provider** | Yes (litellm) | Yes (litellm) | N/A | Yes | Yes | Yes (litellm) |
| **Retry on failure** | Yes (1 retry) | No | N/A | No | Yes | Yes |
| **Multi-page PDF** | No (single image) | Yes (per-page) | Yes | Yes (chunking) | Yes | Yes |
| **Web UI** | Yes | No | No | Visualization | Dashboard | No |
| **Local models** | Yes (Ollama) | Yes (Ollama) | Local by default | Yes (Ollama) | Yes | Yes |
| **License** | MIT | MIT | MIT | Apache 2.0 | GPL 3.0 | Apache 2.0 |
| **Cost tracking** | No | No | N/A | No | No | Yes |

---

## Emerging Patterns (2025-2026)

### 1. Vision LLMs are replacing OCR for many use cases
Gemini Flash 2.0 achieves near-perfect OCR accuracy at ~$0.17 per 1,000 pages. For many teams, sending images directly to a VLM is simpler and cheaper than maintaining an OCR pipeline.

### 2. Schema-driven extraction is the dominant paradigm
Every major tool now supports some form of "define what you want, get structured JSON." The question is how: JSON Schema (Zerox), Pydantic (docminer), few-shot examples (LangExtract), or natural language (Unstract).

### 3. Structured output / constrained generation
LLM providers now offer native JSON mode and structured outputs (OpenAI, Gemini). Libraries are adopting `response_format` to guarantee valid JSON instead of hoping the LLM follows instructions.

### 4. Multi-page chunking is essential
Long PDFs need to be split into pages or chunks, processed in parallel, then merged. Every mature tool has this pattern.

### 5. Hybrid pipelines for cost optimization
Use OCR (cheap) for text extraction, then LLM (expensive) only for understanding/structuring. This can cut costs 10-100x on high-volume workloads.

---

## Recommendations for docminer

### High Priority (Phase 2-3)

1. **Multi-page PDF support** — Split PDFs into per-page images, extract from each, merge results. This is the biggest gap vs competitors. Pattern: Zerox's `pdf2image` approach.

2. **Structured output mode** — Use litellm's `response_format` parameter to request JSON mode from providers that support it. Reduces parsing failures and eliminates need for retry in many cases.

3. **Per-page vs whole-document extraction** — Let users choose: extract per-page (for invoices with line items per page) or whole-document (merge all pages, extract once). Zerox has this pattern.

### Medium Priority (Phase 3+)

4. **Optional OCR preprocessing layer** — Add Docling or LLMWhisperer as optional preprocessors. Convert PDF to markdown first, then extract from text (cheaper, works with non-vision models). Keep vision-first as default.

5. **Cost tracking** — Track token usage and estimated cost per extraction. ContextGem's approach. Display in the web UI per job.

6. **Confidence scores / source grounding** — Ask the LLM to provide confidence per field, inspired by LangExtract's source grounding. Useful for human-in-the-loop verification.

### Future / Backlog

7. **Multi-model routing** — ContextGem's pattern: cheap model for simple fields, expensive model for complex ones. Could significantly reduce costs.

8. **Agent workflows** — Sparrow's classify -> extract -> validate pipeline. Useful for mixed document types (auto-detect invoice vs receipt vs form, apply correct schema).

9. **Batch processing with parallel execution** — Process multiple documents concurrently with asyncio. Every competitor supports this.

---

## Architecture Comparison: What docminer Does Well

Our current architecture is already well-positioned:

- **Pydantic-native schemas** — Better DX than JSON Schema (Zerox) or few-shot examples (LangExtract). Users define Python models, get type safety and validation for free.
- **Retry with error feedback** — We append the failed response and ask the LLM to fix it. Most competitors don't do this. This is a genuine differentiator.
- **litellm integration** — Same multi-provider support as Zerox and ContextGem. Any model, any provider.
- **Full-stack web app** — None of the pure libraries offer a web UI. Sparrow has a dashboard but it's monitoring, not user-facing.

The main gaps are multi-page PDF support and structured output mode — both are straightforward to add.

---

## Sources

- [Docling GitHub - DS4SD/docling](https://github.com/DS4SD/docling)
- [IBM Research - Docling for Generative AI](https://research.ibm.com/blog/docling-generative-AI)
- [Docling AAAI 2025 Paper](https://arxiv.org/html/2501.17887v1)
- [LangExtract GitHub - google/langextract](https://github.com/google/langextract)
- [Google Developers Blog - Introducing LangExtract](https://developers.googleblog.com/introducing-langextract-a-gemini-powered-information-extraction-library/)
- [LangExtract PyPI](https://pypi.org/project/langextract/)
- [Zerox GitHub - getomni-ai/zerox](https://github.com/getomni-ai/zerox)
- [Zerox Python Docs](https://docs.getomni.ai/zerox/python)
- [Sparrow GitHub - katanaml/sparrow](https://github.com/katanaml/sparrow)
- [sparrow-parse PyPI](https://pypi.org/project/sparrow-parse/)
- [ContextGem GitHub - shcherbak-ai/contextgem](https://github.com/shcherbak-ai/contextgem)
- [ContextGem Documentation](https://contextgem.dev/index.html)
- [Unstract GitHub - Zipstack/unstract](https://github.com/Zipstack/unstract)
- [LLMWhisperer](https://unstract.com/llmwhisperer/)
- [Unstract - LLMs for Structured Data Extraction from PDFs](https://unstract.com/blog/comparing-approaches-for-using-llms-for-structured-data-extraction-from-pdfs/)
- [Vision Parse GitHub](https://github.com/iamarunbrahma/vision-parse)
- [pdf-ocr-llm GitHub](https://github.com/hz01/pdf-ocr-llm)
- [Document Data Extraction 2026: LLMs vs OCRs](https://www.vellum.ai/blog/document-data-extraction-llms-vs-ocrs)
- [MarkTechPost - Google LangExtract Release](https://www.marktechpost.com/2025/08/04/google-ai-releases-langextract-an-open-source-python-library-that-extracts-structured-data-from-unstructured-text-documents/)
