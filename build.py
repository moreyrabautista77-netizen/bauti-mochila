#!/usr/bin/env python3
"""Arma la app en un solo HTML.

- dist/mochila.html : página para publicar (sin <!doctype>, la envuelve el visor)
- index.html        : versión completa para abrir con doble clic en la PC
"""
from pathlib import Path

RAIZ = Path(__file__).parent
SRC = RAIZ / "src"
FASES = ["base", "fase1", "fase2", "fase3", "fase4", "fase5", "fase6"]

contenido = "\n".join((SRC / "contenido" / f"{f}.js").read_text(encoding="utf-8") for f in FASES)
# Un "</script" dentro de un texto cerraría la etiqueta <script> antes de tiempo
contenido = contenido.replace("</script", "<\\/script")
pagina = (
    (SRC / "plantilla.html").read_text(encoding="utf-8")
    .replace("/*ESTILOS*/", (SRC / "estilos.css").read_text(encoding="utf-8"))
    .replace("/*CONTENIDO*/", contenido)
    .replace("/*APP*/", (SRC / "app.js").read_text(encoding="utf-8"))
)

(RAIZ / "dist").mkdir(exist_ok=True)
(RAIZ / "dist" / "mochila.html").write_text(pagina, encoding="utf-8")
(RAIZ / "index.html").write_text(
    '<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
    "</head>\n<body>\n" + pagina + "\n</body>\n</html>\n",
    encoding="utf-8",
)
print("OK:", len(pagina) // 1024, "KB")
