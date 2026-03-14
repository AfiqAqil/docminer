from __future__ import annotations

from fastapi.testclient import TestClient

SCHEMA_DEF = {"invoice_no": "str", "total": "float"}


def test_list_schemas_empty(client: TestClient):
    response = client.get("/schemas")
    assert response.status_code == 200
    assert response.json() == []


def test_create_schema(client: TestClient):
    response = client.post(
        "/schemas",
        json={"name": "Invoice", "definition": SCHEMA_DEF},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Invoice"
    assert data["id"] is not None


def test_get_schema(client: TestClient):
    create = client.post("/schemas", json={"name": "Invoice", "definition": SCHEMA_DEF})
    schema_id = create.json()["id"]

    response = client.get(f"/schemas/{schema_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Invoice"


def test_get_schema_not_found(client: TestClient):
    response = client.get("/schemas/999")
    assert response.status_code == 404


def test_delete_schema(client: TestClient):
    create = client.post(
        "/schemas", json={"name": "ToDelete", "definition": SCHEMA_DEF}
    )
    schema_id = create.json()["id"]

    response = client.delete(f"/schemas/{schema_id}")
    assert response.status_code == 204

    response = client.get(f"/schemas/{schema_id}")
    assert response.status_code == 404


def test_delete_schema_not_found(client: TestClient):
    response = client.delete("/schemas/999")
    assert response.status_code == 404


def test_schemas_appear_in_list(client: TestClient):
    client.post("/schemas", json={"name": "S1", "definition": SCHEMA_DEF})
    client.post("/schemas", json={"name": "S2", "definition": SCHEMA_DEF})

    response = client.get("/schemas")
    assert response.status_code == 200
    assert len(response.json()) == 2
