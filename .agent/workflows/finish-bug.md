---
description: Ciclo de cierre definitivo y documentación de una anomalía (Bug/Fallo)
---

# Workflow: Cierre de Anomalía (Finish Bug)

Este workflow formaliza la resolución de un bug una vez que las pruebas han sido validadas, integrando métricas de esfuerzo.

## Workflow

### 1. Actualización de Documentación de Anomalía
- Localizar el archivo en `<paquete>/docs/backlog/B-APX-[PKG]-XXXX.md`.
- **Actualizar metadatos**:
  - `status: completed`
  - `remaining_effort: 0`
  - `actual_effort: [esfuerzo real invertido]`
  - `updated_at: YYYY-MM-DD`

### 2. Documentación de la Solución
- **Añadir (APPEND)** al final del archivo:
  ```markdown
  ## Solución Implementada
  
  ### Análisis de Causa Raíz
  [Explicación técnica]
  
  ### Cambios Realizados
  - [Lista de archivos y lógica]
  ```

### 3. Sincronización con Master Bug
- Si la anomalía tiene un `parent_id`:
  - Verificar si todas las demás anomalías de paquete vinculadas al mismo Master están `completed`.
  - Si es el caso, preguntar al usuario para cerrar el **Master Bug** (`docs/plan/tasks/B-APX-XXXX.md`).

### 4. Cierre de Ciclo con Commit
- Ejecutar el workflow `/commit`.
- El mensaje seguirá el formato: `fix([scope]): [ID] - [subject]`.

