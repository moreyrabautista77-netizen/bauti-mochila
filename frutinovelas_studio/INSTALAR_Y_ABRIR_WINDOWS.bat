@echo off
chcp 65001 >nul
title FrutiNovelas Studio
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (set PY=py -3) else (set PY=python)
%PY% --version >nul 2>nul
if errorlevel 1 (
  echo.
  echo  No se encontro Python. Instalalo desde https://www.python.org/downloads/
  echo  IMPORTANTE: marca la casilla "Add Python to PATH" durante la instalacion.
  echo.
  pause
  exit /b 1
)
if not exist ".venv\Scripts\python.exe" (
  echo Primera vez: instalando FrutiNovelas Studio, puede tardar unos minutos...
  %PY% -m venv .venv
  ".venv\Scripts\python.exe" -m pip install --upgrade pip
  ".venv\Scripts\python.exe" -m pip install -r requirements.txt
  if errorlevel 1 (
    echo Error instalando dependencias. Revisa tu conexion a internet.
    pause
    exit /b 1
  )
)
echo Abriendo FrutiNovelas Studio en tu navegador... (no cierres esta ventana)
".venv\Scripts\python.exe" app.py
pause
