import json

import pytest
from docminer_api.extraction.exceptions import SchemaError
from docminer_api.extraction.schema import from_dict, schema_to_prompt
from pydantic import BaseModel


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
    nickname: str | None = None
    age: int | None = None


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


# --- from_dict tests ---


def test_from_dict_flat_model():
    """from_dict with flat str/int fields creates a valid Pydantic model."""
    Model = from_dict({"name": "str", "age": "int"})
    instance = Model(name="Alice", age=30)
    assert instance.name == "Alice"
    assert instance.age == 30


def test_from_dict_nested_list_of_dicts():
    """from_dict handles a list-of-dicts field definition."""
    Model = from_dict({"items": [{"desc": "str", "qty": "int"}]})
    instance = Model(items=[{"desc": "Widget", "qty": 5}])
    assert instance.items == [{"desc": "Widget", "qty": 5}]


def test_from_dict_optional_fields():
    """from_dict handles 'type | None' optional syntax."""
    Model = from_dict({"name": "str", "nickname": "str | None"})
    instance = Model(name="Alice")
    assert instance.name == "Alice"
    assert instance.nickname is None


def test_from_dict_unknown_type_raises_schema_error():
    """from_dict raises SchemaError for unknown type strings."""
    with pytest.raises(SchemaError, match="Unknown type"):
        from_dict({"bad": "unknown_type"})


def test_from_dict_round_trip_with_schema_to_prompt():
    """from_dict model can be passed to schema_to_prompt successfully."""
    Model = from_dict({"name": "str", "age": "int"})
    result = schema_to_prompt(Model)
    parsed = json.loads(result)
    assert "name" in parsed.get("properties", {})
    assert "age" in parsed.get("properties", {})
