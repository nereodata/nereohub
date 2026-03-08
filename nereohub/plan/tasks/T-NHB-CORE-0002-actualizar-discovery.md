---
id: T-NHB-CORE-0002
title: "Actualizar lógica de discovery.py para usar task_config"
type: feature
parent_id: T-NHB-0001
weight: 100
version: "v0.2.0"
status: completed
effort_unit: h
estimated_effort: 2
remaining_effort: 0
actual_effort: 1
created_at: 2026-03-08
updated_at: 2026-03-08
---

# T-NHB-CORE-0002: Actualizar lógica de discovery.py para usar task_config

## 🔗 Tarea Maestra
- [T-NHB-0001: Lectura de task_config.yaml para descubrimiento de tareas](../../../plan/tasks/T-NHB-0001-lectura-task-config-proyectos.md)

## 🎯 Objetivo Técnico
Modificar `discovery.py` para que, antes de escanear carpetas, busque el `task_config.yaml`. Si lo encuentra, debe priorizar las rutas y prefijos allí definidos para la búsqueda de archivos `T-*.md` y `B-*.md`.

## 📋 Criterios de Aceptación (BDD)
- [ ] **CA-1:** Escenario: Descubrimiento de tareas en rutas personalizadas vía YAML.

## 🧪 Plan de Implementación (TDD)
- [ ] **Test 1:** Mockear un proyecto con rutas no estándar en `task_config.yaml` y verificar que el Hub las encuentra.

## 🏗️ Implementación Técnica
Integrar el nuevo lector de configuración en el bucle de escaneo de proyectos en `discovery.py`.
