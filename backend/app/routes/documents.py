from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, UploadFile, status
from sqlmodel import Session, select

from app.config import settings
from app.database import get_session
from app.models import Document

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload", response_model=Document, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile,
    session: Session = Depends(get_session),
) -> Document:
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)

    suffix = Path(file.filename or "upload").suffix
    saved_name = f"{uuid.uuid4().hex}{suffix}"
    file_path = upload_dir / saved_name

    content = await file.read()
    file_path.write_bytes(content)

    doc = Document(
        filename=file.filename or saved_name,
        content_type=file.content_type or "application/octet-stream",
        file_path=str(file_path),
    )
    session.add(doc)
    session.commit()
    session.refresh(doc)
    return doc


@router.get("", response_model=list[Document])
def list_documents(session: Session = Depends(get_session)) -> list[Document]:
    return list(session.exec(select(Document)).all())
