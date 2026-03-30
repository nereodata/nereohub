---
name: manage-docs
description: Gestión y actualización minimalista de la documentación del proyecto.
---

# Skill: Gestión de Documentación (/manage-docs-workflow)

Esta skill orquesta la actualización de los documentos del proyecto definidos en `docs_config.yaml`, asegurando que se mantengan alineados con los cambios técnicos sin añadir ruido innecesario.

## Principios de Actualización
1. **Necesidad**: Solo actualizar si el cambio impacta directamente el propósito del documento.
2. **Minimalismo**: Incluir solo la información mínima útil.
3. **Continuidad**: Mantener el enfoque general y el nivel de profundidad existente. Esto implica solo añadir información o apartados nuevos si es estrictamente necesaria y útil, y siempre manteniendo la coherencia.

## Pasos de la Skill

### 1. Carga de Configuración
- Intentar leer `docs_config.yaml` para identificar los documentos a mantener.
- **Project Fallback**: Si el archivo no existe (como en este repositorio), el documento por defecto a mantener es `README.md`.
- Cada entrada en el YAML contiene: `nombre`, `path`, `tipo` (por defecto `md`) y `descripcion`.

### 2. Análisis de Impacto
- Evaluar los cambios realizados en el código o las tareas (`task-dev` o `bug-fix`).
- Identificar cuál de los documentos configurados se ve afectado por estos cambios.

### 3. Actualización de Documentos
Para cada documento afectado:
- Leer el contenido actual.
- Integrar la nueva información siguiendo los principios de minimalismo y utilidad.
- Priorizar diagramas Mermaid si ayudan a simplificar la explicación.
- **Validación**: Asegurar que no se degrada la legibilidad ni se pierde el contexto general.

### 4. Gestión del CHANGELOG (WDSV)
- Si el documento `CHANGELOG.md` existe o está configurado, actualizarlo analizando los commits recientes.
- **Agrupación**: Utilizar los tipos de commit (`feat`, `fix`, `docs`, etc.) y sus scopes.
- **Trazabilidad**: Incluir los IDs de tarea/bug (`T-XXX`, `B-XXX`) vinculados a los cambios.
- **Detección de Versión**: Si se detecta un cierre de Tarea Maestra, proponer un incremento de versión **MINOR**. Si es un Bug fix, incremento de **PATCH**.
- **Generación**: Usar el formato:
  ```markdown
  ## [vX.Y.Z] - YYYY-MM-DD
  ### Added / Changed / Fixed
  - [ID] - Descripción resumida (Scope)
  ```

### 5. Sincronización
- Confirmar que los cambios en la documentación reflejan fielmente la implementación técnica actual.
- Validar que la propuesta de versión en el CHANGELOG es coherente con los cambios realizados.

