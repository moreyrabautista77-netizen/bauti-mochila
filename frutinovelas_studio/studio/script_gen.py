"""Generación del guion (historia, personajes, escenas, diálogos) con Claude o en modo offline."""
import json
import random
import re

import anthropic

from .project import EMOCIONES, MOVIMIENTOS, new_project_id, normalize, slugify

SYSTEM_PROMPT = """Sos guionista experto en "frutinovelas": micro-telenovelas virales de TikTok
protagonizadas por frutas y verduras antropomórficas en 3D estilo Pixar, con drama exagerado
(traiciones, infidelidades, hijos secretos, suegras malvadas, venganzas, pobres vs. ricos).

Reglas del formato viral:
- Los primeros 3 segundos son un GANCHO brutal (una frase de diálogo impactante o pregunta).
- Duración total hablada pensada para {duracion} segundos aprox. (TikTok paga videos de más de 1 minuto).
- {escenas} escenas aprox. Cada escena = una imagen vertical + 1 a 3 líneas de diálogo cortas.
- Diálogos MUY cortos, emocionales, en español {acento}. Un narrador puede aparecer poco.
- Terminar en CLIFFHANGER que obligue a ver la parte siguiente.
- Personajes consistentes: cada uno tiene una descripción visual fija EN INGLÉS (fruta, ropa,
  accesorios, rasgos) que se repite tal cual en cada prompt de imagen donde aparece.
- prompt_imagen EN INGLÉS, describe el plano (close-up, wide shot...), la acción, la emoción en la
  cara, el escenario y pega la descripción visual completa de cada personaje presente.
  No incluyas texto escrito dentro de la imagen.

Respondé SOLO con un objeto JSON válido (sin markdown, sin comentarios) con esta forma:
{{
  "titulo": "título corto y morboso",
  "parte": {parte},
  "gancho": "texto en pantalla para los primeros segundos (máx 8 palabras)",
  "final": "texto en pantalla del final, ej: 'PARTE {siguiente} EN MI PERFIL'",
  "resumen": "resumen de 2 líneas de lo que pasó (sirve para continuar la serie)",
  "tiktok": {{"descripcion": "caption para TikTok con pregunta para comentarios", "hashtags": ["#frutinovela", "..."]}},
  "personajes": [
    {{"id": "id_corto_sin_espacios", "nombre": "Nombre", "fruta": "fresa",
      "genero": "f|m", "descripcion_visual": "english visual description",
      "personalidad": "breve"}}
  ],
  "escenas": [
    {{"escenario": "descripción breve en español", "prompt_imagen": "english prompt",
      "movimiento": "uno de {movimientos}",
      "dialogos": [{{"personaje": "id o narrador", "texto": "línea", "emocion": "una de {emociones}"}}]}}
  ]
}}"""

VOCES_F = ["es-MX-DaliaNeural", "es-AR-ElenaNeural", "es-CO-SalomeNeural", "es-ES-ElviraNeural", "es-US-PalomaNeural"]
VOCES_M = ["es-MX-JorgeNeural", "es-AR-TomasNeural", "es-CO-GonzaloNeural", "es-ES-AlvaroNeural", "es-US-AlonsoNeural"]
COLORES = ["#FF4D6D", "#FFD23F", "#3BCEAC", "#7B6CF6", "#FF8C42", "#4CC9F0", "#B5E48C"]

ACENTO_VOZ = {"mexicano": "es-MX", "argentino": "es-AR", "colombiano": "es-CO", "español de España": "es-ES", "latino neutro": "es-US"}


def _assign_voices(project: dict, acento: str) -> None:
    pref = ACENTO_VOZ.get(acento, "es-MX")
    fem = sorted(VOCES_F, key=lambda v: not v.startswith(pref))
    mas = sorted(VOCES_M, key=lambda v: not v.startswith(pref))
    fi = mi = 0
    for i, p in enumerate(project["personajes"]):
        if p.get("id") == "narrador":
            continue
        if p.get("genero", "f").lower().startswith("m"):
            p["voz"] = mas[mi % len(mas)]
            # Personajes del mismo género con la misma voz: se distinguen con el tono
            p["tono"] = f"{'+' if mi % 2 == 0 else '-'}{(mi // len(mas)) * 8 + (mi % 2) * 6}Hz"
            mi += 1
        else:
            p["voz"] = fem[fi % len(fem)]
            p["tono"] = f"+{(fi // len(fem)) * 8 + (fi % 2) * 6}Hz"
            fi += 1
        p["color"] = COLORES[i % len(COLORES)]
    project["personajes"].append({
        "id": "narrador", "nombre": "Narrador", "voz": mas[0], "velocidad": "+5%", "tono": "-4Hz", "color": "#FFFFFF",
    })


