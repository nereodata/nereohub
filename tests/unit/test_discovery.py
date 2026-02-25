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
