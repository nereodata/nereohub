from pathlib import Path
from typing import Optional
from .config import load_project_task_config

TASK_PATTERNS = ["T-*.md", "B-*.md", "BUG-*.md"]


def get_plan_search_dirs(root: Path) -> list:
    """
    Discover plan directories from project root.
    1. Check for project-specific task_config.yaml.
    2. Fallback to conventions (ROOT/plan/, ROOT/packages/*/plan/, etc.).
    Returns list of (directory_path, package_label).
    """
    root = Path(root).resolve()
    path = root / "task_config.yaml"
    has_config = path.exists()
    cfg = load_project_task_config(root)
    dirs = []

    if has_config:
        # 1. Configuration driven discovery (Start with config)
        levels = cfg.get("levels", {})
        master_cfg = levels.get("master", {})
        master_rel_path = master_cfg.get("path")
        if master_rel_path:
            p = (root / master_rel_path).resolve()
            if p.exists() and p.is_dir():
                dirs.append((p, "master"))

        components = levels.get("components", [])
        for comp in components:
            comp_path = comp.get("path")
            if comp_path:
                p = (root / comp_path).resolve()
                if p.exists() and p.is_dir():
                    label = comp.get("id_prefix") or comp.get("name") or "component"
                    dirs.append((p, label))

    # 2. Convention driven discovery (Always append if missing)
    # This ensures files in docs/plan or plan/ are still found
    conventions_master = [
        root / "plan",
        root / "docs" / "plan",
        root / "docs" / "plan" / "tasks",
    ]
    for p_conv in conventions_master:
        if p_conv.exists() and p_conv.is_dir():
            if not any(d.resolve() == p_conv.resolve() for d, _ in dirs):
                dirs.append((p_conv, "master"))

    # Fallback for packages/apps only if no components defined in config
    if not any(label != "master" for _, label in dirs):
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
