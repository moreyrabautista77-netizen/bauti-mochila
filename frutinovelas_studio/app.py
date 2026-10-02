"""FrutiNovelas Studio - interfaz principal (se abre en el navegador, todo corre en tu PC)."""
import copy
import json
import shutil
from pathlib import Path

import gradio as gr

from studio import media_ai, render, tts
from studio import project as P
from studio.config import load_settings, save_settings
from studio.script_gen import generate_script

PJ_COLS = ["id", "nombre", "fruta", "descripcion_visual", "voz", "velocidad", "tono", "color"]
ESC_COLS = ["#", "escenario", "prompt_imagen", "movimiento", "seed"]
DLG_COLS = ["escena", "personaje", "emocion", "texto"]


# ------------------------------------------------------------------ helpers de vista
def _tables(pr):
    if not pr:
        return [[""] * len(PJ_COLS)], [[""] * len(ESC_COLS)], [[""] * len(DLG_COLS)]
    pj = [[p.get(c, "") for c in PJ_COLS] for p in pr["personajes"]]
    esc = [[i + 1, e["escenario"], e["prompt_imagen"], e["movimiento"], e["seed"]] for i, e in enumerate(pr["escenas"])]
    dlg = [[i + 1, d["personaje"], d["emocion"], d["texto"]] for i, e in enumerate(pr["escenas"]) for d in e["dialogos"]]
    return pj, esc, dlg or [[1, "narrador", "normal", ""]]


def _gallery(pr):
    if not pr:
        return []
    out = []
    for i, e in enumerate(pr["escenas"]):
        if e.get("imagen") and Path(e["imagen"]).exists():
            tag = " 🎬" if e.get("video") and Path(e["video"]).exists() else ""
            out.append((e["imagen"], f"Escena {i + 1}{tag}"))
    return out


def _resumen(pr):
    if not pr:
        return "Todavía no hay proyecto. Escribí tu idea y tocá **Generar guion**."
    nombres = ", ".join(f"{p['nombre']} ({p.get('fruta', '')})" for p in pr["personajes"] if p["id"] != "narrador")
    lines = [f"## {pr['titulo']} — Parte {pr['parte']}", f"**Gancho:** {pr.get('gancho', '')}",
             f"**Personajes:** {nombres}", ""]
    for i, e in enumerate(pr["escenas"]):
        img = "🖼️" if e.get("imagen") and Path(e["imagen"]).exists() else "⬜"
        lines.append(f"**{i + 1}.** {img} _{e['escenario']}_")
        for d in e["dialogos"]:
            voz = "🔊" if d.get("audio") and Path(d["audio"]).exists() else ""
            lines.append(f"  - **{d['personaje']}** ({d['emocion']}) {voz}: {d['texto']}")
    return "\n".join(lines)


def _caption(pr):
    if not pr:
        return ""
    t = pr.get("tiktok", {})
    return f"{t.get('descripcion', '')}\n\n{' '.join(t.get('hashtags', []))}".strip()


def _refresh(pr):
    pj, esc, dlg = _tables(pr)
    ids = [p["id"] for p in pr["personajes"]] if pr else []
    n = len(pr["escenas"]) if pr else 1
    return (pr, _resumen(pr), pj, esc, dlg, json.dumps(pr or {}, indent=2, ensure_ascii=False),
            _gallery(pr), gr.update(choices=ids, value=ids[0] if ids else None),
            gr.update(maximum=max(n, 1)), _caption(pr), gr.update(choices=P.list_projects()))


def _need(pr):
    if not pr:
        raise gr.Error("Primero generá o cargá un proyecto.")


def _err(e):
    return gr.Error(str(e)[:900])


# ------------------------------------------------------------------ acciones: guion
def accion_generar(historia, personajes, escenario, tono, acento, duracion, escenas, parte, progress=gr.Progress()):
    progress(0.1, desc="Escribiendo el guion con IA...")
    try:
        pr = generate_script(load_settings(), historia, personajes, escenario, tono, acento,
                             int(duracion), int(escenas), int(parte))
    except Exception as e:
        raise _err(e)
    P.save(pr)
    return _refresh(pr)


