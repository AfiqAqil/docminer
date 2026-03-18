from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from app.database import get_session
from app.models import Schema

router = APIRouter(prefix="/schemas", tags=["schemas"])


class SchemaCreate(BaseModel):
    name: str
    definition: dict


@router.post("", response_model=Schema, status_code=status.HTTP_201_CREATED)
def create_schema(
    body: SchemaCreate,
    session: Session = Depends(get_session),
) -> Schema:
    schema = Schema(
        name=body.name,
        definition=json.dumps(body.definition),
    )
    session.add(schema)
    session.commit()
    session.refresh(schema)
    return schema


@router.get("", response_model=list[Schema])
def list_schemas(session: Session = Depends(get_session)) -> list[Schema]:
    return list(session.exec(select(Schema)).all())


@router.get("/{schema_id}", response_model=Schema)
def get_schema(
    schema_id: int,
    session: Session = Depends(get_session),
) -> Schema:
    schema = session.get(Schema, schema_id)
    if schema is None:
        raise HTTPException(status_code=404, detail="Schema not found")
    return schema


@router.delete("/{schema_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_schema(
    schema_id: int,
    session: Session = Depends(get_session),
) -> None:
    schema = session.get(Schema, schema_id)
    if schema is None:
        raise HTTPException(status_code=404, detail="Schema not found")
    session.delete(schema)
    session.commit()
