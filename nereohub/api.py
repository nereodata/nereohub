"""
NereoHub FastAPI application: multi-project task and anomaly aggregation.
"""

import json
import re
import sys
from pathlib import Path
from typing import Optional
import datetime

from fastapi import FastAPI, Body, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from . import config
from .discovery import (
    TASK_PATTERNS,
    get_plan_search_dirs,
    package_from_path,
    find_task_file,
)
from .parsing import parse_markdown_frontmatter
from .pdf_generator import generate_plan_pdf


def create_app(static_dir: Optional[Path] = None) -> FastAPI:
    """Create FastAPI app. If static_dir is None, use package's static/."""
    app = FastAPI(title="NereoHub API")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    def load_custom_order():
        path = config.get_order_path()
        if not path.exists():
            return {}
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}

    def save_custom_order(order_data: dict):
        config.ensure_app_data_dir()
        with open(config.get_order_path(), "w", encoding="utf-8") as f:
            json.dump(order_data, f, indent=2)

    @app.get("/api/projects")
    async def api_list_projects():
        return {"projects": config.get_projects()}

    @app.post("/api/projects")
    async def api_add_project(body: dict = Body(...)):
        name = body.get("name") or ""
        root = body.get("root") or ""
        color = body.get("color") or ""
        if not root:
            raise HTTPException(
                status_code=400, detail="Falta la ruta del proyecto (root)."
            )
        try:
            project = config.add_project(name, root, color)
            return {"project": project, "status": "ok"}
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    @app.put("/api/projects")
    async def api_update_project(body: dict = Body(...)):
        old_root = body.get("old_root") or ""
        if not old_root:
            raise HTTPException(status_code=400, detail="Falta old_root.")
        try:
            project = config.update_project(
                old_root,
                body.get("name"),
                body.get("root"),
                body.get("color") if "color" in body else None,
            )
            return {"project": project, "status": "ok"}
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    @app.delete("/api/projects")
    async def api_delete_project(
        root: str = Query(..., description="Project root path to remove"),
    ):
        try:
            config.delete_project(root)
            return {"status": "ok"}
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    @app.get("/api/data")
    async def get_all_data():
        projects = config.get_projects()
        data = {
            "projects": [
                {
                    "name": p["name"],
                    "root": p["root"],
                    **({"color": p["color"]} if p.get("color") else {}),
                }
                for p in projects
            ],
            "anomalies": [],
            "backlog": [],
            "masters": [],
            "stats": {
                "bugs_open": 0,
                "tasks_pending": 0,
                "tasks_done": 0,
                "total_estimated": 0,
                "total_remaining": 0,
                "total_actual": 0,
            },
        }
        order_data = load_custom_order()

        for proj in projects:
            project_name = proj["name"]
            project_root = Path(proj["root"])
            if not project_root.exists():
                continue
            search_dirs = get_plan_search_dirs(project_root)
            all_files = []
            for d, _ in search_dirs:
                for pat in TASK_PATTERNS:
                    all_files.extend(d.glob(pat))
            master_map = {}
            found_ids_in_project = set()

            for f in all_files:
                fm = parse_markdown_frontmatter(f, project_root)
                if not fm:
                    continue
                uid = (project_name, fm.get("id"))
                if uid in found_ids_in_project:
                    continue
                found_ids_in_project.add(uid)
                fm["project"] = project_name
                fm["project_id"] = project_name
                fm["package"] = package_from_path(f, project_root)
                try:
                    fm["weight"] = int(fm.get("weight", 9999))
                except (ValueError, TypeError):
                    fm["weight"] = 9999
                for key, default in [
                    ("estimated_effort", 0.0),
                    ("remaining_effort", 0.0),
                    ("actual_effort", 0.0),
                ]:
                    try:
                        fm[key] = float(fm.get(key, default))
                    except (ValueError, TypeError):
                        fm[key] = default
                fm["version"] = str(fm.get("version", "backlog"))
                fm["type"] = fm.get("type", "feature")
                if fm["package"] == "master":
                    master_map[fm["id"]] = {
                        "weight": fm["weight"],
                        "version": fm["version"],
                    }
                parent_id = fm.get("parent_id")
                if parent_id and parent_id in master_map:
                    fm["weight"] = master_map[parent_id]["weight"]
                    child_ver = (fm.get("version") or "").strip().lower()
                    if child_ver in ("", "backlog", "unversioned"):
                        fm["version"] = master_map[parent_id]["version"]
                        fm["inherited"] = True
                    else:
                        fm["inherited"] = False
                if fm["package"] == "master":
                    data["masters"].append(fm)
                elif (
                    fm.get("type") == "bug"
                    or (fm.get("id") or "").startswith("B-")
                    or (fm.get("id") or "").startswith("BUG-")
                ):
                    data["anomalies"].append(fm)
                    if fm.get("status") != "completed":
                        data["stats"]["bugs_open"] += 1
                else:
                    data["backlog"].append(fm)
                    if fm.get("status") == "completed":
                        data["stats"]["tasks_done"] += 1
                    else:
                        data["stats"]["tasks_pending"] += 1
                data["stats"]["total_estimated"] += fm["estimated_effort"]
                data["stats"]["total_remaining"] += fm["remaining_effort"]
                data["stats"]["total_actual"] += fm["actual_effort"]

        for key in ("anomalies", "backlog"):
            items = data[key]
            if not items:
                continue
            by_project = {}
            for item in items:
                pid = item.get("project_id") or item.get("project") or ""
                if pid not in by_project:
                    by_project[pid] = []
                by_project[pid].append(item)
            ordered = []
            for pid, lst in by_project.items():
                order_map = order_data.get(pid) or {}
                lst.sort(
                    key=lambda x: (
                        order_map.get(x.get("id"), 9999),
                        x.get("weight", 9999),
                    )
                )
                ordered.extend(lst)
            data[key] = ordered
        data["masters"].sort(
            key=lambda x: (x.get("version", ""), x.get("weight", 9999))
        )
        data["backlog"].sort(
            key=lambda x: (
                x.get("project_id", ""),
                order_data.get(x.get("project_id"), {}).get(x.get("id"), 9999),
                x.get("weight", 9999),
            )
        )
        data["anomalies"].sort(
            key=lambda x: (
                x.get("project_id", ""),
                order_data.get(x.get("project_id"), {}).get(x.get("id"), 9999),
                x.get("weight", 9999),
            )
        )
        return data

    @app.get("/api/content")
    async def get_content(project_id: str = Query(...), path: str = Query(...)):
        projects = config.get_projects()
        root = None
        for p in projects:
            if p["name"] == project_id:
                root = Path(p["root"])
                break
        if not root:
            raise HTTPException(status_code=404, detail="Proyecto no encontrado")
        full_path = (root / path).resolve()
        root_resolved = root.resolve()
        try:
            full_path.relative_to(root_resolved)
        except ValueError:
            raise HTTPException(status_code=403, detail="Ruta no permitida")
        if full_path.exists() and full_path.is_file():
            try:
                with open(full_path, "r", encoding="utf-8") as f:
                    return {"content": f.read()}
            except Exception as e:
                return {"content": f"Error reading file: {e}"}
        raise HTTPException(status_code=404, detail="File not found")

    @app.post("/api/order")
    async def update_order(order_data: dict = Body(...)):
        current = load_custom_order()
        for project_id, indices in order_data.items():
            if project_id not in current:
                current[project_id] = {}
            current[project_id].update(indices)
        save_custom_order(current)
        return {"status": "ok"}

    @app.post("/api/export-pdf")
    async def export_pdf(tasks: list = Body(...)):
        try:
            enriched = []
            projects = {p["name"]: Path(p["root"]) for p in config.get_projects()}
            for task in tasks:
                path = task.get("path")
                project_id = task.get("project_id") or task.get("project")
                if not path or not project_id or project_id not in projects:
                    continue
                full_path = projects[project_id] / path
                if full_path.exists():
                    with open(full_path, "r", encoding="utf-8") as f:
                        t = dict(task)
                        t["content"] = f.read()
                        enriched.append(t)
            if not enriched:
                raise HTTPException(
                    status_code=400, detail="No tasks with content found"
                )
            today_str = datetime.date.today().strftime("%Y-%m-%d")
            out_dir = config.get_app_data_dir()
            out_dir.mkdir(parents=True, exist_ok=True)
            output_filename = f"hub_plan_{today_str}.pdf"
            output_path = out_dir / output_filename
            generate_plan_pdf(enriched, str(output_path))
            return FileResponse(
                path=str(output_path),
                filename=output_filename,
                media_type="application/pdf",
            )
        except HTTPException:
            raise
        except Exception as e:
            import traceback

            print(traceback.format_exc())
            raise HTTPException(status_code=500, detail=str(e))

    def get_plan_files_for_project(project_root: Path):
        out = []
        search_dirs = get_plan_search_dirs(project_root)
        for base, label in search_dirs:
            if not base.exists() or not base.is_dir():
                continue
            # Buscamos archivos .md que NO sean tareas (o incluimos todos y el parser filtrará)
            # Generalmente los planes son archivos como 'plan_desarrollo.md' o similar.
            for f in base.glob("*.md"):
                if f.is_file():
                    # Evitamos incluir las mismas tareas si están en la misma carpeta,
                    # aunque el parser de plan busca "## Bloque", así que es seguro.
                    rel = str(f.relative_to(project_root)).replace("\\", "/")
                    out.append((rel, f.stem))
        return out

    @app.get("/api/plan")
    async def get_plan():
        projects = config.get_projects()
        plans = []
        for proj in projects:
            root = Path(proj["root"])
            if not root.exists():
                continue
            for rel_path, name in get_plan_files_for_project(root):
                full = root / rel_path
                try:
                    with open(full, "r", encoding="utf-8") as f:
                        content = f.readlines()
                except Exception as e:
                    plans.append(
                        {"name": name, "project_id": proj["name"], "error": str(e)}
                    )
                    continue
                parsed = {
                    "name": name,
                    "project_id": proj["name"],
                    "sections": [],
                }
                current_section = None
                current_task = None
                for line in content:
                    line = line.strip()
                    if line.startswith("## Bloque"):
                        if current_task and current_section:
                            current_section["tasks"].append(current_task)
                            current_task = None
                        if current_section:
                            parsed["sections"].append(current_section)
                        current_section = {
                            "title": line.replace("## ", "").strip(),
                            "tasks": [],
                        }
                    elif line.startswith("### ") and current_section:
                        if current_task:
                            current_section["tasks"].append(current_task)
                        title_raw = line.replace("### ", "").strip()
                        status = "pending"
                        if "✅" in title_raw:
                            status = "done"
                        elif "🟡" in title_raw:
                            status = "in_progress"
                        elif "⚪" in title_raw:
                            status = "pending"
                        current_task = {
                            "title": title_raw.replace("✅", "")
                            .replace("🟡", "")
                            .replace("⚪", "")
                            .strip(),
                            "status": status,
                            "original_status_icon": "✅"
                            if status == "done"
                            else "🟡"
                            if status == "in_progress"
                            else "⚪",
                            "meta": {},
                        }
                    elif current_task and line.startswith("**"):
                        parts = line.split(":", 1)
                        if len(parts) == 2:
                            key = parts[0].replace("**", "").strip().lower()
                            val = parts[1].strip()
                            if "[" in val and "]" in val:
                                m = re.search(r"\[(.*?)\]", val)
                                if m:
                                    val = m.group(1)
                            current_task["meta"][key] = val
                if current_task and current_section:
                    current_section["tasks"].append(current_task)
                if current_section:
                    parsed["sections"].append(current_section)
                plans.append(parsed)
        return plans

    @app.post("/api/update_task")
    async def update_task(task_data: dict = Body(...)):
        task_id = task_data.get("id")
        project_id = task_data.get("project_id") or task_data.get("project")
        if not task_id:
            raise HTTPException(status_code=400, detail="Missing task ID")
        if not project_id:
            raise HTTPException(status_code=400, detail="Missing project_id")
        projects = config.get_projects()
        project_root = None
        for p in projects:
            if p["name"] == project_id:
                project_root = Path(p["root"])
                break
        if not project_root or not project_root.exists():
            raise HTTPException(status_code=404, detail="Proyecto no encontrado")
        target_file = find_task_file(project_root, task_id)
        if not target_file:
            raise HTTPException(
                status_code=404, detail=f"Task file for {task_id} not found"
            )
        try:
            with open(target_file, "r", encoding="utf-8") as f:
                content = f.read()
            if "weight" in task_data:
                new_weight = task_data["weight"]
                if re.search(r"^weight:\s*\d+", content, re.MULTILINE):
                    content = re.sub(
                        r"^weight:\s*\d+",
                        f"weight: {new_weight}",
                        content,
                        count=1,
                        flags=re.MULTILINE,
                    )
                else:
                    content = re.sub(
                        r"^---\s*\n", f"---\nweight: {new_weight}\n", content, count=1
                    )
            if "version" in task_data:
                new_version = task_data["version"]
                if re.search(r"^version:\s*[\"']?.*?[\"']?$", content, re.MULTILINE):
                    content = re.sub(
                        r"^version:\s*[\"']?.*?[\"']?$",
                        f'version: "{new_version}"',
                        content,
                        count=1,
                        flags=re.MULTILINE,
                    )
                else:
                    content = re.sub(
                        r"^---\s*\n",
                        f'---\nversion: "{new_version}"\n',
                        content,
                        count=1,
                    )
            if "status" in task_data:
                new_status = task_data["status"]
                if re.search(r"^status:\s*.*$", content, re.MULTILINE):
                    content = re.sub(
                        r"^status:\s*.*$",
                        f"status: {new_status}",
                        content,
                        count=1,
                        flags=re.MULTILINE,
                    )
                else:
                    content = re.sub(
                        r"^---\s*\n", f"---\nstatus: {new_status}\n", content, count=1
                    )
            with open(target_file, "w", encoding="utf-8") as f:
                f.write(content)
            return {"status": "ok", "id": task_id}
        except Exception as e:
            print(f"Error updating task {task_id}: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    if static_dir is not None:
        static = static_dir
    else:
        meipass = getattr(sys, "_MEIPASS", None)
        if meipass:
            static = Path(meipass) / "nereohub" / "static"
        else:
            static = Path(__file__).resolve().parent / "static"
    if static.exists():
        app.mount("/", StaticFiles(directory=str(static), html=True), name="static")

    return app


app = create_app()
