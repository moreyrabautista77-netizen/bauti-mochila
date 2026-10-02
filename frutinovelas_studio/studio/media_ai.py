"""Generación de imágenes y animación (imagen -> video) con distintos proveedores."""
import base64
import time
import urllib.parse
from pathlib import Path

import requests

from .project import character_map, project_dir

TIMEOUT = 300


def build_image_prompt(project: dict, scene: dict, style: str) -> str:
    """Arma el prompt final: plano de la escena + descripciones fijas de los personajes que hablan."""
    chars = character_map(project)
    prompt = scene.get("prompt_imagen") or scene.get("escenario", "")
    extra = []
    for d in scene.get("dialogos", []):
        c = chars.get(d.get("personaje"))
        if c and c.get("descripcion_visual") and c["descripcion_visual"][:40] not in prompt:
            extra.append(f"{c['nombre']}: {c['descripcion_visual']}")
    if extra:
        prompt += ". Characters: " + "; ".join(dict.fromkeys(extra))
    return f"{prompt}. {style}. No text, no letters, no watermark."


def _download(url: str, dest: Path) -> Path:
    r = requests.get(url, timeout=TIMEOUT)
    r.raise_for_status()
    dest.write_bytes(r.content)
    return dest


def _pollinations(prompt: str, seed: int, dest: Path) -> Path:
    url = (
        "https://image.pollinations.ai/prompt/" + urllib.parse.quote(prompt[:1500])
        + f"?width=1080&height=1920&seed={seed}&model=flux&nologo=true&enhance=false"
    )
    last = None
    for intento in range(3):
        try:
            r = requests.get(url, timeout=TIMEOUT)
            if r.ok and r.headers.get("content-type", "").startswith("image"):
                dest.write_bytes(r.content)
                return dest
            last = f"HTTP {r.status_code}"
        except requests.RequestException as e:
            last = str(e)
        time.sleep(3 * (intento + 1))
    raise RuntimeError(f"Pollinations no respondió ({last}). Probá de nuevo o cambiá de proveedor.")


def _openai(prompt: str, key: str, dest: Path) -> Path:
    if not key:
        raise RuntimeError("Falta la API key de OpenAI en Configuración.")
    r = requests.post(
        "https://api.openai.com/v1/images/generations",
        headers={"Authorization": f"Bearer {key}"},
        json={"model": "gpt-image-1", "prompt": prompt[:4000], "size": "1024x1536", "n": 1},
        timeout=TIMEOUT,
    )
    if not r.ok:
        raise RuntimeError(f"OpenAI imágenes: {r.status_code} {r.text[:300]}")
    item = r.json()["data"][0]
    if item.get("b64_json"):
        dest.write_bytes(base64.b64decode(item["b64_json"]))
        return dest
    return _download(item["url"], dest)


def _fal_run(model: str, key: str, payload: dict) -> dict:
    if not key:
        raise RuntimeError("Falta la API key de fal.ai en Configuración.")
    r = requests.post(
        f"https://fal.run/{model}", headers={"Authorization": f"Key {key}"}, json=payload, timeout=900,
    )
    if not r.ok:
        raise RuntimeError(f"fal.ai ({model}): {r.status_code} {r.text[:300]}")
    return r.json()


def _fal_image(prompt: str, seed: int, settings: dict, dest: Path) -> Path:
    data = _fal_run(settings.get("fal_image_model") or "fal-ai/flux/dev", settings.get("fal_api_key"), {
        "prompt": prompt, "image_size": "portrait_16_9", "seed": seed, "num_images": 1,
        "enable_safety_checker": True,
    })
    return _download(data["images"][0]["url"], dest)


def generate_scene_image(project: dict, index: int, settings: dict) -> str:
    scene = project["escenas"][index]
    prompt = build_image_prompt(project, scene, settings.get("visual_style", ""))
    seed = int(scene.get("seed", 1000 + index))
    dest = project_dir(project) / "imagenes" / f"escena_{index + 1:02d}_{seed}.png"
    provider = settings.get("image_provider", "pollinations")
    if provider == "openai":
        _openai(prompt, settings.get("openai_api_key"), dest)
    elif provider == "fal":
        _fal_image(prompt, seed, settings, dest)
    else:
        _pollinations(prompt, seed, dest)
    scene["imagen"] = str(dest)
    scene["video"] = ""  # la animación vieja ya no corresponde a la imagen nueva
    return str(dest)


def animate_scene(project: dict, index: int, settings: dict) -> str:
    """Convierte la imagen de la escena en un clip animado con IA (fal.ai: Kling, Minimax, etc.)."""
    scene = project["escenas"][index]
    if not scene.get("imagen") or not Path(scene["imagen"]).exists():
        raise RuntimeError(f"La escena {index + 1} no tiene imagen todavía.")
    if settings.get("animation_provider") != "fal":
        raise RuntimeError("Elegí 'fal' como proveedor de animación en Configuración (requiere API key).")
    img = Path(scene["imagen"])
    mime = "image/png" if img.suffix.lower() == ".png" else "image/jpeg"
    data_uri = f"data:{mime};base64," + base64.b64encode(img.read_bytes()).decode()
    lines = " ".join(d["texto"] for d in scene.get("dialogos", []))
    prompt = (
        f"{scene.get('prompt_imagen', '')}. The characters talk expressively and move naturally, "
        f"subtle camera movement, soap opera drama. Dialogue context: {lines}"
    )
    data = _fal_run(settings.get("fal_video_model"), settings.get("fal_api_key"), {
        "prompt": prompt[:2000], "image_url": data_uri, "duration": "5", "aspect_ratio": "9:16",
    })
    url = (data.get("video") or {}).get("url") or data.get("video_url")
    if not url:
        raise RuntimeError(f"Respuesta inesperada de fal.ai: {str(data)[:300]}")
    dest = project_dir(project) / "videos" / f"escena_{index + 1:02d}.mp4"
    _download(url, dest)
    scene["video"] = str(dest)
    return str(dest)
