---
description: Ciclo de desarrollo completo para nuevas tareas o resolución de anomalías
---

// turbo-all
1. **Analizar Requisitos/Anomalía**:
   - Identificar archivos afectados.
   - Revisar `./docs/plan/Execution Plan - Phase 1.md` (si procede).

2. **Fase de Pruebas (Contexto BDD/TDD)**:
   - ¿Hay cambios en el comportamiento? Actualizar o extender `.feature` en `packages/*/tests/features/`.
   - ¿Hay nuevos casos de borde? Actualizar tests unitarios en `packages/*/tests/unit/`.
   - **Revisión de Tests**: Ejecutar `./docs/prompts/test_review.prompt` sobre los tests.
   - Ejecutar pruebas para verificar el "Fallo inicial".
   - *Nota de Arquitectura BDD*: En la medida de lo posible, integrar el escenario en un `.feature` de sistema existente, salvo que sea necesario crear una nueva funcionalidad no existente para resolver la tarea. No crear archivos `.feature` nominales al bug o ID de tarea: los feature son de sistema, no de proceso.

3. **Desarrollo**:
   - Implementar el cambio.
   - Ejecutar pruebas hasta que pasen.
   - **Estándares Estrictos de Código y Estilo**:
     - **Imports**: Deben ir siempre ordenados al principio del archivo.
     - **Docstrings (OBLIGATORIO)**:
       - **Todas** las clases y métodos deben tener docstrings explicativos.
       - **Contexto y Referencias**: Cualquier explicación de lógica compleja, decisiones de diseño especiales (por qué se hizo así), deuda técnica conocida, o referencias a `BUG-XXX` / `TASK-XXX` debe ir **exclusivamente dentro del docstring**, nunca disperso en el código.
     - **Comentarios Inline (PROHIBIDO)**:
       - El código debe ser auto-explicativo (nombres de variables claros, funciones atómicas).
       - **No** se permiten comentarios en el cuerpo del código (`#` o `//`) para explicar la lógica ni para seguimiento de tareas.

4. **Control de Calidad (Review)**:
   - Ejecutar `./docs/prompts/code_review.prompt` y guardar reporte.

5. **Sincronización de Documentación**:
   - Ejecutar `./docs/prompts/design_documentation.prompt` si el diseño ha cambiado.

6. **Finalización**:
   - Usar el workflow `/commit` para guardar los cambios.