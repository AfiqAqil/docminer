"""Tests for custom exception classes."""

import pytest
from docminer_api.extraction.exceptions import (
    ExtractionError,
    SchemaError,
    ValidationError,
)


class TestExtractionError:
    def test_is_exception(self):
        assert issubclass(ExtractionError, Exception)

    def test_instantiable_with_message(self):
        err = ExtractionError("extraction failed")
        assert str(err) == "extraction failed"

    def test_can_be_raised_and_caught(self):
        with pytest.raises(ExtractionError, match="something went wrong"):
            raise ExtractionError("something went wrong")


class TestValidationError:
    def test_is_exception(self):
        assert issubclass(ValidationError, Exception)

    def test_instantiable_with_message_and_errors(self):
        errors = ["field 'name' is required", "field 'age' must be int"]
        err = ValidationError("validation failed", errors=errors)
        assert str(err) == "validation failed"
        assert err.errors == errors

    def test_errors_attribute_is_list(self):
        err = ValidationError("bad output", errors=["err1"])
        assert isinstance(err.errors, list)

    def test_can_be_raised_and_caught(self):
        with pytest.raises(ValidationError, match="invalid"):
            raise ValidationError("invalid", errors=["missing field"])


class TestSchemaError:
    def test_is_exception(self):
        assert issubclass(SchemaError, Exception)

    def test_instantiable_with_message(self):
        err = SchemaError("bad schema")
        assert str(err) == "bad schema"

    def test_can_be_raised_and_caught(self):
        with pytest.raises(SchemaError, match="schema is invalid"):
            raise SchemaError("schema is invalid")
