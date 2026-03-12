# Docminer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Python library + web app for schema-driven document extraction from images/PDFs using multimodal LLMs.

**Architecture:** Three-package monorepo — `core` (Python library), `api` (FastAPI backend), `web` (Next.js frontend). Core is provider-agnostic via litellm. API wraps core with persistence and job management. Frontend consumes API via typed OpenAPI client.

**Tech Stack:** Python 3.12+, uv workspaces, Pydantic, litellm, FastAPI, SQLModel, SQLite, Next.js 15, Tailwind CSS, shadcn/ui, pnpm, Ruff, Biome.

---

### Task 1: Scaffold monorepo and uv workspace

**Files:**
- Create: `pyproject.toml` (workspace root)
- Create: `packages/core/pyproject.toml`
- Create: `packages/core/src/docminer/__init__.py`
- Create: `packages/api/pyproject.toml`
- Create: `packages/api/src/docminer_api/__init__.py`

**Step 1: Create workspace root pyproject.toml**

```toml
[project]
name = "docminer-workspace"
version = "0.0.0"
requires-python = ">=3.12"

[tool.uv.workspace]
members = ["packages/core", "packages/api"]

[tool.ruff]
line-length = 88
target-version = "py312"

[tool.ruff.lint]
select = ["E", "F", "I", "UP"]

[tool.pytest.ini_options]
testpaths = ["packages/core/tests", "packages/api/tests"]
```

**Step 2: Create core package pyproject.toml**

```toml
[project]
name = "docminer"
version = "0.1.0"
description = "Schema-driven document extraction from images and PDFs"
requires-python = ">=3.12"
license = "MIT"
dependencies = [
    "pydantic>=2.0",
    "litellm>=1.0",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.backends"

[tool.hatch.build.targets.wheel]
packages = ["src/docminer"]
```

**Step 3: Create core __init__.py (empty for now)**

```python
"""Docminer: Schema-driven document extraction."""
```

**Step 4: Create api package pyproject.toml**

```toml
[project]
name = "docminer-api"
version = "0.1.0"
description = "FastAPI backend for docminer"
requires-python = ">=3.12"
license = "MIT"
dependencies = [
    "docminer",
    "fastapi>=0.115",
    "uvicorn[standard]>=0.34",
    "sqlmodel>=0.0.22",
    "aiosqlite>=0.20",
    "python-multipart>=0.0.18",
    "sse-starlette>=2.0",
    "pydantic-settings>=2.0",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.backends"

[tool.hatch.build.targets.wheel]
packages = ["src/docminer_api"]
```

**Step 5: Create api __init__.py (empty for now)**

```python
"""Docminer API: FastAPI backend for docminer."""
```

**Step 6: Create directory structure and sync dependencies**

Run:
```bash
mkdir -p packages/core/src/docminer packages/core/tests
mkdir -p packages/api/src/docminer_api packages/api/tests
uv sync
```

Expected: uv resolves all dependencies, creates `uv.lock`.

**Step 7: Verify workspace works**

Run: `uv run python -c "import docminer; print('core OK')"`
Expected: `core OK`

**Step 8: Commit**

```bash
git add pyproject.toml packages/ uv.lock
git commit -m "feat: scaffold monorepo with uv workspace (core + api)"
```

---

### Task 2: Core — exceptions module

**Files:**
- Create: `packages/core/src/docminer/exceptions.py`
- Test: `packages/core/tests/test_exceptions.py`

**Step 1: Write the failing test**

```python
# packages/core/tests/test_exceptions.py
from docminer.exceptions import ExtractionError, SchemaError, ValidationError


def test_extraction_error_is_exception():
    err = ExtractionError("LLM failed")
    assert isinstance(err, Exception)
    assert str(err) == "LLM failed"


def test_validation_error_stores_details():
    err = ValidationError("bad field", errors=["field X required"])
    assert err.errors == ["field X required"]


def test_schema_error_is_exception():
    err = SchemaError("invalid type")
    assert isinstance(err, Exception)
```

**Step 2: Run test to verify it fails**

Run: `uv run pytest packages/core/tests/test_exceptions.py -v`
Expected: FAIL — `ModuleNotFoundError`

**Step 3: Write minimal implementation**

```python
# packages/core/src/docminer/exceptions.py


class ExtractionError(Exception):
    """Raised when document extraction fails."""


class ValidationError(Exception):
    """Raised when LLM output fails schema validation."""

    def __init__(self, message: str, errors: list[str] | None = None):
        super().__init__(message)
        self.errors = errors or []


class SchemaError(Exception):
    """Raised when schema definition is invalid."""
```

**Step 4: Run test to verify it passes**

Run: `uv run pytest packages/core/tests/test_exceptions.py -v`
Expected: 3 passed

**Step 5: Commit**

```bash
git add packages/core/src/docminer/exceptions.py packages/core/tests/test_exceptions.py
git commit -m "feat(core): add exception classes"
```

---

### Task 3: Core — result module

**Files:**
- Create: `packages/core/src/docminer/result.py`
- Test: `packages/core/tests/test_result.py`

**Step 1: Write the failing test**

```python
# packages/core/tests/test_result.py
from pydantic import BaseModel

from docminer.result import ExtractionResult


class Invoice(BaseModel):
    invoice_no: str
    total: float


def test_extraction_result_holds_data():
    invoice = Invoice(invoice_no="INV-001", total=100.0)
    result = ExtractionResult(
        data=invoice,
        raw='{"invoice_no": "INV-001", "total": 100.0}',
    )
    assert result.data.invoice_no == "INV-001"
    assert result.raw == '{"invoice_no": "INV-001", "total": 100.0}'


def test_extraction_result_optional_fields():
    invoice = Invoice(invoice_no="INV-002", total=50.0)
    result = ExtractionResult(
        data=invoice,
        raw="{}",
        confidence=0.95,
        usage={"prompt_tokens": 100, "completion_tokens": 50},
    )
    assert result.confidence == 0.95
    assert result.usage["prompt_tokens"] == 100


def test_extraction_result_defaults():
    invoice = Invoice(invoice_no="INV-003", total=0.0)
    result = ExtractionResult(data=invoice, raw="{}")
    assert result.confidence is None
    assert result.usage is None
```

**Step 2: Run test to verify it fails**

