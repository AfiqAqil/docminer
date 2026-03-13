import json
from typing import Optional

from pydantic import BaseModel

from docminer.schema import schema_to_prompt


class FlatModel(BaseModel):
    name: str
    age: int


class Address(BaseModel):
    street: str
    city: str


class NestedModel(BaseModel):
    name: str
    addresses: list[dict]


class OptionalFieldsModel(BaseModel):
    name: str
    nickname: Optional[str] = None
    age: Optional[int] = None


def test_flat_model_contains_field_names():
    result = schema_to_prompt(FlatModel)
    assert "name" in result
    assert "age" in result


def test_flat_model_output_is_valid_json():
    result = schema_to_prompt(FlatModel)
    parsed = json.loads(result)
    assert isinstance(parsed, dict)


def test_nested_model():
    result = schema_to_prompt(NestedModel)
    parsed = json.loads(result)
    assert isinstance(parsed, dict)
    assert "name" in result
    assert "addresses" in result


def test_optional_fields():
    result = schema_to_prompt(OptionalFieldsModel)
    parsed = json.loads(result)
    assert isinstance(parsed, dict)
    assert "nickname" in result
    assert "age" in result
    # Required fields should be listed
    properties = parsed.get("properties", {})
    assert "name" in properties
    assert "nickname" in properties
    assert "age" in properties


def test_output_is_valid_json():
    """Ensure all models produce valid JSON output."""
    for model in [FlatModel, NestedModel, OptionalFieldsModel]:
        result = schema_to_prompt(model)
        parsed = json.loads(result)
        assert isinstance(parsed, dict)
