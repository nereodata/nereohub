---
id: T-NHB-0001
title: "Lectura de task_config.yaml para descubrimiento de tareas"
type: funcional
weight: 100
version: "v0.2.0"
status: in_progress
effort_unit: h
estimated_effort: 4
remaining_effort: 4
actual_effort: 0
created_at: 2026-03-08
updated_at: 2026-03-08
---

# T-NHB-0001: Lectura de task_config.yaml para descubrimiento de tareas

## 🎯 Objetivo de Negocio
Habilitar a NereoHub para que reconozca la configuración específica de cada proyecto gestionado a través de su archivo `task_config.yaml`. Esto permitirá distinguir correctamente entre tareas/bugs maestros (de proyecto) y tareas de componentes (apps, packages, services), facilitando una navegación y agrupación jerárquica en el Hub.

## 📋 Criterios de Aceptación (Nivel Máster)
- [ ] **CA-M-1:** NereoHub detecta y lee el archivo `task_config.yaml` en la raíz de cada proyecto configurado.
- [ ] **CA-M-2:** Si el archivo existe, NereoHub utiliza los prefijos e identificadores definidos en `levels` para clasificar las tareas.
- [ ] **CA-M-3:** Si el archivo no existe, NereoHub utiliza la lógica de descubrimiento por defecto (fallback).
- [ ] **CA-M-4:** La API expone la información del tipo de tarea (maestra vs componente) basada en esta configuración.

## 🛠 Tareas de Componente
- [T-NHB-CORE-0001: Implementar lector de task_config.yaml]
- [T-NHB-CORE-0002: Actualizar lógica de discovery.py para usar task_config]
