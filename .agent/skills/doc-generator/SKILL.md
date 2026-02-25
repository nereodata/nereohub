---
name: doc-generator
description: Arquitecto de software senior que genera o actualiza documentación técnica de diseño y arquitectura.
---

# Doc Generator Skill

Este skill asegura que el código está siempre alineado con su documentación técnica, incluyendo diagramas Mermaid y cumplimiento de seguridad.

## Workflow

1.  **Identificación de Módulos**:
    - Analizar el código recién escrito.
    - Determinar si afecta a un módulo existente o requiere uno nuevo.

2.  **Generación/Actualización de Diseño**:
    - Crear `docs/architecture/design_[modulo].md`.
    - Incluir diagramas `sequenceDiagram` o `classDiagram` (Mermaid).
    - Explicar entradas, salidas y trazabilidad con requisitos.

3.  **Control de Compliance (CRÍTICO)**:
    - Si el cambio afecta a **seguridad, credenciales o cifrado**, actualizar **obligatoriamente** la documentación en `docs/architecture/security/`.

4.  **Sincronización con el Plan**:
    - Verificar que la documentación refleja los cambios marcados en `docs/plan/`.

## Instrucciones Especiales
- Priorizar diagramas sobre texto denso.
- Mantener la sección de Decisiones Técnicas (ADR) actualizada.
