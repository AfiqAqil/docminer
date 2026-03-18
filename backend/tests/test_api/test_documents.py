from __future__ import annotations

import io

import app.config as cfg
from fastapi.testclient import TestClient


def test_list_documents_empty(client: TestClient):
    response = client.get("/documents")
    assert response.status_code == 200
    assert response.json() == []


def test_upload_document(client: TestClient, tmp_path, monkeypatch):
    monkeypatch.setattr(cfg.settings, "upload_dir", str(tmp_path))

    response = client.post(
        "/documents/upload",
        files={"file": ("invoice.png", io.BytesIO(b"fake bytes"), "image/png")},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["filename"] == "invoice.png"
    assert data["content_type"] == "image/png"
    assert data["id"] is not None


def test_upload_document_saves_file(client: TestClient, tmp_path, monkeypatch):
    monkeypatch.setattr(cfg.settings, "upload_dir", str(tmp_path))
    file_content = b"real image bytes"

    client.post(
        "/documents/upload",
        files={"file": ("doc.png", io.BytesIO(file_content), "image/png")},
    )

    saved_files = list(tmp_path.iterdir())
    assert len(saved_files) == 1
    assert saved_files[0].read_bytes() == file_content


def test_upload_document_appears_in_list(client: TestClient, tmp_path, monkeypatch):
    monkeypatch.setattr(cfg.settings, "upload_dir", str(tmp_path))

    client.post(
        "/documents/upload",
        files={"file": ("doc.jpg", io.BytesIO(b"data"), "image/jpeg")},
    )

    response = client.get("/documents")
    assert response.status_code == 200
    docs = response.json()
    assert len(docs) == 1
    assert docs[0]["filename"] == "doc.jpg"


def test_upload_multiple_documents(client: TestClient, tmp_path, monkeypatch):
    monkeypatch.setattr(cfg.settings, "upload_dir", str(tmp_path))

    client.post(
        "/documents/upload",
        files={"file": ("a.png", io.BytesIO(b"a"), "image/png")},
    )
    client.post(
        "/documents/upload",
        files={"file": ("b.png", io.BytesIO(b"b"), "image/png")},
    )

    response = client.get("/documents")
    assert len(response.json()) == 2
