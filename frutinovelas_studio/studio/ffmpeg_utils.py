"""Helpers de ffmpeg. Usa el ffmpeg que trae imageio-ffmpeg (no hace falta instalarlo aparte)."""
import re
import shutil
import subprocess
from pathlib import Path


def ffmpeg_exe() -> str:
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        exe = shutil.which("ffmpeg")
        if not exe:
            raise RuntimeError("No se encontró ffmpeg. Ejecutá: pip install imageio-ffmpeg")
        return exe


def run(args: list, cwd=None) -> str:
    cmd = [ffmpeg_exe(), "-hide_banner", "-y", *map(str, args)]
    flags = getattr(subprocess, "CREATE_NO_WINDOW", 0)
    p = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, encoding="utf-8",
                       errors="replace", creationflags=flags)
    if p.returncode != 0:
        raise RuntimeError("ffmpeg falló:\n" + p.stderr[-2000:])
    return p.stderr


def duration(path) -> float:
    flags = getattr(subprocess, "CREATE_NO_WINDOW", 0)
    p = subprocess.run([ffmpeg_exe(), "-hide_banner", "-i", str(path)], capture_output=True, text=True,
                       encoding="utf-8", errors="replace", creationflags=flags)
    m = re.search(r"Duration: (\d+):(\d+):(\d+\.\d+)", p.stderr)
    if not m:
        raise RuntimeError(f"No se pudo leer la duración de {path}")
    h, mi, s = m.groups()
    return int(h) * 3600 + int(mi) * 60 + float(s)


def to_wav(src, dest) -> Path:
    run(["-i", src, "-ar", "44100", "-ac", "2", "-c:a", "pcm_s16le", dest])
    return Path(dest)


def silence(seconds: float, dest) -> Path:
    run(["-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-t", f"{seconds:.3f}", "-c:a", "pcm_s16le", dest])
    return Path(dest)