def accion_siguiente_parte(pr, historia, tono, acento, duracion, escenas, progress=gr.Progress()):
    _need(pr)
    progress(0.1, desc=f"Escribiendo la parte {pr['parte'] + 1}...")
    try:
        nuevo = generate_script(load_settings(), historia or "continuá la historia con un giro más fuerte", "", "",
                                tono, acento, int(duracion), int(escenas), int(pr["parte"]) + 1, previo_project=pr)
    except Exception as e:
        raise _err(e)
    P.save(nuevo)
    return _refresh(nuevo)


def accion_cargar(pid):
    if not pid:
        raise gr.Error("Elegí un proyecto de la lista.")
    return _refresh(P.load(pid))


def accion_guardar_tablas(pr, pj, esc, dlg):
    _need(pr)
    pr = copy.deepcopy(pr)
    prev_audio = {(i, d["personaje"], d["emocion"], d["texto"]): d.get("audio", "")
                  for i, e in enumerate(pr["escenas"]) for d in e["dialogos"]}
    pr["personajes"] = []
    for row in pj:
        if not row or not str(row[0]).strip():
            continue
        pr["personajes"].append({c: (str(v) if v is not None else "") for c, v in zip(PJ_COLS, row)})
    old = pr["escenas"]
    pr["escenas"] = []
    for row in esc:
        if not row or not str(row[0]).strip():
            continue
        idx = int(float(row[0])) - 1
        base = copy.deepcopy(old[idx]) if 0 <= idx < len(old) else {}
        prompt_cambio = base.get("prompt_imagen") != row[2]
        base.update({"escenario": row[1] or "", "prompt_imagen": row[2] or "",
                     "movimiento": row[3] if row[3] in P.MOVIMIENTOS else "zoom_in",
                     "seed": int(float(row[4] or 1000 + idx)), "dialogos": []})
        if prompt_cambio:
            base["video"] = ""
        pr["escenas"].append(base)
    for row in dlg:
        if not row or not str(row[3] or "").strip():
            continue
        si = max(1, int(float(row[0] or 1))) - 1
        while si >= len(pr["escenas"]):
            pr["escenas"].append({"escenario": "", "prompt_imagen": "", "dialogos": []})
        d = {"personaje": row[1] or "narrador", "emocion": row[2] or "normal", "texto": str(row[3])}
        d["audio"] = prev_audio.get((si, d["personaje"], d["emocion"], d["texto"]), "")
        pr["escenas"][si]["dialogos"].append(d)
    P.save(P.normalize(pr))
    gr.Info("Cambios guardados. Las voces de líneas modificadas se regeneran al renderizar.")
    return _refresh(pr)


def accion_guardar_json(pr, texto):
    try:
        nuevo = P.normalize(json.loads(texto))
    except Exception as e:
        raise gr.Error(f"JSON inválido: {e}")
    if pr:
        nuevo["id"] = pr["id"]
    P.save(nuevo)
    gr.Info("JSON guardado.")
    return _refresh(nuevo)


# ------------------------------------------------------------------ acciones: imágenes
def accion_imagenes(pr, solo_faltantes, progress=gr.Progress()):
    _need(pr)
    s = load_settings()
    errores = []
    for i, e in enumerate(pr["escenas"]):
        if solo_faltantes and e.get("imagen") and Path(e["imagen"]).exists():
            continue
        progress((i + 1) / len(pr["escenas"]), desc=f"Imagen {i + 1}/{len(pr['escenas'])}")
        try:
            media_ai.generate_scene_image(pr, i, s)
            P.save(pr)
        except Exception as ex:
            errores.append(f"Escena {i + 1}: {ex}")
    if errores:
        gr.Warning("Algunas imágenes fallaron:\n" + "\n".join(errores)[:800])
    return _refresh(pr)


