---
name: commit
description: Generates a commit message based on current changes and rules (Multi-commit enabled)
---

# Skill: Commit Inteligente y Distribuido v3.0 (/commit-workflow)

Este workflow (ahora skill) analiza los cambios pendientes, los agrupa funcionalmente y genera los commits siguiendo los estándares de **Aprexx v3.0**.

## Pasos de la Skill

### 1. Análisis y Agrupación
- Analizar todos los archivos modificados, en stage y **untracked**.
- Agrupar los cambios en bloques con sentido funcional. 
- **Regla Oro**: No debe quedar ningún archivo modificado o nuevo sin procesar. Si un archivo no encaja en un bloque mayor, crear un bloque `chore` o `refactor` adicional.

### 2. Metadatos y Generación del Mensaje (Commit Generator)

Para cada bloque funcional identificado:

a. **Determinar Tipo**: `docs`, `feat`, `fix`, `refactor`, `test`, `chore`, `style`, `perf`.
b. **Determinar Scope**: `plan`, `config`, `api`, `ui`, `backend`, `frontend`, o el nombre del paquete.
c. **Identificar ID de Tarea/Bug e Hitos (Opcional pero recomendado)**:
   - Buscar el ID (`T-XXX`, `B-XXX`) en el frontmatter de los archivos de backlog modificados.
d. **Generación del Mensaje (Inglés Obligatorio)**:
   - **Formato**: `<type>(<scope>): [ID] - <subject>`
   - **Cuerpo (Body)**: Descripción detallada técnica del cambio.
e. **Ejemplo Técnico**: 
   ```text
   feat(ui): T-APX-HMI-0001 - add presentation status indicator in Sidebar

   Implementing a reactive status chip in the main sidebar using Zustand store.
   The chip updates in real-time based on the generation progress.

   Ref: T-APX-HMI-0001, RF-204
   ```

### 3. Confirmación y Ejecución
- Presentar al usuario la propuesta de división en commits y sus respectivos mensajes.
- Tras la aprobación, realizar `git add` por grupos y `git commit`.

### 4. Limpieza de Basura (Housekeeping)
- Eliminar ficheros temporales y artefactos de pruebas detectados en el análisis.
- Preguntar al usuario sobre ficheros untracked irrelevantes.

