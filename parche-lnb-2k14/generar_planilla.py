"""Convierte fuente_planteles.txt en jugadores.csv y agrega el DT a equipos.csv."""
import csv
import re

ENCABEZADOS = {
    "ARGENTINO": "Argentino", "ATENAS": "Atenas", "BOCA JUNIORS": "Boca Juniors",
    "FERRO": "Ferro Carril Oeste", "GIMNASIA": "Gimnasia y Esgrima",
    "INDEPENDIENTE": "Independiente", "INSTITUTO": "Instituto", "LA UNIÓN": "La Unión",
    "LANÚS": "Lanús", "OBERÁ TC": "Oberá Tenis Club", "OLÍMPICO": "Olímpico",
    "PEÑAROL": "Peñarol", "PLATENSE": "Platense", "QUIMSA": "Quimsa", "RACING": "Racing",
    "REGATAS": "Regatas", "SAN LORENZO": "San Lorenzo", "SAN MARTÍN": "San Martín",
}
PUESTOS = {"Base": "PG", "Escolta": "SG", "Alero": "SF", "Ala pivote": "PF", "Pivote": "C"}
PAISES = {
    "EEUU": "EEUU", "Brasil": "Brasil", "BRA": "Brasil", "Ecuador": "Ecuador",
    "Alemania": "Alemania", "Chile": "Chile", "Venezuela": "Venezuela", "Cuba": "Cuba",
    "Senegal": "Senegal", "Colombia": "Colombia", "Dominicana": "República Dominicana",
    "Paraguay": "Paraguay", "Ucrania": "Ucrania", "Uruguay": "Uruguay", "Croacia": "Croacia",
}
NOMBRES_COMPUESTOS = ("Juan Pablo", "Juan Martín", "Juan Cruz", "Gian Luca")
# Valoración provisoria por tipo de ficha (ver README).
OVERALL = {"extranjero": 72, "mayor": 66, "U21": 60, "juvenil": 56}

COLUMNAS = ["equipo_lnb", "nombre", "apellido", "numero", "posicion", "altura_cm",
            "fecha_nacimiento", "lugar_nacimiento", "pais_nacimiento", "ficha_extranjera",
            "categoria", "overall_objetivo", "notas"]


def pais(lugar):
    if lugar.strip() == "Canadá":
        return "Canadá"
    m = re.search(r"\(([^)]+)\)\s*$", lugar)
    return PAISES.get(m.group(1).strip(), "Argentina") if m else "Argentina"


def main():
    jugadores, dts, equipo = [], {}, None
    for linea in open("fuente_planteles.txt", encoding="utf-8"):
        linea = linea.rstrip("\n")
        if not linea.strip():
            continue
        if "\t" not in linea:
            clave = linea.split(" (")[0].strip()
            equipo = ENCABEZADOS[clave]
            continue
        campos = (linea.split("\t") + [""] * 6)[:6]
        numero, nombre_completo, fecha, lugar, altura, puesto = (c.strip() for c in campos)
        if numero == "DT":
            dts[equipo] = nombre_completo
            continue
        marcas = re.search(r"\(([^)]+)\)", nombre_completo)
        marcas = re.split(r"[.,]\s*", marcas.group(1)) if marcas else []
        nombre_completo = re.sub(r"\s*\([^)]+\)", "", nombre_completo).strip()
        compuesto = next((c for c in NOMBRES_COMPUESTOS if nombre_completo.startswith(c + " ")), None)
        if compuesto:
            nombre, apellido = compuesto, nombre_completo[len(compuesto) + 1:]
        else:
            nombre, _, apellido = nombre_completo.partition(" ")

        extranjero = "E" in marcas
        categoria = "J" if "J" in marcas else "U21" if "U21" in marcas else "mayor"
        tipo = "extranjero" if extranjero else {"J": "juvenil"}.get(categoria, categoria)

        notas = []
        if not numero:
            notas.append("sin número en la fuente")
        if not altura or not puesto:
            notas.append("falta altura y puesto en la fuente")
        if re.fullmatch(r"\d{4}", fecha):
            notas.append("solo año de nacimiento")

        jugadores.append({
            "equipo_lnb": equipo, "nombre": nombre, "apellido": apellido, "numero": numero,
            "posicion": PUESTOS.get(puesto, ""),
            "altura_cm": round(float(altura) * 100) if altura else "",
            "fecha_nacimiento": fecha, "lugar_nacimiento": lugar, "pais_nacimiento": pais(lugar),
            "ficha_extranjera": "si" if extranjero else "no", "categoria": categoria,
            "overall_objetivo": OVERALL[tipo], "notas": notas,
        })

    # Números repetidos dentro del mismo equipo (el juego no los permite).
    vistos = {}
    for j in jugadores:
        if j["numero"]:
            vistos.setdefault((j["equipo_lnb"], j["numero"]), []).append(j)
    for repetidos in vistos.values():
        if len(repetidos) > 1:
            for j in repetidos:
                j["notas"].append("número repetido en el equipo")

    with open("jugadores.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=COLUMNAS)
        w.writeheader()
        for j in jugadores:
            w.writerow({**j, "notas": "; ".join(j["notas"])})

    with open("equipos.csv", encoding="utf-8") as f:
        equipos = list(csv.DictReader(f))
    campos = [c for c in equipos[0] if c != "entrenador"] + ["entrenador"]
    with open("equipos.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=campos)
        w.writeheader()
        for e in equipos:
            w.writerow({**e, "entrenador": dts[e["equipo_lnb"]]})

    print(len(jugadores), "jugadores")
    for e in equipos:
        n = sum(j["equipo_lnb"] == e["equipo_lnb"] for j in jugadores)
        print(f"  {e['equipo_lnb']}: {n}")
    for j in jugadores:
        if j["notas"]:
            print("  !", j["equipo_lnb"], j["nombre"], j["apellido"], "->", "; ".join(j["notas"]))


if __name__ == "__main__":
    main()
