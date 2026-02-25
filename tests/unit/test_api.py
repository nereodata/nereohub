"""Unit tests for nereohub API endpoints."""
import pytest
from pathlib import Path

from fastapi.testclient import TestClient


def test_api_projects_list_empty(client: TestClient):
    """GET /api/projects returns empty list when no projects."""
    r = client.get("/api/projects")
    assert r.status_code == 200
    assert r.json() == {"projects": []}


def test_api_projects_add_success(client: TestClient, sample_project_root: Path):
    """POST /api/projects adds a project when root exists."""
    r = client.post(
        "/api/projects",
        json={"name": "TestProj", "root": str(sample_project_root)},
    )
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert data["project"]["name"] == "TestProj"
    r2 = client.get("/api/projects")
    assert len(r2.json()["projects"]) == 1


def test_api_projects_add_fails_missing_root(client: TestClient):
    """POST /api/projects returns 400 when root missing."""
    r = client.post("/api/projects", json={"name": "X"})
    assert r.status_code == 400


def test_api_projects_add_fails_nonexistent_path(client: TestClient):
    """POST /api/projects returns 400 when path does not exist."""
    r = client.post(
        "/api/projects",
        json={"name": "X", "root": "/nonexistent/path/xyz"},
    )
    assert r.status_code == 400


def test_api_data_empty(client: TestClient):
    """GET /api/data returns structure with empty lists when no projects."""
    r = client.get("/api/data")
    assert r.status_code == 200
    data = r.json()
    assert "projects" in data
    assert "masters" in data
    assert "backlog" in data
    assert "anomalies" in data
    assert "stats" in data
    assert data["projects"] == []


def test_api_data_returns_tasks_from_project(client: TestClient, sample_project_root: Path):
    """GET /api/data returns masters when project has plan/ with task md."""
    client.post(
        "/api/projects",
        json={"name": "TestProj", "root": str(sample_project_root)},
    )
    r = client.get("/api/data")
    assert r.status_code == 200
    data = r.json()
    assert len(data["projects"]) == 1
    assert len(data["masters"]) >= 1
    for m in data["masters"]:
        assert m.get("project_id") == "TestProj" or m.get("project") == "TestProj"


def test_api_content_requires_project_id(client: TestClient):
    """GET /api/content without project_id returns 422 or 404."""
    r = client.get("/api/content", params={"path": "plan/T-TEST-001.md"})
    assert r.status_code in (404, 422)


def test_api_content_success(client: TestClient, sample_project_root: Path):
    """GET /api/content returns file content when project and path valid."""
    client.post(
        "/api/projects",
        json={"name": "TestProj", "root": str(sample_project_root)},
    )
    r = client.get(
        "/api/content",
        params={"project_id": "TestProj", "path": "plan/T-TEST-001.md"},
    )
    assert r.status_code == 200
    assert "content" in r.json()
    assert "T-TEST-001" in r.json()["content"]


def test_api_order_post(client: TestClient):
    """POST /api/order accepts order data."""
    r = client.post(
        "/api/order",
        json={"Proj1": {"T-001": 0, "T-002": 1}},
    )
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_api_update_task_requires_project_id(client: TestClient):
    """POST /api/update_task returns 400 when project_id missing."""
    r = client.post(
        "/api/update_task",
        json={"id": "T-TEST-001"},
    )
    assert r.status_code == 400
