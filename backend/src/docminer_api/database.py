from __future__ import annotations

from sqlmodel import Session, SQLModel, create_engine

from docminer_api.config import settings

engine = create_engine(
    settings.db_url,
    connect_args={"check_same_thread": False},
)


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
