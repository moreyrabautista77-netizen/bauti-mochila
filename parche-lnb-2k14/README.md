# Parche LNB 2026/27 para NBA 2K14

Planilla para convertir NBA 2K14 en la Liga Nacional de Básquet argentina, temporada 2026/27 (18 equipos).

**Esto no es un `.ROS` listo para usar.** Son los datos que después cargás con un editor de plantillas (en PC) o a mano en el modo de edición del juego (en consola).

## Archivos

- `equipos.csv`: los 18 equipos de la LNB y el equipo de la NBA al que reemplaza cada uno. Boca, Ferro y San Lorenzo van en equipos con colores parecidos. El resto de las asignaciones son arbitrarias y las podés cambiar.
- `jugadores.csv`: 13 filas por equipo para completar con el plantel.

## Columnas de `jugadores.csv`

| Columna | Qué va |
|---|---|
| posicion / posicion_secundaria | PG, SG, SF, PF o C |
| ficha_extranjera | `si` o `no` (en la LNB hay cupo de extranjeros) |
| rol | `titular`, `rotacion` o `banco` |
| overall_objetivo | La valoración general que querés que tenga en el juego (ver la escala) |

## Escala de valoración sugerida

Si a los jugadores de la LNB les ponés valoraciones de nivel NBA, el juego queda desbalanceado. Esto es una escala para que la liga quede pareja entre sus equipos:

| Rol | Overall |
|---|---|
| Figura de la liga / extranjero top | 74–78 |
| Titular | 68–73 |
| Rotación | 62–67 |
| Banco / juvenil | 55–61 |

## Pasos

1. Completar `jugadores.csv`.
2. En PC: hacer una copia de seguridad del archivo de plantillas antes de tocar nada. Después, en el editor, sobrescribir los jugadores de cada equipo NBA con los de la tabla y renombrar el equipo, la ciudad y la abreviatura según `equipos.csv`.
3. En consola: hacer lo mismo desde el modo de edición de plantillas del juego.
4. Quedan 12 equipos NBA sin usar. Dejalos como están y armá la temporada solo con los 18 equipos de la liga.
