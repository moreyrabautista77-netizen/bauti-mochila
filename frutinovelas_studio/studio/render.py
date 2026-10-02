"""Armado del video final 9:16: escenas animadas + voces + subtítulos estilo TikTok + música."""
import os
import textwrap
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from . import ffmpeg_utils as ff
from .config import BASE_DIR
from .project import character_map, project_dir, slugify

W, H = 1080, 1920
FONTS_DIR = BASE_DIR / "fuentes"

DEFAULT_OPTIONS = {
    "fps": 30,
    "subtitulos": True,
    "mostrar_nombre": True,
    "mayusculas": True,
    "fuente": "Arial",
    "tam_letra": 82,
    "posicion_sub": 560,         # distancia desde abajo (px)
    "palabras_por_bloque": 4,
    "gancho": True,
    "final": True,
    "marca_agua": "",
    "musica": "tension",         # ninguna | tension | ruta a un mp3/wav
    "volumen_musica": 0.18,
    "pausa_entre_lineas": 0.25,
}


# ------------------------------------------------------------------ duraciones
def _estimate(text: str) -> float:
    return max(1.2, len(text) / 14.0)


def build_timeline(project: dict, opts: dict) -> list[dict]:
    """Calcula inicio/fin de cada escena y cada línea de diálogo."""
    t = 0.0
    gap = float(opts["pausa_entre_lineas"])
    timeline = []
    for si, scene in enumerate(project["escenas"]):
        start = t
        t += 0.15
        lines = []
        for d in scene["dialogos"]:
            if not d.get("texto", "").strip():
                continue
            audio = d.get("audio")
            dur = ff.duration(audio) if audio and Path(audio).exists() else _estimate(d["texto"])
            lines.append({"dialogo": d, "start": t, "end": t + dur, "audio": audio if audio and Path(audio).exists() else None})
            t += dur + gap
        t = max(t + 0.2, start + 1.8)
        timeline.append({"index": si, "scene": scene, "start": start, "end": t, "lines": lines})
    return timeline


