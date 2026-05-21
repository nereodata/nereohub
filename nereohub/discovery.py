from pathlib import Path
from typing import Optional
from .config import load_project_task_config

from functools import lru_cache

TASK_PATTERNS = ["T-*.md", "B-*.md", "BUG-*.md"]


def resolve_placeholder_paths(root: Path, rel_path: str, folders: dict, label_template: str) -> list:
    """Resolve paths that may contain {name} placeholders and include subfolders."""
    root = Path(root).resolve()
    results = []

    if "{name}" in rel_path:
        # e.g. services/{name}/docs/backlog/
        base_part = rel_path.split("{name}")[0]
        base_dir = (root / base_part).resolve()
        if base_dir.exists() and base_dir.is_dir():
            for sub in base_dir.iterdir():
                if sub.is_dir():
                    # Attempt to resolve the full path for this specific item
                    item_rel_path = rel_path.replace("{name}", sub.name)
                    item_full_path = (root / item_rel_path).resolve()
                    if item_full_path.exists() and item_full_path.is_dir():
                        label = label_template.replace("{name}", sub.name)
                        results.extend(apply_folders(item_full_path, folders, label))
    else:
        full_path = (root / rel_path).resolve()
        if full_path.exists() and full_path.is_dir():
            results.extend(apply_folders(full_path, folders, label_template))

    return results


def apply_folders(base_path: Path, folders: dict, label: str) -> list:
    """Append subfolders to the base path if they exist."""
    res = []
    # If no folders defined or both are empty, use the base path
    has_subfolders = False
    if folders:
        for f_type in ["tasks", "bugs"]:
            sub_rel = folders.get(f_type)
            if sub_rel:
                p = (base_path / sub_rel).resolve()
                if p.exists() and p.is_dir():
                    res.append((p, label))
                    has_subfolders = True

    if not has_subfolders:
        res.append((base_path, label))
    return res


@lru_cache(maxsize=32)
def get_plan_search_dirs(root: Path) -> list:
    """
    Discover plan directories from project root.
    1. Check for project-specific task_config.yaml.
    2. Fallback to conventions.
    Returns list of (directory_path, package_label).
    """
    root = Path(root).resolve()
    cfg = load_project_task_config(root)
    dirs = []

    # 1. Configuration driven discovery
    levels = cfg.get("levels", {})

    # Master
    master_cfg = levels.get("master", {})
    master_path = master_cfg.get("path")
    if master_path:
        dirs.extend(
            resolve_placeholder_paths(
                root, master_path, master_cfg.get("folders"), "master"
            )
        )

    # Components
    components = levels.get("components", [])
    for comp in components:
        comp_path = comp.get("path")
        if comp_path:
            label_tmpl = comp.get("id_prefix") or comp.get("name") or "{name}"
            dirs.extend(
                resolve_placeholder_paths(
                    root, comp_path, comp.get("folders"), label_tmpl
                )
            )

    # 2. Convention driven discovery (Always append if missing)
    conventions_master = [
        root / "plan",
        root / "docs" / "plan",
        root / "docs" / "plan" / "tasks",
    ]
    for p_conv in conventions_master:
        if p_conv.exists() and p_conv.is_dir():
            if not any(d.resolve() == p_conv.resolve() for d, _ in dirs):
                dirs.append((p_conv, "master"))

    # Fallback for packages/apps only if no components defined IN CONFIG
    # (Checking if components list was empty in config)
    if not components:
        for sub in ("packages", "apps"):
            base_dir = root / sub
            if base_dir.exists():
                for pkg in base_dir.iterdir():
                    if pkg.is_dir():
                        p_plan = pkg / "plan"
                        if p_plan.exists() and p_plan.is_dir():
                            dirs.append((p_plan, pkg.name))
                        for sub_docs in ("backlog", "anomalies"):
                            d_docs = pkg / "docs" / sub_docs
                            if d_docs.exists() and d_docs.is_dir():
                                dirs.append((d_docs, pkg.name))

    return dirs


def package_from_path(file_path: Path, project_root: Path) -> str:
    """Infer package from path relative to project root."""
    file_path = Path(file_path).resolve()
    project_root = Path(project_root).resolve()

    # 1. Try matching against discovery directories (respects config)
    search_dirs = get_plan_search_dirs(project_root)
    for d, label in search_dirs:
        try:
            file_path.relative_to(d)
            return label
        except ValueError:
            continue

    # 2. Fallback to hardcoded conventions (already covered by get_plan_search_dirs fallback, but let's be safe)
    try:
        rel = file_path.relative_to(project_root)
        parts = rel.parts
        if not parts:
            return "unknown"
        if parts[0] == "plan":
            return "master"
        if parts[0] in ("packages", "apps") and len(parts) > 1:
            return parts[1]
    except ValueError:
        pass
    return "unknown"


def find_task_file(project_root: Path, task_id: str) -> Optional[Path]:
    """Find the markdown file for a task id under project root."""
    search_dirs = get_plan_search_dirs(project_root)
    for d, _ in search_dirs:
        if not d.exists():
            continue
        for pat in TASK_PATTERNS:
            for f in d.glob(pat):
                if (
                    f.stem == task_id
                    or f.stem.startswith(task_id + "-")
                    or f.stem.startswith(task_id + ".")
                ):
                    return f
    return None
