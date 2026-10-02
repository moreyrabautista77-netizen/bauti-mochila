#!/usr/bin/env bash
# FrutiNovelas Studio - instalar (la primera vez) y abrir
cd "$(dirname "$0")"
if [ ! -x .venv/bin/python ]; then
  echo "Primera vez: instalando dependencias..."
  python3 -m venv .venv || { echo "Instalá Python 3.10+ desde python.org"; exit 1; }
  .venv/bin/python -m pip install --upgrade pip
  .venv/bin/python -m pip install -r requirements.txt || exit 1
fi
exec .venv/bin/python app.py
