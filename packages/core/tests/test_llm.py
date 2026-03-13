import base64
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from docminer.llm import build_messages, call_llm
from pydantic import BaseModel

FIXTURES = Path(__file__).parent / "fixtures"


class InvoiceSchema(BaseModel):
    invoice_number: str | None = None
    total_amount: float | None = None


@pytest.fixture
def image_bytes() -> bytes:
    return (FIXTURES / "test.png").read_bytes()


class TestBuildMessages:
    def test_returns_system_and_user_messages(self, image_bytes: bytes) -> None:
        msgs = build_messages(image_bytes, "image/png", InvoiceSchema)
        assert len(msgs) == 2
        assert msgs[0]["role"] == "system"
        assert msgs[1]["role"] == "user"

    def test_system_message_contains_schema_fields(self, image_bytes: bytes) -> None:
        msgs = build_messages(image_bytes, "image/png", InvoiceSchema)
        system_content = msgs[0]["content"]
        assert "invoice_number" in system_content
        assert "total_amount" in system_content

    def test_user_message_has_image_url_with_base64(self, image_bytes: bytes) -> None:
        msgs = build_messages(image_bytes, "image/png", InvoiceSchema)
        user_content = msgs[1]["content"]
        assert isinstance(user_content, list)
        image_part = next(p for p in user_content if p.get("type") == "image_url")
        url = image_part["image_url"]["url"]
        expected_b64 = base64.b64encode(image_bytes).decode("utf-8")
        assert url == f"data:image/png;base64,{expected_b64}"


class TestCallLlm:
    @patch("docminer.llm.completion")
    def test_returns_raw_text_and_usage(self, mock_completion: MagicMock) -> None:
        mock_choice = MagicMock()
        mock_choice.message.content = '{"invoice_number": "INV-001"}'
        mock_response = MagicMock()
        mock_response.choices = [mock_choice]
        mock_response.usage.prompt_tokens = 100
        mock_response.usage.completion_tokens = 20
        mock_response.usage.total_tokens = 120
        mock_completion.return_value = mock_response

        raw, usage = call_llm("gpt-4o", [{"role": "user", "content": "test"}])

        assert raw == '{"invoice_number": "INV-001"}'
        assert usage == {
            "prompt_tokens": 100,
            "completion_tokens": 20,
            "total_tokens": 120,
        }

    @patch("docminer.llm.completion")
    def test_passes_correct_model_string(self, mock_completion: MagicMock) -> None:
        mock_choice = MagicMock()
        mock_choice.message.content = "{}"
        mock_response = MagicMock()
        mock_response.choices = [mock_choice]
        mock_response.usage.prompt_tokens = 0
        mock_response.usage.completion_tokens = 0
        mock_response.usage.total_tokens = 0
        mock_completion.return_value = mock_response

        messages = [{"role": "user", "content": "test"}]
        call_llm("anthropic/claude-sonnet-4-20250514", messages)

        mock_completion.assert_called_once()
        call_kwargs = mock_completion.call_args
        assert call_kwargs.kwargs["model"] == "anthropic/claude-sonnet-4-20250514"
