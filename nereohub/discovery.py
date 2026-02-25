"""Discover plan directories from a project root (convention: plan/, packages/*/plan/, apps/*/plan/)."""
from pathlib import Path
from typing import Optional

TASK_PATTERNS = ["T-*.md", "B-*.md", "BUG-*.md"]


def get_plan_search_dirs(root: Path) -> list:
    """
    Discover plan directories from project root.
    Convention: ROOT/plan/, ROOT/packages/<name>/plan/, ROOT/apps/<name>/plan/.
    Optional fallback: ROOT/docs/plan/tasks, ROOT/docs/plan, ROOT/packages/<name>/docs/backlog, .../docs/anomalies.
    Returns list of (directory_path, package_label) where package_label is "master" or package/app name.
    """
    dirs = []
    root = Path(root).resolve()

    plan_root = root / "plan"
    if plan_root.exists() and plan_root.is_dir():
        dirs.append((plan_root, "master"))

    packages_dir = root / "packages"
    if packages_dir.exists():
        for pkg in packages_dir.iterdir():
            if pkg.is_dir():
                plan_pkg = pkg / "plan"
                if plan_pkg.exists() and plan_pkg.is_dir():
                    dirs.append((plan_pkg, pkg.name))

    apps_dir = root / "apps"
    if apps_dir.exists():
        for app in apps_dir.iterdir():
            if app.is_dir():
                plan_app = app / "plan"
                if plan_app.exists() and plan_app.is_dir():
                    dirs.append((plan_app, app.name))

    docs_plan_tasks = root / "docs" / "plan" / "tasks"
    if docs_plan_tasks.exists() and docs_plan_tasks.is_dir():
        dirs.append((docs_plan_tasks, "master"))
    docs_plan = root / "docs" / "plan"
    if docs_plan.exists() and docs_plan.is_dir() and not any(d == docs_plan for d, _ in dirs):
        dirs.append((docs_plan, "master"))

    if packages_dir.exists():
        for pkg in packages_dir.iterdir():
            if pkg.is_dir():
                for sub in ("backlog", "anomalies"):
                    d = pkg / "docs" / sub
                    if d.exists() and d.is_dir():
                        dirs.append((d, pkg.name))

    if apps_dir.exists():
        for app in apps_dir.iterdir():
            if app.is_dir():
                for sub in ("backlog", "anomalies"):
                    d = app / "docs" / sub
                    if d.exists() and d.is_dir():
                        dirs.append((d, app.name))

    return dirs


def package_from_path(file_path: Path, project_root: Path) -> str:
    """Infer package from path relative to project root."""
    try:
        rel = file_path.relative_to(project_root)
        parts = rel.parts
        if not parts:
            return "master"
        if parts[0] == "plan":
            return "master"
        if len(parts) >= 2 and parts[0] == "docs" and parts[1] == "plan":
            return "master"
        if parts[0] == "packages" and len(parts) > 1:
            return parts[1]
        if parts[0] == "apps" and len(parts) > 1:
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
                if f.stem == task_id or f.stem.startswith(task_id + "-") or f.stem.startswith(task_id + "."):
                    return f
    return None