Run: `uv run pytest packages/core/tests/test_result.py -v`
Expected: FAIL — `ModuleNotFoundError`

**Step 3: Write minimal implementation**

```python
# packages/core/src/docminer/result.py
from dataclasses import dataclass, field
from typing import Any


@dataclass
class ExtractionResult:
    """Result of a document extraction."""

    data: Any
    raw: str
    confidence: float | None = None
    usage: dict[str, Any] | None = None
```

**Step 4: Run test to verify it passes**

Run: `uv run pytest packages/core/tests/test_result.py -v`
Expected: 3 passed

**Step 5: Commit**

```bash
git add packages/core/src/docminer/result.py packages/core/tests/test_result.py
git commit -m "feat(core): add ExtractionResult dataclass"
```

---

### Task 4: Core — schema utilities

**Files:**
- Create: `packages/core/src/docminer/schema.py`
- Test: `packages/core/tests/test_schema.py`

**Step 1: Write the failing test**

```python
# packages/core/tests/test_schema.py
from pydantic import BaseModel

from docminer.schema import from_dict, schema_to_prompt


def test_from_dict_simple_types():
    model = from_dict({
        "name": "str",
        "age": "int",
        "score": "float",
        "active": "bool",
    })
    assert issubclass(model, BaseModel)
    instance = model(name="Alice", age=30, score=9.5, active=True)
    assert instance.name == "Alice"
    assert instance.age == 30


def test_from_dict_nested_object():
    model = from_dict({
        "invoice_no": "str",
        "line_items": [{"description": "str", "amount": "float"}],
    })
    instance = model(
        invoice_no="INV-001",
        line_items=[{"description": "Widget", "amount": 9.99}],
    )
    assert instance.line_items[0]["description"] == "Widget"


def test_from_dict_optional_field():
    model = from_dict({
        "name": "str",
        "nickname": "str | None",
    })
    instance = model(name="Alice", nickname=None)
    assert instance.nickname is None


def test_schema_to_prompt_includes_field_names():
    class Invoice(BaseModel):
        invoice_no: str
        total: float

    prompt = schema_to_prompt(Invoice)
    assert "invoice_no" in prompt
    assert "total" in prompt
    assert "str" in prompt.lower() or "string" in prompt.lower()


def test_schema_to_prompt_shows_json_schema():
    class Receipt(BaseModel):
        store: str
        amount: float

    prompt = schema_to_prompt(Receipt)
    # Should contain valid JSON schema representation
    assert "store" in prompt
    assert "amount" in prompt
```

**Step 2: Run test to verify it fails**

Run: `uv run pytest packages/core/tests/test_schema.py -v`
Expected: FAIL — `ModuleNotFoundError`

**Step 3: Write minimal implementation**

```python
# packages/core/src/docminer/schema.py
import json
from typing import Any

from pydantic import BaseModel, create_model

from docminer.exceptions import SchemaError

_TYPE_MAP: dict[str, type] = {
    "str": str,
    "int": int,
    "float": float,
    "bool": bool,
}


def from_dict(schema: dict[str, Any]) -> type[BaseModel]:
    """Create a Pydantic model from a dict schema definition.

    Supported field types: "str", "int", "float", "bool", "str | None", etc.
    Lists of dicts create list[dict[str, ...]] fields.
    """
    fields: dict[str, Any] = {}
    for field_name, field_type in schema.items():
        fields[field_name] = (_resolve_type(field_type), ...)
    try:
        return create_model("DynamicModel", **fields)
    except Exception as e:
        raise SchemaError(f"Failed to create model: {e}") from e


def _resolve_type(type_def: Any) -> type:
    """Resolve a type definition string or structure to a Python type."""
    if isinstance(type_def, str):
        if " | None" in type_def:
            base = type_def.replace(" | None", "").strip()
            base_type = _TYPE_MAP.get(base)
            if base_type is None:
                raise SchemaError(f"Unknown type: {base}")
            return base_type | None
        resolved = _TYPE_MAP.get(type_def)
        if resolved is None:
            raise SchemaError(f"Unknown type: {type_def}")
        return resolved
    if isinstance(type_def, list) and len(type_def) == 1 and isinstance(type_def[0], dict):
        return list[dict[str, Any]]
    raise SchemaError(f"Unsupported type definition: {type_def}")


def schema_to_prompt(schema: type[BaseModel]) -> str:
    """Convert a Pydantic model to a prompt-friendly JSON schema string."""
    json_schema = schema.model_json_schema()
    return json.dumps(json_schema, indent=2)
```

**Step 4: Run test to verify it passes**

Run: `uv run pytest packages/core/tests/test_schema.py -v`
Expected: 5 passed

**Step 5: Commit**

```bash
git add packages/core/src/docminer/schema.py packages/core/tests/test_schema.py
git commit -m "feat(core): add schema utilities (from_dict, schema_to_prompt)"
```

---

### Task 5: Core — LLM wrapper

**Files:**
- Create: `packages/core/src/docminer/llm.py`
- Test: `packages/core/tests/test_llm.py`

**Step 1: Write the failing test**

```python
# packages/core/tests/test_llm.py
import json
from unittest.mock import MagicMock, patch

from pydantic import BaseModel

from docminer.llm import build_messages, call_llm


class Invoice(BaseModel):
    invoice_no: str
    total: float


def test_build_messages_contains_schema():
    messages = build_messages(
        image_data=b"fake-image-bytes",
        media_type="image/png",
        schema=Invoice,
    )
    # Should have a system message and a user message
    assert len(messages) >= 2
    # System message should contain schema info
    system_content = messages[0]["content"]
    assert "invoice_no" in system_content
    assert "total" in system_content


def test_build_messages_user_message_has_image():
    messages = build_messages(
        image_data=b"fake-image-bytes",
        media_type="image/png",
        schema=Invoice,
    )
    user_msg = messages[1]
    assert user_msg["role"] == "user"
    # User message content should be a list with image and text parts
    assert isinstance(user_msg["content"], list)
    has_image = any(
        part.get("type") == "image_url" for part in user_msg["content"]
    )
    assert has_image


@patch("docminer.llm.completion")
def test_call_llm_returns_parsed_response(mock_completion):
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = json.dumps(
        {"invoice_no": "INV-001", "total": 99.99}
    )
    mock_response.usage.prompt_tokens = 100
    mock_response.usage.completion_tokens = 50
    mock_response.usage.total_tokens = 150
    mock_completion.return_value = mock_response

    raw, usage = call_llm(
        model="ollama/llama3.2-vision",
        messages=[{"role": "user", "content": "test"}],
    )
    assert "INV-001" in raw
    assert usage["prompt_tokens"] == 100
    mock_completion.assert_called_once()
```

