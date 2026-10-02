// FASE 5 — Programación y automatización (semanas 17 a 21)

CURSO.semanas.push(
{
  fase: 5,
  titulo: "Lógica de programación y primeros pasos en Python",
  meta: "Pensar como programador y escribir tus primeros programas en Python.",
  lecciones: [
    L("Algoritmos y pensamiento computacional",
      [
        "Un **algoritmo** es una secuencia finita de pasos para resolver un problema. Ya los usás: la escalera de diagnóstico de red es un algoritmo.",
        "Pensamiento computacional:",
        "- **Descomponer**: dividir un problema grande en partes chicas.",
        "- **Reconocer patrones**: ¿esto se parece a algo que ya resolví?",
        "- **Abstraer**: quedarte con lo importante.",
        "- **Diseñar el algoritmo**: pasos claros, sin ambigüedad.",
        "Herramientas para diseñar antes de programar: **pseudocódigo** y **diagramas de flujo** (óvalo inicio/fin, rectángulo proceso, rombo decisión, paralelogramo entrada/salida).",
        ">>INICIO\n  LEER nota\n  SI nota >= 6 ENTONCES\n     MOSTRAR \"Aprobado\"\n  SINO\n     MOSTRAR \"Desaprobado\"\n  FIN SI\nFIN",
        "Estructuras básicas de cualquier lenguaje: **secuencia**, **decisión** (si/sino) y **repetición** (mientras/para). Con esas tres se puede programar todo."
      ],
      [
        "Escribí en pseudocódigo el algoritmo para «preparar un mate» con al menos 10 pasos y una decisión (¿hay yerba?).",
        "Hacé el diagrama de flujo de «la PC no da imagen» usando el árbol que hiciste en la semana 3 (podés usar draw.io).",
        "Escribí en pseudocódigo: pedir 5 números y mostrar el mayor.",
        "Hacé los primeros niveles de **code.org** (Hour of Code) o de **Blockly Games** para entrenar la lógica.",
        "Anotá en la bitácora qué parte de la lógica te resultó más difícil."
      ],
      [
        ["¿Cuáles son las 3 estructuras básicas de la programación?", ["Variables, funciones, clases", "Secuencia, decisión y repetición", "Entrada, salida, RAM", "HTML, CSS, JS"], 1, "Con ellas se construye cualquier algoritmo."],
        ["En un diagrama de flujo, la decisión se dibuja con un…", ["Óvalo", "Rombo", "Rectángulo", "Círculo"], 1, "El rombo tiene salidas Sí/No."],
        ["¿Qué es descomponer un problema?", ["Romper la PC", "Dividirlo en partes más chicas y manejables", "Borrar archivos", "Ignorarlo"], 1, "Es el primer paso del pensamiento computacional."]
      ]),
    L("Instalar Python y primer programa",
      [
        "**Python** es el lenguaje más recomendado para empezar: sintaxis clara, enorme comunidad y sirve para automatizar, analizar datos, web, ciberseguridad e IA.",
        "Instalación en Windows: desde **python.org** (marcar **«Add python.exe to PATH»**) o `winget install Python.Python.3.13` (o la versión estable más reciente). Verificar con `python --version`.",
        "Editor: **Visual Studio Code** con la extensión **Python** de Microsoft.",
        ">># mi primer programa\nnombre = input(\"¿Cómo te llamás? \")\nprint(\"Hola,\", nombre)\nprint(f\"Tu nombre tiene {len(nombre)} letras\")",
        "- `print()` muestra en pantalla. `input()` lee lo que escribe el usuario (siempre como **texto**).",
        "- Las **f-strings** `f\"...{variable}...\"` insertan valores en un texto.",
        "- `#` inicia un comentario.",
        "- Se ejecuta con `python archivo.py` en la terminal o con el botón ▶ de VS Code.",
        "Python usa la **indentación** (sangría de 4 espacios) para definir bloques: no es estética, es sintaxis."
      ],
      [
        "Instalá Python (con PATH) y VS Code con la extensión Python.",
        "Creá la carpeta `05-Programacion/python` y abrila en VS Code.",
        "Escribí y ejecutá `hola.py` con el ejemplo.",
        "Abrí la consola interactiva escribiendo `python` en la terminal y usala como calculadora: `2**10`, `17 // 5`, `17 % 5`. Salí con `exit()`.",
        "Modificá el programa para que pregunte también la edad y diga en qué año cumple 18 (o cuántos años hace que los cumplió)."
      ],
      [
        ["¿Qué tipo de dato devuelve siempre input()?", ["Número entero", "Texto (str)", "Booleano", "Lista"], 1, "Hay que convertirlo con int() o float()."],
        ["¿Qué hace la indentación en Python?", ["Nada, es estética", "Define los bloques de código", "Comenta líneas", "Acelera el programa"], 1, "Es parte de la sintaxis."],
        ["¿Qué hay que marcar al instalar Python en Windows?", ["Instalar Java", "Add python.exe to PATH", "Desactivar el antivirus", "Nada"], 1, "Así funciona el comando python en la terminal."]
      ]),
    L("Variables, tipos y operadores",
      [
        "Tipos básicos:",
        ">>edad = 17              # int (entero)\nprecio = 1599.99       # float (decimal)\nnombre = \"Bauti\"       # str (texto)\nactivo = True          # bool (True/False)\nnada = None            # sin valor",
        "Conversión: `int(\"5\")`, `float(\"3.5\")`, `str(10)`. `type(x)` dice el tipo.",
        "Operadores aritméticos: `+ - * /` (división con decimales), `//` (división entera), `%` (resto), `**` (potencia).",
        "Comparación: `==`, `!=`, `>`, `<`, `>=`, `<=`. Lógicos: `and`, `or`, `not`.",
        "Texto: `\"hola\".upper()`, `.lower()`, `.strip()` (quita espacios), `.replace(\"a\",\"o\")`, `.split(\",\")`, `len(texto)`, `texto[0]` (primer carácter).",
        "Nombres de variables: en minúscula con guiones bajos (`precio_final`), descriptivos. `x1` no dice nada; `cantidad_equipos` sí."
      ],
      [
        "Programa `conversor.py`: pide Mbps y muestra MB/s (como en la semana 1).",
        "Programa `iva.py`: pide un precio sin IVA y muestra el IVA (21 %) y el total, con 2 decimales: `f\"{total:.2f}\"`.",
        "Programa `binario.py`: pide un número decimal y lo muestra en binario y hexadecimal usando `bin()` y `hex()`.",
        "Programa `disco.py`: pide la capacidad en GB que dice el fabricante y muestra lo que verá Windows (× 1000³ ÷ 1024³).",
        "Probá qué pasa si escribís letras donde se pide un número. Anotá el error (lo vas a resolver más adelante con try/except)."
      ],
      [
        ["¿Cuánto da 17 % 5 en Python?", ["3.4", "2", "3", "12"], 1, "% es el resto de la división: 17 = 5×3 + 2."],
        ["¿Qué hace int(\"42\")?", ["Da error", "Convierte el texto \"42\" en el número 42", "Lo convierte en lista", "Lo borra"], 1, "Conversión de str a int."],
        ["¿Qué operador compara igualdad?", ["=", "==", "===", "equals"], 1, "= asigna; == compara."]
      ]),
    L("Condicionales",
      [
        ">>temp = float(input(\"Temperatura de la CPU: \"))\nif temp >= 90:\n    print(\"PELIGRO: revisá refrigeración\")\nelif temp >= 75:\n    print(\"Alta en carga, controlar\")\nelse:\n    print(\"Normal\")",
        "- `if` evalúa una condición; `elif` (sino si) otra; `else` todo lo demás.",
        "- Los dos puntos `:` y la indentación son obligatorios.",
        "- Condiciones combinadas: `if ram < 8 and disco == \"HDD\":`.",
        "- Pertenencia: `if extension in [\".jpg\", \".png\"]:`.",
        "El orden importa: Python ejecuta el **primer** bloque cuya condición sea verdadera y salta el resto. Por eso las condiciones más exigentes van primero."
      ],
      [
        "Escribí el ejemplo de temperatura y probalo con 50, 80 y 95.",
        "Programa `diagnostico_pc.py`: pregunta RAM (GB), tipo de disco (HDD/SSD) y años del equipo, y recomienda: ampliar RAM, pasar a SSD, o cambiar equipo.",
        "Programa `ip_tipo.py`: pide el primer octeto de una IP y dice si es clase privada 10.x, 192.168.x (pedí el segundo octeto) o pública (simplificado).",
        "Programa `nota.py`: nota numérica a concepto (Excelente ≥9, Muy bueno ≥7, Aprobado ≥6, Desaprobado).",
        "Subí estos programas a tu carpeta con comentarios."
      ],
      [
        ["¿Qué palabra se usa para «sino si» en Python?", ["elseif", "elif", "else if", "case"], 1, "elif."],
        ["Si la primera condición del if es verdadera…", ["Se evalúan todas igual", "Se ejecuta ese bloque y se saltan elif/else", "Da error", "Se ejecuta el else"], 1, "Solo un bloque se ejecuta."],
        ["¿Qué devuelve 5 > 3 and 2 > 4?", ["True", "False", "Error", "None"], 1, "and exige que ambas sean verdaderas."]
      ]),
    L("Bucles while y for",
      [
        "**while** repite mientras la condición sea verdadera:",
        ">>clave = \"\"\nwhile clave != \"1234\":\n    clave = input(\"Contraseña: \")\nprint(\"Acceso concedido\")",
        "**for** recorre una secuencia:",
        ">>for i in range(1, 6):        # 1, 2, 3, 4, 5\n    print(\"Equipo\", i)\n\nfor letra in \"Python\":\n    print(letra)\n\ntotal = 0\nfor precio in [1500, 3200, 800]:\n    total += precio\nprint(total)",
        "- `range(inicio, fin, paso)`: el **fin no se incluye**.",
        "- `break` corta el bucle; `continue` salta a la siguiente vuelta.",
        "- **Acumulador** (`total += x`) y **contador** (`cant += 1`): patrones que vas a usar siempre.",
        "Cuidado con los **bucles infinitos**: si la condición nunca cambia, el programa no termina (Ctrl + C lo corta)."
      ],
      [
        "Programa `tabla.py`: pide un número y muestra su tabla de multiplicar del 1 al 10.",
        "Programa `promedio.py`: pide notas hasta que se escriba 0 y muestra cantidad, promedio, máxima y mínima.",
        "Programa `adivina.py`: el programa elige un número al azar (`import random`, `random.randint(1,100)`) y el usuario adivina con pistas «mayor/menor». Contá los intentos.",
        "Programa `ping_simulado.py`: simulá 10 pings con tiempos al azar entre 10 y 200 ms, y al final mostrá mínimo, máximo y promedio.",
        "Hacé 5 ejercicios de bucles en **exercism.org** (track de Python) o en **HackerRank**."
      ],
      [
        ["¿Qué números genera range(1, 5)?", ["1 a 5", "1, 2, 3, 4", "0 a 5", "1 a 4 de a 2"], 1, "El fin no se incluye."],
        ["¿Qué hace break?", ["Pausa el programa", "Sale del bucle", "Salta una vuelta", "Reinicia"], 1, "continue salta una vuelta; break sale."],
        ["Un while cuya condición nunca cambia produce…", ["Un error de sintaxis", "Un bucle infinito", "Nada", "Un for"], 1, "Ctrl + C lo detiene."]
      ])
  ],
  lab: {
    titulo: "Calculadora del técnico",
    pasos: [
      "Programa `calculadora_tecnico.py` con un menú en bucle: 1) Mbps → MB/s, 2) capacidad real de disco, 3) decimal ↔ binario/hex, 4) presupuesto con IVA, 5) consumo de fuente sugerido, 0) salir.",
      "Cada opción en su propio bloque, con mensajes claros.",
      "El menú se repite hasta elegir 0.",
      "Probá cada opción con varios valores y anotá los resultados.",
      "Agregá comentarios explicando cada parte."
    ],
    entregable: "Programa con menú funcionando y comentado."
  }
},
{
  fase: 5,
  titulo: "Python: estructuras de datos y funciones",
  meta: "Organizar datos con listas y diccionarios, y escribir código reutilizable con funciones.",
  lecciones: [
    L("Listas",
      [
        ">>equipos = [\"PC-01\", \"PC-02\", \"NOTE-01\"]\nequipos.append(\"PC-03\")      # agregar\nequipos.remove(\"PC-02\")      # quitar\nprint(equipos[0])            # primero\nprint(equipos[-1])           # último\nprint(len(equipos))          # cantidad\nequipos.sort()               # ordenar\nprint(\"PC-01\" in equipos)    # ¿está?",
        "- Los índices empiezan en **0**.",
        "- **Slicing**: `lista[1:3]` (del 1 al 2), `lista[:2]` (los dos primeros).",
        "- Recorrer con índice: `for i, eq in enumerate(equipos):`.",
        "- Funciones útiles: `sum()`, `max()`, `min()`, `sorted()`.",
        "- **List comprehension**: `cuadrados = [n**2 for n in range(10)]` o filtrar: `pares = [n for n in numeros if n % 2 == 0]`.",
        "Una **tupla** `(1, 2)` es como una lista pero no se puede modificar."
      ],
      [
        "Programa `inventario.py`: lista de equipos con menú para agregar, quitar, listar ordenado y buscar.",
        "Dada una lista de temperaturas `[45, 67, 89, 92, 55, 71]`, mostrá cuántas superan 85 usando una list comprehension.",
        "Pedí 10 precios, guardalos en una lista y mostrá total, promedio, más caro y más barato.",
        "Invertí una lista con `[::-1]` y probá distintos slicing.",
        "Escribí en la bitácora la diferencia entre lista y tupla."
      ],
      [
        ["¿Cuál es el índice del primer elemento de una lista?", ["1", "0", "-1", "Depende"], 1, "Python cuenta desde 0."],
        ["¿Qué devuelve lista[-1]?", ["Error", "El último elemento", "El primero", "None"], 1, "Índices negativos cuentan desde el final."],
        ["¿Qué método agrega un elemento al final?", ["add()", "append()", "push()", "insert_end()"], 1, "append()."]
      ]),
    L("Diccionarios",
      [
        "Un **diccionario** guarda pares **clave: valor**. Ideal para representar «fichas».",
        ">>equipo = {\n    \"nombre\": \"PC-Recepcion\",\n    \"ram_gb\": 8,\n    \"disco\": \"HDD\",\n    \"ip\": \"192.168.1.20\"\n}\nprint(equipo[\"ip\"])\nequipo[\"ram_gb\"] = 16             # modificar\nequipo[\"usuario\"] = \"Ana\"          # agregar\nprint(equipo.get(\"so\", \"Sin dato\")) # get con valor por defecto\nfor clave, valor in equipo.items():\n    print(clave, \"→\", valor)",
        "Lista de diccionarios = una **tabla** (como en Excel o SQL):",
        ">>equipos = [\n    {\"nombre\": \"PC-01\", \"ram_gb\": 8},\n    {\"nombre\": \"PC-02\", \"ram_gb\": 4},\n]\npara_ampliar = [e[\"nombre\"] for e in equipos if e[\"ram_gb\"] < 8]",
        "Este formato es casi idéntico a **JSON**, el formato de datos de las APIs web."
      ],
      [
        "Creá un diccionario con la ficha de tu PC (CPU, RAM, disco, SO, IP).",
        "Creá una lista de 5 equipos (diccionarios) y mostrá los que tienen HDD y menos de 8 GB.",
        "Contá cuántas veces aparece cada palabra en una frase usando un diccionario contador.",
        "Armá un diccionario de puertos `{22: \"SSH\", 80: \"HTTP\", ...}` con los 15 que aprendiste y un programa que pregunte un número y diga el servicio.",
        "Hacé que el programa de puertos funcione al revés también (servicio → puerto)."
      ],
      [
        ["¿Cómo accedés al valor de la clave \"ip\"?", ["equipo.ip", "equipo[\"ip\"]", "equipo(ip)", "equipo->ip"], 1, "Con corchetes y la clave."],
        ["¿Qué ventaja tiene .get(\"clave\", valor)?", ["Es más rápido", "No da error si la clave no existe", "Borra la clave", "Ordena"], 1, "Devuelve el valor por defecto."],
        ["Una lista de diccionarios se parece a…", ["Una imagen", "Una tabla de datos (y a JSON)", "Un archivo ZIP", "Un puerto"], 1, "Cada diccionario es una fila."]
      ]),
    L("Funciones",
      [
        "Una **función** es un bloque de código con nombre que se puede reutilizar.",
        ">>def mbps_a_mbs(mbps):\n    \"\"\"Convierte megabits por segundo a megabytes por segundo.\"\"\"\n    return mbps / 8\n\ndef precio_con_iva(precio, iva=21):\n    return round(precio * (1 + iva / 100), 2)\n\nprint(mbps_a_mbs(300))          # 37.5\nprint(precio_con_iva(1000))     # 1210.0\nprint(precio_con_iva(1000, 10.5))",
        "- **Parámetros**: datos que recibe. Pueden tener **valor por defecto** (`iva=21`).",
        "- **return** devuelve un resultado (diferente de `print`, que solo muestra).",
        "- El **docstring** (texto entre triples comillas) documenta qué hace.",
        "- Las variables creadas dentro de una función son **locales**: no existen afuera.",
        "Regla práctica: si copiaste y pegaste el mismo código dos veces, convertilo en función. Cada función debería hacer **una sola cosa** bien."
      ],
      [
        "Reescribí tu `calculadora_tecnico.py` usando una función por opción.",
        "Escribí `es_ip_valida(texto)` que devuelva True/False (4 partes separadas por punto, cada una entre 0 y 255).",
        "Escribí `calcular_red(ip, prefijo)` que, para /24, /16 y /8, devuelva la dirección de red (pista: usá el módulo `ipaddress`: `ipaddress.ip_network(\"192.168.1.77/24\", strict=False)`).",
        "Probá el módulo `ipaddress` para verificar tus ejercicios de subnetting de la semana 10.",
        "Escribí docstrings en todas tus funciones."
      ],
      [
        ["¿Qué diferencia hay entre return y print?", ["Ninguna", "return devuelve un valor para usar; print solo lo muestra", "print es más rápido", "return imprime en color"], 1, "Una función con return se puede usar en cálculos."],
        ["En def precio(p, iva=21), ¿qué es iva=21?", ["Un error", "Un parámetro con valor por defecto", "Una variable global", "Un comentario"], 1, "Si no se pasa, vale 21."],
        ["¿Qué módulo de Python calcula redes y subredes?", ["math", "ipaddress", "random", "os"], 1, "Muy útil para verificar subnetting."]
      ]),
    L("Módulos y librerías",
      [
        "Python trae una **biblioteca estándar** enorme. Se usa con `import`:",
        ">>import random, math, datetime, platform, socket\nprint(platform.system(), platform.release())   # sistema operativo\nprint(socket.gethostname())                    # nombre del equipo\nprint(datetime.date.today())                   # fecha\nprint(math.sqrt(16))",
        "Librerías externas se instalan con **pip**: `pip install psutil requests`.",
        "- **psutil**: CPU, RAM, discos, procesos, red (perfecto para herramientas de soporte).",
        "- **requests**: consultar páginas y APIs web.",
        "- **openpyxl** / **pandas**: leer y escribir Excel.",
        ">>import psutil\nprint(\"CPU %:\", psutil.cpu_percent(interval=1))\nram = psutil.virtual_memory()\nprint(f\"RAM usada: {ram.percent}%\")\nfor d in psutil.disk_partitions():\n    uso = psutil.disk_usage(d.mountpoint)\n    print(d.device, f\"{uso.percent}% usado\")",
        "**Entornos virtuales** (`python -m venv .venv`) aíslan las librerías de cada proyecto. Buena práctica cuando tengas varios proyectos."
      ],
      [
        "Instalá psutil con `pip install psutil`.",
        "Escribí `monitor.py` que muestre CPU, RAM, discos y batería (`psutil.sensors_battery()`) de tu PC.",
        "Agregá la lista de los 5 procesos que más memoria usan (`psutil.process_iter(['name','memory_info'])`).",
        "Hacé que se actualice cada 2 segundos (`time.sleep(2)`) hasta Ctrl + C.",
        "Creá un entorno virtual para este proyecto y probá instalar psutil adentro."
      ],
      [
        ["¿Con qué comando instalás librerías externas?", ["apt install", "pip install", "winget python", "import install"], 1, "pip es el gestor de paquetes de Python."],
        ["¿Qué librería da información de CPU, RAM y discos?", ["requests", "psutil", "random", "math"], 1, "psutil = process and system utilities."],
        ["¿Para qué sirve un entorno virtual?", ["Para crear VMs", "Para aislar las librerías de cada proyecto", "Para acelerar Python", "Para jugar"], 1, "Evita conflictos de versiones."]
      ]),
    L("Errores y depuración",
      [
        "Tipos de errores:",
        "- **Sintaxis** (`SyntaxError`): falta un `:`, un paréntesis, mala indentación. Python no arranca.",
        "- **En ejecución** (excepciones): `ValueError` (int(\"hola\")), `ZeroDivisionError`, `FileNotFoundError`, `KeyError`, `IndexError`, `TypeError`.",
        "- **Lógicos**: el programa corre pero da un resultado incorrecto. Los más difíciles.",
        "Manejo de excepciones:",
        ">>try:\n    edad = int(input(\"Edad: \"))\nexcept ValueError:\n    print(\"Escribí un número válido\")\nelse:\n    print(\"Gracias\")\nfinally:\n    print(\"Fin\")",
        "**Leer el error** es una habilidad clave: la última línea dice el tipo y el mensaje; las líneas de arriba (traceback) dicen en qué archivo y línea pasó.",
        "Depurar: agregar `print()` para ver valores, usar el **depurador de VS Code** (puntos de interrupción con F9, ejecutar paso a paso con F10) y explicarle el código en voz alta a alguien (o a un patito de goma: «rubber duck debugging»)."
      ],
      [
        "Agregá try/except a todos los `int(input())` de tus programas para que no se rompan con letras.",
        "Escribí una función `pedir_numero(mensaje)` que repita la pregunta hasta que el usuario escriba un número válido. Usala en todos tus programas.",
        "Provocá a propósito 5 errores distintos (ZeroDivisionError, KeyError, etc.) y anotá el mensaje de cada uno.",
        "Usá el depurador de VS Code: poné un punto de interrupción en tu programa `promedio.py` y seguí las variables paso a paso.",
        "Anotá en la bitácora tu estrategia personal para buscar un error."
      ],
      [
        ["int(\"hola\") produce…", ["TypeError", "ValueError", "KeyError", "Nada"], 1, "El texto no se puede convertir a entero."],
        ["¿Qué bloque se ejecuta siempre, haya error o no?", ["except", "else", "finally", "try"], 2, "finally se usa para cerrar recursos."],
        ["¿Qué parte del mensaje de error leés primero?", ["La primera línea", "La última línea: tipo de error y mensaje", "Ninguna", "Solo el número de línea"], 1, "Después subís para ver dónde ocurrió."]
      ])
  ],
  lab: {
    titulo: "Herramienta de inventario de equipos",
    pasos: [
      "Programa `inventario_equipos.py` que guarde equipos como lista de diccionarios (nombre, usuario, CPU, RAM, disco, SO, IP, estado).",
      "Funciones: agregar, listar, buscar por usuario, modificar, eliminar y un **reporte** de equipos que necesitan mejora (RAM < 8 o HDD).",
      "Validá las entradas con try/except y `es_ip_valida()`.",
      "Agregá una opción que cargue automáticamente los datos de la PC actual con psutil y platform.",
      "Probalo con 10 equipos inventados."
    ],
    entregable: "Programa de inventario con funciones y validaciones."
  }
},
{
  fase: 5,
  titulo: "Python para automatizar el trabajo",
  meta: "Automatizar tareas reales de soporte: archivos, backups, reportes y planillas.",
  lecciones: [
    L("Leer y escribir archivos",
      [
        ">>with open(\"notas.txt\", \"w\", encoding=\"utf-8\") as f:   # w = escribir (pisa)\n    f.write(\"Primera línea\\n\")\n\nwith open(\"notas.txt\", \"a\", encoding=\"utf-8\") as f:   # a = agregar\n    f.write(\"Otra línea\\n\")\n\nwith open(\"notas.txt\", encoding=\"utf-8\") as f:        # r = leer (por defecto)\n    for linea in f:\n        print(linea.strip())",
        "- `with` cierra el archivo automáticamente.",
        "- Siempre `encoding=\"utf-8\"` para que las ñ y tildes no se rompan.",
        "**CSV**:",
        ">>import csv\nwith open(\"equipos.csv\", newline=\"\", encoding=\"utf-8\") as f:\n    for fila in csv.DictReader(f):\n        print(fila[\"nombre\"], fila[\"ram_gb\"])",
        "**JSON** (guardar estructuras completas):",
        ">>import json\njson.dump(equipos, open(\"equipos.json\", \"w\", encoding=\"utf-8\"), indent=2, ensure_ascii=False)\nequipos = json.load(open(\"equipos.json\", encoding=\"utf-8\"))",
        "**pathlib** maneja rutas de forma moderna: `from pathlib import Path`; `Path.home() / \"Documents\"`."
      ],
      [
        "Hacé que tu inventario de equipos **guarde y cargue** los datos en `equipos.json` al salir y al iniciar.",
        "Agregá una opción para exportar el inventario a `equipos.csv` y abrilo en Excel.",
        "Escribí `bitacora.py` que agregue una línea con fecha y hora a `bitacora.txt` con lo que escribas.",
        "Leé un log (por ejemplo `C:\\Windows\\WindowsUpdate.log` o cualquier .txt grande) y contá cuántas líneas contienen la palabra «error».",
        "Probá qué pasa si abrís un archivo inexistente y manejá el `FileNotFoundError`."
      ],
      [
        ["¿Qué modo de open() agrega al final sin borrar?", ["\"w\"", "\"a\"", "\"r\"", "\"x\""], 1, "a = append."],
        ["¿Por qué usar with open(...)?", ["Es más rápido", "Cierra el archivo automáticamente", "Cifra el archivo", "No hace falta nada"], 1, "Evita archivos abiertos o corruptos."],
        ["¿Qué parámetro evita problemas con la ñ?", ["mode=\"b\"", "encoding=\"utf-8\"", "ascii=True", "lang=\"es\""], 1, "UTF-8 es el estándar."]
      ]),
    L("Organizar archivos automáticamente",
      [
        "Con `os`, `shutil` y `pathlib` podés hacer en segundos lo que a mano tarda horas:",
        ">>from pathlib import Path\nimport shutil\n\nTIPOS = {\n    \"Imagenes\": [\".jpg\", \".jpeg\", \".png\", \".gif\", \".heic\"],\n    \"Documentos\": [\".pdf\", \".docx\", \".xlsx\", \".txt\", \".pptx\"],\n    \"Comprimidos\": [\".zip\", \".rar\", \".7z\"],\n    \"Instaladores\": [\".exe\", \".msi\"],\n}\ncarpeta = Path.home() / \"Downloads\"\nfor archivo in carpeta.iterdir():\n    if archivo.is_file():\n        for destino, extensiones in TIPOS.items():\n            if archivo.suffix.lower() in extensiones:\n                (carpeta / destino).mkdir(exist_ok=True)\n                shutil.move(str(archivo), carpeta / destino / archivo.name)\n                print(\"Movido:\", archivo.name, \"→\", destino)",
        "Otras operaciones: `shutil.copy2()` (copia con fechas), `shutil.copytree()` (carpetas), `archivo.rename()`, `archivo.stat().st_size` (tamaño), `Path.rglob(\"*.pdf\")` (buscar recursivo).",
        "**Antes de mover o borrar en masa: probá en una carpeta de prueba** y empezá con un «modo simulación» que solo muestre lo que haría."
      ],
      [
        "Creá una carpeta de prueba con 20 archivos de distintos tipos (podés crearlos vacíos con Python).",
        "Escribí `organizador.py` con el ejemplo y agregá un modo simulación (`SIMULAR = True` solo imprime).",
        "Agregá manejo de nombres duplicados (si existe, agregar `_1`, `_2`).",
        "Escribí `renombrar_fotos.py` que renombre fotos con su fecha de modificación: `2026-12-24_001.jpg`.",
        "Escribí `buscar_grandes.py` que liste los archivos de más de 500 MB de una carpeta y sus subcarpetas."
      ],
      [
        ["¿Qué función mueve un archivo?", ["shutil.move()", "os.print()", "open()", "Path.delete()"], 0, "shutil.move(origen, destino)."],
        ["¿Qué hace mkdir(exist_ok=True)?", ["Borra la carpeta", "Crea la carpeta sin error si ya existe", "Da error siempre", "Cambia permisos"], 1, "Evita FileExistsError."],
        ["¿Qué conviene hacer antes de mover miles de archivos con un script?", ["Nada", "Probar en una carpeta de prueba y usar un modo simulación", "Desactivar el antivirus", "Formatear"], 1, "Un error de script se multiplica por mil."]
      ]),
    L("Script de backup en Python",
      [
        ">>from pathlib import Path\nfrom datetime import datetime\nimport shutil, logging\n\nORIGEN = Path.home() / \"Documents\"\nDESTINO = Path(\"D:/Respaldos\")\nCONSERVAR = 7   # cantidad de backups a mantener\n\nlogging.basicConfig(filename=\"backup.log\", level=logging.INFO,\n                    format=\"%(asctime)s %(levelname)s %(message)s\")\n\ndef hacer_backup():\n    DESTINO.mkdir(parents=True, exist_ok=True)\n    nombre = DESTINO / f\"documentos_{datetime.now():%Y-%m-%d_%H%M}\"\n    archivo = shutil.make_archive(str(nombre), \"zip\", ORIGEN)\n    logging.info(\"Backup creado: %s\", archivo)\n    return archivo\n\ndef rotar():\n    backups = sorted(DESTINO.glob(\"documentos_*.zip\"))\n    for viejo in backups[:-CONSERVAR]:\n        viejo.unlink()\n        logging.info(\"Borrado backup viejo: %s\", viejo.name)\n\ntry:\n    hacer_backup()\n    rotar()\nexcept Exception as e:\n    logging.error(\"Falló el backup: %s\", e)",
        "Conceptos nuevos:",
        "- **logging**: registro con fecha de lo que hace el programa. Fundamental en scripts que corren solos.",
        "- **Rotación**: conservar solo los últimos N backups para no llenar el disco.",
        "- Se programa con el **Programador de tareas** (acción: `python.exe` con el script como argumento) o cron en Linux."
      ],
      [
        "Adaptá el script a tus carpetas (origen: `Mochila`; destino: un pendrive o carpeta de prueba).",
        "Ejecutalo varias veces y verificá que la rotación conserva solo los últimos N.",
        "Revisá `backup.log`.",
        "Agregá una **verificación**: abrir el ZIP con `zipfile` y comprobar que la cantidad de archivos coincide con el origen.",
        "Programalo en el Programador de tareas para que corra todos los días."
      ],
      [
        ["¿Para qué sirve la rotación de backups?", ["Para girar el disco", "Para conservar solo los últimos N y no llenar el disco", "Para cifrar", "Para comprimir más"], 1, "Mantiene un historial acotado."],
        ["¿Por qué usar logging en un script automático?", ["Para que sea más lindo", "Para tener registro de qué pasó cuando nadie lo estaba mirando", "Para que sea más rápido", "No sirve"], 1, "Si algo falla de madrugada, el log lo dice."],
        ["¿Qué función de shutil crea un ZIP de una carpeta?", ["shutil.zip()", "shutil.make_archive()", "shutil.copy()", "shutil.pack()"], 1, "make_archive(nombre, \"zip\", carpeta)."]
      ]),
    L("Excel y reportes con Python",
      [
        "Con **openpyxl** leés y escribís Excel; con **pandas** analizás datos como un profesional.",
        ">>pip install openpyxl pandas",
        ">>import pandas as pd\nventas = pd.read_excel(\"ventas.xlsx\")\nprint(ventas.head())                       # primeras filas\nprint(ventas[\"importe\"].sum())             # total\nresumen = ventas.groupby(\"vendedor\")[\"importe\"].sum().sort_values(ascending=False)\nprint(resumen)\nresumen.to_excel(\"resumen_vendedores.xlsx\")",
        "pandas trabaja con **DataFrames** (tablas). Operaciones: filtrar `ventas[ventas[\"importe\"] > 10000]`, agrupar `groupby`, ordenar, unir tablas (`merge`, como el JOIN de SQL), leer CSV (`read_csv`).",
        "Caso real: todos los meses una oficina une 10 planillas a mano. Con 10 líneas de pandas (`pd.concat`) se hace en un segundo. **Ese tipo de automatización es lo que te hace destacar en una pasantía.**"
      ],
      [
        "Usá la planilla de 200 ventas de la semana 15 y reproducí con pandas la tabla dinámica (total por vendedor y por mes).",
        "Generá con Python 3 planillas de ventas de distintos meses y escribí un script que las una en una sola.",
        "Exportá el resumen a Excel con openpyxl y poné los encabezados en negrita.",
        "Leé tu `equipos.csv` del inventario con pandas y listá los que necesitan mejora.",
        "Anotá qué tarea de Excel de tu casa, escuela o trabajo podrías automatizar."
      ],
      [
        ["¿Qué librería se usa para analizar tablas de datos en Python?", ["pandas", "random", "socket", "turtle"], 0, "pandas con DataFrames."],
        ["¿Qué hace groupby(\"vendedor\")[\"importe\"].sum()?", ["Borra vendedores", "Suma el importe por cada vendedor", "Cuenta filas", "Ordena alfabéticamente"], 1, "Equivale a una tabla dinámica."],
        ["¿Qué función une varias tablas una debajo de la otra?", ["pd.concat", "pd.split", "pd.drop", "pd.print"], 0, "concat apila DataFrames."]
      ]),
    L("Python y redes",
      [
        "Python también sirve para herramientas de red:",
        ">>import socket, subprocess, platform\n\ndef ping(host):\n    param = \"-n\" if platform.system() == \"Windows\" else \"-c\"\n    r = subprocess.run([\"ping\", param, \"1\", host], capture_output=True)\n    return r.returncode == 0\n\ndef puerto_abierto(host, puerto, timeout=1):\n    with socket.socket() as s:\n        s.settimeout(timeout)\n        return s.connect_ex((host, puerto)) == 0\n\nfor h in [\"192.168.1.1\", \"8.8.8.8\", \"google.com\"]:\n    print(h, \"OK\" if ping(h) else \"SIN RESPUESTA\")\nprint(\"HTTPS google:\", puerto_abierto(\"google.com\", 443))",
        "- `subprocess.run()` ejecuta comandos del sistema y captura su salida.",
        "- `socket` permite conexiones de red de bajo nivel.",
        "- `requests` consulta APIs: `requests.get(\"https://api.ipify.org\").text` devuelve tu IP pública.",
        "Recordatorio ético: escaneá solo **tu red** o con autorización."
      ],
      [
        "Escribí `escalera.py` que ejecute la escalera de diagnóstico (localhost, gateway, 8.8.8.8, google.com) y diga en qué escalón falla y qué significa.",
        "Obtené el gateway automáticamente o pedilo por teclado.",
        "Escribí `puertos.py` que revise los puertos 22, 80, 443, 445 y 3389 de tu router y de tu propia PC.",
        "Mostrá tu IP pública con requests.",
        "Guardá el resultado del diagnóstico en un archivo con fecha (para entregarlo como informe)."
      ],
      [
        ["¿Qué módulo ejecuta comandos del sistema como ping?", ["socket", "subprocess", "json", "math"], 1, "subprocess.run()."],
        ["connect_ex() devuelve 0 cuando…", ["El puerto está cerrado", "La conexión fue exitosa (puerto abierto)", "No hay red", "Hay error de sintaxis"], 1, "0 = éxito."],
        ["¿Por qué el parámetro de ping cambia entre -n y -c?", ["Por capricho", "Windows usa -n y Linux/Mac usan -c para la cantidad", "Por la versión de Python", "No cambia"], 1, "Por eso se consulta platform.system()."]
      ])
  ],
  lab: {
    titulo: "Caja de herramientas de soporte en Python",
    pasos: [
      "Uní en `herramientas_soporte.py` un menú con: info del sistema (psutil), diagnóstico de red (escalera), organizador de Descargas, backup con rotación, buscar archivos grandes.",
      "Cada herramienta en su propio módulo `.py` importado desde el menú principal.",
      "Todo con try/except y logging.",
      "Generá un **informe** en TXT con el resultado de info del sistema + red, listo para dárselo a un cliente.",
      "Escribí un `README.md` explicando instalación y uso."
    ],
    entregable: "Proyecto Python modular con README."
  }
},
{
  fase: 5,
  titulo: "Web, Git y GitHub",
  meta: "Entender cómo funciona la web, hacer una página propia y publicar tus proyectos en GitHub como portfolio.",
  lecciones: [
    L("Cómo funciona la web",
      [
        "Cuando escribís una dirección en el navegador:",
        "- 1) El **DNS** traduce el dominio a una IP.",
        "- 2) Se abre una conexión **TCP** al puerto 443 y se negocia el cifrado **TLS** (HTTPS).",
        "- 3) El navegador envía una **petición HTTP** (`GET /index.html`).",
        "- 4) El **servidor web** (Nginx, Apache) responde con un **código de estado** y el contenido.",
        "- 5) El navegador interpreta **HTML** (estructura), **CSS** (diseño) y **JavaScript** (comportamiento).",
        "Códigos de estado: **200** OK, **301/302** redirección, **403** prohibido, **404** no encontrado, **500** error del servidor, **502/503** servidor caído o saturado.",
        "**Frontend** (lo que ve el usuario) vs **backend** (servidor, base de datos, lógica). Una **API** es una puerta para que los programas pidan datos (muchas responden en JSON).",
        "Herramienta clave: **DevTools** del navegador (F12): pestañas Elements, Console, Network (ver cada petición y su código)."
      ],
      [
        "Abrí F12 → Network, recargá una página y mirá cuántas peticiones hace, sus códigos y tiempos.",
        "Entrá a una URL inexistente de un sitio y mirá el 404 en Network.",
        "En la consola (F12 → Console) escribí `document.title` y `2+2`.",
        "Con Python, hacé `requests.get(\"https://api.github.com/users/octocat\").json()` y mirá el JSON que devuelve.",
        "Escribí en la bitácora qué pasa, paso a paso, cuando entrás a google.com."
      ],
      [
        ["¿Qué código HTTP significa «no encontrado»?", ["200", "301", "404", "500"], 2, "404 Not Found."],
        ["¿Qué tecnología define la estructura de una página?", ["CSS", "HTML", "Python", "SQL"], 1, "HTML = estructura; CSS = diseño; JS = comportamiento."],
        ["Un error 500 indica un problema…", ["Del usuario", "Del servidor", "Del DNS", "Del cable"], 1, "Los 5xx son errores del servidor."]
      ]),
    L("HTML: estructura de una página",
      [
        ">><!DOCTYPE html>\n<html lang=\"es\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>Bautista — Técnico en Informática</title>\n</head>\n<body>\n  <header><h1>Bautista</h1><p>Soporte técnico y redes</p></header>\n  <main>\n    <section>\n      <h2>Servicios</h2>\n      <ul><li>Armado y reparación de PC</li><li>Redes Wi-Fi</li></ul>\n    </section>\n    <a href=\"mailto:mi@correo.com\">Contacto</a>\n    <img src=\"foto.jpg\" alt=\"Foto de Bautista\">\n  </main>\n</body>\n</html>",
        "- Las **etiquetas** se abren y cierran: `<p>...</p>`. Algunas no se cierran (`<img>`, `<br>`).",
        "- **Atributos**: `href` (enlace), `src` (origen), `alt` (texto alternativo, importante para accesibilidad).",
        "- Etiquetas **semánticas**: header, nav, main, section, article, footer.",
        "- Títulos `h1`–`h6`, párrafos `p`, listas `ul/ol/li`, tablas `table/tr/td`, formularios `form/input/button`."
      ],
      [
        "En VS Code creá `05-Programacion/web/index.html` con el ejemplo, adaptado a vos.",
        "Instalá la extensión **Live Server** y abrí la página.",
        "Agregá una sección «Proyectos» con una lista de lo que hiciste en el curso (presupuestos, scripts, red en Packet Tracer…).",
        "Agregá una tabla con tus habilidades y nivel.",
        "Validá tu HTML en validator.w3.org."
      ],
      [
        ["¿Qué atributo describe una imagen para lectores de pantalla?", ["src", "alt", "href", "title"], 1, "alt = texto alternativo."],
        ["¿Qué etiqueta crea un enlace?", ["<link>", "<a>", "<href>", "<url>"], 1, "<a href=\"...\">."],
        ["¿Para qué sirve <meta name=\"viewport\">?", ["Para el SEO", "Para que la página se vea bien en celulares", "Para el título", "Para cargar CSS"], 1, "Adaptación a pantallas móviles."]
      ]),
    L("CSS y JavaScript básico",
      [
        "**CSS** da estilo:",
        ">>body { font-family: system-ui, sans-serif; max-width: 800px; margin: auto; padding: 16px; }\nh1 { color: #1d4ed8; }\n.tarjeta { border: 1px solid #ccc; border-radius: 8px; padding: 12px; }\n@media (max-width: 600px) { h1 { font-size: 1.5rem; } }",
        "Selectores: por etiqueta (`h1`), por clase (`.tarjeta`), por id (`#contacto`). Modelo de caja: **margin, border, padding, content**. Layout moderno con **flexbox** y **grid**. `@media` adapta a celulares.",
        "**JavaScript** agrega comportamiento:",
        ">><button id=\"btn\">Calcular</button>\n<p id=\"res\"></p>\n<script>\n  document.getElementById(\"btn\").addEventListener(\"click\", () => {\n    const mbps = Number(prompt(\"Mbps:\"));\n    document.getElementById(\"res\").textContent = (mbps / 8) + \" MB/s\";\n  });\n</script>",
        "La lógica es la misma que en Python (variables, if, for, funciones) con otra sintaxis: llaves `{}` en lugar de indentación, `const`/`let` para variables, `;` al final."
      ],
      [
        "Creá `estilos.css`, enlazalo con `<link rel=\"stylesheet\" href=\"estilos.css\">` y dale estilo a tu página.",
        "Hacé que las tarjetas de proyectos se ordenen con flexbox o grid y que en el celular queden en una columna.",
        "Agregá con JavaScript una calculadora de Mbps → MB/s en tu página.",
        "Probá la página en modo celular con F12 → ícono de dispositivo.",
        "Hacé las primeras lecciones de **freeCodeCamp** (Responsive Web Design) si te quedó tiempo."
      ],
      [
        ["¿Cómo se selecciona una clase en CSS?", ["#clase", ".clase", "clase()", "@clase"], 1, "Punto para clase, numeral para id."],
        ["¿Qué regla CSS adapta el diseño a pantallas chicas?", ["@media", "@import", "@font", "@phone"], 0, "Media queries."],
        ["En JavaScript, los bloques se delimitan con…", ["Indentación", "Llaves {}", "Corchetes []", "begin/end"], 1, "A diferencia de Python."]
      ]),
    L("Git: control de versiones",
      [
        "**Git** guarda la historia de tus archivos: qué cambió, cuándo y por qué. Podés volver atrás y trabajar en equipo sin pisarse.",
        ">>git config --global user.name \"Tu Nombre\"\ngit config --global user.email \"tu@correo.com\"\ngit init                 # crear repositorio en la carpeta\ngit status               # ver cambios\ngit add archivo.py       # preparar (o git add . para todo)\ngit commit -m \"Agrega menú principal\"   # guardar versión\ngit log --oneline        # historial\ngit diff                 # qué cambió\ngit restore archivo.py   # descartar cambios no guardados",
        "Conceptos: **repositorio**, **commit** (foto del proyecto), **rama (branch)** para probar cosas sin romper la principal (`git switch -c nueva-funcion`), **merge** para unir.",
        "Mensajes de commit claros, en presente: «Agrega validación de IP», no «cambios».",
        "Un archivo `.gitignore` indica qué no subir (contraseñas, `.venv`, archivos temporales). **Nunca subas contraseñas ni datos de clientes.**"
      ],
      [
        "Instalá Git (`winget install Git.Git`) y configurá nombre y correo.",
        "Convertí `05-Programacion/python` en repositorio: `git init`, `git add .`, `git commit -m \"Primeros programas\"`.",
        "Hacé un cambio en un programa, mirá `git diff` y hacé un commit.",
        "Creá una rama `prueba`, rompé algo, hacé commit, volvé a `main` y mirá que ahí está intacto.",
        "Creá un `.gitignore` con `.venv/`, `__pycache__/`, `*.log`."
      ],
      [
        ["¿Qué hace git commit?", ["Sube a internet", "Guarda una versión (foto) de los cambios preparados", "Borra archivos", "Crea una rama"], 1, "La subida es git push."],
        ["¿Para qué sirve una rama?", ["Para borrar el historial", "Para trabajar en algo nuevo sin afectar la versión principal", "Para comprimir", "Para cifrar"], 1, "Después se une con merge."],
        ["¿Qué nunca debe subirse a un repositorio?", ["Código", "Contraseñas y datos de clientes", "README", "Imágenes del proyecto"], 1, "Usá .gitignore y variables de entorno."]
      ]),
    L("GitHub y tu portfolio",
      [
        "**GitHub** aloja repositorios Git en la nube. Es tu **portfolio**: los reclutadores miran lo que hiciste, no solo lo que decís.",
        ">>git remote add origin https://github.com/usuario/repo.git\ngit push -u origin main     # subir\ngit pull                    # bajar cambios\ngit clone URL               # copiar un repo",
        "Un buen repositorio tiene:",
        "- **README.md** claro: qué hace, captura de pantalla, cómo instalarlo y usarlo, qué aprendiste.",
        "- Código ordenado y comentado; commits con mensajes descriptivos.",
        "- Licencia (MIT es común).",
        "**GitHub Pages** publica gratis páginas web estáticas: tu `index.html` puede ser tu sitio personal en `usuario.github.io`.",
        "Tu **perfil de GitHub** puede tener un README especial (repo con tu mismo nombre de usuario) con presentación y habilidades.",
        "Markdown básico: `# Título`, `**negrita**`, `- lista`, `` `código` ``, `[enlace](url)`, `![imagen](ruta)`."
      ],
      [
        "Creá tu cuenta en GitHub (con un nombre de usuario profesional) y activá 2FA.",
        "Creá un repo `herramientas-soporte` y subí tu proyecto de Python con un README completo.",
        "Creá un repo `usuario.github.io` con tu página web y activá GitHub Pages.",
        "Creá el README de perfil con: quién sos, qué estudiás, habilidades y proyectos.",
        "Agregá el enlace a tu GitHub en tu página web."
      ],
      [
        ["¿Qué comando sube tus commits a GitHub?", ["git commit", "git push", "git pull", "git add"], 1, "push = empujar al remoto."],
        ["¿Qué archivo explica un proyecto en GitHub?", ["index.html", "README.md", "LICENSE", ".gitignore"], 1, "Es lo primero que se ve."],
        ["¿Qué servicio publica gratis una web estática desde un repo?", ["GitHub Pages", "GitHub Copilot", "Git LFS", "GitHub Issues"], 0, "usuario.github.io."]
      ])
  ],
  lab: {
    titulo: "Tu sitio web profesional publicado",
    pasos: [
      "Terminá tu página personal: presentación, servicios, habilidades, proyectos (con enlaces a GitHub) y contacto.",
      "Que se vea bien en el celular y en la PC.",
      "Publicala con GitHub Pages.",
      "Subí a GitHub al menos 3 repos: herramientas de soporte (Python), scripts (bat/ps1/sh) y la base de datos SQL con consultas.",
      "Pedile a alguien que revise tu sitio desde su celular y anotá sus comentarios."
    ],
    entregable: "Sitio publicado en usuario.github.io + 3 repos con README."
  }
},
{
  fase: 5,
  titulo: "Automatización de sistemas, nube e IA",
  meta: "Llevar la automatización al nivel profesional y conocer las tecnologías que vas a ver en las empresas.",
  lecciones: [
    L("Programador de tareas y cron a fondo",
      [
        "Automatizar es que las cosas pasen **sin que nadie se acuerde**.",
        "**Programador de tareas de Windows** (`taskschd.msc`): desencadenadores (diario, al iniciar, al iniciar sesión, ante un evento), acciones (ejecutar programa), condiciones (solo con corriente, si está inactivo) y configuración (reintentos).",
        "Desde la consola:",
        ">>schtasks /create /tn \"Backup diario\" /tr \"python C:\\scripts\\backup.py\" /sc daily /st 20:00\nschtasks /query /tn \"Backup diario\"\nschtasks /delete /tn \"Backup diario\" /f",
        "Ejecutar «aunque el usuario no haya iniciado sesión» requiere guardar credenciales; ejecutar «con los privilegios más altos» da permisos de admin.",
        "En Linux, **cron**: `minuto hora día mes día_semana comando`. Ejemplos: `*/15 * * * *` cada 15 minutos; `0 9 * * 1-5` lunes a viernes a las 9; `0 3 1 * *` el día 1 de cada mes a las 3.",
        "Siempre: rutas **absolutas**, logging y verificar al día siguiente que corrió."
      ],
      [
        "Creá con `schtasks` una tarea que ejecute tu backup de Python todos los días.",
        "Creá desde la interfaz una tarea que se dispare **al iniciar sesión** y escriba la fecha en un log.",
        "Mirá el historial de ejecución de la tarea y su «Resultado de la última ejecución» (0x0 = éxito).",
        "En la VM Linux, programá con cron un script que guarde `df -h` en un log cada 15 minutos. Verificalo después de media hora.",
        "Escribí 5 expresiones cron con su significado."
      ],
      [
        ["¿Qué significa `0 9 * * 1-5` en cron?", ["Cada 9 minutos", "Lunes a viernes a las 9:00", "El 9 de cada mes", "9 veces por día"], 1, "minuto 0, hora 9, días de semana 1 a 5."],
        ["En el Programador de tareas, el resultado 0x0 significa…", ["Error", "Éxito", "No se ejecutó", "Sin permisos"], 1, "0 = terminó bien."],
        ["¿Por qué usar rutas absolutas en tareas programadas?", ["Son más cortas", "Porque la tarea puede ejecutarse desde otra carpeta de trabajo", "No importa", "Por seguridad"], 1, "Las relativas suelen fallar."]
      ]),
    L("Instalación desatendida y despliegue",
      [
        "En una empresa no instalás 30 PCs a mano. Herramientas:",
        "- **winget** con un archivo de exportación: `winget export -o apps.json` en una PC modelo y `winget import -i apps.json` en las demás.",
        "- **Ninite** (ninite.com): un instalador que instala varios programas gratuitos de una vez.",
        "- **Chocolatey**: gestor de paquetes alternativo para Windows.",
        "- Instaladores silenciosos: muchos `.msi` aceptan `msiexec /i programa.msi /qn` (sin preguntas).",
        "- **Imágenes** con Clonezilla o herramientas de Microsoft (MDT/Autopilot en empresas, con **Intune**).",
        "- **Archivo de respuesta** (autounattend.xml) para que la instalación de Windows no haga preguntas.",
        "Además: **Sysprep** prepara una imagen de Windows para clonarla en otros equipos (genera nuevos identificadores).",
        "El objetivo: que poner una PC en marcha pase de 3 horas a 30 minutos, siempre igual y documentado."
      ],
      [
        "En tu PC ejecutá `winget export -o apps.json` y revisá el archivo.",
        "En la VM de Windows limpia, ejecutá `winget import -i apps.json` (editá antes el archivo para dejar 5 programas).",
        "Armá un instalador en ninite.com con tus programas básicos y probalo en la VM.",
        "Investigá qué hace Sysprep y escribí en qué caso lo usarías.",
        "Actualizá tu `instalar-basicos.ps1` de la semana 6 con lo aprendido."
      ],
      [
        ["¿Qué comando exporta la lista de programas instalados con winget?", ["winget list", "winget export -o apps.json", "winget save", "winget backup"], 1, "Después se usa winget import."],
        ["¿Qué hace msiexec /i programa.msi /qn?", ["Desinstala", "Instala sin interfaz ni preguntas", "Descarga", "Repara"], 1, "/qn = quiet, no UI."],
        ["¿Para qué sirve Sysprep?", ["Limpia virus", "Prepara una imagen de Windows para clonarla en otros equipos", "Formatea", "Acelera Windows"], 1, "Generaliza la instalación."]
      ]),
    L("Nube y servicios para empresas",
      [
        "La **nube** es usar recursos (servidores, almacenamiento, aplicaciones) de un proveedor por internet.",
        "Modelos:",
        "- **SaaS** (software como servicio): Gmail, Microsoft 365, Canva. Usás la aplicación.",
        "- **PaaS** (plataforma): subís tu código y ellos lo corren.",
        "- **IaaS** (infraestructura): alquilás servidores virtuales (AWS, Azure, Google Cloud).",
        "Proveedores: **AWS**, **Microsoft Azure**, **Google Cloud**. Las pymes argentinas usan mucho **Microsoft 365** y **Google Workspace**.",
        "Tareas de soporte en la nube: alta y baja de usuarios, licencias, contraseñas y MFA, permisos de carpetas compartidas (SharePoint/OneDrive/Drive), configurar Outlook en celulares, recuperar archivos de la papelera o versiones anteriores.",
        "**Contenedores (Docker)**: empaquetan una aplicación con todo lo que necesita para correr igual en cualquier lado. Es muy usado en servidores; conocerlo te suma.",
        "Certificaciones de entrada gratuitas o accesibles: **Microsoft AZ-900** (Fundamentos de Azure), **AWS Cloud Practitioner**, **Google Cloud Digital Leader**."
      ],
      [
        "Clasificá en SaaS, PaaS o IaaS: Netflix, Gmail, una VM en Azure, GitHub Pages, Microsoft 365, AWS EC2.",
        "Explorá la consola de administración de Google Workspace o Microsoft 365 con una cuenta de prueba (o mirá un video del panel de administración).",
        "Recuperá en tu OneDrive o Drive una **versión anterior** de un archivo.",
        "Instalá **Docker Desktop** (si tu PC lo soporta) y ejecutá `docker run hello-world`. Si no, investigá qué es un contenedor y anotalo.",
        "Recorré el módulo gratuito de **Microsoft Learn «Fundamentos de Azure»** (al menos la primera unidad)."
      ],
      [
        ["Gmail es un ejemplo de…", ["IaaS", "PaaS", "SaaS", "Hardware"], 2, "Usás la aplicación terminada."],
        ["¿Qué empaqueta Docker?", ["Discos", "Aplicaciones con todo lo que necesitan para correr", "Cables", "Contraseñas"], 1, "Contenedores."],
        ["Alquilar un servidor virtual en AWS es…", ["SaaS", "IaaS", "PaaS", "Freeware"], 1, "Infraestructura como servicio."]
      ]),
    L("Inteligencia artificial como herramienta del técnico",
      [
        "Los asistentes de IA (como Claude, ChatGPT, Copilot, Gemini) son herramientas poderosas para un técnico **si se usan bien**:",
        "- Explicar un mensaje de error o un log.",
        "- Ayudar a escribir o revisar scripts (PowerShell, Python, Bash).",
        "- Redactar informes y mensajes claros para clientes.",
        "- Generar planes de estudio y ejercicios de práctica.",
        "Reglas profesionales:",
        "- **Verificá siempre**: la IA puede equivocarse con seguridad. Probá los comandos primero en una VM, nunca directo en el equipo del cliente.",
        "- **Entendé lo que ejecutás**: si no sabés qué hace un comando, no lo corras.",
        "- **Confidencialidad**: no pegues contraseñas, datos personales ni información de clientes en un chat de IA.",
        "- Usala para aprender más rápido, no para no aprender: en la entrevista y en el trabajo vas a tener que razonar vos.",
        "Buen pedido (prompt): contexto + objetivo + restricciones + formato. Ej.: «Soy técnico, Windows 11, error 0x80070005 al actualizar. Dame posibles causas ordenadas por probabilidad y cómo verificar cada una sin perder datos»."
      ],
      [
        "Pegale a un asistente de IA un error real que hayas visto en el curso y pedile causas ordenadas por probabilidad. Verificá cada una.",
        "Pedile que revise uno de tus scripts de Python y que te explique cada sugerencia. Aplicá solo las que entiendas.",
        "Pedile 10 preguntas de entrevista de soporte técnico y respondelas vos primero; después compará.",
        "Escribí tus propias **reglas de uso de IA** como técnico (5 puntos).",
        "Detectá un error de la IA: pedile algo técnico que vos ya sepas bien (por ejemplo subnetting) y verificá la respuesta."
      ],
      [
        ["La IA te sugiere un comando que no entendés para el equipo de un cliente. ¿Qué hacés?", ["Lo ejecuto igual", "Investigo qué hace y lo pruebo primero en una VM", "Lo ejecuto como admin", "Le pregunto al cliente"], 1, "Nunca ejecutes lo que no entendés."],
        ["¿Qué no debés pegar en un chat de IA?", ["Un mensaje de error genérico", "Contraseñas y datos personales de clientes", "Una pregunta de estudio", "Código de ejemplo"], 1, "Confidencialidad ante todo."],
        ["¿Qué hace bueno a un pedido (prompt)?", ["Que sea cortito", "Contexto, objetivo, restricciones y formato esperado", "Escribirlo en mayúsculas", "Usar emojis"], 1, "Cuanto más contexto, mejor respuesta."]
      ]),
    L("Ciberseguridad práctica: hacia dónde seguir",
      [
        "Después de soporte, muchos técnicos se especializan. Caminos posibles:",
        "- **Redes**: certificación Cisco **CCNA**.",
        "- **Sistemas / servidores**: Windows Server, Active Directory, Linux (certificación **LPI Linux Essentials**, luego **RHCSA**).",
        "- **Ciberseguridad**: **CompTIA Security+**, Cisco CyberOps, práctica en **TryHackMe** y **Hack The Box** (laboratorios legales).",
        "- **Nube**: AZ-900 → AZ-104; AWS.",
        "- **Desarrollo**: Python, web, bases de datos.",
        "- **Soporte**: **CompTIA A+** es la certificación de referencia mundial de lo que estudiaste en este curso; **Google IT Support** (Coursera, con ayuda financiera disponible).",
        "Recursos gratuitos valiosos: Cisco Netacad, Microsoft Learn, freeCodeCamp, TryHackMe (salas gratuitas), Coursera (auditar cursos), YouTube (Professor Messer para A+, en inglés).",
        "El **inglés técnico** es clave: la documentación, los errores y los foros están en inglés. Practicá leyendo documentación oficial."
      ],
      [
        "Creá una cuenta en **TryHackMe** y hacé la sala gratuita introductoria (por ejemplo «Pre Security» o «Intro to Cyber Security»).",
        "Mirá el temario oficial de **CompTIA A+** (Core 1 y Core 2) y marcá qué temas ya viste en este curso.",
        "Elegí un camino de especialización que te interese y escribí por qué.",
        "Leé una página de documentación oficial en inglés (por ejemplo la de `robocopy` en Microsoft Learn) y traducí lo esencial.",
        "Armá tu **plan para después del curso**: 3 certificaciones o cursos con fecha estimada."
      ],
      [
        ["¿Qué certificación es la referencia mundial para soporte técnico?", ["CCNA", "CompTIA A+", "AZ-104", "RHCSA"], 1, "Cubre hardware, SO, redes básicas, seguridad y soporte."],
        ["¿Dónde podés practicar hacking ético de forma legal?", ["En la red del vecino", "En plataformas como TryHackMe o Hack The Box", "En la escuela sin permiso", "En un banco"], 1, "Laboratorios autorizados."],
        ["¿Por qué es importante el inglés técnico?", ["No lo es", "La documentación, los errores y los foros están mayormente en inglés", "Para viajar", "Solo para programar"], 1, "Leer documentación es parte del trabajo diario."]
      ])
  ],
  lab: {
    titulo: "Proyecto integrador de automatización",
    pasos: [
      "Elegí un problema real (tuyo, de tu familia o de un comercio conocido) que se pueda automatizar.",
      "Escribí el análisis: situación actual, tiempo que lleva, propuesta, herramientas.",
      "Desarrollá la solución (Python, PowerShell, Excel con macros o una combinación) con logging y manejo de errores.",
      "Programala con el Programador de tareas o cron si corresponde, y probala varios días.",
      "Subila a GitHub con README y escribí un informe de 1 página con el «antes y después» (tiempo ahorrado)."
    ],
    entregable: "Solución automatizada funcionando + informe antes/después + repo."
  }
}
);
