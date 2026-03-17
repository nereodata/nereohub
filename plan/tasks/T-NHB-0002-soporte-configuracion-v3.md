---
id: T-NHB-0002
title: "Soporte para configuraciones Issue-as-Code v3.0 (folders y placeholders)"
type: funcional
weight: 100
version: "v0.3.0"
status: completed
effort_unit: h
estimated_effort: 6
remaining_effort: 0
actual_effort: 6
created_at: 2026-03-14
updated_at: 2026-03-14
---

# T-NHB-0002: Soporte para configuraciones Issue-as-Code v3.0 (folders y placeholders)

## 🎯 Objetivo de Negocio
Alinear NereoHub con el estándar Issue-as-Code v3.0, permitiendo una mayor flexibilidad en la organización del backlog mediante el uso de subcarpetas específicas (`tasks`, `bugs`) y el soporte de placeholders `{name}` en las rutas de los componentes. Esto facilitará la integración en proyectos monorepo complejos (servicios, apps, paquetes).

## 📋 Criterios de Aceptación (Nivel Máster)
- [ ] **CA-M-1:** El sistema reconoce y utiliza la sección `folders` (con `tasks` y `bugs`) para master y componentes.
- [ ] **CA-M-2:** El sistema resuelve correctamente el placeholder `{name}` en los `path` de los componentes basándose en la estructura del sistema de archivos.
- [ ] **CA-M-3:** El descubrimiento de tareas y anomalías respeta la nueva jerarquía de carpetas definida.
- [ ] **CA-M-4:** Se mantiene la compatibilidad con el formato anterior (fallback a la ruta base si no hay `folders`).

## 🛠 Tareas de Componente
- [T-NHB-CORE-0003: Implementar soporte de `folders` y placeholders `{name}` en el lector de configuración]
- [T-NHB-CORE-0004: Actualizar lógica de descubrimiento para manejar subcarpetas y nombres dinámicos]