**Step 2: Run test to verify it fails**

Run: `uv run pytest packages/core/tests/test_llm.py -v`
Expected: FAIL — `ModuleNotFoundError`

**Step 3: Write minimal implementation**

```python
# packages/core/src/docminer/llm.py
import base64
from typing import Any

from litellm import completion
from pydantic import BaseModel

from docminer.schema import schema_to_prompt

_SYSTEM_PROMPT = """You are a document data extraction assistant.
Extract structured data from the provided document image according to this JSON schema:

{schema}

Rules:
- Return ONLY valid JSON matching the schema. No markdown, no explanation.
- If a field is not found in the document, use null.
- Be precise with numbers, dates, and identifiers."""


def build_messages(
    image_data: bytes,
    media_type: str,
    schema: type[BaseModel],
) -> list[dict[str, Any]]:
    """Build the LLM message payload with image and schema."""
    schema_str = schema_to_prompt(schema)
    b64 = base64.b64encode(image_data).decode("utf-8")

    return [
        {
            "role": "system",
            "content": _SYSTEM_PROMPT.format(schema=schema_str),
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:{media_type};base64,{b64}",
                    },
                },
                {
                    "type": "text",
                    "text": "Extract the structured data from this document.",
                },
            ],
        },
    ]


def call_llm(
    model: str,
    messages: list[dict[str, Any]],
    temperature: float = 0.0,
    **kwargs: Any,
) -> tuple[str, dict[str, int]]:
    """Call the LLM via litellm and return (raw_text, usage_dict)."""
    response = completion(
        model=model,
        messages=messages,
        temperature=temperature,
        **kwargs,
    )
    raw = response.choices[0].message.content
    usage = {
        "prompt_tokens": response.usage.prompt_tokens,
        "completion_tokens": response.usage.completion_tokens,
        "total_tokens": response.usage.total_tokens,
    }
    return raw, usage
```

**Step 4: Run test to verify it passes**

Run: `uv run pytest packages/core/tests/test_llm.py -v`
Expected: 3 passed

**Step 5: Commit**

```bash
git add packages/core/src/docminer/llm.py packages/core/tests/test_llm.py
git commit -m "feat(core): add LLM wrapper (build_messages, call_llm)"
```

---

### Task 6: Core — Extractor class

**Files:**
- Create: `packages/core/src/docminer/extractor.py`
- Modify: `packages/core/src/docminer/__init__.py`
- Test: `packages/core/tests/test_extractor.py`

**Step 1: Write the failing test**

```python
# packages/core/tests/test_extractor.py
import json
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from pydantic import BaseModel

from docminer import Extractor, ExtractionResult
from docminer.exceptions import ExtractionError


class Receipt(BaseModel):
    store: str
    total: float


def _mock_completion(content: str):
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = content
    mock_response.usage.prompt_tokens = 50
    mock_response.usage.completion_tokens = 30
    mock_response.usage.total_tokens = 80
    return mock_response


@patch("docminer.llm.completion")
def test_extract_from_bytes(mock_completion):
    mock_completion.return_value = _mock_completion(
        json.dumps({"store": "ACME", "total": 42.50})
    )
    extractor = Extractor(model="ollama/llama3.2-vision")
    result = extractor.extract(b"fake-png-bytes", schema=Receipt)

    assert isinstance(result, ExtractionResult)
    assert result.data.store == "ACME"
    assert result.data.total == 42.50
    assert result.usage["total_tokens"] == 80


@patch("docminer.llm.completion")
def test_extract_from_file_path(mock_completion, tmp_path):
    mock_completion.return_value = _mock_completion(
        json.dumps({"store": "Shop", "total": 10.0})
    )
    # Create a fake PNG file (just needs to exist and have bytes)
    fake_file = tmp_path / "receipt.png"
    fake_file.write_bytes(b"\x89PNG fake image data")

    extractor = Extractor(model="ollama/llama3.2-vision")
    result = extractor.extract(fake_file, schema=Receipt)

    assert result.data.store == "Shop"


@patch("docminer.llm.completion")
def test_extract_from_string_path(mock_completion, tmp_path):
    mock_completion.return_value = _mock_completion(
        json.dumps({"store": "Market", "total": 5.0})
    )
    fake_file = tmp_path / "receipt.jpg"
    fake_file.write_bytes(b"\xff\xd8\xff fake jpeg")

    extractor = Extractor(model="ollama/llama3.2-vision")
    result = extractor.extract(str(fake_file), schema=Receipt)

    assert result.data.store == "Market"


@patch("docminer.llm.completion")
def test_extract_retries_on_validation_error(mock_completion):
    # First call returns invalid JSON, second returns valid
    mock_completion.side_effect = [
        _mock_completion('{"store": "ACME"}'),  # missing 'total'
        _mock_completion(json.dumps({"store": "ACME", "total": 10.0})),
    ]
    extractor = Extractor(model="ollama/llama3.2-vision")
    result = extractor.extract(b"fake-bytes", schema=Receipt)

    assert result.data.total == 10.0
    assert mock_completion.call_count == 2


@patch("docminer.llm.completion")
def test_extract_raises_after_retry_exhausted(mock_completion):
    mock_completion.side_effect = [
        _mock_completion("not json at all"),
        _mock_completion("still not json"),
    ]
    extractor = Extractor(model="ollama/llama3.2-vision")

    with pytest.raises(ExtractionError):
        extractor.extract(b"fake-bytes", schema=Receipt)
```

**Step 2: Run test to verify it fails**

Run: `uv run pytest packages/core/tests/test_extractor.py -v`
Expected: FAIL — `ImportError`

**Step 3: Write minimal implementation**

