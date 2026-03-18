from __future__ import annotations

import json
from datetime import UTC, datetime

from sqlmodel import Session

from app.extraction import Extractor
from app.extraction.schema import from_dict
from app.models import Document, ExtractionJob, Schema


def run_extraction(job_id: int) -> None:
    """Run extraction for a job. Creates its own DB session."""
    import app.database as _db

    with Session(_db.engine) as session:
        job = session.get(ExtractionJob, job_id)
        if job is None:
            return

        job.status = "processing"
        session.add(job)
        session.commit()

        try:
            document = session.get(Document, job.document_id)
            schema_record = session.get(Schema, job.schema_id)

            if document is None or schema_record is None:
                raise ValueError("Document or schema record not found")

            schema_dict = json.loads(schema_record.definition)
            schema_model = from_dict(schema_dict)

            import app.config as _cfg

            extractor = Extractor(model=_cfg.settings.model)
            result = extractor.extract(document.file_path, schema=schema_model)

            job.status = "completed"
            job.result = json.dumps(result.data.model_dump())
            job.completed_at = datetime.now(UTC)
        except Exception as exc:
            job.status = "failed"
            job.error = str(exc)
            job.completed_at = datetime.now(UTC)

        session.add(job)
        session.commit()
