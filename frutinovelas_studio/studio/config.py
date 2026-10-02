"""Configuración persistente (API keys, proveedores, rutas)."""
import json
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
PROJECTS_DIR = BASE_DIR / "proyectos"
SETTINGS_FILE = BASE_DIR / "settings.json"

DEFAULTS = {
    # Guion
    "script_provider": "claude",          # claude | offline
    "anthropic_api_key": "",
    "claude_model": "claude-opus-5-5",
    # Imágenes
    "image_provider": "pollinations",     # pollinations | openai | fal
    "openai_api_key": "",
    "fal_api_key": "",
    "fal_image_model": "fal-ai/flux/dev",
    # Animación IA (imagen -> video)
    "animation_provider": "ninguno",      # ninguno | fal
    "fal_video_model": "fal-ai/kling-video/v2.1/standard/image-to-video",
    # Voz
    "tts_provider": "edge",               # edge | elevenlabs | offline
    "elevenlabs_api_key": "",
    "elevenlabs_model": "eleven_multilingual_v2",
    # Estilo visual global (se agrega a cada prompt de imagen)
    "visual_style": (
        "3D Pixar-style animation, anthropomorphic fruit characters with big expressive eyes, "
        "detailed faces, small arms and legs, dramatic cinematic lighting, telenovela soap-opera "
        "mood, highly detailed, vibrant colors, vertical 9:16 composition"
    ),
}


def load_settings() -> dict:
    data = dict(DEFAULTS)
    if SETTINGS_FILE.exists():
        try:
            data.update(json.loads(SETTINGS_FILE.read_text(encoding="utf-8")))
        except (OSError, json.JSONDecodeError):
            pass
    # Las variables de entorno pisan lo guardado si existen
    env_map = {
        "ANTHROPIC_API_KEY": "anthropic_api_key",
        "OPENAI_API_KEY": "openai_api_key",
        "FAL_KEY": "fal_api_key",
        "ELEVENLABS_API_KEY": "elevenlabs_api_key",
    }
    for env, key in env_map.items():
        if os.environ.get(env) and not data.get(key):
            data[key] = os.environ[env]
    return data


def save_settings(data: dict) -> None:
    merged = load_settings()
    merged.update(data)
    SETTINGS_FILE.write_text(json.dumps(merged, indent=2, ensure_ascii=False), encoding="utf-8")