```python
# packages/core/src/docminer/extractor.py
import json
import mimetypes
from pathlib import Path
from typing import Any

from pydantic import BaseModel, ValidationError as PydanticValidationError

from docminer.exceptions import ExtractionError
from docminer.llm import build_messages, call_llm
from docminer.result import ExtractionResult

_MIME_DEFAULTS = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".pdf": "application/pdf",
}


class Extractor:
    """Main entry point for document extraction."""

    def __init__(self, model: str, temperature: float = 0.0, **kwargs: Any):
        self.model = model
        self.temperature = temperature
        self.kwargs = kwargs

    def extract(
        self,
        source: str | Path | bytes,
        schema: type[BaseModel],
    ) -> ExtractionResult:
        """Extract structured data from a document.

        Args:
            source: File path (str or Path) or raw bytes.
            schema: Pydantic model class defining the expected output shape.

        Returns:
            ExtractionResult with validated data, raw response, and usage stats.

        Raises:
            ExtractionError: If extraction or validation fails after retry.
        """
        image_data, media_type = self._load_source(source)
        messages = build_messages(image_data, media_type, schema)

        raw, usage = call_llm(
            model=self.model,
            messages=messages,
            temperature=self.temperature,
            **self.kwargs,
        )

        # Try to parse and validate
        result = self._parse_and_validate(raw, schema)
        if result is not None:
            return ExtractionResult(data=result, raw=raw, usage=usage)

        # Retry once with error feedback
        retry_messages = messages + [
            {"role": "assistant", "content": raw},
            {
                "role": "user",
                "content": (
                    "Your response was not valid JSON matching the schema. "
                    "Please try again. Return ONLY valid JSON."
                ),
            },
        ]
        raw_retry, usage_retry = call_llm(
            model=self.model,
            messages=retry_messages,
            temperature=self.temperature,
            **self.kwargs,
        )

        result = self._parse_and_validate(raw_retry, schema)
        if result is not None:
            return ExtractionResult(data=result, raw=raw_retry, usage=usage_retry)

        raise ExtractionError(
            f"Failed to extract valid data after retry. Last response: {raw_retry[:200]}"
        )

    def _load_source(self, source: str | Path | bytes) -> tuple[bytes, str]:
        """Load document bytes and determine media type."""
        if isinstance(source, bytes):
            return source, "image/png"  # default for raw bytes
        path = Path(source)
        if not path.exists():
            raise ExtractionError(f"File not found: {path}")
        data = path.read_bytes()
        media_type = _MIME_DEFAULTS.get(
            path.suffix.lower(),
            mimetypes.guess_type(str(path))[0] or "application/octet-stream",
        )
        return data, media_type

    def _parse_and_validate(
        self, raw: str, schema: type[BaseModel]
    ) -> BaseModel | None:
        """Try to parse JSON and validate against schema. Returns None on failure."""
        try:
            parsed = json.loads(raw)
            return schema.model_validate(parsed)
        except (json.JSONDecodeError, PydanticValidationError):
            return None
```

**Step 4: Update __init__.py with public exports**

```python
# packages/core/src/docminer/__init__.py
"""Docminer: Schema-driven document extraction."""

from docminer.extractor import Extractor
from docminer.result import ExtractionResult

__all__ = ["Extractor", "ExtractionResult"]
```

**Step 5: Run test to verify it passes**

Run: `uv run pytest packages/core/tests/test_extractor.py -v`
Expected: 5 passed

**Step 6: Run all core tests**

Run: `uv run pytest packages/core/tests/ -v`
Expected: All tests pass (11 total)

**Step 7: Commit**

```bash
git add packages/core/src/docminer/ packages/core/tests/test_extractor.py
git commit -m "feat(core): add Extractor class with retry logic"
```

---

### Task 7: API — database and models

**Files:**
- Create: `packages/api/src/docminer_api/models.py`
- Create: `packages/api/src/docminer_api/database.py`
- Create: `packages/api/src/docminer_api/config.py`
- Test: `packages/api/tests/test_models.py`

**Step 1: Write the failing test**

```python
# packages/api/tests/test_models.py
from datetime import datetime, timezone

from sqlmodel import Session, SQLModel, create_engine

from docminer_api.models import Document, ExtractionJob, Schema


def _make_engine():
    engine = create_engine("sqlite:///:memory:")
    SQLModel.metadata.create_all(engine)
    return engine


def test_create_document():
    engine = _make_engine()
    with Session(engine) as session:
        doc = Document(
            filename="test.pdf",
            content_type="application/pdf",
            file_path="/tmp/test.pdf",
            uploaded_at=datetime.now(timezone.utc),
        )
        session.add(doc)
        session.commit()
        session.refresh(doc)
        assert doc.id is not None
        assert doc.filename == "test.pdf"


def test_create_schema():
    engine = _make_engine()
    with Session(engine) as session:
        schema = Schema(
            name="Invoice",
            definition='{"invoice_no": "str"}',
            created_at=datetime.now(timezone.utc),
        )
        session.add(schema)
        session.commit()
        session.refresh(schema)
        assert schema.id is not None


def test_create_extraction_job():
    engine = _make_engine()
    with Session(engine) as session:
        doc = Document(
            filename="test.pdf",
            content_type="application/pdf",
            file_path="/tmp/test.pdf",
            uploaded_at=datetime.now(timezone.utc),
        )
        schema = Schema(
            name="Invoice",
            definition="{}",
            created_at=datetime.now(timezone.utc),
        )
        session.add(doc)
        session.add(schema)
        session.commit()
        session.refresh(doc)
        session.refresh(schema)

        job = ExtractionJob(
            document_id=doc.id,
            schema_id=schema.id,
            status="pending",
            created_at=datetime.now(timezone.utc),
        )
        session.add(job)
        session.commit()
        session.refresh(job)
        assert job.id is not None
        assert job.status == "pending"
        assert job.result is None
```

**Step 2: Run test to verify it fails**

Run: `uv run pytest packages/api/tests/test_models.py -v`
Expected: FAIL — `ModuleNotFoundError`

**Step 3: Write config module**

```python
# packages/api/src/docminer_api/config.py
from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    model_config = {"env_prefix": "DOCMINER_"}

    model: str = "ollama/llama3.2-vision"
    db_url: str = "sqlite:///data/docminer.db"
    upload_dir: Path = Path("data/uploads")


settings = Settings()
```

**Step 4: Write database module**

```python
# packages/api/src/docminer_api/database.py
from sqlmodel import Session, SQLModel, create_engine

from docminer_api.config import settings

engine = create_engine(settings.db_url, echo=False)


def init_db():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
```

