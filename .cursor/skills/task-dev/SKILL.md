---
name: task-dev
description: Ciclo de desarrollo completo para una tarea del backlog (BDD -> TDD -> Dev -> QA -> Doc)
---

# Skill: Desarrollo de Tarea (/task-dev-workflow)

Este flujo (ahora skill) orquesta el ciclo completo de desarrollo de una tarea, soportando la jerarquía **Master/Componente v3.0**.

## Modos de Ejecución

1.  **Modo Maestro (Master Mode)**:
    - Entrada: `T-[PRJ]-XXXX`
    - Comportamiento: El AI analiza el plan, identifica todas las tareas de componente vinculadas y las ejecuta secuencialmente.
2.  **Modo Componente (Component Mode)**:
    - Entrada: `T-[PRJ]-[COMP]-XXXX`
    - Comportamiento: El AI se enfoca exclusivamente en el alcance del componente técnico.

## Workflow Completo

### 1. Inicialización y Contexto
- Cargar metadatos de la tarea (ID, Weight, Version, Effort).
- Si es **Component Mode**, identificar `parent_id` para actualizar métricas globales.
- Si es **Master Mode**, cargar lista de tareas hijas pendientes.

### 2. Gestión de Esfuerzo (Inicio)
- Confirmar `estimated_effort`.
- Establecer `remaining_effort` inicial igual al estimado si es nueva.
- **Actualizar Estado**: Cambiar `status` a `in_progress` (en curso).

### 3. Ciclo de Desarrollo Técnico (Por cada Componente)
Para cada componente afectado (secuencialmente en Master Mode, o el único en Component Mode):

#### 3.1 Fase BDD/TDD (Red Phase)
- Definir escenarios en `<componente>/tests/bdd/features/` integrándolos en de un `.feature` de sistema existente.
- Crear tests unitarios en `<componente>/tests/unit/` que cubran el cambio.
- **Validación**: Ejecutar la revisión de tests (`/review-test-workflow`). Puntuación mínima de 8/10. NO se inicia la implementación sin tests validados.
- Confirmar que los tests fallan inicialmente (Estado Rojo).
- **Human in the loop**: Solicitar confirmación del usuario antes de continuar.

#### 3.2 Fase de Desarrollo (Green Phase)
- Implementar la lógica necesaria siguiendo estándares (Docstrings obligatorios, limpieza).
- Refactorizar hasta que todos los tests creados en la fase roja pasen con éxito.

#### 3.3 Calidad y Revisión (QA Phase)
- Ejecutar la suite de pruebas completa para descartar regresiones.
- Ejecutar la revisión de código exhaustiva (`/review-code-workflow`). 
- **Criterio**: Puntuación mínima de 8/10 en inspecciones de seguridad y testeabilidad.
- **Human in the loop**: Solicitar confirmación del usuario antes de continuar.

#### 3.4 Sincronización de Diseño (Sync Phase)
- Revisar si el código altera el diseño técnico macro.
- Generar o actualizar los documentos definidos en `docs_config.yaml` usando la skill `/manage-docs-workflow`, asegurando un enfoque minimalista y útil.

### 4. Actualización de Métricas y Esfuerzo
**Al completar una sesión o el total de un componente:**
- Calcular `actual_effort` invertido en la sesión.
- Actualizar `remaining_effort` en el archivo de la tarea (estimación de lo que falta).
- Si el componente está terminado, marcar `status: completed`.

### 5. Finalización y Commit
- Generar un commit message estandarizado (usando lógica de `/commit-workflow`).
- Si es **Master Mode**, verificar si todos los componentes hijos están completados. Si es así, cerrar la Tarea Maestra (`completed`).

