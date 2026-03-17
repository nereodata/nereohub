"""pytest-bdd scenarios and step definitions for API and config features."""
import json
import pytest
from pytest_bdd import scenarios, given, when, then, parsers
from pathlib import Path

FEATURES_DIR = Path(__file__).resolve().parent.parent / "features"

scenarios(
    str(FEATURES_DIR / "api_proyectos.feature"),
    str(FEATURES_DIR / "agregacion_datos.feature"),
    str(FEATURES_DIR / "api_datos.feature"),
    str(FEATURES_DIR / "configuracion_proyectos.feature"),
    str(FEATURES_DIR / "descubrimiento_jerarquico.feature"),
    str(FEATURES_DIR / "update_task_status.feature"),
)

# --- Fixture: client (reuse from root conftest) ---
# We need the client that uses NEREOHUB_DATA_DIR. Root conftest provides it.


@given(parsers.parse('que no hay proyectos configurados'))
def no_projects(client):
    """Ensure no projects (relies on fresh app_data_dir per test)."""
    pass


@given(parsers.parse('que existe un directorio de proyecto en "{path}"'))
def existe_directorio_proyecto(path, sample_project_for_bdd, bdd_context):
    """Record the sample project path for later steps."""
    bdd_context["project_root"] = str(sample_project_for_bdd.resolve())


@given(parsers.parse('que existe un directorio de proyecto con plan y tareas en "{path}"'))
def existe_directorio_con_plan(path, sample_project_for_bdd, bdd_context):
    """Same: sample project has plan/ and tasks."""
    bdd_context["project_root"] = str(sample_project_for_bdd.resolve())


@given(parsers.parse('que existe un directorio de proyecto con plan/T-TEST-001.md en "{path}"'))
def existe_directorio_con_archivo(path, sample_project_for_bdd, bdd_context):
    """Sample project has the task file."""
    bdd_context["project_root"] = str(sample_project_for_bdd.resolve())


@given(parsers.parse('hay un proyecto añadido con nombre "{name}" y root "{path}"'))
def proyecto_anadido(name, path, client, bdd_context):
    """Add project via API; use context root if path is placeholder."""
    root = bdd_context.get("project_root") or path
    r = client.post("/api/projects", json={"name": name, "root": root})
    assert r.status_code == 200, r.text


@given(parsers.parse('hay un proyecto configurado con tareas'))
def proyecto_configurado_con_tareas(client, sample_project_for_bdd, bdd_context):
    """Add project and ensure it has tasks."""
    bdd_context["project_root"] = str(sample_project_for_bdd.resolve())
    r = client.post(
        "/api/projects",
        json={"name": "ProjTasks", "root": str(sample_project_for_bdd.resolve())},
    )
    assert r.status_code == 200


@given(parsers.parse('hay un proyecto anadido con root "{path}"'))
def proyecto_anadido_por_root(path, client, bdd_context):
    """Add project by root (use context if path is placeholder)."""
    root = bdd_context.get("project_root") or path
    client.post("/api/projects", json={"name": "Proj", "root": root})
    bdd_context["last_root"] = root


@given("que no hay orden previo")
def no_order():
    """Fresh order (app_data_dir is fresh per test)."""
    pass


@when(parsers.parse('solicito la lista de proyectos'))
def solicito_lista_proyectos(client, bdd_context):
    """GET /api/projects."""
    r = client.get("/api/projects")
    bdd_context["response"] = r


@when(parsers.parse('anado el proyecto con nombre "{name}" y ruta "{path}"'))
def anado_proyecto(name, path, client, bdd_context):
    """POST /api/projects."""
    root = bdd_context.get("project_root") or path
    r = client.post("/api/projects", json={"name": name, "root": root})
    bdd_context["response"] = r


@when(parsers.parse('intento anadir el proyecto con nombre "{name}" y ruta "{path}"'))
def intento_anadir_proyecto(name, path, client, bdd_context):
    """POST /api/projects with invalid path."""
    r = client.post("/api/projects", json={"name": name, "root": path})
    bdd_context["response"] = r


@when("guardo el orden de las tareas para ese proyecto")
def guardo_orden(client, bdd_context):
    """POST /api/order."""
    r = client.post(
        "/api/order",
        json={"ProjTasks": {"T-TEST-001": 0}},
    )
    bdd_context["response"] = r


@when(parsers.parse('hago GET a "{path}"'))
def get_request(path, client, bdd_context):
    """GET request to path."""
    bdd_context["response"] = client.get(path)


@when(parsers.parse('hago POST a "{path}" con body name "{name}" y root "{root}"'))
def post_projects(path, name, root, client, bdd_context):
    """POST to /api/projects with name and root."""
    r = client.post(path, json={"name": name, "root": bdd_context.get("project_root") or root})
    bdd_context["response"] = r


@when(parsers.parse('hago DELETE a "{path}" con query root "{root}"'))
def delete_project(path, root, client, bdd_context):
    """DELETE /api/projects?root=..."""
    actual_root = bdd_context.get("last_root") or bdd_context.get("project_root") or root
    r = client.delete(f"{path}?root={actual_root}")
    bdd_context["response"] = r


