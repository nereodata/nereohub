---
name: req-analysis
description: Identificar ambigüedades, asunciones y conflictos en los requisitos originales.
---

# Skill: Análisis de Requisitos Funcionales (/req-analysis-workflow)

Este flujo se encarga de procesar los requisitos brutos de un proyecto para asegurar su claridad y accionabilidad.

**Objetivo:** Identificar ambigüedades, asunciones y conflictos en los requisitos originales.

**Documentación necesaria:**
- `requirements.md` (Los requisitos brutos o descripción del proyecto).

## Instrucciones del Prompt (Ejecutar con el contexto anterior)

Analiza los requisitos de proyecto adjuntos en busca de ambigüedades, conflictos o información faltante. 
Tu objetivo es asegurar que los requisitos son claros y accionables antes de proceder con la planificación técnica. 
En principio, eres encargado de resolver posibles ambigüedades funcionales siempre que exista una solución preferible.
Si no existe una solución preferible, formula preguntas claras para el usuario para resolver la ambigüedad.
Toda asunción debe ser documentada en el informe indicando el motivo de la asunción y la solución adoptada.

Revisa el archivo adjunto con los requisitos del proyecto.

### SALIDA ESPERADA:
Un informe completo en formato Markdown en el mismo directorio del fichero de requisito y llamado `req_analysis.md`. 
El informe debe empezar con una línea que indique el estado, ya sea '**Estado:** REQUIERE_ACLARACION' o '**Estado:** ASUNCIONES_REALIZADAS'.
A continuación, debe desarrollar el reporte con secciones claras para las preguntas o las asunciones tomadas.

**REGLA CRÍTICA:** Este informe debe centrarse ÚNICAMENTE en el análisis de los requisitos funcionales. NO debe incluir decisiones técnicas, tecnologías, arquitecturas, planes de desarrollo, etc.
