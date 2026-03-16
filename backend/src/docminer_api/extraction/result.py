from dataclasses import dataclass
from typing import Any


@dataclass
class ExtractionResult:
    data: Any  # validated Pydantic BaseModel instance
    raw: str  # raw LLM response string
    confidence: float | None = None
    usage: dict[str, Any] | None = None
