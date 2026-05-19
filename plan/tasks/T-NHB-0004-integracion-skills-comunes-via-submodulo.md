---
id: T-NHB-0004
title: "Integración de skills y workflows comunes en NereoHub vía submódulo .agents"
type: tools
weight: 500
version: "v0.5.0"
status: completed
effort_unit: h
estimated_effort: 1
remaining_effort: 0
actual_effort: 1
created_at: 2026-05-17
updated_at: 2026-05-17
---

# T-NHB-0004: Integración de skills y workflows comunes en NereoHub vía submódulo .agents

## 🎯 Objetivo de Negocio
Reutilizar el repositorio común de skills y workflows (`imoremu/Wokflows`) desde NereoHub sin duplicar contenido. Las skills viven en un único sitio, se versionan de forma independiente, y Claude Code las consume automáticamente bajo el directorio estándar `.claude/skills/`, manteniendo la coherencia entre proyectos que compartan el mismo conjunto de skills.

## 📋 Criterios de Aceptación (Nivel Máster)
- [x] **CA-M-1:** El directorio `.agents/` está declarado en `.gitmodules` como submódulo apuntando a `https://github.com/imoremu/Wokflows.git` y queda inicializable con `git submodule update --init`.
- [x] **CA-M-2:** Existe `.claude/skills` como **symlink relativo** a `../.agents/skills`, de forma que git versiona únicamente el enlace (17 bytes) y no los documentos del submódulo.
- [x] **CA-M-3:** Tras `git clone` + `git submodule update --init`, Claude Code reconoce las skills del submódulo en `.claude/skills/<skill>/SKILL.md` sin pasos adicionales.
- [x] **CA-M-4:** Ningún `.md` de las skills queda copiado dentro del repositorio NereoHub; las actualizaciones del repo `Wokflows` se incorporan exclusivamente actualizando el puntero de commit del submódulo.

## 🛠 Tareas de Componente
_Tarea exclusivamente de infraestructura del repositorio raíz; no requiere subtareas de componente._

## 🗒 Notas
- La URL del submódulo es `https://github.com/imoremu/Wokflows.git` (errata conocida en el nombre del repo remoto; pendiente de renombrar a `Workflows` por el dueño del repo).
- El symlink es relativo (`../.agents/skills`) para que funcione en cualquier ruta de clonado.
- `.claude/` no se ignora: se versiona como directorio que contiene únicamente el symlink, dejando libertad para añadir `.claude/settings.json`, `.claude/agents/`, etc. sin tocar el submódulo.