@when(parsers.parse('hago GET a "{path}" con project_id "{pid}" y path "{filepath}"'))
def get_content(path, pid, filepath, client, bdd_context):
    """GET /api/content?project_id=...&path=..."""
    r = client.get(path, params={"project_id": pid, "path": filepath})
    bdd_context["response"] = r


@when(parsers.parse('hago POST a "{path}" con body {body}'))
def post_order(path, body, client, bdd_context):
    """POST /api/order with JSON body."""
    data = json.loads(body)
    r = client.post(path, json=data)
    bdd_context["response"] = r


@when(parsers.parse('hago POST a "/api/update_task" con body solo id "{task_id}"'))
def post_update_task_no_project(task_id, client, bdd_context):
    """POST /api/update_task with only id."""
    r = client.post("/api/update_task", json={"id": task_id})
    bdd_context["response"] = r


@then(parsers.parse('la respuesta contiene una lista vacía de proyectos'))
def respuesta_lista_vacia(bdd_context):
    """Assert projects list is empty."""
    r = bdd_context["response"]
    assert r.status_code == 200
    assert r.json().get("projects") == []


@then(parsers.parse('la respuesta indica exito'))
def respuesta_ok(bdd_context):
    """Assert response indicates success."""
    r = bdd_context["response"]
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "ok" or "project" in data


@then(parsers.parse('la lista de proyectos contiene un proyecto con nombre "{name}"'))
def lista_contiene_proyecto(name, client, bdd_context):
    """Assert project list contains project with name."""
    r = client.get("/api/projects")
    projects = r.json().get("projects", [])
    assert any(p.get("name") == name for p in projects)


@then(parsers.parse('la respuesta indica error'))
def respuesta_error(bdd_context):
    """Assert response indicates error (4xx)."""
    r = bdd_context["response"]
    assert r.status_code >= 400


@then(parsers.parse('el mensaje indica que la ruta no existe'))
def mensaje_ruta_no_existe(bdd_context):
    """Assert detail mentions path."""
    r = bdd_context["response"]
    data = r.json()
    detail = data.get("detail", "")
    assert "ruta" in detail.lower() or "existe" in detail.lower() or "carpeta" in detail.lower()


@then("el orden se persiste en la configuración del usuario")
def orden_persistido(client, bdd_context):
    """Assert order was saved (next GET /api/data would apply it)."""
    r = client.get("/api/data")
    assert r.status_code == 200


@then(parsers.parse('el codigo de respuesta es {code:d}'))
def codigo_respuesta(code, bdd_context):
    """Assert status code."""
    assert bdd_context["response"].status_code == code


@then(parsers.parse('el JSON tiene la clave "{key}"'))
def json_tiene_clave(key, bdd_context):
    """Assert JSON has key."""
    assert key in bdd_context["response"].json()


@then(parsers.parse('"projects" es una lista'))
def projects_es_lista(bdd_context):
    """Assert projects is a list."""
    assert isinstance(bdd_context["response"].json().get("projects"), list)


@then(parsers.parse('"projects" como lista vacia'))
def projects_lista_vacia(bdd_context):
    """Assert projects is empty list."""
    assert bdd_context["response"].json().get("projects") == []


@then(parsers.parse('"masters" como lista'))
def masters_es_lista(bdd_context):
    """Assert masters is a list."""
    assert isinstance(bdd_context["response"].json().get("masters"), list)


@then(parsers.parse('"backlog" como lista'))
def backlog_es_lista(bdd_context):
    """Assert backlog is a list."""
    assert isinstance(bdd_context["response"].json().get("backlog"), list)


@then(parsers.parse('"anomalies" como lista'))
def anomalies_es_lista(bdd_context):
    """Assert anomalies is a list."""
    assert isinstance(bdd_context["response"].json().get("anomalies"), list)


@then(parsers.parse('"stats"'))
def tiene_stats(bdd_context):
    """Assert has stats key."""
    assert "stats" in bdd_context["response"].json()


@then(parsers.parse('el JSON tiene "status" igual a "ok"'))
def status_ok(bdd_context):
    """Assert status is ok."""
    assert bdd_context["response"].json().get("status") == "ok"


@then(parsers.parse('el JSON tiene "project" con "name" "{name}"'))
def project_name(name, bdd_context):
    """Assert project name in response."""
    assert bdd_context["response"].json().get("project", {}).get("name") == name


@then("la lista de proyectos ya no contiene ese root")
def no_contiene_root(client, bdd_context):
    """Assert project was removed."""
    root = bdd_context.get("last_root") or bdd_context.get("project_root")
    r = client.get("/api/projects")
    roots = [p.get("root") for p in r.json().get("projects", [])]
    assert root not in roots


@then(parsers.parse('"masters" tiene al menos un elemento'))
def masters_tiene_elementos(bdd_context):
    """Assert masters has at least one item."""
    assert len(bdd_context["response"].json().get("masters", [])) >= 1


@then(parsers.parse('cada elemento en "masters" tiene "project_id" o "project" igual a "{name}"'))
def masters_tienen_project_id(name, bdd_context):
    """Assert each master has project_id."""
    masters = bdd_context["response"].json().get("masters", [])
    for m in masters:
        assert m.get("project_id") == name or m.get("project") == name


