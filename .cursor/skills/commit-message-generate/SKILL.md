---
name: commit-message-generate
description: Genera una propuesta de mensaje de commit analizando el contexto actual de cambios.
---

# Skill: Generador Rápido de Commit (/commit-message-generate-workflow)

Esta skill genera una propuesta única de mensaje de commit basada exclusivamente en el **contexto de la conversación actual** y la **última tarea o bug** discutido en el hilo.

## Pasos de la Skill

### 1. Extracción de Contexto
- Identificar la última **tarea principal** (`T-XXX`) o **bug** (`B-XXX`) que se ha estado tratando en el hilo.
- Resumir las acciones realizadas (creación de archivos, modificaciones, refactorizaciones).

### 2. Generación del Mensaje
- Generar un **único mensaje** siguiendo el estándar **Aprexx v3.0**.
- **Formato**: `<type>(<scope>): [ID] - <subject>` (Subject en inglés).
- El cuerpo del mensaje debe ser un resumen técnico breve de lo hecho en el hilo.

## Entrega
- Devolver el bloque de texto del commit para que el usuario pueda copiarlo directamente.

