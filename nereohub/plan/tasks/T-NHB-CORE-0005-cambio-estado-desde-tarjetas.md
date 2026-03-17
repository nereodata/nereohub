---
id: T-NHB-CORE-0005
title: "Permitir cambio de estado de tareas desde las tarjetas en NereoHub"
type: feature
parent_id: T-NHB-0003
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

# T-NHB-CORE-0005: Permitir cambio de estado de tareas desde las tarjetas en NereoHub

## 🔗 Tarea Maestra
- [T-NHB-0003: Gestión de estado de tareas desde tarjetas en NereoHub](../../../plan/tasks/T-NHB-0003-gestion-estado-tareas-desde-tarjetas.md)

## 🎯 Objetivo Técnico
Implementar en el núcleo de NereoHub el soporte para actualizar el `status` de una tarea directamente desde las tarjetas:
- Exponer un endpoint o acción en la API que permita cambiar el estado de una tarea validando los valores permitidos.
- Actualizar el frontmatter del archivo Markdown correspondiente para reflejar el nuevo `status`.
- Asegurar que el sistema de descubrimiento y carga de tareas refleja siempre el estado persistido en disco.
- Integrar la operación con la UI de tarjetas para que el cambio de estado sea inmediato y coherente.

## 📋 Criterios de Aceptación (BDD)
- [x] **CA-1:** Escenario: Cambio de estado desde tarjeta de `backlog` a `planned` y verificación del nuevo valor en el archivo Markdown.
- [x] **CA-2:** Escenario: Intento de asignar un estado no permitido devuelve un error controlado sin modificar el archivo.
- [x] **CA-3:** Escenario: Tras reiniciar NereoHub, las tarjetas muestran los estados actualizados de las tareas modificadas.

## 🧪 Plan de Implementación (TDD)
- [x] **Test 1:** Verificar que la operación de cambio de estado modifica el frontmatter del archivo correcto.
- [x] **Test 2:** Verificar que sólo se aceptan los estados permitidos (`backlog`, `planned`, `in_progress`, `completed`, `blocked`).
- [x] **Test 3:** Verificar que el módulo de descubrimiento carga el nuevo estado tras una actualización.

## 🏗️ Implementación Técnica
Actualizar los módulos de NereoHub responsables de:
- Localizar el archivo Markdown de una tarea a partir de su ID.
- Modificar de forma segura el bloque de frontmatter para actualizar el campo `status`.
- Exponer esta funcionalidad a la UI de tarjetas mediante la API o acciones existentes del servidor.

