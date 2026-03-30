---
name: task-list
description: Generar el backlog técnico asignable a equipos/agentes en formato JSON.
---

# Skill: Generación de Lista de Tareas (/task-list-workflow)

Este flujo se encarga de transformar el plan de trabajo y la arquitectura en un backlog técnico estructurado para procesamiento automatizado.

**Objetivo:** Generar el backlog técnico asignable a equipos/agentes.

**Documentación necesaria:**
- `requirements.md`
- `req_analysis.md`
- `needs_analysis.md`
- `platform_plan.md`
- `work_plan.md`

## Instrucciones del Prompt (Ejecutar con el contexto anterior)

Basándote en el Plan de Trabajo y la Arquitectura, genera la lista de tareas técnica final en formato JSON para su procesamiento.

### Instrucciones:
- Cada tarea debe especificar el 'equipo_asignado' (ej: 'Backend con FastAPI y PostgreSQL').
- No utilices las palabras 'desarrollador', 'tester' o 'revisor'.
- Las tareas deben ser claras y accionables para un agente IA.

### ESTRUCTURA JSON REQUERIDA:
```json
{
  "lista_de_tareas": [
    {
      "id_tarea": 1,
      "descripcion": "Descripción detallada...",
      "equipo_asignado": "Tecnología + Contexto"
    }
  ]
}
```

**IMPORTANTE:** Devuelve solo el JSON puro, sin bloques de código markdown ni explicaciones adicionales.