**Step 5: Write models**

```python
# packages/api/src/docminer_api/models.py
from datetime import datetime

from sqlmodel import Field, SQLModel


class Document(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    filename: str
    content_type: str
    file_path: str
    uploaded_at: datetime


class Schema(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    definition: str
    created_at: datetime


class ExtractionJob(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    document_id: int = Field(foreign_key="document.id")
    schema_id: int = Field(foreign_key="schema.id")
    status: str = Field(default="pending")
    result: str | None = None
    error: str | None = None
    created_at: datetime
    completed_at: datetime | None = None
```

**Step 6: Run test to verify it passes**

Run: `uv run pytest packages/api/tests/test_models.py -v`
Expected: 3 passed

**Step 7: Commit**

```bash
git add packages/api/src/docminer_api/ packages/api/tests/
git commit -m "feat(api): add database models, config, and session management"
```

---

### Task 8: API — document endpoints

**Files:**
- Create: `packages/api/src/docminer_api/routes/documents.py`
- Create: `packages/api/src/docminer_api/app.py`
- Test: `packages/api/tests/test_documents.py`

**Step 1: Write the failing test**

```python
# packages/api/tests/test_documents.py
import io

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine

from docminer_api.app import create_app
from docminer_api.database import get_session


@pytest.fixture
def client():
    engine = create_engine("sqlite:///:memory:")
    SQLModel.metadata.create_all(engine)

    def override_session():
        with Session(engine) as session:
            yield session

    app = create_app()
    app.dependency_overrides[get_session] = override_session
    return TestClient(app)


def test_upload_document(client, tmp_path):
    file_content = b"%PDF-1.4 fake pdf content"
    response = client.post(
        "/documents/upload",
        files={"file": ("invoice.pdf", io.BytesIO(file_content), "application/pdf")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "invoice.pdf"
    assert data["content_type"] == "application/pdf"
    assert "id" in data


def test_list_documents_empty(client):
    response = client.get("/documents")
    assert response.status_code == 200
    assert response.json() == []


def test_list_documents_after_upload(client):
    file_content = b"fake image"
    client.post(
        "/documents/upload",
        files={"file": ("photo.png", io.BytesIO(file_content), "image/png")},
    )
    response = client.get("/documents")
    assert response.status_code == 200
    docs = response.json()
    assert len(docs) == 1
    assert docs[0]["filename"] == "photo.png"
```

**Step 2: Run test to verify it fails**

Run: `uv run pytest packages/api/tests/test_documents.py -v`
Expected: FAIL — `ModuleNotFoundError`

**Step 3: Write the app factory**

```python
# packages/api/src/docminer_api/app.py
from fastapi import FastAPI

from docminer_api.database import init_db
from docminer_api.routes.documents import router as documents_router


def create_app() -> FastAPI:
    app = FastAPI(title="Docminer API", version="0.1.0")

    @app.on_event("startup")
    def on_startup():
        init_db()

    app.include_router(documents_router)
    return app
```

**Step 4: Write documents route**

```python
# packages/api/src/docminer_api/routes/__init__.py
```

```python
# packages/api/src/docminer_api/routes/documents.py
import shutil
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, UploadFile
from sqlmodel import Session, select

from docminer_api.config import settings
from docminer_api.database import get_session
from docminer_api.models import Document

router = APIRouter()


@router.post("/documents/upload")
def upload_document(
    file: UploadFile,
    session: Session = Depends(get_session),
) -> Document:
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    safe_name = f"{timestamp}_{file.filename}"
    file_path = upload_dir / safe_name

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    doc = Document(
        filename=file.filename,
        content_type=file.content_type or "application/octet-stream",
        file_path=str(file_path),
        uploaded_at=datetime.now(timezone.utc),
    )
    session.add(doc)
    session.commit()
    session.refresh(doc)
    return doc


@router.get("/documents")
def list_documents(
    session: Session = Depends(get_session),
) -> list[Document]:
    return list(session.exec(select(Document)).all())
```

**Step 5: Run test to verify it passes**

Run: `uv run pytest packages/api/tests/test_documents.py -v`
Expected: 3 passed

**Step 6: Commit**

```bash
git add packages/api/src/docminer_api/ packages/api/tests/
git commit -m "feat(api): add document upload and list endpoints"
```

---

### Task 9: API — schema endpoints

**Files:**
- Create: `packages/api/src/docminer_api/routes/schemas.py`
- Modify: `packages/api/src/docminer_api/app.py`
- Test: `packages/api/tests/test_schemas.py`

**Step 1: Write the failing test**

```python
# packages/api/tests/test_schemas.py
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine

from docminer_api.app import create_app
from docminer_api.database import get_session


@pytest.fixture
def client():
    engine = create_engine("sqlite:///:memory:")
    SQLModel.metadata.create_all(engine)

    def override_session():
        with Session(engine) as session:
            yield session

    app = create_app()
    app.dependency_overrides[get_session] = override_session
    return TestClient(app)


def test_create_schema(client):
    response = client.post(
        "/schemas",
        json={
            "name": "Invoice",
            "definition": '{"invoice_no": "str", "total": "float"}',
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Invoice"
    assert "id" in data


def test_list_schemas_empty(client):
    response = client.get("/schemas")
    assert response.status_code == 200
    assert response.json() == []


def test_list_schemas_after_create(client):
    client.post(
        "/schemas",
        json={"name": "Receipt", "definition": '{"store": "str"}'},
    )
    response = client.get("/schemas")
    assert response.status_code == 200
    schemas = response.json()
    assert len(schemas) == 1
    assert schemas[0]["name"] == "Receipt"
```

**Step 2: Run test to verify it fails**

Run: `uv run pytest packages/api/tests/test_schemas.py -v`
Expected: FAIL — route not found (404)

**Step 3: Write schemas route**

```python
# packages/api/src/docminer_api/routes/schemas.py
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel as PydanticBaseModel
from sqlmodel import Session, select

from docminer_api.database import get_session
from docminer_api.models import Schema

router = APIRouter()


class SchemaCreate(PydanticBaseModel):
    name: str
    definition: str


@router.post("/schemas")
def create_schema(
    body: SchemaCreate,
    session: Session = Depends(get_session),
) -> Schema:
    schema = Schema(
        name=body.name,
        definition=body.definition,
        created_at=datetime.now(timezone.utc),
    )
    session.add(schema)
    session.commit()
    session.refresh(schema)
    return schema


@router.get("/schemas")
def list_schemas(
    session: Session = Depends(get_session),
) -> list[Schema]:
    return list(session.exec(select(Schema)).all())
```

