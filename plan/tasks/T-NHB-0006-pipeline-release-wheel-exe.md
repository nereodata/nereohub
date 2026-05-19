---
id: T-NHB-0006
title: "Pipeline de release: wheel + ejecutable con frontend embebido"
type: despliegue
weight: 300
version: "v0.6.0"
status: backlog
effort_unit: h
estimated_effort: 4
remaining_effort: 4
actual_effort: 0
created_at: 2026-05-17
updated_at: 2026-05-17
---

# T-NHB-0006: Pipeline de release: wheel + ejecutable con frontend embebido

## 🎯 Objetivo de Negocio
Permitir que usuarios **no-dev** instalen y ejecuten NereoHub sin necesidad de Node.js, npm ni de un clon del repositorio. Hoy, `scripts/nereohub.sh` compila el frontend bajo demanda (workflow para devs), pero falta el camino para perfiles no técnicos: un artefacto autocontenido (wheel y/o ejecutable PyInstaller) con los bundles del frontend ya pre-compilados y embebidos, distribuido vía GitHub Releases.

Esta capacidad habilita el uso de NereoHub como herramienta de creación/gestión de tareas por parte de usuarios funcionales en el futuro.

## 📋 Criterios de Aceptación (Nivel Máster)
- [ ] **CA-M-1:** Un push de tag `vX.Y.Z` dispara un workflow de GitHub Actions que produce un Release con dos artefactos descargables: el wheel (`nereohub-X.Y.Z-py3-none-any.whl`) y el ejecutable PyInstaller (`nereohub-X.Y.Z-<plataforma>.zip` o equivalente).
- [ ] **CA-M-2:** Instalar el wheel en una máquina **sin Node.js ni npm** y lanzar `nereohub` sirve la UI completa en `http://localhost:8888` sin errores 404 en `/assets/*`.
- [ ] **CA-M-3:** Ejecutar el binario de PyInstaller en una máquina limpia (sin Python ni Node) lanza la UI correctamente.
- [ ] **CA-M-4:** El README incluye una sección de instalación para no-devs que apunta al Release y describe ambos artefactos.

## 🛠 Tareas de Componente
_Tarea de infraestructura del repositorio raíz; las subtareas se desglosarán si la complejidad lo justifica al iniciar el desarrollo._

## 🏗️ Implementación Técnica (esbozo)
- **Workflow `release.yml`** disparado por `push: tags: ['v*']`:
  1. `actions/setup-node@v4` (Node 20) + `actions/setup-python@v5` (3.11).
  2. `cd frontend && npm install && npm run build`.
  3. `cp -r frontend/dist/assets nereohub/static/ && cp frontend/dist/index.html nereohub/static/`.
  4. `python -m build` → wheel y sdist en `dist/`. Verificar que `pyproject.toml` incluye `nereohub/static/**` como `package_data` (revisar configuración actual).
  5. `pip install pyinstaller && pyinstaller nereohub.spec` → empaquetar `dist/nereohub/` en zip.
  6. `softprops/action-gh-release@v2` para subir artefactos al Release del tag.
- **Verificación previa local** del `nereohub.spec` actual: confirmar que sigue produciendo un binario funcional con la última estructura del paquete (la última actualización data de hace meses y la estructura del frontend ha cambiado desde entonces). Ajustar `datas`/`hiddenimports` si es necesario.
- **Multiplataforma:** decidir si el exe se construye solo para Linux (matriz simple) o también Windows/macOS (matriz `runs-on`). Sugerencia inicial: solo Linux + Windows en la primera versión, macOS si hay demanda.

## ⚠️ Riesgos
- **PyInstaller:** el spec puede requerir ajustes de `hidden imports` o `datas` (especialmente para `nereohub/static/`). Probar en local antes de mover a CI.
- **Tamaño del binario:** el bundle de PyInstaller con todas las dependencias FastAPI/uvicorn puede pesar >50 MB. Documentar y, si se considera bloqueante, explorar `--onefile` vs `--onedir`.

## 🗒 Notas
- La decisión de mantener `nereohub/static/assets/` en `.gitignore` se documenta en el README (sección "Frontend: compilación bajo demanda"). Esta tarea es el complemento natural a esa decisión: el repo queda limpio y los usuarios reciben los artefactos vía Release.
- Origen: conversación del 2026-05-17 sobre los 404 al lanzar `scripts/nereohub.sh` en un checkout limpio.
