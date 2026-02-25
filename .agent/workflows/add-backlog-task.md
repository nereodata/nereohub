---
description: Añade una nueva tarea al backlog del producto siguiendo estándares de Issue-as-Code
---

# Workflow: Añadir Tarea al Backlog (/add-backlog-task)

Este flujo permite registrar tareas pendientes en el backlog del producto, siguiendo el estándar **Issue-as-Code distribuido v3.0 (Master/Package)**.

## Estructura del Backlog

- **Tareas**: `docs/plan/tasks/`

## Workflow

### 1. Identificación

- **Tasks**: `docs/plan/tasks/` (Prefijo `T-NHB-XXXX`)


### 2. Asignación de ID y Peso

- **ID**: Secuencial por nivel/paquete. Verificar el último ID en el directorio correspondiente.
- **Peso (Weight)**: Valor entero (0 - ∞). 
  - **Prioridad Crítica**: 0-10 (Urgencias).
  - **Prioridad Alta**: 10-100 (ASAP).
  - **Desarrollo**: 100-1000.
  - **Roadmap**: 1000+.
  - *Nota*: Tareas de versiones futuras deben tener pesos mayores que las actuales.

### 3. Creación del Archivo

**Nombre:** `[ID]-descripcion-corta.md`

**Formato para Tarea Maestra (Master):**

```markdown
---
id: T-NHB-XXXX
title: "Título descriptivo"
type: funcional | despliegue | diseño | tools | infra
weight: [integer]
version: "v0.2.X"
status: backlog | planned | in_progress | completed | blocked
estimated_effort: 0
remaining_effort: 0
actual_effort: 0
created_at: YYYY-MM-DD
updated_at: YYYY-MM-DD
original_ref: [Legacy ID if any]
---

# [ID]: [Título]

## 🎯 Objetivo de Negocio
[Descripción del valor de negocio y el "qué" se quiere conseguir]

## 📋 Criterios de Aceptación (Nivel Máster)
- [ ] **CA-M-1:** [Criterio de alto nivel]

```

**Formato para Tarea de Paquete (Package):**

```markdown
---
id: T-NHB-XXXX
title: "Título técnico"
type: feature | enhancement | refactor | technical-debt
parent_id: T-NHB-XXXX
...
---

# [ID]: [Título]

## 🔗 Tarea Maestra
- [T-NHB-XXXX: Título Maestros](../../../docs/plan/tasks/T-NHB-XXXX.md)

## Estado de Desarrollo
...
```

## Estados del Workflow

Los estados permitidos para el campo `status` son:

- **backlog**: Tarea registrada pero no planificada ni iniciada.
- **planned**: Tarea asignada a un plan de ejecución (sprint/fase).
- **in_progress**: Tarea en curso (desarrollo activo).
- **completed**: Tarea finalizada y verificada (reemplaza a 'closed' o 'resolved').
- **blocked**: Tarea bloqueada por dependencias externas o impedimentos.
- **canceled**: Tarea descartada (no reproducible, duplicada, etc.).
