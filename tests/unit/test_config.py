"""Unit tests for nereohub.config."""
import pytest
from pathlib import Path

import nereohub.config as config


def test_get_app_data_dir_returns_path():
    """get_app_data_dir returns a Path (conftest sets NEREOHUB_DATA_DIR to tmp_path)."""
    path = config.get_app_data_dir()
    assert isinstance(path, Path)


def test_load_config_empty_when_no_file():
    """load_config returns projects list when file does not exist."""
    data = config.load_config()
    assert data == {"projects": []}


def test_save_and_load_config(app_data_dir):
    """save_config and load_config round-trip."""
    data = {"projects": [{"name": "P1", "root": str(app_data_dir)}]}
    config.save_config(data)
    loaded = config.load_config()
    assert loaded["projects"] == data["projects"]


def test_get_projects_empty_when_no_config():
    """get_projects returns [] when no config file."""
    assert config.get_projects() == []


def test_add_project_success(sample_project_root):
    """add_project adds a project when root exists."""
    proj = config.add_project("TestProj", str(sample_project_root))
    assert proj["name"] == "TestProj"
    assert Path(proj["root"]) == sample_project_root.resolve()
    assert len(config.get_projects()) == 1


def test_add_project_fails_when_root_missing():
    """add_project raises when root does not exist."""
    with pytest.raises(ValueError, match="no existe"):
        config.add_project("X", "/nonexistent/path/xyz")


def test_add_project_fails_duplicate(sample_project_root):
    """add_project raises when same root already added."""
    config.add_project("P1", str(sample_project_root))
    with pytest.raises(ValueError, match="ya está configurado"):
        config.add_project("P2", str(sample_project_root))


def test_delete_project(sample_project_root):
    """delete_project removes the project."""
    config.add_project("P1", str(sample_project_root))
    config.delete_project(str(sample_project_root))
    assert config.get_projects() == []


def test_delete_project_raises_when_not_found():
    """delete_project raises when project not in config."""
    with pytest.raises(ValueError, match="no encontrado"):
        config.delete_project("/some/other/path")
