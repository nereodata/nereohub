---
description: Ciclo completo para la resolución de anomalías (bugs) detectedas.
---

# Bug Fix Workflow (Resolución de Anomalías)

Este flujo orquesta la resolución de bugs, soportando la jerarquía **Master/Package v3.0**.

## Modos de Ejecución

1.  **Modo Maestro (Master Fix)**:
    - Entrada: `B-APX-XXXX`
    - El AI analiza todos los paquetes afectados por el bug maestro y aplica las correcciones secuencialmente.
2.  **Modo Paquete (Package Fix)**:
    - Entrada: `B-APX-[PKG]-XXXX`
    - Foco exclusivo en la corrección técnica de un componente.

## Workflow

### 1. Reproducción y Esfuerzo

- Cargar metadatos del bug.
- Establecer `actual_effort` y actualizar `remaining_effort`.
- **Fase de Pruebas**: Crear/actualizar BDD y Unit Test que capturen el fallo.
    - *Importante*: Integrar el escenario en un `.feature` de sistema existente, salvo que sea necesario crear una nueva funcionalidad no existente para resolver el bug. No crear archivos `.feature` nominales al bug o ID de tarea: los feature son de sistema, no de proceso.

### 2. Desarrollo (Fix)

- Implementar la corrección siguiendo estándares (Docstrings obligatorios, no comentarios inline).
- Verificar que los tests pasan.

### 3. Fase de Verificación (QA)

- Ejecutar `/review-fix` usando el skill `bug-fix-reviewer`.
- Validar que no hay regresiones.

### 4. Cierre y Documentación

- Ejecutar `/finish-bug` para documentar la solución y actualizar métricas de esfuerzo.
- Si es **Master Fix**, verificar si otros paquetes requieren correcciones para el mismo problema.

### 5. Persistencia

- Ejecutar `/commit` para guardar la corrección con el prefijo `fix([ID])`.