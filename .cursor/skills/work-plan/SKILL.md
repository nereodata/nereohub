---
name: work-plan
description: Crear la estrategia de desarrollo y generar tareas en el backlog.
---

# Skill: Plan de Trabajo (/work-plan-workflow)

**Objetivo:** Crear la estrategia de desarrollo basada en las tecnologías elegidas y automatizar la creación de tareas.

**Documentación necesaria:**
- `requirements.md`
- `req_analysis.md` (Resultado del paso 1).
- `needs_analysis.md` (Resultado del paso 2).
- `platform_plan.md` (Resultado del paso 3).

## Instrucciones del Prompt (Ejecutar en dos fases)

### Fase 1: Generación del Plan de Desarrollo
Genera un plan de desarrollo técnico detallado basado EXCLUSIVAMENTE en la arquitectura de plataforma aprobada. 

**Instrucciones:**
1. **Foco en Software**: No incluyas tareas de infraestructura (ya definidas en el plan anterior).
2. **Filosofía BDD/TDD**: Cada bloque funcional debe empezar por la definición de pruebas.
3. **Tecnologías**: Usa EXACTAMENTE las definidas en el plan de plataforma (ej. si dice React, usa React).
4. **Granularidad**: Tareas atómicas e independientes.

**SALIDA ESPERADA:**
Un resumen del plan de trabajo en un fichero Markdown de nombre `work_plan.md`, en el mismo directorio que los ficheros de entrada y que explique las fases de desarrollo, hitos principales y estrategia de integración continua.

### Fase 2: Automatización del Backlog (Task Creation)
Una vez generado el `work_plan.md`, procede a registrar cada una de las tareas identificadas en el sistema de backlog utilizando la skill `/task-add-workflow`.

**Reglas de Priorización (Weighting):**
- La prioridad de las tareas debe ser **ascendente**.
- El peso inicial debe ser **superior a 100** (o el valor indicado por el usuario).
- Se debe dejar una separación de **10 puntos** entre cada tarea (ej. 110, 120, 130...).
- Para cada tarea del plan, invoca `/task-add-workflow` proporcionando el título, objetivo técnico y criterios de aceptación derivados del plan.

**SALIDA ESPERADA:**
Confirmación del plan generado y lista de IDs de tareas maestras (`T-[PRJ]-XXXX`) y de componente (`T-[PRJ]-[COMP]-XXXX`) creadas.
