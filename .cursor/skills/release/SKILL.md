---
name: release
description: Gestión de lanzamientos y etiquetado de versiones (Release Management)
---

# Skill: Gestión de Lanzamientos (/release-workflow)

Esta skill formaliza el cierre de una versión del proyecto, asegurando que todos los entregables estén listos y etiquetados correctamente en Git.

## Pasos de la Skill

### 1. Validación Pre-Release
- Verificar que no hay cambios pendientes sin commitear (staged o unstaged).
- Ejecutar `/review-test-workflow` y `/review-code-workflow` de forma global si es necesario.
- Confirmar que el `CHANGELOG.md` está actualizado (e invocar `/manage-docs-workflow` si no lo está).

### 2. Identificación de la Versión
- Leer la versión actual de la configuración del proyecto (`task_config.yaml` -> `project.version`).
- Determinar el nuevo número de versión basado en los cambios realizados y la política WDSV:
  - **MAJOR**: Paradigma / Hito masivo.
  - **MINOR**: Nueva Tarea Maestra finalizada.
  - **PATCH**: Bug fixes o mantenimiento.

### 3. Ejecución del Bump
- Actualizar `task_config.yaml` con la nueva versión.
- Crear un commit de release: `chore(release): vX.Y.Z`.
- Sincronizar (cerrar) la tarea de release `T-[PRJ]-REL-XXXX` en el backlog.

### 4. Etiquetado (Tagging)
- Crear una etiqueta anotada en Git: `git tag -a vX.Y.Z -m "Release vX.Y.Z"`.
- Indicar al usuario que debe realizar el `git push --follow-tags` para publicar la versión.

### 5. Notificación
- Generar un resumen de la release para ser compartido (extraído del CHANGELOG).

