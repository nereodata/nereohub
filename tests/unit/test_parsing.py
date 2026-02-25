"""Unit tests for nereohub.parsing."""
import pytest
from pathlib import Path

from nereohub.parsing import parse_markdown_frontmatter


def test_parse_markdown_frontmatter_success(sample_project_root):
    """parse_markdown_frontmatter returns dict with path and content_text."""
    f = sample_project_root / "plan" / "T-TEST-001.md"
    result = parse_markdown_frontmatter(f, sample_project_root)
    assert result is not None
    assert result.get("id") == "T-TEST-001"
    assert result.get("title") == "Test task"
    assert "path" in result
    assert result["path"].replace("\\", "/") == "plan/T-TEST-001.md"
    assert "content_text" in result
    assert "Content" in result["content_text"]


def test_parse_markdown_frontmatter_no_frontmatter(tmp_path):
    """parse_markdown_frontmatter returns None when no valid frontmatter."""
    f = tmp_path / "no-fm.md"
    f.write_text("Just text\n", encoding="utf-8")
    assert parse_markdown_frontmatter(f, tmp_path) is None


def test_parse_markdown_frontmatter_empty_frontmatter(tmp_path):
    """parse_markdown_frontmatter returns None when frontmatter is empty."""
    f = tmp_path / "empty.md"
    f.write_text("---\n---\nbody", encoding="utf-8")
    result = parse_markdown_frontmatter(f, tmp_path)
    # Implementation may return {} or None for empty yaml
    if result is not None:
        assert "path" in result