def accion_ver_escena(pr, n):
    if not pr:
        return "", "zoom_in", None, None
    i = int(n) - 1
    if not 0 <= i < len(pr["escenas"]):
        return "", "zoom_in", None, None
    e = pr["escenas"][i]
    img = e["imagen"] if e.get("imagen") and Path(e["imagen"]).exists() else None
    vid = e["video"] if e.get("video") and Path(e["video"]).exists() else None
    return e["prompt_imagen"], e["movimiento"], img, vid


def accion_click_galeria(pr, evt: gr.SelectData):
    con_imagen = [i for i, e in enumerate(pr["escenas"]) if e.get("imagen") and Path(e["imagen"]).exists()]
    return con_imagen[evt.index] + 1 if evt.index < len(con_imagen) else 1


def accion_regenerar(pr, n, prompt, mov, nueva_semilla, progress=gr.Progress()):
    _need(pr)
    i = int(n) - 1
    e = pr["escenas"][i]
    e["prompt_imagen"], e["movimiento"] = prompt, mov
    if nueva_semilla:
        e["seed"] = int(e.get("seed", 1000)) + 7919
    progress(0.3, desc="Generando imagen...")
    try:
        media_ai.generate_scene_image(pr, i, load_settings())
    except Exception as ex:
        raise _err(ex)
    P.save(pr)
    return (*_refresh(pr), *accion_ver_escena(pr, n))


def accion_subir_imagen(pr, n, archivo):
    _need(pr)
    if not archivo:
        raise gr.Error("Subí una imagen.")
    i = int(n) - 1
    dest = P.project_dir(pr) / "imagenes" / f"escena_{i + 1:02d}_propia{Path(archivo).suffix}"
    shutil.copy(archivo, dest)
    pr["escenas"][i]["imagen"], pr["escenas"][i]["video"] = str(dest), ""
    P.save(pr)
    return (*_refresh(pr), *accion_ver_escena(pr, n))


def accion_subir_video(pr, n, archivo):
    _need(pr)
    if not archivo:
        raise gr.Error("Subí un video.")
    i = int(n) - 1
    dest = P.project_dir(pr) / "videos" / f"escena_{i + 1:02d}_propio{Path(archivo).suffix}"
    shutil.copy(archivo, dest)
    pr["escenas"][i]["video"] = str(dest)
    P.save(pr)
    return (*_refresh(pr), *accion_ver_escena(pr, n))


def accion_animar(pr, n, todas, progress=gr.Progress()):
    _need(pr)
    s = load_settings()
    indices = range(len(pr["escenas"])) if todas else [int(n) - 1]
    for k, i in enumerate(indices):
        progress((k + 1) / len(indices), desc=f"Animando escena {i + 1} con IA (puede tardar 1-5 min)...")
        try:
            media_ai.animate_scene(pr, i, s)
            P.save(pr)
        except Exception as ex:
            raise _err(ex)
    return (*_refresh(pr), *accion_ver_escena(pr, n))


def accion_quitar_animacion(pr, n):
    _need(pr)
    pr["escenas"][int(n) - 1]["video"] = ""
    P.save(pr)
    return (*_refresh(pr), *accion_ver_escena(pr, n))


# ------------------------------------------------------------------ acciones: voces
def accion_ver_voz(pr, pid):
    c = P.character_map(pr or {"personajes": []}).get(pid) if pr else None
    if not c:
        return gr.update(), 0, 0, "#FFFFFF"
    return c["voz"], tts._num(c["velocidad"], "%"), tts._num(c["tono"], "Hz"), c.get("color", "#FFFFFF")


def accion_probar_voz(pr, pid, voz, vel, tono, emocion, texto):
    _need(pr)
    c = dict(P.character_map(pr).get(pid) or {"nombre": pid})
    c.update({"voz": voz, "velocidad": tts._fmt(int(vel), "%"), "tono": tts._fmt(int(tono), "Hz")})
    dest = P.project_dir(pr) / "audio" / "_prueba.wav"
    try:
        tts.synthesize(texto or "¡No puedo creer lo que me hiciste!", c, emocion, load_settings(), dest)
    except Exception as ex:
        raise _err(ex)
    return str(dest)