def _extract_json(text: str) -> dict:
    text = re.sub(r"^```(?:json)?|```$", "", text.strip(), flags=re.M)
    start, end = text.find("{"), text.rfind("}")
    if start < 0 or end < 0:
        raise ValueError("La IA no devolvió JSON")
    return json.loads(text[start:end + 1])


def _user_prompt(historia, personajes, escenario, tono, previo):
    partes = [f"Historia / idea: {historia or 'sorprendeme con un drama viral'}"]
    if personajes:
        partes.append(f"Personajes pedidos: {personajes}")
    if escenario:
        partes.append(f"Escenario principal: {escenario}")
    if tono:
        partes.append(f"Tono: {tono}")
    if previo:
        partes.append(
            "Esto es la CONTINUACIÓN de la serie. Mantené EXACTAMENTE los mismos personajes (mismos id y "
            f"descripcion_visual). Proyecto anterior:\n{previo}"
        )
    return "\n".join(partes)


def generate_with_claude(settings, historia, personajes, escenario, tono, acento, duracion, escenas, parte, previo=None):
    key = settings.get("anthropic_api_key") or None
    client = anthropic.Anthropic(api_key=key)
    system = SYSTEM_PROMPT.format(
        duracion=duracion, escenas=escenas, acento=acento, parte=parte, siguiente=parte + 1,
        movimientos=MOVIMIENTOS, emociones=EMOCIONES,
    )
    messages = [{"role": "user", "content": _user_prompt(historia, personajes, escenario, tono, previo)}]
    last_error = None
    for _ in range(2):
        try:
            with client.beta.messages.stream(
                model=settings.get("claude_model") or "claude-opus-5-5",
                max_tokens=32000,
                system=system,
                messages=messages,
                output_config={"effort": "medium"},
                # Si el modelo rechaza el pedido, la API reintenta automáticamente con otro modelo
                betas=["server-side-fallback-2026-07-01"],
                fallbacks="default",
            ) as stream:
                response = stream.get_final_message()
        except anthropic.AuthenticationError as e:
            raise RuntimeError("API key de Anthropic inválida. Revisala en Configuración.") from e
        except anthropic.RateLimitError as e:
            raise RuntimeError("Límite de uso de Anthropic alcanzado, probá en un minuto.") from e
        except anthropic.APIStatusError as e:
            raise RuntimeError(f"Error de la API de Anthropic ({e.status_code}): {e.message}") from e
        except anthropic.APIConnectionError as e:
            raise RuntimeError("No se pudo conectar con Anthropic. Revisá tu internet.") from e
        if response.stop_reason == "refusal":
            raise RuntimeError("La IA rechazó esta historia. Probá con otra idea.")
        text = "".join(b.text for b in response.content if b.type == "text")
        try:
            return _extract_json(text)
        except (ValueError, json.JSONDecodeError) as e:
            last_error = e
            messages = messages + [
                {"role": "assistant", "content": text},
                {"role": "user", "content": "Eso no fue JSON válido. Devolvé SOLO el objeto JSON completo."},
            ]
    raise RuntimeError(f"No se pudo leer el guion generado: {last_error}")


# ---------------------------------------------------------------- modo offline
FRUTAS = [
    ("Fresita", "fresa", "f", "a cute strawberry woman with long eyelashes, red shiny skin with seeds, green leaf hair, pink dress, pearl necklace"),
    ("Don Mango", "mango", "m", "a rich mango man with orange-yellow skin, black mustache, elegant navy suit, gold watch"),
    ("Banana Rosa", "banana", "f", "a tall banana woman with yellow peel, red lipstick, sunglasses on her head, leopard print dress"),
    ("Kiwi", "kiwi", "m", "a young kiwi man with fuzzy brown skin, green inner face, white t-shirt, denim jacket"),
    ("Doña Piña", "piña", "f", "an old pineapple woman with spiky green crown hair, glasses, purple shawl, stern face"),
    ("Uvita", "uva", "f", "a small purple grape girl with big eyes, pigtails made of leaves, yellow school uniform"),
]