**Step 4: Update app.py to include schemas router**

```python
# packages/api/src/docminer_api/app.py
from fastapi import FastAPI

from docminer_api.database import init_db
from docminer_api.routes.documents import router as documents_router
from docminer_api.routes.schemas import router as schemas_router


def create_app() -> FastAPI:
    app = FastAPI(title="Docminer API", version="0.1.0")

    @app.on_event("startup")
    def on_startup():
        init_db()

    app.include_router(documents_router)
    app.include_router(schemas_router)
    return app
```

**Step 5: Run test to verify it passes**

Run: `uv run pytest packages/api/tests/test_schemas.py -v`
Expected: 3 passed

**Step 6: Commit**

```bash
git add packages/api/src/docminer_api/ packages/api/tests/
git commit -m "feat(api): add schema create and list endpoints"
```

---

### Task 10: API — extraction endpoints

**Files:**
- Create: `packages/api/src/docminer_api/routes/extract.py`
- Create: `packages/api/src/docminer_api/services.py`
- Modify: `packages/api/src/docminer_api/app.py`
- Test: `packages/api/tests/test_extract.py`

**Step 1: Write the failing test**

```python
# packages/api/tests/test_extract.py
import io
import json
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine

from docminer_api.app import create_app
from docminer_api.database import get_session


@pytest.fixture
def client():
    engine = create_engine("sqlite:///:memory:")
    SQLModel.metadata.create_all(engine)

    def override_session():
        with Session(engine) as session:
            yield session

    app = create_app()
    app.dependency_overrides[get_session] = override_session
    return TestClient(app)


def _seed_doc_and_schema(client):
    """Upload a document and create a schema, return their IDs."""
    doc_resp = client.post(
        "/documents/upload",
        files={"file": ("test.png", io.BytesIO(b"fake"), "image/png")},
    )
    schema_resp = client.post(
        "/schemas",
        json={"name": "Receipt", "definition": '{"store": "str", "total": "float"}'},
    )
    return doc_resp.json()["id"], schema_resp.json()["id"]


def test_start_extraction(client):
    doc_id, schema_id = _seed_doc_and_schema(client)
    response = client.post(
        "/extract",
        json={"document_id": doc_id, "schema_id": schema_id},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "pending"
    assert data["document_id"] == doc_id
    assert data["schema_id"] == schema_id
    assert "id" in data


def test_get_extraction_job(client):
    doc_id, schema_id = _seed_doc_and_schema(client)
    create_resp = client.post(
        "/extract",
        json={"document_id": doc_id, "schema_id": schema_id},
    )
    job_id = create_resp.json()["id"]

    response = client.get(f"/extract/{job_id}")
    assert response.status_code == 200
    assert response.json()["id"] == job_id


def test_get_nonexistent_job(client):
    response = client.get("/extract/9999")
    assert response.status_code == 404
```

**Step 2: Run test to verify it fails**

Run: `uv run pytest packages/api/tests/test_extract.py -v`
Expected: FAIL — route not found

**Step 3: Write services module**

```python
# packages/api/src/docminer_api/services.py
import json
from datetime import datetime, timezone

from sqlmodel import Session

from docminer import Extractor
from docminer.schema import from_dict
from docminer_api.config import settings
from docminer_api.models import Document, ExtractionJob, Schema


def run_extraction(job_id: int, engine) -> None:
    """Run extraction in background. Reads job, document, schema from DB."""
    from sqlmodel import Session

    with Session(engine) as session:
        job = session.get(ExtractionJob, job_id)
        if job is None:
            return

        job.status = "processing"
        session.add(job)
        session.commit()

        try:
            doc = session.get(Document, job.document_id)
            schema_row = session.get(Schema, job.schema_id)

            schema_def = json.loads(schema_row.definition)
            pydantic_model = from_dict(schema_def)

            extractor = Extractor(model=settings.model)
            result = extractor.extract(doc.file_path, schema=pydantic_model)

            job.status = "completed"
            job.result = result.data.model_dump_json()
            job.completed_at = datetime.now(timezone.utc)
        except Exception as e:
            job.status = "failed"
            job.error = str(e)
            job.completed_at = datetime.now(timezone.utc)

        session.add(job)
        session.commit()
```

**Step 4: Write extract route**

```python
# packages/api/src/docminer_api/routes/extract.py
from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel as PydanticBaseModel
from sqlmodel import Session

from docminer_api.database import engine, get_session
from docminer_api.models import ExtractionJob
from docminer_api.services import run_extraction

router = APIRouter()


class ExtractionRequest(PydanticBaseModel):
    document_id: int
    schema_id: int


@router.post("/extract")
def start_extraction(
    body: ExtractionRequest,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
) -> ExtractionJob:
    job = ExtractionJob(
        document_id=body.document_id,
        schema_id=body.schema_id,
        status="pending",
        created_at=datetime.now(timezone.utc),
    )
    session.add(job)
    session.commit()
    session.refresh(job)

    background_tasks.add_task(run_extraction, job.id, engine)
    return job


@router.get("/extract/{job_id}")
def get_extraction_job(
    job_id: int,
    session: Session = Depends(get_session),
) -> ExtractionJob:
    job = session.get(ExtractionJob, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
```

**Step 5: Update app.py to include extract router**

```python
# packages/api/src/docminer_api/app.py
from fastapi import FastAPI

from docminer_api.database import init_db
from docminer_api.routes.documents import router as documents_router
from docminer_api.routes.extract import router as extract_router
from docminer_api.routes.schemas import router as schemas_router


def create_app() -> FastAPI:
    app = FastAPI(title="Docminer API", version="0.1.0")

    @app.on_event("startup")
    def on_startup():
        init_db()

    app.include_router(documents_router)
    app.include_router(schemas_router)
    app.include_router(extract_router)
    return app
```

**Step 6: Run test to verify it passes**

Run: `uv run pytest packages/api/tests/test_extract.py -v`
Expected: 3 passed

**Step 7: Run all API tests**

Run: `uv run pytest packages/api/tests/ -v`
Expected: All tests pass (9 total)

