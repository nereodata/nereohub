# Requisitos del proyecto NereoHub

Los requisitos formales del proyecto están definidos como **especificaciones ejecutables** en los escenarios BDD (Gherkin). Constituyen la fuente de verdad para el comportamiento esperado.

## Ubicación

- **Features (Gherkin):** `tests/bdd/features/*.feature`
- **Step definitions:** `tests/bdd/step_defs/test_api_bdd.py`

## Cómo ejecutar los requisitos (BDD)

```bash
# Todos los escenarios BDD
pytest tests/bdd/ -v

# Solo unitarias
pytest tests/unit/ -v

# Todo (unit + BDD)
pytest tests/ -v
```

## Resumen por feature

| Feature | Requisitos cubiertos |
|---------|----------------------|
| **configuracion_proyectos** | Config en AppData; listar proyectos vacío; añadir proyecto (nombre + ruta); validar ruta; no añadir ruta inexistente. |
| **api_proyectos** | GET /api/projects; POST /api/projects; DELETE /api/projects. |
| **agregacion_datos** | GET /api/data sin proyectos (estructura vacía); GET /api/data con proyecto (masters con project_id). |
| **api_datos** | GET /api/content (project_id + path); POST /api/order; POST /api/update_task requiere project_id. |

Cualquier cambio de requisitos debe reflejarse en los `.feature` y en los steps correspondientes.