TRAMAS = [
    ("¿Te casaste con él por su dinero?", [
        ("{a}", "No es lo que parece, {b}...", "llorando"),
        ("{b}", "¡Te vi con {c} en la verdulería!", "enojada"),
        ("narrador", "Pero nadie sabía el secreto que {c} escondía...", "susurro"),
        ("{c}", "Yo solo quería lo que me corresponde.", "malvada"),
        ("{b}", "¿Qué te corresponde? ¡Sos una cualquiera!", "gritando"),
        ("{c}", "Soy la hija perdida de {d}.", "malvada"),
        ("{d}", "No... eso es imposible.", "sorprendida"),
        ("{a}", "¡Siempre lo supe!", "gritando"),
        ("{d}", "Hay algo que nunca les conté...", "triste"),
        ("narrador", "Y esa noche, todo cambió para siempre.", "susurro"),
    ]),
]


def generate_offline(historia, personajes, escenario, tono, acento, duracion, escenas, parte):
    """Genera un guion de ejemplo sin IA (para probar el programa sin API key)."""
    rnd = random.Random(historia or "x")
    cast = rnd.sample(FRUTAS, 4)
    nombres = [c[0] for c in cast]
    ids = [slugify(c[1]) for c in cast]
    lugar = escenario or "una lujosa mansión de frutas"
    gancho, lineas = TRAMAS[0]
    fmt = {k: v for k, v in zip("abcd", nombres)}
    id_by_tag = {"{" + k + "}": i for k, i in zip("abcd", ids)}
    escenas_out = []
    for i, (who, texto, emo) in enumerate(lineas[: max(4, escenas)]):
        pid = id_by_tag.get(who, "narrador")
        presentes = [c for c, cid in zip(cast, ids) if cid == pid] or cast[:2]
        desc = "; ".join(c[3] for c in presentes)
        shot = ["close-up shot", "medium shot", "wide shot", "dramatic low angle shot"][i % 4]
        escenas_out.append({
            "escenario": lugar,
            "prompt_imagen": f"{shot} of {desc}, {emo} expression, inside {lugar}",
            "movimiento": MOVIMIENTOS[i % 6],
            "dialogos": [{"personaje": pid, "texto": texto.format(**fmt), "emocion": emo}],
        })
    project = {
        "titulo": historia[:50] if historia else "La traición de " + nombres[0],
        "parte": parte,
        "gancho": gancho.format(**fmt),
        "final": f"PARTE {parte + 1} EN MI PERFIL",
        "resumen": "Guion de ejemplo generado sin IA.",
        "tiktok": {"descripcion": "¿Quién tiene la culpa? 👇", "hashtags": ["#frutinovela", "#drama", "#novela", "#parati", "#ia"]},
        "personajes": [
            {"id": cid, "nombre": c[0], "fruta": c[1], "genero": c[2], "descripcion_visual": c[3]}
            for c, cid in zip(cast, ids)
        ],
        "escenas": escenas_out,
    }
    if personajes:
        project["resumen"] += f" Personajes pedidos (editalos a mano): {personajes}"
    return project


def generate_script(settings, historia, personajes="", escenario="", tono="drama", acento="mexicano",
                    duracion=75, escenas=12, parte=1, previo_project=None):
    previo = None
    if previo_project:
        previo = json.dumps({
            "titulo": previo_project.get("titulo"), "parte": previo_project.get("parte"),
            "resumen": previo_project.get("resumen"),
            "personajes": [{k: p.get(k) for k in ("id", "nombre", "fruta", "genero", "descripcion_visual")}
                           for p in previo_project["personajes"] if p["id"] != "narrador"],
            "ultimas_lineas": [d["texto"] for e in previo_project["escenas"][-3:] for d in e["dialogos"]],
        }, ensure_ascii=False)
    if settings.get("script_provider") == "offline":
        data = generate_offline(historia, personajes, escenario, tono, acento, duracion, escenas, parte)
    else:
        data = generate_with_claude(settings, historia, personajes, escenario, tono, acento, duracion, escenas, parte, previo)
    data["personajes"] = [p for p in data.get("personajes", []) if p.get("id") != "narrador"]
    _assign_voices(data, acento)
    if previo_project:  # conservar voces de la parte anterior
        prev = {p["id"]: p for p in previo_project["personajes"]}
        for p in data["personajes"]:
            if p["id"] in prev:
                for k in ("voz", "velocidad", "tono", "color", "descripcion_visual"):
                    p[k] = prev[p["id"]].get(k, p.get(k))
    data["id"] = new_project_id(f"{data.get('titulo', 'frutinovela')}-p{parte}")
    data["parte"] = parte
    return normalize(data)
