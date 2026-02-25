"""Unit tests for nereohub.pdf_generator."""
import pytest
from pathlib import Path

from nereohub.pdf_generator import generate_plan_pdf


def test_generate_plan_pdf_creates_file(tmp_path):
    """generate_plan_pdf creates a PDF file with minimal task list."""
    tasks = [
        {
            "id": "T-001",
            "title": "Test task",
            "version": "v0.2",
            "content": "# Test\n\nBody.",
            "type": "feature",
            "status": "open",
            "weight": 10,
        }
    ]
    out = tmp_path / "out.pdf"
    result = generate_plan_pdf(tasks, str(out))
    assert result == str(out)
    assert out.exists()
    assert out.stat().st_size > 500
