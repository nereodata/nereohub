---
name: code-reviewer
description: Experto en revisión de código que evalúa seguridad, eficiencia, testeabilidad y cumplimiento de estándares.
---

# Code Reviewer Skill

Este skill se encarga de realizar auditorías de código exhaustivas sobre el proyecto Adataxx, puntuando categorías clave y detectando riesgos.

## Workflow

1.  **Análisis de Ámbito**:
    - Identificar qué archivos han sido modificados o creados.
    - Leer el contexto del requisito asociado (RF/RNF).

2.  **Evaluación por Categorías**:
    Analiza y puntúa (1-10) las siguientes áreas:
    - **Seguridad**: Manejo de credenciales, protección contra inyecciones.
    - **Eficiencia**: Complejidad algorítmica y gestión de recursos.
    - **Testeabilidad**: Facilidad para mockear dependencias y modularidad.
    - **Mantenibilidad**: Limpieza, DRY, división de responsabilidades y nombres descriptivos. Métodos y clases limpias y bien organizadas. Imports en el bloque de imports.
    - **Documentación**: Presencia de docstrings. No debe haber comentarios que no sean docstrings
    - **Cobertura de Requisitos**: Trazabilidad directa con el Plan de Ejecución.

3.  **Generación de Reporte**:
    - Usar el formato Markdown definido en `docs/prompts/code_review.prompt`.
    - Clasificar hallazgos en: 🔴 Crítico, 🟠 Alto, 🟡 Medio, 🟢 Bajo.

4.  **Criterio de Aprobación**:
    - Cualquier puntuación < 8 en Seguridad o Testeabilidad inhabilita el paso a producción.

## Salida
Guardar el reporte en `docs/review/code_reviews/code_review_report - [Fase] - [Bloque] - Review [X].md`.
