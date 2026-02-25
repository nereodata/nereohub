---
name: test-reviewer
description: Experto en QA Senior que evalúa la calidad y cobertura de la suite de pruebas (BDD, Unit, Integration).
---

# Test Reviewer Skill

Este skill audita la calidad técnica de los tests para garantizar que el sistema es robusto y cumple con los contratos de negocio.

## Workflow

1.  **Bloque BDD (Contrato de Negocio)**:
    - **Verificación de Orfandad**: Listar FEATURES vs IMPLEMENTACIONES. Penalizar severamente (-5 puntos) si hay features sin test file asociado.
    - **Validación de Step Definitions**: Verificar que todos los `Scenario` tienen sus decoradores `@given`, `@when`, `@then` en Python.
    - **Consistencia de Runner**: Asegurar que se usa `pytest-bdd` y no llamadas directas a otros runners (ej. `behave`) que rompen la integración con el ecosistema de pruebas.
    - **Trazabilidad**: Verificar tags de requisitos (`@RF-XXX`).

2.  **Bloque Unitario (Aislamiento técnico)**:
    - **Pureza**: Garantizar que NO hay accesos a DB real, archivos físicos o red (usar mocks/fixtures).
    - **Cobertura Edge**: Exigir casos para entradas nulas, diccionarios vacíos y excepciones controladas.

3.  **Bloque Integración (Flujo Real)**:
    - **Persistencia**: Validar que el flujo completo (API -> DB) persiste los datos correctamente.
    - **Paridad Híbrida**: Verificar que el test contempla tanto el driver SQLite (Desktop) como Postgres (SaaS) si aplica.

4.  **Generación de Reporte**:
    - Usar el formato de `docs/prompts/test_review.prompt`.
    - NOTA: Si la puntuación final es < 8, el reviewer DEBE fallar la validación y proponer acciones inmediatdas.

## Salida
Guardar en `docs/review/test_reviews/test_quality_report - [Fase] - [Bloque].md`.
