# Parche LNB 2026/27 para NBA 2K14

Planilla para convertir NBA 2K14 en la Liga Nacional de Básquet argentina, temporada 2026/27 (18 equipos).

**Esto no es un `.ROS` listo para usar.** Son los datos que después cargás con un editor de plantillas (en PC) o a mano en el modo de edición del juego (en consola).

## Archivos

- `equipos.csv`: los 18 equipos de la LNB y el equipo de la NBA al que reemplaza cada uno. Boca, Ferro y San Lorenzo van en equipos con colores parecidos. El resto de las asignaciones son arbitrarias y las podés cambiar.
- `jugadores.csv`: los 220 jugadores de los 18 planteles, ya cargados.
- `fuente_planteles.txt`: los planteles tal como se publicaron (sin las filas de encabezado ni los asistentes). Corregí dos cosas: "Resistancia" pasó a "Resistencia" y a Torren Jones le agregué "(EEUU)".
- `generar_planilla.py`: arma `jugadores.csv` y la columna de entrenador de `equipos.csv` a partir de la fuente. Si cambia un plantel, editá `fuente_planteles.txt` y corré `python3 generar_planilla.py`.

## Columnas de `jugadores.csv`

| Columna | Qué va |
|---|---|
| posicion | PG (base), SG (escolta), SF (alero), PF (ala pivote), C (pivote) |
| pais_nacimiento | País donde nació. **No es la nacionalidad**: hay jugadores nacidos afuera que juegan con ficha nacional |
| ficha_extranjera | `si` si la fuente lo marca con (E) |
| categoria | `mayor`, `U21` o `J` (juvenil) |
| overall_objetivo | Valoración **provisoria**, sacada solo del tipo de ficha (ver la escala) |
| notas | Datos que faltan o que hay que resolver a mano |

## Valoración provisoria

El script pone 72 a los extranjeros, 66 a los mayores, 60 a los U21 y 56 a los juveniles. Esto **no mide el nivel real de nadie**: es un punto de partida para que la liga quede pareja. Ajustalo jugador por jugador con la escala de abajo.

## Escala de valoración sugerida

Si a los jugadores de la LNB les ponés valoraciones de nivel NBA, el juego queda desbalanceado. Esto es una escala para que la liga quede pareja entre sus equipos:

| Rol | Overall |
|---|---|
| Figura de la liga / extranjero top | 74–78 |
| Titular | 68–73 |
| Rotación | 62–67 |
| Banco / juvenil | 55–61 |

## Pasos

1. Revisar `overall_objetivo` y resolver lo que diga la columna `notas`. Hay jugadores sin número en Lanús y Oberá, números repetidos en Peñarol y a Bautista Aguilar (Instituto) le faltan la altura y el puesto.
2. En PC: hacer una copia de seguridad del archivo de plantillas antes de tocar nada. Después, en el editor, sobrescribir los jugadores de cada equipo NBA con los de la tabla y renombrar el equipo, la ciudad y la abreviatura según `equipos.csv`.
3. En consola: hacer lo mismo desde el modo de edición de plantillas del juego.
4. Quedan 12 equipos NBA sin usar. Dejalos como están y armá la temporada solo con los 18 equipos de la liga.
