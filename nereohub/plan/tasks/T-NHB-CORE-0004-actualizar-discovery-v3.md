---
id: T-NHB-CORE-0004
title: "Actualizar lógica de descubrimiento para manejar subcarpetas y nombres dinámicos"
type: feature
parent_id: T-NHB-0002
weight: 100
version: "v0.3.0"
status: completed
effort_unit: h
estimated_effort: 3
remaining_effort: 0
actual_effort: 3
created_at: 2026-03-14
updated_at: 2026-03-14
---

# T-NHB-CORE-0004: Actualizar lógica de descubrimiento para manejar subcarpetas y nombres dinámicos

## 🔗 Tarea Maestra
- [T-NHB-0002: Soporte para configuraciones Issue-as-Code v3.0 (folders y placeholders)](../../../plan/tasks/T-NHB-0002-soporte-configuracion-v3.md)

## 🎯 Objetivo Técnico
Modificar `nereohub/discovery.py` para:
1. Resolver el placeholder `{name}` en las rutas buscando en las carpetas base (services, apps, packages).
2. Combinar `path` con `folders.tasks` y `folders.bugs` para generar las rutas de búsqueda finales.
3. Asegurar que `get_plan_search_dirs` devuelva todas las combinaciones válidas.

## 📋 Criterios de Aceptación (BDD)
- [ ] **CA-1:** Escenario: Descubrimiento en subcarpetas `tasks/` y `bugs/`.
- [ ] **CA-2:** Escenario: Resolución de múltiples componentes basados en un patrón `{name}`.

## 🧪 Plan de Implementación (TDD)
- [ ] **Test 1:** Mockear estructura de carpetas y verificar resolución de `{name}`.
- [ ] **Test 2:** Verificar que las tareas de bugs se encuentran en la subcarpeta configurada.

## 🏗️ Implementación Técnica
Refactorizar `get_plan_search_dirs` para que sea iterativo sobre los componentes definidos y resuelva rutas dinámicas.
