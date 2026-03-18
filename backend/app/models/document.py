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
