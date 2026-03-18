from __future__ import annotations

from datetime import UTC, datetime

from sqlmodel import Field, SQLModel


class Schema(SQLModel, table=True):
    __tablename__ = "schema_def"

    id: int | None = Field(default=None, primary_key=True)
    name: str
    definition: str  # JSON-serialized field dict
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