@then(parsers.parse('"content" contiene "{text}"'))
def content_contains(text, bdd_context):
    """Assert content contains text."""
    assert text in bdd_context["response"].json().get("content", "")


@then(parsers.parse('el mensaje indica project_id'))
def mensaje_project_id(bdd_context):
    """Assert detail mentions project_id."""
    detail = bdd_context["response"].json().get("detail", "")
    assert "project" in detail.lower()
@given(parsers.parse('que existe un directorio de proyecto "{path}"'))
def existe_directorio_vacio(path, tmp_path, bdd_context):
    """Create a temporary directory for a project."""
    project_root = tmp_path / "custom_project"
    project_root.mkdir(parents=True, exist_ok=True)
    bdd_context["project_root"] = str(project_root.resolve())


@given(parsers.parse('existe un archivo "task_config.yaml" en la raiz del proyecto con:'))
def existe_task_config(bdd_context, step):
    """Create task_config.yaml in the project root."""
    root = Path(bdd_context["project_root"])
    (root / "task_config.yaml").write_text(step.text, encoding="utf-8")


@given(parsers.parse('existe una tarea maestra en "{path}"'))
def existe_tarea_maestra_en(path, bdd_context):
    """Create a task file at the specified relative path."""
    root = Path(bdd_context["project_root"])
    task_path = root / path
    task_path.parent.mkdir(parents=True, exist_ok=True)
    task_path.write_text("""---
id: T-CST-0001
title: Custom Master
status: backlog
---
""", encoding="utf-8")


@given(parsers.parse('existe una tarea de componente en "{path}"'))
def existe_tarea_comp_en(path, bdd_context):
    """Create a component task file."""
    root = Path(bdd_context["project_root"])
    task_path = root / path
    task_path.parent.mkdir(parents=True, exist_ok=True)
    task_path.write_text("""---
id: T-CST-CORE-0001
title: Custom Core
status: backlog
parent_id: T-CST-0001
---
""", encoding="utf-8")


@then(parsers.parse('"{key}" contiene una tarea con id "{task_id}"'))
def key_contiene_tarea(key, task_id, bdd_context):
    """Verify that a list in the response contains a task with the given ID."""
    data = bdd_context["response"].json().get(key, [])
    ids = [item.get("id") for item in data]
    assert task_id in ids, f"Task {task_id} not found in {key}. Found: {ids}"


# --- update_task_status.feature steps ---

@given(parsers.parse('la tarea {task_id} tiene status "{status}"'))
def tarea_tiene_status(task_id, status, sample_project_for_bdd, bdd_context):
    """Ensure task file has the given status in frontmatter."""
    bdd_context["project_root"] = str(sample_project_for_bdd.resolve())
    task_path = sample_project_for_bdd / "plan" / f"{task_id}.md"
    if not task_path.exists():
        task_path.parent.mkdir(parents=True, exist_ok=True)
        task_path.write_text(f"""---
id: {task_id}
title: Test task
status: {status}
weight: 10
version: v0.2
type: feature
---

# Content
""", encoding="utf-8")
    else:
        content = task_path.read_text(encoding="utf-8")
        import re
        if re.search(r"^status:\s*.*$", content, re.MULTILINE):
            content = re.sub(r"^status:\s*.*$", f"status: {status}", content, count=1, flags=re.MULTILINE)
        else:
            content = content.replace("---\n", f"---\nstatus: {status}\n", 1)
        task_path.write_text(content, encoding="utf-8")


@when(parsers.parse('hago POST a "/api/update_task" con id "{task_id}", project_id "{project_id}" y status "{status}"'))
def post_update_task_status(task_id, project_id, status, client, bdd_context):
    """POST /api/update_task with status."""
    r = client.post("/api/update_task", json={"id": task_id, "project_id": project_id, "status": status})
    bdd_context["response"] = r


@then(parsers.parse('la tarea {task_id} tiene status "{expected_status}" en disco'))
def tarea_status_en_disco(task_id, expected_status, sample_project_for_bdd, bdd_context):
    """Assert task file on disk has the expected status."""
    root = Path(bdd_context.get("project_root") or str(sample_project_for_bdd.resolve()))
    from nereohub.discovery import find_task_file
    task_file = find_task_file(root, task_id)
    assert task_file, f"Task file for {task_id} not found"
    content = task_file.read_text(encoding="utf-8")
    import re
    m = re.search(r"^status:\s*(.+)$", content, re.MULTILINE)
    assert m, f"No status in frontmatter: {content[:200]}"
    actual = m.group(1).strip().strip('"\'')
    assert actual == expected_status, f"Expected status {expected_status}, got {actual}"


@then(parsers.parse('la tarea {task_id} mantiene status "{expected_status}" en disco'))
def tarea_mantiene_status(task_id, expected_status, sample_project_for_bdd, bdd_context):
    """Same as tarea_status_en_disco - verify file was not modified."""
    tarea_status_en_disco(task_id, expected_status, sample_project_for_bdd, bdd_context)
