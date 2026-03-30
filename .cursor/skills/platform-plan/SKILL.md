---
name: platform-plan
description: Definir la infraestructura, tecnologías y estrategia de escalado/lock-in.
---

# Skill: Necesidades de Plataforma (/platform-plan-workflow)

**Objetivo:** Definir la infraestructura, tecnologías y estrategia de escalado/lock-in.

**Documentación necesaria:**
- `requirements.md`
- `req_analysis.md` (Resultado del paso 1).
- `needs_analysis.md` (Resultado del paso 2).

## Instrucciones del Prompt (Ejecutar con el contexto anterior)

Define la arquitectura de la plataforma y un plan de configuración detallado para un ingeniero humano.

### Proceso de Pensamiento Estratégico:
1. **Identifica Espectro de Soluciones**: (IaaS, PaaS, BaaS).
2. **Análisis Comparativo**: (Coste, Time-to-market, Escalabilidad, Lock-in).
3. **Análisis de Sostenibilidad (Coste del éxito)**: ¿Qué pasa si el proyecto triunfa? Cuantifica el coste de migración fuera de soluciones propietarias.

### Decisión Final y Hoja de Ruta:
- Si eliges Lock-in alto: Define KPI de migración.
- Si eliges Desacoplado: Define plan de optimización.

### SALIDA ESPERADA:
Informe en un fichero Markdown de nombre `platform_plan.md`, en el mismo directorio que los ficheros de entrada y con:
1. Resumen del pensamiento estratégico.
2. Decisión de arquitectura (Stack tecnológico).
3. Recursos necesarios (BBDD, Servidores, etc.).
4. Plan de configuración paso a paso para un ingeniero.