def accion_guardar_voz(pr, pid, voz, vel, tono, color):
    _need(pr)
    for p in pr["personajes"]:
        if p["id"] == pid:
            cambio = (p["voz"], p["velocidad"], p["tono"]) != (voz, tts._fmt(int(vel), "%"), tts._fmt(int(tono), "Hz"))
            p.update({"voz": voz, "velocidad": tts._fmt(int(vel), "%"), "tono": tts._fmt(int(tono), "Hz"), "color": color})
            if cambio:  # hay que regenerar sus audios
                for e in pr["escenas"]:
                    for d in e["dialogos"]:
                        if d["personaje"] == pid:
                            d["audio"] = ""
    P.save(pr)
    gr.Info(f"Voz de {pid} guardada.")
    return _refresh(pr)


def accion_voces(pr, solo_faltantes, progress=gr.Progress()):
    _need(pr)
    try:
        tts.generate_all_audio(pr, load_settings(), only_missing=solo_faltantes, progress=progress)
    except Exception as ex:
        P.save(pr)
        raise _err(ex)
    P.save(pr)
    return _refresh(pr)


# ------------------------------------------------------------------ acciones: render
def _opts(subs, nombre, mayus, fuente, tam, pos, palabras, gancho, final, marca, musica, musica_archivo, vol, pausa):
    m = musica_archivo if musica == "archivo propio" and musica_archivo else ("tension" if musica == "suspenso (incluida)" else "ninguna")
    return {"subtitulos": subs, "mostrar_nombre": nombre, "mayusculas": mayus, "fuente": fuente, "tam_letra": tam,
            "posicion_sub": pos, "palabras_por_bloque": palabras, "gancho": gancho, "final": final,
            "marca_agua": marca, "musica": m, "volumen_musica": vol, "pausa_entre_lineas": pausa}


def accion_render(pr, gancho_txt, final_txt, caption, *opt_values, progress=gr.Progress()):
    _need(pr)
    pr["gancho"], pr["final"] = gancho_txt, final_txt
    s = load_settings()
    try:
        progress(0.01, desc="Generando voces faltantes...")
        tts.generate_all_audio(pr, s, only_missing=True)
    except Exception as ex:
        gr.Warning(f"No se pudieron generar las voces ({ex}). Se renderiza con silencio en esas líneas.")
    P.save(pr)
    try:
        out = render.render(pr, _opts(*opt_values), progress=progress)
    except Exception as ex:
        raise _err(ex)
    (out.parent / "caption_tiktok.txt").write_text(caption or "", encoding="utf-8")
    return str(out), str(out), _refresh(pr)[1]


def accion_todo(historia, personajes, escenario, tono, acento, duracion, escenas, parte, progress=gr.Progress()):
    """Un clic: guion -> imágenes -> voces -> video."""
    s = load_settings()
    progress(0.02, desc="1/4 Escribiendo guion...")
    try:
        pr = generate_script(s, historia, personajes, escenario, tono, acento, int(duracion), int(escenas), int(parte))
    except Exception as e:
        raise _err(e)
    P.save(pr)
    fallas = 0
    for i in range(len(pr["escenas"])):
        progress(0.05 + 0.5 * i / len(pr["escenas"]), desc=f"2/4 Imagen {i + 1}/{len(pr['escenas'])}")
        try:
            media_ai.generate_scene_image(pr, i, s)
        except Exception:
            fallas += 1
        P.save(pr)
    if s.get("animation_provider") == "fal":
        for i in range(len(pr["escenas"])):
            progress(0.55 + 0.1 * i / len(pr["escenas"]), desc=f"Animando escena {i + 1} con IA...")
            try:
                media_ai.animate_scene(pr, i, s)
            except Exception:
                pass
            P.save(pr)
    progress(0.66, desc="3/4 Voces...")
    try:
        tts.generate_all_audio(pr, s)
    except Exception as ex:
        gr.Warning(f"Voces: {ex}")
    P.save(pr)
    progress(0.75, desc="4/4 Render...")
    try:
        out = render.render(pr, {"musica": "tension"})
    except Exception as ex:
        raise _err(ex)
    if fallas:
        gr.Warning(f"{fallas} imágenes fallaron; se usaron placas provisorias. Regeneralas en la pestaña Imágenes.")
    return (*_refresh(pr), str(out))


