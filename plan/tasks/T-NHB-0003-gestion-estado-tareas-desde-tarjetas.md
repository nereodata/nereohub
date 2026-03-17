---
id: T-NHB-0003
title: "Gestión de estado de tareas desde tarjetas en NereoHub"
type: funcional
weight: 100
version: "v0.5.0"
status: completed
effort_unit: h
estimated_effort: 6
remaining_effort: 0
actual_effort: 6
created_at: 2026-03-16
updated_at: 2026-03-16
---

# T-NHB-0003: Gestión de estado de tareas desde tarjetas en NereoHub

## 🎯 Objetivo de Negocio
Permitir que los usuarios modifiquen el estado de una tarea directamente desde las tarjetas de NereoHub (por ejemplo, cambiar entre `backlog`, `planned` e `in_progress`), evitando tener que editar manualmente los archivos Markdown. Esto mejora la productividad y reduce errores al mantener sincronizado el estado visible en el Hub con el `status` real definido en el frontmatter de las tareas.

## 📋 Criterios de Aceptación (Nivel Máster)
- [x] **CA-M-1:** Desde la tarjeta de una tarea en NereoHub es posible cambiar su estado entre al menos `backlog`, `planned`, `in_progress`, `completed` y `blocked`.
- [x] **CA-M-2:** Al cambiar el estado desde la tarjeta, el `status` del frontmatter del archivo Markdown correspondiente se actualiza de forma persistente en disco.
- [x] **CA-M-3:** Tras recargar NereoHub o volver a ejecutar el descubrimiento, las tarjetas muestran el estado actualizado sin inconsistencias.
- [x] **CA-M-4:** La API de NereoHub expone un endpoint o acción específica para actualizar el estado de una tarea de forma segura (validando valores permitidos).

## 🛠 Tareas de Componente
- [x] [T-NHB-CORE-0005: Permitir cambio de estado de tareas desde las tarjetas en NereoHub]

