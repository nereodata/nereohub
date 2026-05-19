---
id: T-NHB-0005
title: "Migración del submódulo de skills a nereodata/nereoskills"
type: tools
weight: 500
version: "v0.5.0"
status: completed
effort_unit: h
estimated_effort: 0.5
remaining_effort: 0
actual_effort: 0.5
created_at: 2026-05-17
updated_at: 2026-05-17
---

# T-NHB-0005: Migración del submódulo de skills a nereodata/nereoskills

## 🎯 Objetivo de Negocio
Tras el renombrado y traslado del repositorio común de skills/workflows desde `imoremu/Wokflows` (con errata) a `nereodata/nereoskills` bajo la organización oficial, actualizar la referencia del submódulo `.agents` en NereoHub para que apunte al nuevo origen sin perder el pin de commit ya validado.

## 📋 Criterios de Aceptación (Nivel Máster)
- [x] **CA-M-1:** `.gitmodules` apunta a `https://github.com/nereodata/nereoskills.git` y la URL local en `.git/config` (`submodule..agents.url`) está sincronizada.
- [x] **CA-M-2:** Un `git submodule update --init` desde un clone limpio inicializa `.agents/` desde la nueva URL sin pasos manuales adicionales.
- [x] **CA-M-3:** El commit pin actual del submódulo (`95e9274cbe84910d2fc95eba12343722da7a0f72`) sigue siendo accesible desde el nuevo origen (verificado con `git fetch` + `git cat-file -t`); por tanto, no se mueve el puntero del submódulo en este cambio.
- [x] **CA-M-4:** El symlink `.claude/skills → ../.agents/skills` introducido en T-NHB-0004 sigue funcionando sin modificaciones tras la migración.

## 🛠 Tareas de Componente
_Tarea exclusivamente de infraestructura del repositorio raíz; no requiere subtareas de componente._

## 🗒 Notas
- La actualización a `main` (HEAD = `4fdd673`) en el nuevo repo queda fuera del alcance de esta tarea: este cambio es estrictamente de URL, manteniendo el pin existente. Si en el futuro se quiere bumpear el puntero, se hará en una tarea independiente.
- Comando equivalente que aplica el cambio: `git submodule set-url .agents https://github.com/nereodata/nereoskills.git` (requiere git ≥ 2.25).
