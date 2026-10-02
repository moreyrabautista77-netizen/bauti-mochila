# 🍓 FrutiNovelas Studio

Programa para tu PC que crea **telenovelas de frutas con IA** para TikTok (estilo @frutinovelas):
escribís la idea → la IA escribe el guion con personajes, escenas y diálogos → genera las imágenes
3D estilo Pixar → les pone voz a cada personaje → arma el video vertical 1080x1920 con subtítulos
grandes, gancho "PARTE 1", música de suspenso y cierre "PARTE 2 EN MI PERFIL".

Todo es editable: historia, personajes, voces, textos, emociones, imágenes, movimientos de cámara,
subtítulos, música y textos en pantalla.

## Instalación (Windows)

1. Instalá **Python 3.10 o más nuevo** desde https://www.python.org/downloads/
   ⚠️ Marcá **"Add Python to PATH"** en el instalador.
2. Descargá esta carpeta (`frutinovelas_studio`) a tu PC.
3. Doble clic en **`INSTALAR_Y_ABRIR_WINDOWS.bat`**.
   La primera vez instala todo (unos minutos). Después abre directo en tu navegador.

Mac / Linux: `./abrir_mac_linux.sh`

No hace falta instalar ffmpeg: viene incluido.

## Cómo se usa

| Pestaña | Qué hacés |
|---|---|
| **1. Historia** | Escribís la idea, personajes y escenario. **⚡ 1 clic** hace el video entero. **✍️ Generar guion** te deja editar antes. **➡️ Siguiente parte** escribe la parte 2, 3... con los mismos personajes y voces. |
| **2. Editar guion** | Tablas editables de personajes, escenas y diálogos (agregar/borrar filas). JSON completo para usuarios avanzados. |
| **3. Imágenes** | Genera todas las imágenes, regenerá una escena con otra variante o con tu prompt, subí tu propia imagen o clip, animá escenas con IA. |
| **4. Voces** | Elegí voz, velocidad, tono y color para cada personaje. Probalas con distintas emociones. |
| **5. Video final** | Subtítulos (fuente, tamaño, altura, palabras por bloque), gancho, texto final, marca de agua, música. Renderiza el MP4 y te da la descripción + hashtags para copiar. |
| **⚙️ Configuración** | API keys y proveedores. |

Los proyectos quedan guardados en `proyectos/` (podés reabrirlos y seguir editando).

## Proveedores y costos

| Parte | Gratis | Mejor calidad (pago) |
|---|---|---|
| Guion | modo `offline` (guion de ejemplo) | **Claude** (Anthropic) — recomendado, centavos por guion |
| Imágenes | **Pollinations** (sin cuenta) | **fal.ai** (Flux) o **OpenAI** (gpt-image-1) |
| Animación | zoom / paneo / temblor automáticos | **fal.ai** imagen→video (Kling, Minimax, etc.) |
| Voces | **Edge TTS** (voces neuronales de Microsoft, muchos acentos) | **ElevenLabs** (en el campo voz poné `eleven:VOICE_ID`) |

Para que quede **igual a los videos virales** (personajes que se mueven y hablan):
Claude para el guion + fal.ai para imágenes (Flux) y animación (Kling). Cada escena animada cuesta
unos centavos de dólar en fal.ai; revisá precios en su web.

API keys:
- Anthropic: https://console.anthropic.com
- fal.ai: https://fal.ai/dashboard/keys
- OpenAI: https://platform.openai.com/api-keys
- ElevenLabs: https://elevenlabs.io

## Tips para monetizar en TikTok

- El **Programa de Recompensas para Creadores** paga videos de **más de 1 minuto** → dejá la duración en 70-90 s.
- Los primeros 3 segundos son todo: usá un gancho fuerte (el programa lo pone arriba con "PARTE N").
- Hacé **series** (botón "Siguiente parte") y terminá siempre en cliffhanger: la gente entra a tu perfil a buscar la parte 2.
- Publicá 1-3 por día, mismo horario. Preguntá algo en la descripción para generar comentarios.
- Activá la etiqueta **"Contenido generado por IA"** al publicar (TikTok lo exige para contenido realista con IA).
- Usá personajes y música propios / libres de derechos (la música de suspenso incluida es sintetizada y libre).

## Problemas comunes

- **Las imágenes fallan**: Pollinations a veces está saturado; tocá "Solo las que faltan" y reintentá, o cambiá a fal.ai.
- **Sin voces**: Edge TTS necesita internet. Si falla, el video se arma igual con silencio en esas líneas.
- **Fuente de los subtítulos**: poné un `.ttf` (ej. Montserrat Black, Bangers) en la carpeta `fuentes/` y escribí su nombre en "Fuente".
