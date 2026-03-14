from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI

from docminer_api.config import settings
from docminer_api.database import create_db_and_tables
from docminer_api.routes import documents, extract, schemas


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    create_db_and_tables()
    Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(title="docminer API", lifespan=lifespan)

app.include_router(documents.router)
app.include_router(schemas.router)
app.include_router(extract.router)
