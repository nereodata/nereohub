---
name: bug-fix-reviewer
description: Especialista en verificar que las correcciones de errores (bugs) resuelven el problema de raíz sin introducir regresiones.
---

# Bug Fix Reviewer Skill

Este skill se enfoca exclusivamente en validar que un FIX aborda los issues detectados en revisiones previas o en el registro de anomalías.

## Workflow

1.  **Contextualización**:
    - Leer el **Reporte de Review original** o el registro en `docs/plan/Anomalies.md`.
    - Identificar los archivos modificados para el fix.

2.  **Verificación Técnica**:
    - ¿Se ha resuelto el problema de raíz?
    - ¿Se han añadido tests de integración/unitarios que cubran el escenario que fallaba?
    - ¿Se han introducido nuevos problemas (regresiones)?

3.  **Veredicto**:
    - ✅ **RESUELTO**: Corrección completa y de alta calidad.
    - ⚠️ **PARCIAL**: Falta algún detalle menor o test.
    - ❌ **NO RESUELTO**: El problema persiste.

4.  **Generación de Reporte**:
    - Usar el formato Markdown definido en `docs/prompts/code_review_fix.prompt`.

## Salida
Guardar en `docs/review/code_reviews/code_review_report - [Fase] - Re-Review [Bug ID].md`.
