---
name: review-code
description: Realiza una revisión de código completa
---

# Skill: Code Review (/review-code-workflow)

Este flujo (ahora skill) orquesta la revisión del código para asegurar que cumple con los estándares de calidad del proyecto.

## Pasos de la Skill

### 1. Identificar Ámbito
Determinar qué archivos o bloques de código han sido modificados o deben ser revisados.

### 2. Análisis Crítico (Code Reviewer)
Analiza y puntúa (1-10) rigurosamente las siguientes áreas:
* **Seguridad (CRÍTICO)**: Manejo de credenciales, protección contra inyecciones sql/xss, validación de inputs.
* **Eficiencia**: Complejidad algorítmica y gestión de memoria/recursos.
* **Testeabilidad (CRÍTICO)**: Facilidad para mockear dependencias, inversión de control y modularidad.
* **Mantenibilidad**: Código Limpio, DRY, SOLID, división de responsabilidades y nombres descriptivos. Imports correctos.
* **Documentación**: Presencia de docstrings obligatorios en clases y métodos. No debe haber apenas comentarios inline.
* **Cumplimiento de Requisitos**: Trazabilidad e implementación correcta de lo solicitado.

### 3. Generar Reporte
Documentar los hallazgos estructuradamente. (Usualmente guardado en la carpeta `docs/review/code_reviews/` si existe, o presentado directamente al usuario). Asignar una puntuación global del 1 al 10.

### 4. Veredicto Final
Informar al usuario si el código es "Apto para producción" (Pasa los mínimos) o si requiere correcciones obligatorias pre-commit.

