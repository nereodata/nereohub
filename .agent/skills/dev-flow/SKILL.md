---
name: dev-flow
description: Orquestador de ciclo de desarrollo completo (BDD -> TDD -> Dev -> QA -> Doc)
---

# Desarrollo y Resolución de Anomalías (Standard Flow)

Esta habilidad garantiza que cualquier cambio en el código, sea planificado o una corrección de error, siga el rigor técnico del proyecto.

## Paso 1: Diseño de Pruebas y Validación (Red Phase)
- **BDD/TDD**: Crear o actualizar escenarios y tests unitarios que cubran el cambio o la anomalía.
- **Revisión de Tests**: Ejecutar `./docs/prompts/test_review.prompt` sobre los nuevos tests.
- **Criterio**: Puntuación mínima de 8/10. NO se inicia la implementación sin tests validados.
- **Fallo inicial**: Confirmar que los tests fallan (Estado Rojo).

## Paso 2: Implementación (Green Phase)
- Desarrollar la lógica necesaria para que los tests pasen.
- Seguir los estándares de arquitectura definidos en `Execution Plan - Phase 1.md`.

## Paso 3: Verificación y Calidad (QA Phase)
- **Pruebas**: Ejecutar la suite completa para asegurar que no hay regresiones.
- **Revisión de Código**: Evaluar la calidad del código usando `./docs/prompts/code_review.prompt`.
- **Criterio**: Puntuación mínima de 8/10.

## Paso 4: Documentación de Diseño (Sync Phase)
- Revisar si el cambio altera el diseño técnico.
- Si hay cambios, actualizar o crear el documento en `docs/architecture/` usando `./docs/prompts/design_documentation.prompt`.

## Paso 5: Commit (Final Phase)
- Ejecutar el workflow `/commit` para persistir los cambios con el formato estándar.
