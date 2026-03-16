from docminer_api.extraction.result import ExtractionResult
from pydantic import BaseModel


class Person(BaseModel):
    name: str
    age: int


class TestExtractionResultAllFields:
    def test_construction_with_all_fields(self):
        person = Person(name="Alice", age=30)
        result = ExtractionResult(
            data=person,
            raw='{"name": "Alice", "age": 30}',
            confidence=0.95,
            usage={"prompt_tokens": 10, "completion_tokens": 20},
        )
        assert result.data == person
        assert result.raw == '{"name": "Alice", "age": 30}'
        assert result.confidence == 0.95
        assert result.usage == {"prompt_tokens": 10, "completion_tokens": 20}


class TestExtractionResultOptionalFields:
    def test_optional_fields_default_to_none(self):
        person = Person(name="Bob", age=25)
        result = ExtractionResult(
            data=person,
            raw='{"name": "Bob", "age": 25}',
        )
        assert result.data == person
        assert result.raw == '{"name": "Bob", "age": 25}'
        assert result.confidence is None
        assert result.usage is None


class TestExtractionResultDataField:
    def test_data_holds_pydantic_model_instance(self):
        person = Person(name="Charlie", age=40)
        result = ExtractionResult(data=person, raw='{"name": "Charlie", "age": 40}')
        assert isinstance(result.data, BaseModel)
        assert isinstance(result.data, Person)
        assert result.data.name == "Charlie"
        assert result.data.age == 40
