"""Tests for docminer.extractor module."""

from __future__ import annotations

import json
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from app.extraction.exceptions import ExtractionError
from app.extraction.extractor import Extractor
from app.extraction.result import ExtractionResult
from pydantic import BaseModel


class Receipt(BaseModel):
    store: str
    total: float


def _mock_completion(content: str) -> MagicMock:
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = content
    mock_response.usage.prompt_tokens = 50
    mock_response.usage.completion_tokens = 30
    mock_response.usage.total_tokens = 80
    return mock_response


VALID_JSON = json.dumps({"store": "Walmart", "total": 42.99})
INVALID_JSON = json.dumps({"total": 42.99})  # missing required 'store'


class TestExtractFromBytes:
    @patch("app.extraction.llm.completion")
    def test_successful_extraction(self, mock_comp: MagicMock) -> None:
        mock_comp.return_value = _mock_completion(VALID_JSON)
        extractor = Extractor(model="gpt-4o")
        result = extractor.extract(b"fake-image-bytes", Receipt)

        assert isinstance(result, ExtractionResult)
        assert isinstance(result.data, Receipt)
        assert result.data.store == "Walmart"
        assert result.data.total == 42.99
        assert result.raw == VALID_JSON
        assert result.usage is not None
        assert result.usage["total_tokens"] == 80

    @patch("app.extraction.llm.completion")
    def test_uses_default_mime_for_bytes(self, mock_comp: MagicMock) -> None:
        mock_comp.return_value = _mock_completion(VALID_JSON)
        extractor = Extractor(model="gpt-4o")
        extractor.extract(b"fake-image-bytes", Receipt)
        # Should have called completion once successfully
        assert mock_comp.call_count == 1


class TestExtractFromFilePath:
    @patch("app.extraction.llm.completion")
    def test_from_pathlib_path(self, mock_comp: MagicMock, tmp_path: Path) -> None:
        fake_file = tmp_path / "receipt.png"
        fake_file.write_bytes(b"fake-png-data")

        mock_comp.return_value = _mock_completion(VALID_JSON)
        extractor = Extractor(model="gpt-4o")
        result = extractor.extract(fake_file, Receipt)

        assert isinstance(result, ExtractionResult)
        assert result.data.store == "Walmart"

    @patch("app.extraction.llm.completion")
    def test_from_string_path(self, mock_comp: MagicMock, tmp_path: Path) -> None:
        fake_file = tmp_path / "receipt.jpg"
        fake_file.write_bytes(b"fake-jpg-data")

        mock_comp.return_value = _mock_completion(VALID_JSON)
        extractor = Extractor(model="gpt-4o")
        result = extractor.extract(str(fake_file), Receipt)

        assert isinstance(result, ExtractionResult)
        assert result.data.total == 42.99


class TestRetryOnValidationError:
    @patch("app.extraction.llm.completion")
    def test_retry_succeeds_on_second_call(self, mock_comp: MagicMock) -> None:
        mock_comp.side_effect = [
            _mock_completion(INVALID_JSON),
            _mock_completion(VALID_JSON),
        ]
        extractor = Extractor(model="gpt-4o")
        result = extractor.extract(b"fake-image-bytes", Receipt)

        assert mock_comp.call_count == 2
        assert isinstance(result.data, Receipt)
        assert result.data.store == "Walmart"

    @patch("app.extraction.llm.completion")
    def test_raises_after_retry_exhausted(self, mock_comp: MagicMock) -> None:
        mock_comp.side_effect = [
            _mock_completion(INVALID_JSON),
            _mock_completion(INVALID_JSON),
        ]
        extractor = Extractor(model="gpt-4o")

        with pytest.raises(ExtractionError):
            extractor.extract(b"fake-image-bytes", Receipt)

        assert mock_comp.call_count == 2
