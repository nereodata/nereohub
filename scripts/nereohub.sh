#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV_DIR="${NEREOHUB_VENV:-$PROJECT_DIR/.venv-wsl}"
FRONTEND_DIR="$PROJECT_DIR/frontend"
STATIC_DIR="$PROJECT_DIR/nereohub/static"
export NEREOHUB_PORT="${NEREOHUB_PORT:-8889}"

cd "$PROJECT_DIR"

if [ ! -x "$VENV_DIR/bin/python" ]; then
  python3 -m venv "$VENV_DIR"
  "$VENV_DIR/bin/python" -m pip install --upgrade pip
  "$VENV_DIR/bin/python" -m pip install -e .
fi

if [ ! -f "$STATIC_DIR/assets/index.js" ] || [ ! -f "$STATIC_DIR/assets/index.css" ]; then
  if ! command -v npm >/dev/null 2>&1; then
    cat >&2 <<'EOF'
[nereohub] Faltan los assets compilados del frontend (nereohub/static/assets/)
           y no se ha encontrado `npm` en el PATH para compilarlos.

Opciones:
  - Devs: instala Node.js 18+ y vuelve a lanzar este script.
  - No-devs: usa un wheel/exe pre-compilado (ver README).
EOF
    exit 1
  fi
  echo "[nereohub] Compilando frontend..."
  ( cd "$FRONTEND_DIR" && npm install && npm run build )
  mkdir -p "$STATIC_DIR"
  rm -rf "$STATIC_DIR/assets"
  cp -r "$FRONTEND_DIR/dist/assets" "$STATIC_DIR/"
  cp "$FRONTEND_DIR/dist/index.html" "$STATIC_DIR/index.html"
fi

exec "$VENV_DIR/bin/python" -m nereohub "$@"
