---
name: bug-fix
description: Ciclo completo para la resolución de anomalías (bugs) detectadas.
---

# Skill: Resolución de Anomalías (/bug-fix-workflow)

Este flujo orquesta la resolución de bugs, soportando la jerarquía **Master/Componente v3.0**.

## Modos de Ejecución

1.  **Modo Maestro (Master Fix)**:
    - Entrada: `B-[PRJ]-XXXX`
    - El AI analiza todos los componentes afectados por el bug maestro y aplica las correcciones secuencialmente.
2.  **Modo Componente (Componente Fix)**:
    - Entrada: `B-[PRJ]-[COMP]-XXXX`
    - Foco exclusivo en la corrección técnica de un componente.

## Pasos de la Skill

### 1. Reproducción y Esfuerzo

- Cargar metadatos del bug.
- Establecer `actual_effort` y actualizar `remaining_effort`.
- **Fase de Pruebas**: Crear/actualizar BDD y Unit Test que capturen el fallo.
    - *Importante*: Integrar el escenario en un `.feature` de sistema existente, salvo que sea necesario crear una nueva funcionalidad no existente para resolver el bug. No crear archivos `.feature` nominales al bug o ID de tarea: los feature son de sistema, no de proceso.
- **Human in the loop**: Solicitar confirmación del usuario antes de continuar.

### 2. Desarrollo (Fix)

- Implementar la corrección siguiendo estándares (Docstrings obligatorios, no comentarios inline).
- Verificar que los tests pasan.

### 3. Fase de Verificación (QA)

- Ejecutar el proceso de revisión de corrección (`review-fix` logic) usando el skill `bug-fix-reviewer`.
- Validar que no hay regresiones.
- **Human in the loop**: Solicitar confirmación del usuario antes de continuar.

### 4. Cierre y Documentación

- Documentar la solución y actualizar métricas de esfuerzo en el archivo de backlog.
- Ejecutar la actualización de documentación del proyecto a través de `/manage-docs-workflow`.
- Si es **Master Fix**, verificar si otros componentes requieren correcciones para el mismo problema.

### 5. Persistencia

- Realizar los cambios y preparar para hacer commit con el prefijo `fix([ID])` (puedes apoyarte en la skill `commit`).

