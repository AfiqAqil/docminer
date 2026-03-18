"""Extractor class for schema-driven document extraction."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from pydantic import BaseModel
from pydantic import ValidationError as PydanticValidationError

from app.extraction.exceptions import ExtractionError
from app.extraction.llm import build_messages, call_llm
from app.extraction.result import ExtractionResult

_MIME_MAP: dict[str, str] = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".pdf": "application/pdf",
    ".webp": "image/webp",
}


class Extractor:
    """Extract structured data from document images using an LLM."""

    def __init__(self, model: str, temperature: float = 0.0, **kwargs: Any) -> None:
        self.model = model
        self.temperature = temperature
        self.kwargs = kwargs

    def extract(
        self,
        source: str | Path | bytes,
        schema: type[BaseModel],
    ) -> ExtractionResult:
        """Extract structured data from a document source.

        Args:
            source: Image bytes, a file path string, or a Path object.
            schema: Pydantic model class defining the expected output.

        Returns:
            ExtractionResult with validated data.

        Raises:
            ExtractionError: If extraction fails after retry.
        """
        image_data, media_type = self._load_source(source)
        messages = build_messages(image_data, media_type, schema)

        raw, usage = call_llm(
            self.model, messages, temperature=self.temperature, **self.kwargs
        )

        result = self._parse_and_validate(raw, schema)
        if result is not None:
            return ExtractionResult(
                data=result,
                raw=raw,
                usage=usage,
            )

        # Retry once with error feedback
        messages.append({"role": "assistant", "content": raw})
        messages.append(
            {
                "role": "user",
                "content": (
                    "The previous response did not match the required schema. "
                    "Please fix the JSON and try again. Return ONLY valid JSON."
                ),
            },
        )

        raw, usage = call_llm(
            self.model, messages, temperature=self.temperature, **self.kwargs
        )

        result = self._parse_and_validate(raw, schema)
        if result is not None:
            return ExtractionResult(
                data=result,
                raw=raw,
                usage=usage,
            )

        msg = (
            "Extraction failed after retry: "
            f"LLM output does not match schema {schema.__name__}"
        )
        raise ExtractionError(msg)

    @staticmethod
    def _load_source(source: str | Path | bytes) -> tuple[bytes, str]:
        """Load image bytes and detect MIME type from the source."""
        if isinstance(source, bytes):
            return source, "image/png"

        path = Path(source)
        image_data = path.read_bytes()
        media_type = _MIME_MAP.get(path.suffix.lower(), "application/octet-stream")
        return image_data, media_type

    @staticmethod
    def _parse_and_validate(raw: str, schema: type[BaseModel]) -> BaseModel | None:
        """Parse JSON and validate against schema. Returns None on failure."""
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            return None

        try:
            return schema.model_validate(data)
        except PydanticValidationError:
            return None