# ------------------------------------------------------------------ configuración
def accion_guardar_config(*vals):
    keys = ["script_provider", "anthropic_api_key", "claude_model", "image_provider", "openai_api_key",
            "fal_api_key", "fal_image_model", "animation_provider", "fal_video_model", "tts_provider",
            "elevenlabs_api_key", "visual_style"]
    save_settings(dict(zip(keys, vals)))
    gr.Info("Configuración guardada.")


# ------------------------------------------------------------------ UI
def build_ui():
    s = load_settings()
    with gr.Blocks(title="FrutiNovelas Studio") as demo:
        state = gr.State(None)
        gr.Markdown("# 🍓 FrutiNovelas Studio\nCreá telenovelas de frutas con IA para TikTok: guion, imágenes, voces, subtítulos y video vertical listo para subir.")
        with gr.Row():
            proyectos = gr.Dropdown(P.list_projects(), label="Mis proyectos", scale=4)
            btn_cargar = gr.Button("📂 Abrir", scale=1)

        with gr.Tabs():
            # ---------------- 1. Historia
            with gr.Tab("1. Historia"):
                with gr.Row():
                    with gr.Column(scale=3):
                        historia = gr.Textbox(label="Idea / historia", lines=4, placeholder=(
                            "Ej: Fresita descubre que su esposo Don Mango la engaña con Banana Rosa, "
                            "su mejor amiga, y que el bebé que espera Banana no es de Mango..."))
                        personajes = gr.Textbox(label="Personajes (opcional)", lines=2, placeholder=(
                            "Ej: Fresita (fresa, buena y humilde), Don Mango (mango millonario), Banana Rosa (banana villana)"))
                        escenario = gr.Textbox(label="Escenario (opcional)", placeholder="Ej: una mansión en la frutería, un hospital, una boda")
                    with gr.Column(scale=2):
                        tono = gr.Dropdown(["drama", "drama con humor", "venganza", "romance", "terror", "comedia"], value="drama", label="Tono", allow_custom_value=True)
                        acento = gr.Dropdown(["mexicano", "argentino", "colombiano", "latino neutro", "español de España"], value="mexicano", label="Acento de las voces")
                        duracion = gr.Slider(30, 180, value=75, step=5, label="Duración objetivo (seg) — más de 60s para monetizar")
                        n_escenas = gr.Slider(4, 25, value=12, step=1, label="Cantidad de escenas")
                        parte = gr.Number(value=1, precision=0, label="Parte N°")
                with gr.Row():
                    btn_guion = gr.Button("✍️ Generar guion (para editar antes)", variant="primary")
                    btn_todo = gr.Button("⚡ Generar VIDEO COMPLETO en 1 clic", variant="stop")
                    btn_sig = gr.Button("➡️ Escribir siguiente parte")
                video_rapido = gr.Video(label="Video (modo 1 clic)", height=520)
                resumen = gr.Markdown(_resumen(None))

            # ---------------- 2. Editar guion
            with gr.Tab("2. Editar guion"):
                gr.Markdown("Editá cualquier celda y tocá **Guardar cambios**. Podés agregar filas para nuevas escenas, diálogos o personajes. "
                            f"Movimientos: `{', '.join(P.MOVIMIENTOS)}` · Emociones: `{', '.join(P.EMOCIONES)}`")
                tabla_pj = gr.Dataframe(headers=PJ_COLS, label="Personajes", type="array", interactive=True, wrap=True)
                tabla_esc = gr.Dataframe(headers=ESC_COLS, label="Escenas", type="array", interactive=True, wrap=True)
                tabla_dlg = gr.Dataframe(headers=DLG_COLS, label="Diálogos (escena = número de escena)", type="array", interactive=True, wrap=True)
                btn_tablas = gr.Button("💾 Guardar cambios", variant="primary")
                with gr.Accordion("Avanzado: editar JSON completo", open=False):
                    json_box = gr.Code(language="json", label="proyecto.json")
                    btn_json = gr.Button("💾 Guardar JSON")

            # ---------------- 3. Imágenes y animación
            with gr.Tab("3. Imágenes"):
                with gr.Row():
                    btn_imgs = gr.Button("🎨 Generar imágenes de todas las escenas", variant="primary")
                    solo_falt_img = gr.Checkbox(value=True, label="Solo las que faltan")
                galeria = gr.Gallery(label="Escenas", columns=6, height=360, object_fit="cover")
                with gr.Row():
                    with gr.Column(scale=2):
                        n_esc = gr.Slider(1, 12, value=1, step=1, label="Escena a editar")
                        prompt_esc = gr.Textbox(label="Prompt de la imagen (inglés da mejores resultados)", lines=4)
                        mov_esc = gr.Dropdown(P.MOVIMIENTOS, value="zoom_in", label="Movimiento de cámara (si no está animada con IA)")
                        with gr.Row():
                            btn_regen = gr.Button("🔁 Regenerar (otra variante)")
                            btn_regen_mismo = gr.Button("🖌️ Generar con este prompt")
                        subir_img = gr.Image(type="filepath", label="...o subí tu propia imagen", height=200)
                        btn_subir_img = gr.Button("⬆️ Usar esta imagen")
                    with gr.Column(scale=2):
                        img_esc = gr.Image(label="Imagen actual", height=420, interactive=False)
                        vid_esc = gr.Video(label="Animación IA de la escena", height=300)
                        with gr.Row():
                            btn_animar = gr.Button("🎬 Animar escena con IA")
                            btn_animar_todas = gr.Button("🎬 Animar TODAS")
                            btn_quitar_anim = gr.Button("✖️ Quitar animación")
                        subir_vid = gr.Video(label="...o subí tu propio clip", height=160)
                        btn_subir_vid = gr.Button("⬆️ Usar este clip")

            # ---------------- 4. Voces
            with gr.Tab("4. Voces"):
                with gr.Row():
                    with gr.Column():
                        pj_sel = gr.Dropdown([], label="Personaje")
                        voz_sel = gr.Dropdown(tts.EDGE_VOCES_ES, label="Voz (Edge) o eleven:VOICE_ID para ElevenLabs", allow_custom_value=True)
                        vel = gr.Slider(-50, 100, value=0, step=1, label="Velocidad %")
                        tono_v = gr.Slider(-50, 50, value=0, step=1, label="Tono (Hz) — subilo para voces de fruta chiquita")
                        color = gr.ColorPicker(label="Color del nombre en subtítulos")
                        emo_prueba = gr.Dropdown(P.EMOCIONES, value="normal", label="Emoción de prueba")
                        txt_prueba = gr.Textbox(value="¡No puedo creer que me hayas engañado con ella!", label="Texto de prueba")
                        with gr.Row():
                            btn_probar = gr.Button("▶️ Probar voz")
                            btn_guardar_voz = gr.Button("💾 Guardar voz del personaje", variant="primary")
                        audio_prueba = gr.Audio(label="Prueba", type="filepath")
                    with gr.Column():
                        solo_falt_voz = gr.Checkbox(value=False, label="Solo las que faltan")
                        btn_voces = gr.Button("🔊 Generar todas las voces", variant="primary")
                        gr.Markdown("Las voces se generan solas al renderizar si faltan. Editá textos/emociones en la pestaña 2.")

            # ---------------- 5. Render
            with gr.Tab("5. Video final"):
                with gr.Row():
                    with gr.Column():
                        gancho_txt = gr.Textbox(label="Texto gancho (primeros 3 seg)")
                        final_txt = gr.Textbox(label="Texto final", value="SIGUEME PARA LA PARTE 2")
                        with gr.Accordion("Subtítulos", open=True):
                            o_subs = gr.Checkbox(value=True, label="Subtítulos estilo TikTok")
                            o_nombre = gr.Checkbox(value=True, label="Mostrar nombre de quien habla")
                            o_mayus = gr.Checkbox(value=True, label="MAYÚSCULAS")
                            o_fuente = gr.Textbox(value="Arial", label="Fuente (instalada en la PC o .ttf en la carpeta 'fuentes')")
                            o_tam = gr.Slider(40, 130, value=82, step=1, label="Tamaño de letra")
                            o_pos = gr.Slider(150, 1400, value=560, step=10, label="Altura de subtítulos (desde abajo)")
                            o_palabras = gr.Slider(1, 8, value=4, step=1, label="Palabras por bloque")
                        o_gancho = gr.Checkbox(value=True, label="Mostrar 'PARTE N' + gancho al inicio")
                        o_final = gr.Checkbox(value=True, label="Mostrar texto final")
                        o_marca = gr.Textbox(label="Marca de agua (tu @usuario)", placeholder="@frutinovelas")
                        o_musica = gr.Radio(["suspenso (incluida)", "ninguna", "archivo propio"], value="suspenso (incluida)", label="Música de fondo")
                        o_musica_arch = gr.File(label="Tu música (mp3/wav)", file_types=["audio"], type="filepath")
                        o_vol = gr.Slider(0, 0.6, value=0.18, step=0.01, label="Volumen música (baja sola cuando hablan)")
                        o_pausa = gr.Slider(0, 1.5, value=0.25, step=0.05, label="Pausa entre diálogos (seg)")
                    with gr.Column():
                        btn_render = gr.Button("🎞️ RENDERIZAR VIDEO", variant="primary", size="lg")
                        video_final = gr.Video(label="Resultado (1080x1920)", height=640)
                        archivo_final = gr.File(label="Descargar MP4")
                        caption = gr.Textbox(label="Descripción + hashtags para TikTok (copiar y pegar)", lines=4)

            # ---------------- Configuración
            with gr.Tab("⚙️ Configuración"):
                gr.Markdown("Las claves se guardan solo en tu PC (`settings.json`). Sin claves funciona con: guion offline de ejemplo, imágenes gratis (Pollinations) y voces gratis (Edge).")
                c_script = gr.Radio(["claude", "offline"], value=s["script_provider"], label="Guion")
                c_anth = gr.Textbox(value=s["anthropic_api_key"], type="password", label="Anthropic API key (console.anthropic.com)")
                c_model = gr.Dropdown(["claude-opus-5-5", "claude-sonnet-5-5", "claude-haiku-4-5"], value=s["claude_model"], label="Modelo Claude", allow_custom_value=True)
                c_img = gr.Radio(["pollinations", "openai", "fal"], value=s["image_provider"], label="Imágenes (pollinations = gratis)")
                c_oai = gr.Textbox(value=s["openai_api_key"], type="password", label="OpenAI API key (imágenes gpt-image-1)")
                c_fal = gr.Textbox(value=s["fal_api_key"], type="password", label="fal.ai API key (imágenes Flux y animación Kling/Minimax/etc.)")
                c_fal_img = gr.Textbox(value=s["fal_image_model"], label="Modelo de imagen fal.ai")
                c_anim = gr.Radio(["ninguno", "fal"], value=s["animation_provider"], label="Animación IA (ninguno = zoom/paneo automático, gratis)")
                c_fal_vid = gr.Textbox(value=s["fal_video_model"], label="Modelo imagen→video fal.ai")
                c_tts = gr.Radio(["edge", "elevenlabs", "offline"], value=s["tts_provider"], label="Voces (edge = gratis)")
                c_eleven = gr.Textbox(value=s["elevenlabs_api_key"], type="password", label="ElevenLabs API key")
                c_style = gr.Textbox(value=s["visual_style"], lines=3, label="Estilo visual (se agrega a todas las imágenes)")
                btn_cfg = gr.Button("💾 Guardar configuración", variant="primary")

        # ---------------- wiring
        refresh_out = [state, resumen, tabla_pj, tabla_esc, tabla_dlg, json_box, galeria, pj_sel, n_esc, caption, proyectos]
        escena_out = [prompt_esc, mov_esc, img_esc, vid_esc]

        def fill_render_fields(pr):
            return (pr or {}).get("gancho", ""), (pr or {}).get("final", "SIGUEME PARA LA PARTE 2")

        btn_guion.click(accion_generar, [historia, personajes, escenario, tono, acento, duracion, n_escenas, parte], refresh_out)
        btn_sig.click(accion_siguiente_parte, [state, historia, tono, acento, duracion, n_escenas], refresh_out)
        btn_todo.click(accion_todo, [historia, personajes, escenario, tono, acento, duracion, n_escenas, parte], refresh_out + [video_rapido])
        btn_cargar.click(accion_cargar, [proyectos], refresh_out)
        state.change(fill_render_fields, [state], [gancho_txt, final_txt]).then(accion_ver_escena, [state, n_esc], escena_out)
        btn_tablas.click(accion_guardar_tablas, [state, tabla_pj, tabla_esc, tabla_dlg], refresh_out)
        btn_json.click(accion_guardar_json, [state, json_box], refresh_out)

        btn_imgs.click(accion_imagenes, [state, solo_falt_img], refresh_out)
        n_esc.change(accion_ver_escena, [state, n_esc], escena_out)
        galeria.select(accion_click_galeria, [state], n_esc)
        btn_regen.click(lambda pr, n, p, m: accion_regenerar(pr, n, p, m, True), [state, n_esc, prompt_esc, mov_esc], refresh_out + escena_out)
        btn_regen_mismo.click(lambda pr, n, p, m: accion_regenerar(pr, n, p, m, False), [state, n_esc, prompt_esc, mov_esc], refresh_out + escena_out)
        btn_subir_img.click(accion_subir_imagen, [state, n_esc, subir_img], refresh_out + escena_out)
        btn_subir_vid.click(accion_subir_video, [state, n_esc, subir_vid], refresh_out + escena_out)
        btn_animar.click(lambda pr, n: accion_animar(pr, n, False), [state, n_esc], refresh_out + escena_out)
        btn_animar_todas.click(lambda pr, n: accion_animar(pr, n, True), [state, n_esc], refresh_out + escena_out)
        btn_quitar_anim.click(accion_quitar_animacion, [state, n_esc], refresh_out + escena_out)

        pj_sel.change(accion_ver_voz, [state, pj_sel], [voz_sel, vel, tono_v, color])
        btn_probar.click(accion_probar_voz, [state, pj_sel, voz_sel, vel, tono_v, emo_prueba, txt_prueba], audio_prueba)
        btn_guardar_voz.click(accion_guardar_voz, [state, pj_sel, voz_sel, vel, tono_v, color], refresh_out)
        btn_voces.click(accion_voces, [state, solo_falt_voz], refresh_out)

        opt_inputs = [o_subs, o_nombre, o_mayus, o_fuente, o_tam, o_pos, o_palabras, o_gancho, o_final, o_marca,
                      o_musica, o_musica_arch, o_vol, o_pausa]
        btn_render.click(accion_render, [state, gancho_txt, final_txt, caption, *opt_inputs], [video_final, archivo_final, resumen])

        btn_cfg.click(accion_guardar_config, [c_script, c_anth, c_model, c_img, c_oai, c_fal, c_fal_img, c_anim,
                                              c_fal_vid, c_tts, c_eleven, c_style], None)
    return demo


if __name__ == "__main__":
    build_ui().queue().launch(inbrowser=True, theme=gr.themes.Soft(primary_hue="pink"))
