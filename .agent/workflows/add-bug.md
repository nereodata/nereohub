---
description: Registro de una nueva anomalía (bug) siguiendo el estándar Issue-as-Code (Distribuido)
---

# Workflow: Registro de Anomalía (/add-bug)

Este flujo implementa el estándar de **Issue-as-Code distribuido v3.0**, donde cada paquete es responsable de su propio historial de calidad, integrándose con la visión global.


## 1. Identificación

- **Bugs**: `docs/plan/bugs/` (Prefijo `B-NHB-XXXX`)


- **B-NHB-XXXX**: .

## 2. Creación del Archivo

**Nombre del archivo:** `[ID]-descripcion-corta.md`

**Metadatos (YAML Frontmatter):**

```markdown
---
id: B-NHB-[PKG]-XXXX
title: "Título descriptivo"
type: bug
weight: [integer]
version: "vX.Y"
status: open | in_progress | completed | blocked
estimated_effort: [points/hours]
remaining_effort: [points/hours]
actual_effort: 0
created_at: YYYY-MM-DD
updated_at: YYYY-MM-DD
references: [RF-XXX, T-NHB-YYYY]
parent_id: [Master ID if Package bug]
assets: [./assets/[ID]-evidencia.png]
---
```

### 3. Gestión de Assets

- Guardar evidencias en `docs/plan/bugs/assets/`.
- Referenciar relativamente en el markdown.

### 4. Ciclo de Vida y Pesos

- Los bugs críticos (urgentes) deben tener un **Weight** entre 0 y 10.
- Los bugs prioritarios deben tener un **Weight** entre 10 y 100.
- Los bugs de desarrollo deben tener un **Weight** entre 100 y 1000.
- Los bugs no necesarios deben tener un **Weight** mayor que 1000.

- El Hub permitirá reordenar y editar estos pesos para priorizar el "Fix" sobre el "Feature".

### 5. Cierre

- Al cerrar un bug de paquete, se debe actualizar el `remaining_effort` a 0.
- Si es el último bug de paquete vinculado a un Master, se debe cerrar también el Master.

## Estados del Workflow

Los estados permitidos para el campo `status` son:

- **open**: Anomalía registrada y pendiente de análisis.
- **in_progress**: Anomalía en proceso de corrección ("En curso").
- **completed**: Corrección implementada y verificada (reemplaza a 'closed' o 'resolved').
- **superseded**: Anomalía corregida debida a un cambio previo por otra tarea o anomalía. Implica que no hay cambio trazado con ella.
- **blocked**: Anomalía bloqueada por dependencias externas o impedimentos.
- **rejected**: Anomalía descartada (no reproducible, duplicada, etc.).