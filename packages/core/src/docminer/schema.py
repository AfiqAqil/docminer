import json

from pydantic import BaseModel


def schema_to_prompt(schema: type[BaseModel]) -> str:
    """Convert a Pydantic model to a prompt-friendly JSON schema string."""
    json_schema = schema.model_json_schema()
    return json.dumps(json_schema, indent=2)
