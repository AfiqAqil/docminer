from __future__ import annotations

import io
import json
from unittest.mock import patch

import docminer_api.config as cfg
from docminer_api.extraction import ExtractionResult
from fastapi.testclient import TestClient
from pydantic import BaseModel

SCHEMA_DEF = {"invoice_no": "str", "total": "float"}


class _FakeModel(BaseModel):
    invoice_no: str
    total: float


def _upload_doc(client: TestClient, tmp_path, monkeypatch) -> int:
    monkeypatch.setattr(cfg.settings, "upload_dir", str(tmp_path))
    r = client.post(
        "/documents/upload",
        files={"file": ("inv.png", io.BytesIO(b"fake"), "image/png")},
    )
    return r.json()["id"]


def _create_schema(client: TestClient) -> int:
    r = client.post("/schemas", json={"name": "Invoice", "definition": SCHEMA_DEF})
    return r.json()["id"]


def test_start_extraction_creates_pending_job(
    client: TestClient, tmp_path, monkeypatch
):
    doc_id = _upload_doc(client, tmp_path, monkeypatch)
    schema_id = _create_schema(client)

    response = client.post(
        "/extract", json={"document_id": doc_id, "schema_id": schema_id}
    )

    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "pending"
    assert data["document_id"] == doc_id
    assert data["schema_id"] == schema_id
    assert data["id"] is not None


def test_get_job_not_found(client: TestClient):
    response = client.get("/extract/999")
    assert response.status_code == 404


def test_get_job(client: TestClient, tmp_path, monkeypatch):
    doc_id = _upload_doc(client, tmp_path, monkeypatch)
    schema_id = _create_schema(client)

    create = client.post(
        "/extract", json={"document_id": doc_id, "schema_id": schema_id}
    )
    job_id = create.json()["id"]

    response = client.get(f"/extract/{job_id}")
    assert response.status_code == 200
    assert response.json()["id"] == job_id


def test_extraction_completes_successfully(client: TestClient, tmp_path, monkeypatch):
    doc_id = _upload_doc(client, tmp_path, monkeypatch)
    schema_id = _create_schema(client)

    fake_model = _FakeModel(invoice_no="INV-001", total=99.99)
    fake_result = ExtractionResult(
        data=fake_model,
        raw='{"invoice_no": "INV-001", "total": 99.99}',
    )

    with patch("docminer_api.services.extraction_service.Extractor") as mock_cls:
        mock_cls.return_value.extract.return_value = fake_result
        create = client.post(
            "/extract", json={"document_id": doc_id, "schema_id": schema_id}
        )

    job_id = create.json()["id"]

    poll = client.get(f"/extract/{job_id}")
    assert poll.status_code == 200
    data = poll.json()
    assert data["status"] == "completed"
    assert data["result"] is not None
    result_dict = json.loads(data["result"])
    assert result_dict["invoice_no"] == "INV-001"
    assert result_dict["total"] == 99.99


def test_list_extractions(client: TestClient, tmp_path, monkeypatch):
    doc_id = _upload_doc(client, tmp_path, monkeypatch)
    schema_id = _create_schema(client)

    client.post("/extract", json={"document_id": doc_id, "schema_id": schema_id})
    client.post("/extract", json={"document_id": doc_id, "schema_id": schema_id})

    response = client.get("/extract")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2


def test_list_extractions_empty(client: TestClient):
    response = client.get("/extract")
    assert response.status_code == 200
    assert response.json() == []


def test_extraction_fails_on_extractor_error(client: TestClient, tmp_path, monkeypatch):
    doc_id = _upload_doc(client, tmp_path, monkeypatch)
    schema_id = _create_schema(client)

    with patch("docminer_api.services.extraction_service.Extractor") as mock_cls:
        mock_cls.return_value.extract.side_effect = Exception("LLM unavailable")
        create = client.post(
            "/extract", json={"document_id": doc_id, "schema_id": schema_id}
        )

    job_id = create.json()["id"]

    poll = client.get(f"/extract/{job_id}")
    data = poll.json()
    assert data["status"] == "failed"
    assert "LLM unavailable" in data["error"]


def test_stream_job_not_found(client: TestClient):
    with client.stream("GET", "/extract/999/stream") as response:
        assert response.status_code == 200
        text = response.read().decode()
    assert "error" in text


def test_stream_completed_job(client: TestClient, tmp_path, monkeypatch):
    doc_id = _upload_doc(client, tmp_path, monkeypatch)
    schema_id = _create_schema(client)

    fake_result = ExtractionResult(
        data=_FakeModel(invoice_no="INV-002", total=0.0),
        raw='{"invoice_no": "INV-002", "total": 0.0}',
    )

    with patch("docminer_api.services.extraction_service.Extractor") as mock_cls:
        mock_cls.return_value.extract.return_value = fake_result
        create = client.post(
            "/extract", json={"document_id": doc_id, "schema_id": schema_id}
        )

    job_id = create.json()["id"]

    with client.stream("GET", f"/extract/{job_id}/stream") as response:
        assert response.status_code == 200
        text = response.read().decode()

    assert "completed" in text