# ------------------------------------------------------------------ visuales
def placeholder_image(project: dict, index: int) -> Path:
    """Imagen provisoria cuando la escena todavía no tiene imagen generada."""
    scene = project["escenas"][index]
    dest = project_dir(project) / "imagenes" / f"provisoria_{index + 1:02d}.png"
    img = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(img)
    for y in range(H):
        k = y / H
        draw.line([(0, y), (W, y)], fill=(int(120 + 100 * k), int(20 + 40 * k), int(60 + 30 * (1 - k))))
    font = None
    for name in ("arial.ttf", "Arial.ttf", "DejaVuSans.ttf", "/System/Library/Fonts/Supplemental/Arial.ttf"):
        try:
            font = ImageFont.truetype(name, 54)
            break
        except OSError:
            continue
    font = font or ImageFont.load_default(size=54)
    texto = f"ESCENA {index + 1}\n\n" + textwrap.fill(scene.get("escenario") or scene.get("prompt_imagen", ""), 26)
    draw.multiline_text((W // 2, H // 2), texto, font=font, fill="white", anchor="mm", align="center")
    img.save(dest)
    return dest


def _zoompan(mov: str, n: int) -> str:
    c = "iw/2-(iw/zoom/2)", "ih/2-(ih/zoom/2)"
    exprs = {
        "zoom_in": (f"1+0.18*on/{n}", *c),
        "zoom_out": (f"1.18-0.18*on/{n}", *c),
        "paneo_izq": ("1.15", f"(iw-iw/zoom)*(1-on/{n})", c[1]),
        "paneo_der": ("1.15", f"(iw-iw/zoom)*on/{n}", c[1]),
        "temblor": ("1.1", f"{c[0]}+sin(on*1.9)*14", f"{c[1]}+cos(on*2.3)*14"),
        "zoom_dramatico": (f"min(1+0.6*on/{max(n // 3, 1)},1.6)", *c),
        "estatico": ("1.0", *c),
    }
    z, x, y = exprs.get(mov, exprs["zoom_in"])
    return f"zoompan=z='{z}':x='{x}':y='{y}':d=1:s={W}x{H}:fps={{fps}}"


def render_scene_clip(project: dict, item: dict, opts: dict, dest: Path) -> Path:
    scene, dur, fps = item["scene"], item["end"] - item["start"], int(opts["fps"])
    enc = ["-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", "-r", fps, "-an"]
    cover = f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1"
    video = scene.get("video")
    if video and Path(video).exists():
        ff.run(["-stream_loop", "-1", "-i", video, "-t", f"{dur:.3f}", "-vf", f"{cover},fps={fps}", *enc, dest])
        return dest
    img = scene.get("imagen")
    if not img or not Path(img).exists():
        img = placeholder_image(project, item["index"])
    n = max(int(dur * fps), 1)
    big = f"scale={int(W * 1.5)}:{int(H * 1.5)}:force_original_aspect_ratio=increase,crop={int(W * 1.5)}:{int(H * 1.5)}"
    vf = f"{big},{_zoompan(scene.get('movimiento', 'zoom_in'), n).format(fps=fps)},setsar=1"
    ff.run(["-loop", "1", "-framerate", fps, "-i", img, "-t", f"{dur:.3f}", "-vf", vf, *enc, dest])
    return dest


# ------------------------------------------------------------------ subtítulos ASS
def _ass_color(hex_color: str) -> str:
    h = (hex_color or "#FFFFFF").lstrip("#")
    if len(h) != 6:
        h = "FFFFFF"
    return f"&H00{h[4:6]}{h[2:4]}{h[0:2]}".upper()


def _ts(t: float) -> str:
    t = max(t, 0)
    return f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"


def _clean(s: str) -> str:
    return s.replace("{", "(").replace("}", ")").replace("\n", " ").strip()


def _chunks(text: str, max_words: int) -> list[str]:
    words = text.split()
    out, cur = [], []
    for w in words:
        cur.append(w)
        if len(cur) >= max_words or len(" ".join(cur)) > 20 or w[-1:] in ".?!,":
            out.append(" ".join(cur))
            cur = []
    if cur:
        out.append(" ".join(cur))
    return out


def build_ass(project: dict, timeline: list, opts: dict, total: float) -> str:
    chars = character_map(project)
    font, size = opts["fuente"], int(opts["tam_letra"])
    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,{font},{size},&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,7,3,2,60,60,{int(opts['posicion_sub'])},1
Style: Nombre,{font},{int(size * 0.62)},&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,5,2,2,60,60,{int(opts['posicion_sub']) + int(size * 1.15)},1
Style: Gancho,{font},{int(size * 0.9)},&H00FFFFFF,&H00FFFFFF,&H00000000,&HC0000000,-1,0,0,0,100,100,0,0,3,18,0,8,70,70,230,1
Style: Parte,{font},{int(size * 0.7)},&H0000D7FF,&H00FFFFFF,&H00000000,&HC0000000,-1,0,0,0,100,100,0,0,3,14,0,8,70,70,140,1
Style: Final,{font},{int(size * 0.85)},&H00FFFFFF,&H00FFFFFF,&H00000000,&HC00030FF,-1,0,0,0,100,100,0,0,3,20,0,5,70,70,0,1
Style: Marca,{font},38,&H90FFFFFF,&H00FFFFFF,&H90000000,&H00000000,-1,0,0,0,100,100,0,0,1,2,0,3,40,40,60,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ev = []
    up = (lambda s: s.upper()) if opts["mayusculas"] else (lambda s: s)
    if opts["gancho"]:
        ev.append(f"Dialogue: 2,{_ts(0)},{_ts(3.2)},Parte,,0,0,0,,{{\\fad(150,200)}}PARTE {project.get('parte', 1)}")
        gancho = textwrap.fill(up(_clean(project.get("gancho") or project["titulo"])), 22).replace("\n", "\\N")
        ev.append(f"Dialogue: 2,{_ts(0)},{_ts(3.2)},Gancho,,0,0,0,,{{\\fad(150,200)}}{gancho}")
    if opts["final"] and project.get("final"):
        fin = textwrap.fill(up(_clean(project["final"])), 18).replace("\n", "\\N")
        ev.append(f"Dialogue: 3,{_ts(max(total - 2.2, 0))},{_ts(total)},Final,,0,0,0,,{{\\fad(200,0)\\t(0,300,\\fscx110\\fscy110)}}{fin}")
    if opts["marca_agua"]:
        ev.append(f"Dialogue: 1,{_ts(0)},{_ts(total)},Marca,,0,0,0,,{_clean(opts['marca_agua'])}")
    if opts["subtitulos"]:
        for item in timeline:
            for ln in item["lines"]:
                d = ln["dialogo"]
                char = chars.get(d.get("personaje"), {})
                pieces = _chunks(_clean(d["texto"]), int(opts["palabras_por_bloque"]))
                total_chars = sum(len(p) for p in pieces) or 1
                t = ln["start"]
                span = ln["end"] - ln["start"]
                color = _ass_color(char.get("color", "#FFFFFF"))
                for p in pieces:
                    dt = span * len(p) / total_chars
                    pop = "{\\fscx80\\fscy80\\t(0,90,\\fscx100\\fscy100)}"
                    ev.append(f"Dialogue: 0,{_ts(t)},{_ts(t + dt)},Sub,,0,0,0,,{pop}{up(p)}")
                    t += dt
                if opts["mostrar_nombre"] and d.get("personaje") != "narrador" and char:
                    ev.append(
                        f"Dialogue: 0,{_ts(ln['start'])},{_ts(ln['end'])},Nombre,,0,0,0,,"
                        f"{{\\c{color}}}{up(_clean(char.get('nombre', '')))}"
                    )
    return head + "\n".join(ev) + "\n"


# ------------------------------------------------------------------ audio
def build_voice_track(timeline: list, total: float, work: Path) -> Path:
    parts, cursor, k = [], 0.0, 0
    for item in timeline:
        for ln in item["lines"]:
            gap = ln["start"] - cursor
            if gap > 0.01:
                parts.append(ff.silence(gap, work / f"sil_{k}.wav"))
                k += 1
            if ln["audio"]:
                parts.append(Path(ln["audio"]))
                cursor = ln["start"] + ff.duration(ln["audio"])
            else:
                parts.append(ff.silence(ln["end"] - ln["start"], work / f"sil_{k}.wav"))
                k += 1
                cursor = ln["end"]
    if total - cursor > 0.01:
        parts.append(ff.silence(total - cursor, work / f"sil_{k}.wav"))
    lst = work / "voces.txt"
    lst.write_text("".join(f"file '{p.resolve().as_posix()}'\n" for p in parts), encoding="utf-8")
    out = work / "voces.wav"
    ff.run(["-f", "concat", "-safe", "0", "-i", lst, "-c:a", "pcm_s16le", "-ar", "44100", "-ac", "2", out])
    return out


def builtin_music(kind: str, total: float, work: Path) -> Path | None:
    """Música de suspenso sintetizada (libre de derechos) para no depender de archivos externos."""
    if kind != "tension":
        return None
    out = work / "musica_tension.wav"
    expr = (
        "0.22*sin(2*PI*55*t)*(0.6+0.4*sin(2*PI*0.25*t))"
        "+0.12*sin(2*PI*65.4*t)+0.10*sin(2*PI*82.4*t)*(0.5+0.5*sin(2*PI*0.5*t))"
        "+0.05*sin(2*PI*329.6*t)*(0.5+0.5*sin(2*PI*2*t))*gt(mod(t,4),2)"
    )
    ff.run(["-f", "lavfi", "-i", f"aevalsrc='{expr}|{expr}':s=44100:d={total:.2f}",
            "-af", "lowpass=f=1800,volume=1.4", "-c:a", "pcm_s16le", out])
    return out


# ------------------------------------------------------------------ render principal
def render(project: dict, options: dict | None = None, progress=None) -> Path:
    opts = {**DEFAULT_OPTIONS, **(options or {})}
    pdir = project_dir(project)
    work = pdir / "render"
    for f in work.glob("*"):
        if f.is_file() and (f.suffix in (".wav", ".txt", ".ass") or f.name.startswith("seg_")):
            f.unlink(missing_ok=True)

    def step(p, msg):
        if progress:
            progress(p, desc=msg)

    step(0.02, "Calculando tiempos")
    timeline = build_timeline(project, opts)
    if not timeline:
        raise RuntimeError("El proyecto no tiene escenas.")
    total = timeline[-1]["end"]

    segs = []
    for i, item in enumerate(timeline):
        step(0.05 + 0.6 * i / len(timeline), f"Animando escena {i + 1}/{len(timeline)}")
        segs.append(render_scene_clip(project, item, opts, work / f"seg_{i:03d}.mp4"))
    lst = work / "escenas.txt"
    lst.write_text("".join(f"file '{s.resolve().as_posix()}'\n" for s in segs), encoding="utf-8")
    ff.run(["-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", work / "seg_todo.mp4"])

    step(0.7, "Armando voces")
    voces = build_voice_track(timeline, total, work)

    step(0.78, "Subtítulos y música")
    (work / "subs.ass").write_text(build_ass(project, timeline, opts, total), encoding="utf-8")
    musica = opts["musica"]
    music_path = None
    if musica and musica not in ("ninguna", "tension") and Path(musica).exists():
        music_path = Path(musica)
    else:
        music_path = builtin_music(musica, total, work)

    step(0.82, "Render final")
    out = pdir / f"{slugify(project['titulo'])}_parte{project.get('parte', 1)}.mp4"
    inputs = ["-i", "seg_todo.mp4", "-i", "voces.wav"]
    vf = "[0:v]subtitles=subs.ass"
    if FONTS_DIR.exists():
        vf += f":fontsdir='{Path(os.path.relpath(FONTS_DIR, work)).as_posix()}'"
    vf += "[v]"
    if music_path:
        inputs += ["-stream_loop", "-1", "-i", str(music_path.resolve())]
        vol = float(opts["volumen_musica"])
        af = (
            f"[1:a]asplit=2[vo][sc];[2:a]volume={vol},atrim=0:{total:.3f}[mu];"
            "[mu][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[duck];"
            "[vo][duck]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5[a]"
        )
    else:
        af = "[1:a]loudnorm=I=-14:TP=-1.5[a]"
    ff.run([
        *inputs, "-filter_complex", f"{vf};{af}", "-map", "[v]", "-map", "[a]",
        "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k", "-ar", "44100", "-movflags", "+faststart", "-t", f"{total:.3f}",
        out.resolve(),
    ], cwd=work)
    step(1.0, "¡Listo!")
    return out
