from __future__ import annotations

from datetime import UTC, datetime

from sqlmodel import Field, SQLModel


class Document(SQLModel, table=True):
    __tablename__ = "document"

    id: int | None = Field(default=None, primary_key=True)
    filename: str
    content_type: str
    file_path: str
    uploaded_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class Schema(SQLModel, table=True):
    __tablename__ = "schema_def"  # "schema" conflicts with SQLAlchemy internals

    id: int | None = Field(default=None, primary_key=True)
    name: str
    definition: str  # JSON-serialized field dict
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class ExtractionJob(SQLModel, table=True):
    __tablename__ = "extraction_job"

    id: int | None = Field(default=None, primary_key=True)
    document_id: int = Field(foreign_key="document.id")
    schema_id: int = Field(foreign_key="schema_def.id")
    status: str = "pending"
    result: str | None = None  # JSON-serialized extraction result
    error: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    completed_at: datetime | None = None
