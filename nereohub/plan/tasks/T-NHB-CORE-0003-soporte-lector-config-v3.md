---
id: T-NHB-CORE-0003
title: "Implementar soporte de `folders` y placeholders `{name}` en el lector de configuración"
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

# T-NHB-CORE-0003: Implementar soporte de `folders` y placeholders `{name}` en el lector de configuración

## 🔗 Tarea Maestra
- [T-NHB-0002: Soporte para configuraciones Issue-as-Code v3.0 (folders y placeholders)](../../../plan/tasks/T-NHB-0002-soporte-configuracion-v3.md)

## 🎯 Objetivo Técnico
Actualizar `nereohub/config.py` para que el esquema de carga de `task_config.yaml` soporte la nueva estructura:
- Sub-objeto `folders` bajo `master` y los elementos de `components`.
- Almacenamiento de las rutas con placeholders para su posterior resolución.

## 📋 Criterios de Aceptación (BDD)
- [ ] **CA-1:** Escenario: Carga de YAML con `folders.tasks` y `folders.bugs`.
- [ ] **CA-2:** Escenario: Preservación de cadenas con `{name}` en el campo `path`.

## 🧪 Plan de Implementación (TDD)
- [ ] **Test 1:** Validar que `load_project_task_config` devuelve los nuevos campos si están presentes.
- [ ] **Test 2:** Verificar que los valores por defecto se mantienen para archivos v2.0.

## 🏗️ Implementación Técnica
Modificar el diccionario `defaults` en `load_project_task_config` y el proceso de mezcla (merge) para incluir `folders`.
