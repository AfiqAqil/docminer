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


def from_dict(definition: dict) -> type[BaseModel]:
    """Create a dynamic Pydantic model from a dict definition.

    Supports type strings: "str", "int", "float", "bool".
    Supports optional fields via "type | None".
    Supports list-of-dict fields via [{"field": "type"}].
    Raises SchemaError for unknown type strings.
    """
    fields: dict[str, Any] = {}
    for field_name, field_type in definition.items():
        fields[field_name] = _resolve_field(field_name, field_type)
    return create_model("DynamicModel", **fields)


def _resolve_field(field_name: str, field_type: Any) -> Any:
    """Resolve a field definition to a (type, default) tuple for create_model."""
    if isinstance(field_type, list):
        # list of dicts, e.g. [{"desc": "str", "qty": "int"}]
        if len(field_type) == 1 and isinstance(field_type[0], dict):
            return (list[dict[str, Any]], ...)
        raise SchemaError(f"Invalid list definition for field '{field_name}'")

    if isinstance(field_type, str):
        # Handle "type | None" optional syntax
        if "|" in field_type:
            parts = [p.strip() for p in field_type.split("|")]
            if len(parts) == 2 and "None" in parts:
                base_type_str = parts[0] if parts[1] == "None" else parts[1]
                base_type = _resolve_type_str(field_name, base_type_str)
                return (base_type | None, None)
            raise SchemaError(
                f"Invalid union type '{field_type}' for field '{field_name}'"
            )
        return (_resolve_type_str(field_name, field_type), ...)

    raise SchemaError(
        f"Unsupported field definition for '{field_name}': {field_type}"
    )


def _resolve_type_str(field_name: str, type_str: str) -> type:
    """Map a type string to a Python type."""
    resolved = _TYPE_MAP.get(type_str)
    if resolved is None:
        raise SchemaError(f"Unknown type '{type_str}' for field '{field_name}'")
    return resolved


def schema_to_prompt(schema: type[BaseModel]) -> str:
    """Convert a Pydantic model to a prompt-friendly JSON schema string."""
    json_schema = schema.model_json_schema()
    return json.dumps(json_schema, indent=2)
