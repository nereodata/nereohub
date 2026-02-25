"""
User configuration for NereoHub. Stored in OS app data directory, not in the repo.
- Windows: %APPDATA%\\NereoHub\\config.yaml
- macOS: ~/Library/Application Support/NereoHub/config.yaml
- Linux: ~/.config/nereohub/config.yaml

For tests, set NEREOHUB_DATA_DIR to a temporary directory.
"""
import os
from pathlib import Path
from typing import List

import yaml

HUB_NAME = "NereoHub"


def get_app_data_dir() -> Path:
    """Return the Hub application data directory (cross-platform)."""
    env_dir = os.environ.get("NEREOHUB_DATA_DIR")
    if env_dir:
        return Path(env_dir).resolve()
    try:
        from platformdirs import user_data_dir
        return Path(user_data_dir(HUB_NAME, ""))
    except ImportError:
        if os.name == "nt":
            base = os.environ.get("APPDATA", os.path.expanduser("~"))
            return Path(base) / HUB_NAME
        if os.name == "posix":
            if os.uname().sysname == "Darwin":
                return Path.home() / "Library" / "Application Support" / HUB_NAME
            return Path.home() / ".config" / "nereohub"
    return Path.home() / ".config" / "nereohub"


def get_config_path() -> Path:
    return get_app_data_dir() / "config.yaml"


def get_order_path() -> Path:
    return get_app_data_dir() / "order.json"


def ensure_app_data_dir() -> Path:
    d = get_app_data_dir()
    d.mkdir(parents=True, exist_ok=True)
    return d


def load_config() -> dict:
    path = get_config_path()
    if not path.exists():
        return {"projects": []}
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
            if data is None:
                return {"projects": []}
            if "projects" not in data:
                data["projects"] = []
            return data
    except Exception:
        return {"projects": []}


def save_config(data: dict) -> None:
    ensure_app_data_dir()
    path = get_config_path()
    with open(path, "w", encoding="utf-8") as f:
        yaml.dump(data, f, default_flow_style=False, allow_unicode=True)


def get_projects() -> List[dict]:
    """List of { name, root, color? } with root as resolved Path (string for YAML compat on save)."""
    data = load_config()
    projects = data.get("projects") or []
    result = []
    for p in projects:
        name = p.get("name") or "Unnamed"
        root = p.get("root") or ""
        if root:
            item = {"name": name, "root": str(Path(root).resolve())}
            if p.get("color"):
                item["color"] = str(p["color"]).strip()
            result.append(item)
    return result


def add_project(name: str, root: str, color: str = "") -> dict:
    root_path = Path(root).resolve()
    if not root_path.exists() or not root_path.is_dir():
        raise ValueError("La ruta del proyecto no existe o no es una carpeta.")
    data = load_config()
    projects = data.get("projects") or []
    for existing in projects:
        if Path(existing.get("root", "")).resolve() == root_path:
            raise ValueError("Ese proyecto ya está configurado.")
    entry = {"name": name.strip() or root_path.name, "root": str(root_path)}
    if color and str(color).strip():
        entry["color"] = str(color).strip()
    projects.append(entry)
    data["projects"] = projects
    save_config(data)
    out = {"name": projects[-1]["name"], "root": str(root_path)}
    if projects[-1].get("color"):
        out["color"] = projects[-1]["color"]
    return out


def update_project(old_root: str, name: str, root: str, color: str = None) -> dict:
    data = load_config()
    projects = data.get("projects") or []
    old_path = Path(old_root).resolve()
    for i, p in enumerate(projects):
        if Path(p.get("root", "")).resolve() == old_path:
            new_root = Path(root).resolve() if root else old_path
            if root and (not new_root.exists() or not new_root.is_dir()):
                raise ValueError("La nueva ruta no existe o no es una carpeta.")
            new_name = (name or "").strip() or new_root.name
            entry = {"name": new_name, "root": str(new_root)}
            if color is not None:
                if str(color).strip():
                    entry["color"] = str(color).strip()
                # else: keep no color
            elif p.get("color"):
                entry["color"] = p["color"]
            projects[i] = entry
            data["projects"] = projects
            save_config(data)
            out = {"name": entry["name"], "root": entry["root"]}
            if entry.get("color"):
                out["color"] = entry["color"]
            return out
    raise ValueError("Proyecto no encontrado.")


def delete_project(root: str) -> None:
    data = load_config()
    projects = data.get("projects") or []
    target = Path(root).resolve()
    new_list = [p for p in projects if Path(p.get("root", "")).resolve() != target]
    if len(new_list) == len(projects):
        raise ValueError("Proyecto no encontrado.")
    data["projects"] = new_list
    save_config(data)
