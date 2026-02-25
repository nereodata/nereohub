# NereoHub

Hub genérico para visualizar y priorizar tareas y anomalías de **tus proyectos*. Las tareas viven en cada repositorio git junto con el código; el Hub las lee y agrega. Cada usuario configura sus proyectos en un archivo de configuración propio (no versionado en el repo).

## Requisitos

- Python 3.9+
- Dependencias: ver `pyproject.toml` o `pip install -e .`

## Instalación y ejecución

```bash
cd NereoHub
pip install -e .
nereohub
```

O con el módulo:

```bash
python -m nereohub
```

Abre en el navegador: **http://localhost:8888**

La primera vez no habrá proyectos configurados: usa **Gestionar proyectos** en el menú lateral para añadir la ruta raíz de cada proyecto.

## Pruebas

Los requisitos del proyecto están definidos como escenarios BDD en `tests/bdd/features/*.feature`. Ver [docs/requirements.md](docs/requirements.md).

**Script recomendado** (genera resumen en `output/test/` y pasados/total al final):

```bash
pip install -e ".[dev]"

# Todas las pruebas (unitarias + BDD)
python scripts/run_tests.py

# Solo unitarias
python scripts/run_tests.py tests/unit

# Solo BDD
python scripts/run_tests.py tests/bdd

# Por nombre (-k) o una prueba concreta
python scripts/run_tests.py -k "test_config"
python scripts/run_tests.py tests/unit/test_config.py::test_add_project_success

# Por etiqueta (si defines markers en pyproject.toml)
python scripts/run_tests.py -m "smoke"
```

El script (en `scripts/run_tests.py`) escribe en `output/test/`: `junit.xml`, `failures_summary.md` (si hay fallos) y `last_summary.txt` (pasados/total). La carpeta `output/` está en `.gitignore`.

Alternativa directa con pytest:

```bash
pytest tests/ -v
pytest tests/ -v --cov=nereohub
```

## Ejecutable (PyInstaller)

Para generar un ejecutable independiente (sin instalar Python en la máquina):

```bash
pip install pyinstaller
pyinstaller nereohub.spec
```

El ejecutable quedará en `dist/nereohub/` (o `dist/nereohub.exe` según el SO). La primera ejecución creará la carpeta de configuración en AppData (igual que la versión con Python). Ver [Build con PyInstaller](#build-con-pyinstaller) más abajo.

## Convenio de carpetas por proyecto

Dado un proyecto con **raíz** `ROOT`, el Hub descubre automáticamente:

| Ubicación | Uso |
|-----------|-----|
| `ROOT/plan/` | Plan y anomalías generales |
| `ROOT/packages/<nombre>/plan/` | Tareas y anomalías por paquete |
| `ROOT/apps/<nombre>/plan/` | Tareas y anomalías por app |

**Archivos detectados:** Markdown con frontmatter YAML: `T-*.md`, `B-*.md`, `BUG-*.md`. Fallback opcional: `docs/plan/`, `packages/.../docs/backlog`, etc.

## Configuración de usuario

No versionada. **Los proyectos se persisten en un archivo YAML** en la carpeta de datos de la aplicación, de modo que la configuración se mantiene entre sesiones.

Ubicación según SO:

- **Windows:** `%APPDATA%\NereoHub\config.yaml`
- **macOS:** `~/Library/Application Support/NereoHub/config.yaml`
- **Linux:** `~/.config/nereohub/config.yaml`

Ejemplo de contenido:

```yaml
projects:
  - name: "Aprexx"
    root: "C:/SW/Aprexx"
    color: "#3b82f6"
  - name: "OtroProyecto"
    root: "D:/repos/otro"
```

El campo `color` (hex) es opcional y se usa para identificar las tarjetas de cada proyecto en la UI. El orden personalizado se guarda en el mismo directorio (p. ej. `order.json`). Todo se gestiona desde la aplicación (añadir, editar, eliminar proyectos).

## Estructura del repo

```
NereoHub/
├── pyproject.toml
├── README.md
├── nereohub/              # Paquete principal
│   ├── __init__.py
│   ├── __main__.py        # Entrada: nereohub / python -m nereohub
│   ├── config.py
│   ├── discovery.py
│   ├── parsing.py
│   ├── api.py
│   ├── pdf_generator.py
│   └── static/            # UI (index.html, app.js, styles.css)
├── scripts/
│   └── run_tests.py       # Lanzar pruebas (unit + BDD) y generar resumen
├── tests/
│   ├── conftest.py
│   ├── unit/              # Pruebas unitarias
│   └── bdd/               # BDD (features + steps)
│       ├── features/*.feature
│       └── step_defs/
└── docs/
    └── requirements.md    # Índice de requisitos (features BDD)
```

## API (resumen)

- `GET /api/projects` — Listar proyectos
- `POST /api/projects` — Añadir proyecto (`name`, `root`, `color` opcional)
- `PUT /api/projects` — Editar proyecto (`old_root`, `name`, `root`, `color` opcional)
- `DELETE /api/projects?root=...` — Eliminar proyecto
- `GET /api/data` — Datos agregados con `project_id` en cada ítem
- `GET /api/content?project_id=...&path=...` — Contenido de un archivo
- `POST /api/order` — Guardar orden por proyecto
- `POST /api/update_task` — Actualizar tarea (`id`, `project_id`, ...)
- `POST /api/export-pdf` — Generar PDF del plan
- `GET /api/plan` — Documentos de plan por proyecto

## Build con PyInstaller

1. Instalar: `pip install pyinstaller`
2. Generar: `pyinstaller nereohub.spec`
3. El ejecutable y sus datos se generan en `dist/`. Incluye el paquete `nereohub` y la carpeta `static/`. La configuración del usuario (config.yaml, order.json) se sigue leyendo/escribiendo en la carpeta de datos de la aplicación del SO.

## Licencia

MIT License. Ver el archivo [LICENSE](LICENSE) para más detalles.
