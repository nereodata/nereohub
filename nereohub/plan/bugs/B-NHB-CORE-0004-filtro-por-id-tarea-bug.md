---
id: B-NHB-CORE-0004
title: "Falta filtro por ID de tarea/bug en FilterBar"
type: bug
weight: 50
version: ""
status: in_progress
effort_unit: h
estimated_effort: 2
remaining_effort: 0.5
actual_effort: 0.5
created_at: 2026-05-18
updated_at: 2026-05-18
---

### Descripción
La barra de filtros (`frontend/src/components/FilterBar.jsx`) no permite filtrar la lista de tareas y bugs por **identificador** (p. ej. `T-AIRA-0009`, `B-NHB-CORE-0003`). Cuando un usuario sabe el ID exacto que busca, no tiene atajo en la UI para llegar a él y debe recorrer manualmente las columnas/listas o usar el buscador del navegador sobre el DOM renderizado.

### Comportamiento esperado
- Añadir un campo de texto en `FilterBar` (o reutilizar el filtro de descripción existente, ampliándolo) que aplique sobre el `id` del item además de sobre el título.
- El matching debe ser:
  - **Case-insensitive.**
  - **Substring** (no exact match), para que escribir `0009` o `AIRA-0009` o `aira-0009` funcione.
- El filtro se aplica en todas las vistas que respetan `applyFilters`: Plan, Backlog y Anomalies (tanto en `PlanView` como en `ListView`).
- Combina (AND) con los filtros existentes (proyecto, versión, status, etc.).
- El estado del filtro persiste con el resto del estado de UI (`localStorage`, ver `feat(ui): implement filter and UI state persistence`).

### Pasos para reproducir
1. Configurar un proyecto con varias decenas de tareas.
2. Abrir cualquier pestaña (Plan / Backlog / Anomalies).
3. Intentar localizar una tarea concreta por su ID (p. ej. `T-AIRA-0009`).
4. **Esperado:** un input en la FilterBar acepta el ID y filtra la vista al item buscado.
5. **Observado:** no existe tal input; sólo hay filtros por proyecto, versión, status y descripción (este último opera sobre `title`/`content_body`, no sobre `id`).

### Notas técnicas
- Verificar si el filtro de "descripción" actual (si existe) ya recorre el `id` — en ese caso bastaría con documentarlo y/o extender su scope. Si no, añadir un input dedicado.
- Aplicar también en `useExports.js` si el filtro debe afectar al PDF/CSV exportado.
- UX sugerida: input pequeño con placeholder "ID o texto…" combinado con el filtro de descripción para no añadir un control nuevo, siempre que se documente claramente.
