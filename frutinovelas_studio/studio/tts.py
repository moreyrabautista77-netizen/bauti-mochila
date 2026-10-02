"""Voces: Edge TTS (gratis), ElevenLabs (premium) u offline (voces del sistema)."""
import asyncio
import re
from pathlib import Path

import requests

from .ffmpeg_utils import to_wav
from .project import character_map, project_dir

EDGE_VOCES_ES = [
    "es-MX-DaliaNeural", "es-MX-JorgeNeural", "es-AR-ElenaNeural", "es-AR-TomasNeural",
    "es-CO-SalomeNeural", "es-CO-GonzaloNeural", "es-ES-ElviraNeural", "es-ES-AlvaroNeural",
    "es-ES-XimenaNeural", "es-US-PalomaNeural", "es-US-AlonsoNeural", "es-CL-CatalinaNeural",
    "es-CL-LorenzoNeural", "es-PE-CamilaNeural", "es-PE-AlexNeural", "es-VE-PaolaNeural",
    "es-VE-SebastianNeural", "es-UY-ValentinaNeural", "es-UY-MateoNeural",
]

# Ajustes de velocidad/tono por emoción (se suman a los del personaje)
EMOCION_AJUSTE = {
    "normal": (0, 0), "triste": (-12, -4), "llorando": (-15, -6), "enojada": (8, 2), "gritando": (14, 8),
    "sorprendida": (6, 10), "susurro": (-10, -6), "feliz": (8, 6), "malvada": (-8, -8),
}


def _num(s: str, unidad: str) -> int:
    m = re.match(r"\s*([+-]?\d+)", str(s or "0").replace(unidad, ""))
    return int(m.group(1)) if m else 0


def _fmt(n: int, unidad: str) -> str:
    return f"{'+' if n >= 0 else ''}{n}{unidad}"


async def _edge_save(text, voice, rate, pitch, dest):
    import edge_tts
    await edge_tts.Communicate(text, voice, rate=rate, pitch=pitch).save(str(dest))


def _edge(text, char, emocion, dest: Path):
    dr, dp = EMOCION_AJUSTE.get(emocion, (0, 0))
    rate = _fmt(max(-50, min(100, _num(char.get("velocidad"), "%") + dr)), "%")
    pitch = _fmt(max(-50, min(50, _num(char.get("tono"), "Hz") + dp)), "Hz")
    voice = char.get("voz") or "es-MX-DaliaNeural"
    if voice.startswith("eleven:"):
        voice = "es-MX-DaliaNeural"
    asyncio.run(_edge_save(text, voice, rate, pitch, dest))
    if not dest.exists() or dest.stat().st_size == 0:
        raise RuntimeError("Edge TTS no devolvió audio (¿sin internet?).")


def _elevenlabs(text, char, emocion, settings, dest: Path):
    key = settings.get("elevenlabs_api_key")
    if not key:
        raise RuntimeError("Falta la API key de ElevenLabs en Configuración.")
    voice_id = (char.get("voz") or "").removeprefix("eleven:")
    if not voice_id or "Neural" in voice_id:
        raise RuntimeError(
            f"El personaje {char['nombre']} necesita un voice_id de ElevenLabs en el campo 'voz' (ej: eleven:21m00Tcm4TlvDq8ikWAM)."
        )
    estilo = {"gritando": 0.9, "enojada": 0.8, "llorando": 0.8, "malvada": 0.7}.get(emocion, 0.4)
    r = requests.post(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
        headers={"xi-api-key": key, "accept": "audio/mpeg"},
        json={"text": text, "model_id": settings.get("elevenlabs_model", "eleven_multilingual_v2"),
              "voice_settings": {"stability": 0.35, "similarity_boost": 0.8, "style": estilo}},
        timeout=180,
    )
    if not r.ok:
        raise RuntimeError(f"ElevenLabs: {r.status_code} {r.text[:200]}")
    dest.write_bytes(r.content)


def _offline(text, char, emocion, dest: Path):
    import pyttsx3  # opcional: pip install pyttsx3
    engine = pyttsx3.init()
    for v in engine.getProperty("voices"):
        if "spanish" in v.name.lower() or "es" in "".join(map(str, v.languages)).lower():
            engine.setProperty("voice", v.id)
            break
    dr, _ = EMOCION_AJUSTE.get(emocion, (0, 0))
    engine.setProperty("rate", int(175 * (1 + (_num(char.get("velocidad"), "%") + dr) / 100)))
    engine.save_to_file(text, str(dest))
    engine.runAndWait()


def synthesize(text: str, char: dict, emocion: str, settings: dict, dest_wav: Path) -> Path:
    provider = settings.get("tts_provider", "edge")
    raw = dest_wav.with_suffix(".mp3" if provider != "offline" else ".aiff")
    if provider == "elevenlabs":
        _elevenlabs(text, char, emocion, settings, raw)
    elif provider == "offline":
        _offline(text, char, emocion, raw)
    else:
        _edge(text, char, emocion, raw)
    to_wav(raw, dest_wav)
    raw.unlink(missing_ok=True)
    return dest_wav


def generate_all_audio(project: dict, settings: dict, only_missing=False, progress=None) -> list[str]:
    chars = character_map(project)
    out_dir = project_dir(project) / "audio"
    hechos, total = [], sum(len(e["dialogos"]) for e in project["escenas"])
    n = 0
    for si, scene in enumerate(project["escenas"]):
        for di, d in enumerate(scene["dialogos"]):
            n += 1
            if progress:
                progress(n / max(total, 1), desc=f"Voz {n}/{total}")
            if only_missing and d.get("audio") and Path(d["audio"]).exists():
                continue
            if not d.get("texto", "").strip():
                continue
            char = chars.get(d.get("personaje")) or chars["narrador"]
            dest = out_dir / f"e{si + 1:02d}_d{di + 1:02d}.wav"
            synthesize(d["texto"], char, d.get("emocion", "normal"), settings, dest)
            d["audio"] = str(dest)
            hechos.append(str(dest))
    return hechos
