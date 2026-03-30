---
name: needs-analysis
description: Cuantificar requisitos no funcionales, riesgos de compliance y viabilidad de APIs.
---

# Skill: Análisis de Necesidades Técnicas (/needs-analysis-workflow)

**Objetivo:** Cuantificar requisitos no funcionales, riesgos de compliance y viabilidad de APIs.

**Documentación necesaria:**
- `requirements.md`
- `req_analysis.md` (Resultado del paso 1).

## Instrucciones del Prompt

Basándote en el análisis de requisitos funcionales del contexto y del análisis funcional previo, tu misión es cuantificar las necesidades técnicas y los Requisitos No Funcionales (NFRs) del proyecto en dos fases: la fase inicial y la fase de madurez. 
Debes estimar, desde un punto de vista cuantitativo, las cargas de trabajo, los volúmenes de datos y las expectativas de rendimiento para guiar las posteriores decisiones de arquitectura.

### Análisis de Riesgo Obligatorio (Principio 0):
1. **Riesgos de Compliance**: Requisitos de RGPD, Ciberseguridad o legales derivados del manejo de datos.
2. **Riesgos de Dependencias (API)**: Viabilidad de integración con APIs de terceros (ToS, rate limits, costes).

Presenta tus hallazgos en una tabla con:
| Característica | Fase Inicial | Fase Madurez | Exigencia (1-10) | Justificación y Riesgo |
| --- | --- | --- | --- | --- |

Incluye filas para: Usuarios Concurrentes, Latencia, Almacenamiento, RPS, Escalabilidad, SLA, Seguridad/Compliance, Rendimiento BD, APIs Externas y Backup.

### SALIDA ESPERADA:
Informe en un fichero Markdown de nombre `needs_analysis.md`, en el mismo directorio que los ficheros de entrada y con la tabla detallada y cuantificada.

