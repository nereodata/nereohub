---
description: Generates a commit message based on current changes and rules (Multi-commit enabled)
---

# Workflow: Commit Inteligente y Distribuido v3.0

Este workflow analiza los cambios pendientes, los agrupa funcionalmente y genera los commits siguiendo los estándares de **Nereodata**.

1. **Análisis y Agrupación**:
   - Analizar todos los archivos modificados, en stage y **untracked**.
   - Agrupar los cambios en bloques con sentido funcional. 
   - **Regla Oro**: No debe quedar ningún archivo modificado o nuevo sin procesar. Si un archivo no encaja en un bloque mayor, crear un bloque `chore` o `refactor` adicional.

2. **Para cada bloque funcional identificado**:
   
   a. **Determinar Tipo**: `fix` (bugs), `feat` (funcionalidad), `docs`, `refactor`, `chore`.
   
   b. **Identificar ID de Tarea/Bug**:
      - Buscar el ID en el frontmatter de los archivos de backlog modificados.
      - Formatos válidos: `T-APX-XXXX`, `T-APX-[PKG]-XXXX`, `B-APX-XXXX`, `B-APX-[PKG]-XXXX`.
   
   c. **Check de Compliance**:
      - Verificar que el archivo `.md` correspondiente al ID exista y tenga el `status` correcto.
      - Para tareas de paquete, verificar si existe `parent_id` y su estado.

   d. **Generación del Mensaje**:
      - **Mensaje**: `<type>(<scope>): [ID] - <subject>` (en inglés).
      - **Footer**: Incluir `Ref: [ID]`. Si hay una tarea maestra vinculada, incluir también `Ref-Master: [Master-ID]`.
      
   e. **Ejemplo**: 
      - `feat(hmi): T-APX-HMI-0001 - Add stepper component for navigation`
      - `fix(ctx): B-APX-CTX-0002 - Resolve memory leak in context service`

3. **Confirmación y Ejecución**:
   - Presentar al usuario la propuesta de división en commits y sus respectivos mensajes.
   - Tras la aprobación, realizar `git add` por grupos y `git commit`.

4. **Limpieza de Basura (Housekeeping)**:
   - Eliminar ficheros temporales y artefactos de pruebas detectados en el análisis.
   - Preguntar al usuario sobre ficheros untracked irrelevantes.