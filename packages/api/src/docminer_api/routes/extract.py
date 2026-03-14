from __future__ import annotations

import json
from collections.abc import AsyncGenerator

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session
from sse_starlette.sse import EventSourceResponse

from docminer_api.database import get_session
from docminer_api.models import ExtractionJob
from docminer_api.services import run_extraction

router = APIRouter(prefix="/extract", tags=["extract"])


class ExtractRequest(BaseModel):
    document_id: int
    schema_id: int


@router.post("", response_model=ExtractionJob, status_code=status.HTTP_201_CREATED)
def start_extraction(
    body: ExtractRequest,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
) -> ExtractionJob:
    job = ExtractionJob(
        document_id=body.document_id,
        schema_id=body.schema_id,
    )
    session.add(job)
    session.commit()
    session.refresh(job)
    background_tasks.add_task(run_extraction, job.id)
    return job


@router.get("/{job_id}", response_model=ExtractionJob)
def get_job(
    job_id: int,
    session: Session = Depends(get_session),
) -> ExtractionJob:
    job = session.get(ExtractionJob, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.get("/{job_id}/stream")
async def stream_job(job_id: int) -> EventSourceResponse:
    async def event_generator() -> AsyncGenerator[dict, None]:
        import asyncio

        import docminer_api.database as _db

        while True:
            with Session(_db.engine) as s:
                job = s.get(ExtractionJob, job_id)

                if job is None:
                    yield {
                        "event": "error",
                        "data": json.dumps({"error": "Job not found"}),
                    }
                    return

                payload: dict = {"status": job.status}
                if job.result:
                    payload["result"] = json.loads(job.result)
                if job.error:
                    payload["error"] = job.error

                yield {"event": "status", "data": json.dumps(payload)}

                if job.status in ("completed", "failed"):
                    return

            await asyncio.sleep(0.5)

    return EventSourceResponse(event_generator())
