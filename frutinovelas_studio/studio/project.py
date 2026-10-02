"""Modelo de proyecto: un JSON editable + carpeta con imágenes, audios y videos."""
import json
import re
import time
import unicodedata
from pathlib import Path

from .config import PROJECTS_DIR

MOVIMIENTOS = ["zoom_in", "zoom_out", "paneo_izq", "paneo_der", "temblor", "zoom_dramatico", "estatico"]
EMOCIONES = ["normal", "triste", "llorando", "enojada", "gritando", "sorprendida", "susurro", "feliz", "malvada"]


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text[:40] or "proyecto"


def project_dir(project: dict) -> Path:
    d = PROJECTS_DIR / project["id"]
    for sub in ("imagenes", "videos", "audio", "render"):
        (d / sub).mkdir(parents=True, exist_ok=True)
    return d


def new_project_id(titulo: str) -> str:
    return f"{time.strftime('%Y%m%d-%H%M%S')}-{slugify(titulo)}"


def normalize(project: dict) -> dict:
    """Completa campos faltantes para que el resto del programa no falle."""
    project.setdefault("id", new_project_id(project.get("titulo", "frutinovela")))
    project.setdefault("titulo", "Frutinovela")
    project.setdefault("parte", 1)
    project.setdefault("gancho", project["titulo"])
    project.setdefault("final", "SIGUEME PARA LA PARTE 2")
    project.setdefault("tiktok", {"descripcion": "", "hashtags": []})
    project.setdefault("personajes", [])
    project.setdefault("escenas", [])
    ids = set()
    for p in project["personajes"]:
        p.setdefault("id", slugify(p.get("nombre", "personaje")))
        p.setdefault("nombre", p["id"].capitalize())
        p.setdefault("fruta", "")
        p.setdefault("descripcion_visual", "")
        p.setdefault("voz", "es-MX-DaliaNeural")
        p.setdefault("velocidad", "+0%")
        p.setdefault("tono", "+0Hz")
        p.setdefault("color", "#FFD23F")
        ids.add(p["id"])
    if "narrador" not in ids:
        project["personajes"].append({
            "id": "narrador", "nombre": "Narrador", "fruta": "", "descripcion_visual": "",
            "voz": "es-MX-JorgeNeural", "velocidad": "+5%", "tono": "+0Hz", "color": "#FFFFFF",
        })
    for i, e in enumerate(project["escenas"]):
        e.setdefault("escenario", "")
        e.setdefault("prompt_imagen", "")
        e.setdefault("movimiento", MOVIMIENTOS[i % 3])
        e.setdefault("dialogos", [])
        e.setdefault("imagen", "")
        e.setdefault("video", "")
        e.setdefault("seed", 1000 + i)
        for d in e["dialogos"]:
            d.setdefault("personaje", "narrador")
            d.setdefault("texto", "")
            d.setdefault("emocion", "normal")
            d.setdefault("audio", "")
    return project


def save(project: dict) -> Path:
    project = normalize(project)
    path = project_dir(project) / "proyecto.json"
    path.write_text(json.dumps(project, indent=2, ensure_ascii=False), encoding="utf-8")
    return path


def load(project_id: str) -> dict:
    path = PROJECTS_DIR / project_id / "proyecto.json"
    return normalize(json.loads(path.read_text(encoding="utf-8")))


def list_projects() -> list[str]:
    if not PROJECTS_DIR.exists():
        return []
    return sorted((p.name for p in PROJECTS_DIR.iterdir() if (p / "proyecto.json").exists()), reverse=True)


def character_map(project: dict) -> dict:
    return {p["id"]: p for p in project["personajes"]}
