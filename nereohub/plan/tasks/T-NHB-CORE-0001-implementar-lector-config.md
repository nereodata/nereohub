---
id: T-NHB-CORE-0001
title: "Implementar lector de task_config.yaml"
type: feature
parent_id: T-NHB-0001
weight: 100
version: "v0.2.0"
status: in_progress
effort_unit: h
estimated_effort: 2
remaining_effort: 2
actual_effort: 0
created_at: 2026-03-08
updated_at: 2026-03-08
---

# T-NHB-CORE-0001: Implementar lector de task_config.yaml

## 🔗 Tarea Maestra
- [T-NHB-0001: Lectura de task_config.yaml para descubrimiento de tareas](../../../plan/tasks/T-NHB-0001-lectura-task-config-proyectos.md)

## 🎯 Objetivo Técnico
Crear un módulo o extender `config.py` para cargar un archivo `task_config.yaml` desde la raíz de un proyecto dado y parsear su contenido (prefijos de proyecto, componentes y rutas).

## 📋 Criterios de Aceptación (BDD)
- [ ] **CA-1:** Escenario: Carga exitosa de configuración válida.
- [ ] **CA-2:** Escenario: Manejo grácil de archivo inexistente (usar defaults).

## 🧪 Plan de Implementación (TDD)
- [ ] **Test 1:** Validar que se detecta el archivo en una ruta de prueba.

## 🏗️ Implementación Técnica
Se debe usar `PyYAML` para el parseo. El modelo debe coincidir con la estructura definida en el estándar Issue-as-Code v3.0.
