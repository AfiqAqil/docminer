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
    """Build the message list for an LLM vision call."""
    schema_str = schema_to_prompt(schema)
    b64 = base64.b64encode(image_data).decode("utf-8")
    return [
        {"role": "system", "content": _SYSTEM_PROMPT.format(schema=schema_str)},
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:{media_type};base64,{b64}"},
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
        model=model, messages=messages, temperature=temperature, **kwargs
    )
    raw = response.choices[0].message.content
    usage = {
        "prompt_tokens": response.usage.prompt_tokens,
        "completion_tokens": response.usage.completion_tokens,
        "total_tokens": response.usage.total_tokens,
    }
    return raw, usage
