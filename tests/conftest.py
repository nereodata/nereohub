"""Shared pytest fixtures for NereoHub tests."""
import os
import pytest
from pathlib import Path

from fastapi.testclient import TestClient


@pytest.fixture
def app_data_dir(tmp_path):
    """Temporary directory for config and order (used via NEREOHUB_DATA_DIR)."""
    return tmp_path


@pytest.fixture(autouse=True)
def set_app_data_dir_env(app_data_dir, monkeypatch):
    """Ensure tests use a temporary app data directory."""
    monkeypatch.setenv("NEREOHUB_DATA_DIR", str(app_data_dir))


@pytest.fixture
def client(app_data_dir):
    """FastAPI TestClient with app using app_data_dir for config."""
    from nereohub.api import create_app
    app = create_app()
    return TestClient(app)


@pytest.fixture
def sample_project_root(tmp_path):
    """A temporary directory with plan/ and a sample task markdown file."""
    plan_dir = tmp_path / "plan"
    plan_dir.mkdir()
    task_md = plan_dir / "T-TEST-001.md"
    task_md.write_text("""---
id: T-TEST-001
title: Test task
status: open
weight: 10
version: v0.2
type: feature
---

# Content
""", encoding="utf-8")
    return tmp_path


@pytest.fixture
def project_with_packages(tmp_path):
    """Temporary directory with plan/, packages/foo/plan/, apps/bar/plan/."""
    (tmp_path / "plan").mkdir()
    (tmp_path / "packages" / "foo" / "plan").mkdir(parents=True)
    (tmp_path / "apps" / "bar" / "plan").mkdir(parents=True)
    return tmp_path


@pytest.fixture
def bdd_context():
    """Shared context dict for BDD steps (e.g. project_root path)."""
    return {}


@pytest.fixture
def sample_project_for_bdd(tmp_path):
    """Create a sample project directory for BDD (plan/ with T-TEST-001.md)."""
    plan_dir = tmp_path / "plan"
    plan_dir.mkdir()
    (plan_dir / "T-TEST-001.md").write_text("""---
id: T-TEST-001
title: Test task
status: open
weight: 10
version: v0.2
type: feature
---

# Content
""", encoding="utf-8")
    return tmp_path