**Step 8: Commit**

```bash
git add packages/api/src/docminer_api/ packages/api/tests/
git commit -m "feat(api): add extraction endpoints with background processing"
```

---

### Task 11: API — SSE streaming endpoint

**Files:**
- Modify: `packages/api/src/docminer_api/routes/extract.py`
- Test: `packages/api/tests/test_extract_stream.py`

**Step 1: Write the failing test**

```python
# packages/api/tests/test_extract_stream.py
import io
from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine

from docminer_api.app import create_app
from docminer_api.database import get_session
from docminer_api.models import Document, ExtractionJob, Schema


@pytest.fixture
def client():
    engine = create_engine("sqlite:///:memory:")
    SQLModel.metadata.create_all(engine)

    def override_session():
        with Session(engine) as session:
            yield session

    app = create_app()
    app.dependency_overrides[get_session] = override_session
    return TestClient(app)


def test_stream_completed_job(client):
    # Seed a completed job directly
    doc_resp = client.post(
        "/documents/upload",
        files={"file": ("test.png", io.BytesIO(b"fake"), "image/png")},
    )
    schema_resp = client.post(
        "/schemas",
        json={"name": "Test", "definition": '{"name": "str"}'},
    )
    create_resp = client.post(
        "/extract",
        json={
            "document_id": doc_resp.json()["id"],
            "schema_id": schema_resp.json()["id"],
        },
    )
    job_id = create_resp.json()["id"]

    # Stream endpoint should return at least one event
    with client.stream("GET", f"/extract/{job_id}/stream") as response:
        assert response.status_code == 200
        # Read first chunk to verify it's SSE format
        for line in response.iter_lines():
            if line.startswith("data:"):
                assert "status" in line
                break


def test_stream_nonexistent_job(client):
    response = client.get("/extract/9999/stream")
    assert response.status_code == 404
```

**Step 2: Run test to verify it fails**

Run: `uv run pytest packages/api/tests/test_extract_stream.py -v`
Expected: FAIL — 404 or route not found

**Step 3: Add SSE endpoint to extract route**

Add to `packages/api/src/docminer_api/routes/extract.py`:

```python
import asyncio
import json

from sse_starlette.sse import EventSourceResponse


async def _job_event_generator(job_id: int, session_factory):
    """Yield SSE events until job is completed or failed."""
    while True:
        with session_factory() as session:
            job = session.get(ExtractionJob, job_id)
            if job is None:
                return

            event_data = json.dumps({
                "id": job.id,
                "status": job.status,
                "result": job.result,
                "error": job.error,
            })
            yield {"data": event_data}

            if job.status in ("completed", "failed"):
                return

        await asyncio.sleep(1)


@router.get("/extract/{job_id}/stream")
async def stream_extraction_job(
    job_id: int,
    session: Session = Depends(get_session),
):
    job = session.get(ExtractionJob, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")

    from docminer_api.database import get_session_direct
    return EventSourceResponse(_job_event_generator(job_id, get_session_direct))
```

Add to `packages/api/src/docminer_api/database.py`:

```python
def get_session_direct():
    """Return a session context manager (not a generator, for use outside FastAPI DI)."""
    return Session(engine)
```

**Step 4: Run test to verify it passes**

Run: `uv run pytest packages/api/tests/test_extract_stream.py -v`
Expected: 2 passed

**Step 5: Commit**

```bash
git add packages/api/src/docminer_api/ packages/api/tests/
git commit -m "feat(api): add SSE streaming for extraction job progress"
```

---

### Task 12: Scaffold Next.js frontend

**Files:**
- Create: `packages/web/` (via create-next-app)
- Create: `Makefile`

**Step 1: Install pnpm**

Run: `npm install -g pnpm`
Expected: pnpm installed successfully

**Step 2: Create Next.js app**

Run:
```bash
cd packages && pnpm create next-app@latest web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
```

Expected: Next.js project scaffolded in `packages/web/`

**Step 3: Remove ESLint config (we use Biome instead)**

Run:
```bash
cd packages/web && rm -f .eslintrc.json eslint.config.mjs
pnpm add -D @biomejs/biome
pnpm biome init
```

**Step 4: Install shadcn/ui**

Docs reference: Check latest shadcn/ui init command for Next.js 15+.

Run:
```bash
cd packages/web && pnpm dlx shadcn@latest init -d
```

Expected: shadcn/ui configured, `components.json` created.

**Step 5: Install OpenAPI codegen tool**

Run:
```bash
cd packages/web && pnpm add -D openapi-typescript-codegen
```

**Step 6: Create root Makefile**

```makefile
# Makefile

.PHONY: dev dev-api dev-web test codegen

dev:
	$(MAKE) dev-api & $(MAKE) dev-web

dev-api:
	uv run uvicorn docminer_api.app:create_app --factory --reload --port 8000

dev-web:
	cd packages/web && pnpm dev

test:
	uv run pytest packages/core/tests packages/api/tests -v

codegen:
	cd packages/web && pnpm openapi-typescript-codegen generate -i http://localhost:8000/openapi.json -o src/lib/api/generated --client fetch
```

**Step 7: Verify frontend starts**

Run: `cd packages/web && pnpm dev`
Expected: Next.js dev server starts on port 3000

**Step 8: Commit**

```bash
git add packages/web/ Makefile
git commit -m "feat(web): scaffold Next.js frontend with Tailwind, shadcn/ui, Biome"
```

---

### Task 13: Frontend — API client and layout

**Files:**
- Create: `packages/web/src/lib/api/client.ts`
- Modify: `packages/web/src/app/layout.tsx`
- Create: `packages/web/src/app/page.tsx` (dashboard)

**Step 1: Create API client wrapper**

