---
name: review-fix
description: Revisión específica de correcciones de bugs
---

# Skill: Review Fix (/review-fix-workflow)

Este flujo (ahora skill) está especializado en revisar y validar que la corrección aplicada a un Bug (Anomalía) es válida, completa y segura.

## Pasos de la Skill

### 1. Analizar el Fix
Identificar exactamente qué issue (bug) o qué comentarios de una revisión anterior se están intentando resolver con los cambios actuales.

### 2. Verificación de Corrección y Regresiones (Bug Fix Reviewer)
Verificar rigurosamente técnica y funcionalmente:
* ¿Se ha resuelto el problema de raíz (Root Cause) o es solo un parche?
* ¿Se han añadido tests de integración/unitarios que cubran el escenario específico que fallaba?
* ¿Se han introducido nuevos problemas (regresiones) colaterales?

### 3. Veredicto Final
Emitir un veredicto claro y tajante determinando si la corrección es suficiente:
* ✅ **RESUELTO**: Corrección completa, de alta calidad y testeada.
* ⚠️ **PARCIAL**: Falta algún detalle menor o test.
* ❌ **NO RESUELTO**: El problema original persiste o se ha roto algo grave.

### 4. Generar Reporte
Documentar los hallazgos basándose en el veredicto. Guardar en `docs/review/code_reviews/code_review_report - [Fase] - Re-Review [Bug ID].md`.

