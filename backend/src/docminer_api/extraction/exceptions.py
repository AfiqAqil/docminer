"""Custom exception classes for docminer."""


class ExtractionError(Exception):
    """Raised when extraction fails."""


class ValidationError(Exception):
    """Raised when LLM output fails validation."""

    def __init__(self, message: str, *, errors: list[str]) -> None:
        super().__init__(message)
        self.errors = errors


class SchemaError(Exception):
    """Raised when schema definition is invalid."""