```typescript
// packages/web/src/lib/api/client.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  documents: {
    list: () => apiFetch<Document[]>("/documents"),
    upload: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      return apiFetch<Document>("/documents/upload", {
        method: "POST",
        headers: {},
        body: form,
      });
    },
  },
  schemas: {
    list: () => apiFetch<Schema[]>("/schemas"),
    create: (name: string, definition: string) =>
      apiFetch<Schema>("/schemas", {
        method: "POST",
        body: JSON.stringify({ name, definition }),
      }),
  },
  extract: {
    start: (documentId: number, schemaId: number) =>
      apiFetch<ExtractionJob>("/extract", {
        method: "POST",
        body: JSON.stringify({ document_id: documentId, schema_id: schemaId }),
      }),
    get: (jobId: number) => apiFetch<ExtractionJob>(`/extract/${jobId}`),
    stream: (jobId: number) =>
      new EventSource(`${API_BASE}/extract/${jobId}/stream`),
  },
};

// Types matching FastAPI models
export interface Document {
  id: number;
  filename: string;
  content_type: string;
  file_path: string;
  uploaded_at: string;
}

export interface Schema {
  id: number;
  name: string;
  definition: string;
  created_at: string;
}

export interface ExtractionJob {
  id: number;
  document_id: number;
  schema_id: number;
  status: "pending" | "processing" | "completed" | "failed";
  result: string | null;
  error: string | null;
  created_at: string;
  completed_at: string | null;
}
```

**Step 2: Update layout with navigation**

Update `packages/web/src/app/layout.tsx` to include a sidebar or top nav with links to `/`, `/extract`, `/documents`, `/schemas`.

Use shadcn/ui components. Install needed ones:

```bash
cd packages/web && pnpm dlx shadcn@latest add button navigation-menu
```

**Step 3: Create dashboard page**

`packages/web/src/app/page.tsx` — simple dashboard showing recent extractions count, quick link to `/extract`.

**Step 4: Verify it renders**

Run: `cd packages/web && pnpm dev`
Visit `http://localhost:3000` — should show dashboard layout.

**Step 5: Commit**

```bash
git add packages/web/src/
git commit -m "feat(web): add API client, layout with navigation, and dashboard"
```

---

### Task 14: Frontend — extract page

**Files:**
- Create: `packages/web/src/app/extract/page.tsx`
- Create: `packages/web/src/components/file-upload.tsx`
- Create: `packages/web/src/components/schema-picker.tsx`
- Create: `packages/web/src/components/extraction-result.tsx`

**Step 1: Install shadcn/ui components needed**

```bash
cd packages/web && pnpm dlx shadcn@latest add card select textarea badge separator
```

**Step 2: Create FileUpload component**

Drag-and-drop zone using native HTML5 drag events + file input fallback. Calls `api.documents.upload()` on drop. Shows filename and upload status.

**Step 3: Create SchemaPicker component**

Dropdown of saved schemas (fetched via `api.schemas.list()`), plus an inline JSON textarea to create a new one on the fly.

**Step 4: Create ExtractionResult component**

Side-by-side layout: document preview on left (image tag for images, embed/iframe for PDFs), JSON result on right with syntax highlighting. Subscribes to SSE via `api.extract.stream()` for real-time status.

**Step 5: Wire into extract page**

`packages/web/src/app/extract/page.tsx` — three-step flow:
1. Upload/select document
2. Pick/create schema
3. View results

State managed with React `useState` — step 1 sets `documentId`, step 2 sets `schemaId`, step 3 triggers extraction and shows results.

**Step 6: Verify end-to-end**

Start both servers:
```bash
make dev
```

1. Upload a document via the UI
2. Create a schema
3. Run extraction (will fail without Ollama running, but the flow should work)

**Step 7: Commit**

```bash
git add packages/web/src/
git commit -m "feat(web): add extract page with upload, schema picker, and results view"
```

---

### Task 15: Frontend — documents and schemas pages

**Files:**
- Create: `packages/web/src/app/documents/page.tsx`
- Create: `packages/web/src/app/schemas/page.tsx`

**Step 1: Install shadcn/ui table component**

```bash
cd packages/web && pnpm dlx shadcn@latest add table
```

**Step 2: Create documents page**

Table listing all documents (filename, type, uploaded date). Fetches from `api.documents.list()`.

**Step 3: Create schemas page**

Table listing all schemas (name, created date). Button to create new schema with a modal/dialog containing name + JSON definition fields.

```bash
cd packages/web && pnpm dlx shadcn@latest add dialog input label
```

**Step 4: Verify both pages render**

Run: `cd packages/web && pnpm dev`
Visit `/documents` and `/schemas`.

**Step 5: Commit**

```bash
git add packages/web/src/
git commit -m "feat(web): add documents and schemas management pages"
```

---

### Task 16: CORS and dev environment wiring

**Files:**
- Modify: `packages/api/src/docminer_api/app.py`
- Create: `packages/web/.env.local`

**Step 1: Add CORS middleware to FastAPI**

```python
# Add to create_app() in app.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Step 2: Create frontend env file**

```
# packages/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Step 3: Test cross-origin requests**

Start both servers with `make dev`. Verify frontend can call backend without CORS errors.

**Step 4: Commit**

```bash
git add packages/api/src/docminer_api/app.py packages/web/.env.local
git commit -m "feat: add CORS middleware and frontend env config"
```

---

### Task 17: Ruff and Biome configuration

**Files:**
- Modify: `pyproject.toml` (ruff config already there from Task 1)
- Modify: `packages/web/biome.json`

**Step 1: Verify Ruff works on Python code**

Run: `uv run ruff check packages/`
Expected: No errors (or fix any that appear).

Run: `uv run ruff format packages/ --check`
Expected: All files formatted correctly.

**Step 2: Configure Biome for TypeScript**

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0/schema.json",
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": { "recommended": true }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  }
}
```

Run: `cd packages/web && pnpm biome check src/`
Expected: No errors.

**Step 3: Add lint commands to Makefile**

```makefile
lint:
	uv run ruff check packages/
	cd packages/web && pnpm biome check src/

format:
	uv run ruff format packages/
	cd packages/web && pnpm biome format src/ --write
```

**Step 4: Commit**

```bash
git add pyproject.toml packages/web/biome.json Makefile
git commit -m "chore: configure Ruff and Biome linting"
```

---

### Task 18: Run full test suite and final verification

**Step 1: Run all Python tests**

Run: `uv run pytest packages/core/tests packages/api/tests -v`
Expected: All tests pass (20+ tests).

**Step 2: Run linters**

Run: `make lint`
Expected: Clean.

**Step 3: Verify dev servers start**

Run: `make dev`
Expected: FastAPI on :8000, Next.js on :3000, no errors.

**Step 4: Commit any fixes**

If any fixes were needed, commit them:
```bash
git add -A
git commit -m "fix: address issues found in final verification"
```
