"""Unit tests for project-specific task_config.yaml loading."""

import yaml
from pathlib import Path
from nereohub.config import load_project_task_config


def test_load_project_task_config_valid(tmp_path):
    """Load valid task_config.yaml from project root."""
    config_data = {
        "project": {"prefix": "PRJ", "name": "Project"},
        "levels": {
            "master": {"id_prefix": "", "path": "plan/"},
            "components": [
                {"type": "package", "id_prefix": "CORE", "path": "nereohub/plan/"}
            ],
        },
    }
    config_file = tmp_path / "task_config.yaml"
    with open(config_file, "w", encoding="utf-8") as f:
        yaml.dump(config_data, f)

    loaded = load_project_task_config(tmp_path)
    assert loaded["project"]["prefix"] == "PRJ"
    assert loaded["levels"]["master"]["path"] == "plan/"
    assert len(loaded["levels"]["components"]) == 1
    assert loaded["levels"]["components"][0]["id_prefix"] == "CORE"


def test_load_project_task_config_missing(tmp_path):
    """Return defaults when task_config.yaml is missing."""
    loaded = load_project_task_config(tmp_path)
    # Default values based on current hardcoded logic in discovery.py
    assert loaded["project"]["prefix"] == ""
    assert loaded["levels"]["master"]["path"] == "plan/"
    # By default, we might still want to support the packages/* convention if not specified?
    # Or maybe the defaults should be empty components.
    assert "components" in loaded["levels"]


def test_load_project_task_config_invalid_yaml(tmp_path):
    """Handle invalid YAML gracefully by returning defaults."""
    config_file = tmp_path / "task_config.yaml"
    config_file.write_text("invalid: yaml: :", encoding="utf-8")

    loaded = load_project_task_config(tmp_path)
    assert loaded["project"]["prefix"] == ""
