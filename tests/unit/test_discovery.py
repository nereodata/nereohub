"""Unit tests for nereohub.discovery."""

import pytest
from pathlib import Path

from nereohub.discovery import (
    get_plan_search_dirs,
    package_from_path,
    find_task_file,
    TASK_PATTERNS,
)


def test_task_patterns_defined():
    """TASK_PATTERNS includes expected globs."""
    assert "T-*.md" in TASK_PATTERNS
    assert "B-*.md" in TASK_PATTERNS
    assert "BUG-*.md" in TASK_PATTERNS


def test_get_plan_search_dirs_finds_plan_root(sample_project_root):
    """get_plan_search_dirs finds ROOT/plan/ as master."""
    dirs = get_plan_search_dirs(sample_project_root)
    labels = [label for _, label in dirs]
    assert "master" in labels
    plan_dirs = [d for d, l in dirs if l == "master"]
    assert any((sample_project_root / "plan") == d for d in plan_dirs)


def test_get_plan_search_dirs_finds_packages_and_apps(project_with_packages):
    """get_plan_search_dirs finds packages/*/plan and apps/*/plan."""
    dirs = get_plan_search_dirs(project_with_packages)
    labels = [label for _, label in dirs]
    assert "master" in labels
    assert "foo" in labels
    assert "bar" in labels


def test_get_plan_search_dirs_fallback_docs_plan_tasks(tmp_path):
    """Fallback: docs/plan/tasks is discovered as master."""
    (tmp_path / "docs" / "plan" / "tasks").mkdir(parents=True)
    dirs = get_plan_search_dirs(tmp_path)
    assert any("tasks" in str(d) and "docs" in str(d) for d, _ in dirs)


def test_package_from_path_plan_is_master(sample_project_root):
    """File under plan/ has package master."""
    f = sample_project_root / "plan" / "T-TEST-001.md"
    assert package_from_path(f, sample_project_root) == "master"


def test_package_from_path_packages_foo(sample_project_root):
    """File under packages/foo/ has package foo."""
    pkg_plan = sample_project_root / "packages" / "foo" / "plan"
    pkg_plan.mkdir(parents=True)
    f = pkg_plan / "T-X-001.md"
    f.write_text("---\nid: T-X-001\n---\n")
    assert package_from_path(f, sample_project_root) == "foo"


def test_find_task_file_finds_by_stem(sample_project_root):
    """find_task_file returns file when task_id matches stem."""
    found = find_task_file(sample_project_root, "T-TEST-001")
    assert found is not None
    assert found.name == "T-TEST-001.md"


def test_find_task_file_returns_none_unknown_id(sample_project_root):
    """find_task_file returns None when task not found."""
    assert find_task_file(sample_project_root, "T-NONE-999") is None


def test_get_plan_search_dirs_with_config(tmp_path):
    """get_plan_search_dirs uses values from task_config.yaml."""
    # Define custom paths
    (tmp_path / "custom_master").mkdir(parents=True)
    (tmp_path / "src" / "core" / "plan").mkdir(parents=True)

    config_content = """
project:
  prefix: PRJ
levels:
  master:
    path: custom_master/
  components:
    - type: package
      id_prefix: CORE
      path: src/core/plan/
"""
    (tmp_path / "task_config.yaml").write_text(config_content, encoding="utf-8")

    dirs = get_plan_search_dirs(tmp_path)
    labels = [label for _, label in dirs]

    assert "master" in labels
    assert "CORE" in labels

    master_path = next(d for d, l in dirs if l == "master")
    core_path = next(d for d, l in dirs if l == "CORE")

    assert str(master_path).replace("\\", "/").endswith("custom_master")
    assert str(core_path).replace("\\", "/").endswith("src/core/plan")


def test_get_plan_search_dirs_v3_folders(tmp_path):
    """v3.0: get_plan_search_dirs returns segregated folders if configured."""
    (tmp_path / "docs" / "tasks").mkdir(parents=True)
    (tmp_path / "docs" / "bugs").mkdir(parents=True)

    config_content = """
levels:
  master:
    path: docs/
    folders:
      tasks: tasks/
      bugs: bugs/
"""
    (tmp_path / "task_config.yaml").write_text(config_content, encoding="utf-8")

    dirs = get_plan_search_dirs(tmp_path)
    paths = [str(d).replace("\\", "/") for d, _ in dirs]

    assert any(p.endswith("docs/tasks") for p in paths)
    assert any(p.endswith("docs/bugs") for p in paths)


def test_get_plan_search_dirs_v3_placeholders(tmp_path):
    """v3.0: get_plan_search_dirs resolves {name} placeholders."""
    # Create structure: services/srv-a/backlog, services/srv-b/backlog
    (tmp_path / "services" / "srv-a" / "backlog").mkdir(parents=True)
    (tmp_path / "services" / "srv-b" / "backlog").mkdir(parents=True)
    (tmp_path / "services" / "README.md").write_text("not a dir")

    config_content = """
levels:
  components:
    - type: service
      id_prefix: "{name}"
      path: services/{name}/backlog/
"""
    (tmp_path / "task_config.yaml").write_text(config_content, encoding="utf-8")

    dirs = get_plan_search_dirs(tmp_path)
    srv_dirs = [d for d, label in dirs if label in ("srv-a", "srv-b")]

    assert len(srv_dirs) == 2
    labels = [label for _, label in dirs]
    assert "srv-a" in labels
    assert "srv-b" in labels
