// FASE 1 — Fundamentos y hardware (semanas 1 a 4)
// Formato de lección: L(título, teoría[], práctica[], preguntas[])
// teoría: "- " = viñeta, ">>" = bloque de código, **negrita**, `código`
// pregunta: [enunciado, [opciones], índiceCorrecto, explicación]

CURSO.semanas.push(
{
  fase: 1,
  titulo: "Cómo funciona una computadora",
  meta: "Entender qué pasa adentro de la PC desde que tocás una tecla hasta que ves el resultado.",
  lecciones: [
    L("Qué es la informática y qué hace un técnico",
      [
        "La informática estudia cómo **procesar información de forma automática**. Una computadora hace siempre el mismo ciclo: **entrada → proceso → salida**, y guarda datos en el **almacenamiento**.",
        "Tu perfil profesional (Técnico en Informática Profesional y Personal) tiene 7 funciones. Este curso las cubre todas:",
        "- Facilitar la operatoria del usuario y capacitarlo.",
        "- Mantener la integridad de los datos (backups, antivirus, recuperación).",
        "- Instalar y poner en marcha equipos, programas y redes.",
        "- Mantener equipos y sistemas (diagnóstico, reemplazo, preventivo).",
        "- Optimizar el ambiente de trabajo y programar pequeñas soluciones.",
        "- Asesorar en compra y venta, armar equipos.",
        "- Autogestionar su trabajo o su propio emprendimiento.",
        "La habilidad más valorada en una pasantía no es saber todo de memoria: es **diagnosticar con método**, buscar información confiable y explicarle al usuario lo que hiciste."
      ],
      [
        "Creá en tu PC una carpeta `Mochila` con subcarpetas: `01-Hardware`, `02-Sistemas`, `03-Redes`, `04-Seguridad`, `05-Programacion`, `06-Profesional`.",
        "Creá dentro de `Mochila` un archivo de texto `bitacora.txt`. Cada día vas a anotar: fecha, qué aprendiste, qué te costó.",
        "Escribí en la bitácora, con tus palabras, las 7 funciones del técnico y un ejemplo real de cada una (ej.: «a mi tía se le borraron fotos» → integridad de datos).",
        "Buscá 3 avisos de pasantías o empleos de soporte técnico/help desk en tu zona (LinkedIn, Computrabajo, Bumeran). Copiá en la bitácora los requisitos que se repiten.",
        "Marcá cuáles de esos requisitos ya sabés y cuáles no. Esa lista es tu punto de partida."
      ],
      [
        ["¿Cuál es el ciclo básico de una computadora?", ["Proceso → entrada → salida", "Entrada → proceso → salida", "Salida → almacenamiento → entrada", "Encendido → BIOS → apagado"], 1, "Recibe datos (entrada), los procesa (CPU) y entrega un resultado (salida)."],
        ["Recuperar fotos borradas de un cliente corresponde a la función de…", ["Comprar/vender", "Autogestión", "Mantener la integridad de los datos", "Optimizar el ambiente"], 2, "Resguardar, reparar y recuperar datos es la función de integridad de datos."],
        ["Según el perfil, ¿qué habilidad es clave para el técnico?", ["Saber soldar placas", "Diagnosticar fallas con método sin afectar los datos del usuario", "Programar sistemas operativos", "Diseñar procesadores"], 1, "El perfil remarca diagnosticar en un tiempo aceptable sin afectar datos ni operatoria."]
      ]),
    L("Sistemas de numeración: binario y hexadecimal",
      [
        "La computadora trabaja con electricidad: hay tensión (1) o no hay (0). Por eso usa **binario** (base 2). Cada dígito es un **bit**; 8 bits forman un **byte**.",
        "Para pasar de binario a decimal, cada posición vale una potencia de 2, de derecha a izquierda: 1, 2, 4, 8, 16, 32, 64, 128.",
        ">>  128 64 32 16  8  4  2  1\n    1   1  0  0  1  0  0  0   = 128+64+8 = 200",
        "Para pasar de decimal a binario: restá la potencia más grande que entre, poné 1, y seguí. Ej.: 37 = 32 + 4 + 1 → `00100101`.",
        "El **hexadecimal** (base 16) usa 0-9 y A-F (A=10 … F=15). Un dígito hex = 4 bits exactos, por eso se usa para colores (`#FF8800`), direcciones MAC (`3C:52:82:1A:FF:01`) e IPv6.",
        "Vas a usar binario de verdad en la fase de redes (máscaras de subred), así que esta lección es la base."
      ],
      [
        "Abrí la Calculadora de Windows → menú → **Programador**. Escribí 200 en DEC y mirá BIN y HEX.",
        "Sin calculadora, pasá a binario en papel: 5, 12, 63, 100, 192, 255. Después verificá con la calculadora.",
        "Pasá a decimal: `1010`, `11110000`, `01111111`, `11000000`.",
        "Pasá a decimal estos hex: `0A`, `1F`, `FF`, `C0`.",
        "En la bitácora, explicá por qué 255 es el número más grande que entra en un byte."
      ],
      [
        ["¿Cuánto es 11000000 en decimal?", ["128", "192", "224", "160"], 1, "128 + 64 = 192. Lo vas a ver mucho en las IP 192.168.x.x."],
        ["¿Cuántos bits tiene un byte?", ["4", "8", "16", "1024"], 1, "Un byte = 8 bits."],
        ["En hexadecimal, F equivale a…", ["15", "16", "10", "F no existe"], 0, "A=10, B=11, C=12, D=13, E=14, F=15."]
      ]),
    L("Unidades de información y medidas",
      [
        "Almacenamiento y memoria se miden en bytes: **KB, MB, GB, TB**. Hay dos convenciones:",
        "- Decimal (fabricantes de discos): 1 KB = 1000 B, 1 GB = 1000³ B.",
        "- Binaria (Windows): 1 KiB = 1024 B, 1 GiB = 1024³ B.",
        "Por eso un disco de «1 TB» aparece en Windows como unos **931 GB**: no le falta nada, es otra unidad. Esto es una pregunta típica de clientes.",
        "La **velocidad de red** se mide en **bits** por segundo (Mbps). La velocidad de descarga en programas suele mostrarse en **bytes** (MB/s). 100 Mbps ÷ 8 ≈ **12,5 MB/s**.",
        "Frecuencias: el procesador se mide en **GHz** (miles de millones de ciclos por segundo). La RAM en **MT/s** o MHz (ej. DDR4-3200).",
        "Otras medidas que vas a usar: **W** (watts) para fuentes, **V** (voltios) en el multímetro: la fuente de PC entrega +12 V, +5 V y +3,3 V."
      ],
      [
        "Abrí **Este equipo**, clic derecho en el disco C: → Propiedades. Anotá capacidad, espacio usado y libre.",
        "Calculá cuánto mostraría Windows para un disco de 500 GB (500 × 1000³ ÷ 1024³). Verificá: ≈ 465,6 GB.",
        "Hacé un test de velocidad en fast.com o speedtest.net. Convertí el resultado de Mbps a MB/s.",
        "Descargá un archivo grande (por ejemplo una ISO de Linux, sin instalarla) y compará la velocidad que muestra el navegador con tu cálculo.",
        "Anotá en la bitácora cómo le explicarías a un cliente por qué su disco «tiene menos espacio»."
      ],
      [
        ["Un cliente tiene internet de 300 Mbps. ¿Qué velocidad de descarga máxima aproximada verá?", ["300 MB/s", "37,5 MB/s", "3 MB/s", "2400 MB/s"], 1, "300 ÷ 8 = 37,5 MB/s."],
        ["¿Por qué un disco de 1 TB se ve como ~931 GB en Windows?", ["Viene fallado", "El fabricante usa base 1000 y Windows base 1024", "Windows ocupa ese espacio", "Por los virus"], 1, "Es una diferencia de unidades, no de capacidad real."],
        ["¿Qué tensiones principales entrega una fuente de PC?", ["220 V y 110 V", "+12 V, +5 V y +3,3 V", "+48 V", "+1 V"], 1, "La fuente convierte 220 V alterna en +12, +5 y +3,3 V continua."]
      ]),
    L("Arquitectura: CPU, memoria, almacenamiento y buses",
      [
        "La mayoría de las computadoras sigue el modelo de **Von Neumann**: una **CPU** que ejecuta instrucciones, una **memoria** donde están el programa y los datos, y **buses** que los conectan con los dispositivos de entrada/salida.",
        "- **CPU**: tiene núcleos (cores), hilos (threads), caché (L1, L2, L3) y frecuencia (GHz). Ejecuta el ciclo **buscar → decodificar → ejecutar**.",
        "- **RAM**: memoria de trabajo, rápida y **volátil** (se borra al apagar).",
        "- **Almacenamiento** (HDD/SSD): lento comparado con la RAM pero **permanente**.",
        "- **GPU**: procesa gráficos; puede ser integrada en la CPU o dedicada (placa de video).",
        "Jerarquía de memoria, de más rápida y chica a más lenta y grande: **registros → caché → RAM → SSD → HDD**.",
        "Regla práctica de soporte: si la PC anda lenta con muchas pestañas abiertas, suele faltar **RAM**. Si tarda mucho en arrancar y abrir programas, suele ser un **disco mecánico (HDD)**. Cambiar HDD por SSD es la mejora más barata y notoria."
      ],
      [
        "Abrí el **Administrador de tareas** (Ctrl + Shift + Esc) → pestaña **Rendimiento**.",
        "Anotá: modelo de CPU, núcleos, procesadores lógicos, velocidad base, caché L3.",
        "En Memoria: cantidad total, velocidad, ranuras usadas. En Disco: ¿es SSD o HDD?",
        "Abrí 15 pestañas del navegador y mirá cómo sube el uso de RAM. Cerralas y mirá cómo baja.",
        "Ejecutá `msinfo32` (Win + R) y guardá un resumen en `01-Hardware/mi-pc.txt`."
      ],
      [
        ["¿Qué memoria se borra al apagar la PC?", ["SSD", "HDD", "RAM", "BIOS"], 2, "La RAM es volátil."],
        ["¿Cuál es la mejora más notoria y barata para una PC lenta con HDD?", ["Más GHz", "Cambiar a SSD", "Otra placa de video", "Otro teclado"], 1, "El SSD reduce mucho los tiempos de arranque y apertura."],
        ["Ordená de más rápida a más lenta:", ["RAM → caché → SSD", "Caché → RAM → SSD → HDD", "HDD → SSD → RAM", "SSD → RAM → caché"], 1, "Registros y caché son lo más rápido; el HDD lo más lento."]
      ]),
    L("Software: firmware, sistema operativo y aplicaciones",
      [
        "El software se organiza en capas:",
        "- **Firmware (BIOS/UEFI)**: vive en un chip de la placa madre. Revisa el hardware al encender (**POST**) y busca desde dónde arrancar.",
        "- **Sistema operativo**: Windows, Linux, macOS, Android. Administra procesos, memoria, archivos, dispositivos y usuarios.",
        "- **Drivers (controladores)**: le enseñan al sistema operativo a usar cada dispositivo.",
        "- **Aplicaciones**: navegador, Office, juegos, etc.",
        "Tipos de licencias: **propietario** (Windows, Office), **libre/open source** (Linux, LibreOffice), **freeware** (gratis pero cerrado), **shareware/trial**. Un técnico serio **no instala software pirata** en equipos de clientes: es ilegal y una fuente común de malware.",
        "Arranque típico: encendido → UEFI → POST → gestor de arranque (Windows Boot Manager o GRUB) → kernel → servicios → inicio de sesión."
      ],
      [
        "Abrí **Configuración → Sistema → Información** y anotá edición y versión de Windows (ej. Windows 11 Home 24H2).",
        "Win + R → `winver`. Compará.",
        "Abrí el **Administrador de dispositivos** (Win + X). Buscá si hay algún dispositivo con signo de advertencia amarillo.",
        "Elegí un dispositivo (ej. adaptador de red) → Propiedades → Controlador. Anotá fabricante, versión y fecha del driver.",
        "Hacé una lista de 10 programas que tengas instalados y clasificalos por tipo de licencia."
      ],
      [
        ["¿Qué hace el POST?", ["Instala Windows", "Verifica el hardware al encender", "Actualiza drivers", "Escanea virus"], 1, "Power-On Self Test: autotest de encendido del firmware."],
        ["Un dispositivo sin driver aparece en el Administrador de dispositivos con…", ["Una tilde verde", "Un ícono de advertencia amarillo", "Nada", "Color azul"], 1, "El signo amarillo indica problema o falta de controlador."],
        ["LibreOffice es software…", ["Propietario", "Libre/open source", "Pirata", "Firmware"], 1, "Es libre y gratuito, buena alternativa legal para clientes."]
      ])
  ],
  lab: {
    titulo: "Ficha técnica de tu PC",
    pasos: [
      "Instalá **CPU-Z** y **CrystalDiskInfo** (desde sus sitios oficiales).",
      "Con CPU-Z completá: CPU (modelo, socket, núcleos), Mainboard (fabricante, modelo, BIOS), Memory (tipo, tamaño, frecuencia), SPD (módulos por ranura).",
      "Con CrystalDiskInfo anotá el estado de salud del disco y las horas de uso.",
      "Armá en `01-Hardware/ficha-mi-pc.txt` una ficha profesional como la que entregarías a un cliente.",
      "Escribí al final 2 recomendaciones de mejora con su justificación (ej. agregar RAM, pasar a SSD)."
    ],
    entregable: "Ficha técnica completa con recomendaciones."
  }
},
{
  fase: 1,
  titulo: "Componentes de hardware",
  meta: "Reconocer cada componente, su función y cómo elegir piezas compatibles.",
  lecciones: [
    L("Placa madre (motherboard)",
      [
        "Es la placa donde se conecta todo. Lo importante para elegirla y diagnosticarla:",
        "- **Socket**: tiene que coincidir con la CPU (ej. AMD **AM4/AM5**, Intel **LGA1700/LGA1851**).",
        "- **Chipset**: define funciones (overclock, cantidad de USB y PCIe). Ej.: AMD B550, B650; Intel B760, Z790.",
        "- **Factor de forma**: ATX (grande), micro-ATX, mini-ITX. Debe entrar en el gabinete.",
        "- **Ranuras de RAM**: tipo (DDR4 o DDR5, no son intercambiables) y cantidad.",
        "- **Slots PCIe** para placa de video; **M.2** para SSD NVMe; puertos **SATA** para discos.",
        "- **Conectores de energía**: ATX de 24 pines y EPS de 4/8 pines para la CPU.",
        "- **Pila CR2032**: mantiene la configuración y la hora del BIOS. Si la PC pierde la hora al desenchufarla, cambiá la pila.",
        "- **Panel frontal (F_PANEL)**: pines del botón de encendido, reset y LEDs."
      ],
      [
        "Con CPU-Z (pestaña Mainboard) identificá el modelo exacto de tu placa.",
        "Buscá el **manual en PDF** en la web del fabricante. Ubicá el diagrama de la placa.",
        "En el manual, encontrá: socket, chipset, RAM máxima soportada, cantidad de M.2 y SATA.",
        "Buscá la página de **«CPU support list»** de tu placa y anotá 3 procesadores compatibles.",
        "Si podés, abrí el gabinete (PC desenchufada, tocá metal para descargarte) y señalá en vivo cada parte que viste en el diagrama."
      ],
      [
        ["¿Qué tiene que coincidir entre CPU y placa madre?", ["El color", "El socket (y el chipset compatible)", "La marca del gabinete", "El tamaño del disco"], 1, "Socket y compatibilidad de chipset/BIOS."],
        ["Una PC pierde la fecha y hora cada vez que se desenchufa. Causa probable:", ["Virus", "Pila CR2032 agotada", "Disco roto", "Falta RAM"], 1, "La pila mantiene la CMOS/RTC sin energía externa."],
        ["¿Se puede poner RAM DDR4 en una placa DDR5?", ["Sí", "No, son físicamente incompatibles", "Solo con adaptador", "Solo en notebooks"], 1, "Tienen distinta muesca y voltaje."]
      ]),
    L("Procesador (CPU) y refrigeración",
      [
        "Marcas: **Intel** (Core i3/i5/i7/i9, Core Ultra) y **AMD** (Ryzen 3/5/7/9). El número de generación importa más que la «i»: un i5 nuevo supera a un i7 viejo.",
        "Al comparar CPUs mirá: **núcleos/hilos**, **frecuencia boost**, **caché**, **TDP** (watts que disipa) y si trae **gráficos integrados** (en AMD suelen ser los modelos «G»; en Intel los que NO terminan en «F»).",
        "La CPU necesita **disipador + ventilador (cooler)** y **pasta térmica** entre ambos. Sin buena refrigeración el procesador hace **thermal throttling**: baja su velocidad para no quemarse.",
        "Temperaturas orientativas: en reposo 30–50 °C, en carga 60–85 °C. Por encima de 90 °C sostenidos hay que revisar.",
        "Mantenimiento: limpiar el polvo con aire comprimido y **cambiar la pasta térmica** cada 2–3 años (antes si se seca)."
      ],
      [
        "Instalá **HWMonitor** o **HWiNFO** y mirá la temperatura de la CPU en reposo.",
        "Abrí un video 4K o un juego durante 5 minutos y volvé a mirar la temperatura máxima.",
        "Comparación de compra: en una tienda online elegí 2 procesadores de precio parecido (uno Intel y uno AMD). Armá una tabla con núcleos, hilos, frecuencia, caché, TDP, gráficos integrados y precio.",
        "Buscá un video de cambio de pasta térmica y anotá los pasos en `01-Hardware/pasta-termica.txt`.",
        "Escribí qué procesador le recomendarías a un estudiante que usa Office y navegador, y por qué."
      ],
      [
        ["¿Qué es el thermal throttling?", ["Overclock automático", "Bajar la velocidad por exceso de temperatura", "Un tipo de pasta térmica", "Un error del BIOS"], 1, "La CPU se protege reduciendo frecuencia."],
        ["Un Ryzen 5 5600 (sin G) en una PC sin placa de video…", ["Funciona igual", "No da imagen: no tiene gráficos integrados", "Usa la GPU de la placa madre", "Da imagen en blanco y negro"], 1, "Necesita placa de video dedicada."],
        ["¿Cada cuánto conviene renovar la pasta térmica?", ["Cada semana", "Cada 2–3 años o si hay temperaturas altas", "Nunca", "Cada vez que se prende"], 1, "Se seca con el tiempo y pierde conductividad."]
      ]),
    L("Memoria RAM",
      [
        "La RAM guarda lo que estás usando ahora. Características:",
        "- **Tipo**: DDR3, DDR4, DDR5 (y LPDDR en notebooks, soldada).",
        "- **Capacidad**: 8 GB es el mínimo hoy; **16 GB** recomendado para uso general; 32 GB para edición/juegos pesados.",
        "- **Velocidad**: DDR4-3200, DDR5-6000 (MT/s). **Latencia** CL (menor es mejor).",
        "- **Formato**: DIMM (escritorio) o **SO-DIMM** (notebook).",
        "**Dual channel**: dos módulos iguales en las ranuras correctas (casi siempre A2 y B2) duplican el ancho de banda. 2×8 GB rinde más que 1×16 GB.",
        "Síntomas de RAM fallada: pantallazos azules aleatorios, reinicios, archivos que se corrompen, pitidos al encender. Se prueba con **Diagnóstico de memoria de Windows** (`mdsched`) o **MemTest86**.",
        "Antes de comprar RAM para ampliar, revisá: tipo, máximo soportado por la placa, ranuras libres y si en la notebook está soldada."
      ],
      [
        "En CPU-Z → pestañas **Memory** y **SPD**: anotá tipo, frecuencia, canales (Single/Dual) y módulos instalados.",
        "En el Administrador de tareas → Memoria: mirá «Ranuras usadas: X de Y».",
        "Ejecutá `mdsched.exe` y programá una prueba para el próximo reinicio (si podés reiniciar ahora, hacelo).",
        "Simulá un pedido: un cliente con notebook de 8 GB DDR4 quiere 16 GB. Buscá en Crucial o en el manual si acepta ampliación y qué módulo comprar.",
        "Anotá el presupuesto y las razones en la bitácora."
      ],
      [
        ["¿Qué configuración rinde más?", ["1×16 GB", "2×8 GB en dual channel", "Da igual", "4×4 GB en ranuras de cualquier color"], 1, "Dual channel duplica el ancho de banda."],
        ["Pantallazos azules aleatorios y archivos corruptos pueden indicar…", ["RAM defectuosa", "Mouse roto", "Monitor viejo", "Poca batería"], 0, "Probá la RAM con mdsched o MemTest86."],
        ["Las notebooks usan módulos…", ["DIMM", "SO-DIMM (o RAM soldada)", "SATA", "M.2"], 1, "SO-DIMM es el formato chico."]
      ]),
    L("Almacenamiento: HDD, SSD SATA y NVMe",
      [
        "- **HDD**: discos magnéticos que giran (5400/7200 RPM). Baratos por GB, lentos (~150 MB/s), frágiles ante golpes.",
        "- **SSD SATA 2,5\"**: memoria flash, ~550 MB/s, ideal para revivir PCs viejas.",
        "- **SSD M.2 NVMe**: conectado por PCIe, 2000–7000+ MB/s. Ojo: hay M.2 **SATA** y M.2 **NVMe**; revisar qué acepta el slot.",
        "Salud del disco: el sistema **S.M.A.R.T.** registra errores. En HDD los atributos críticos son **Reallocated Sectors**, **Pending Sectors** y **Uncorrectable**. En SSD mirá el **% de vida restante** y TBW.",
        "Síntomas de HDD muriendo: ruidos de clic, lentitud extrema, archivos que no abren, «disco al 100%». **Primero se hace backup, después se diagnostica**.",
        "Clonar disco: copiar todo el sistema de un HDD a un SSD con herramientas como **Macrium Reflect**, **Clonezilla** o la del fabricante del SSD."
      ],
      [
        "Abrí CrystalDiskInfo: anotá estado, temperatura, horas de encendido y los atributos 05, C5 y C6 si es HDD.",
        "Instalá **CrystalDiskMark** y medí la velocidad secuencial de lectura/escritura de tu disco.",
        "Win + X → **Administración de discos**: mirá particiones, tipo (GPT/MBR) y sistemas de archivos.",
        "Investigá: para pasar el Windows de un HDD a un SSD nuevo, ¿qué pasos y herramientas usarías? Escribí el procedimiento numerado.",
        "Compará precio por GB de un HDD de 1 TB, un SSD SATA de 1 TB y un NVMe de 1 TB."
      ],
      [
        ["Un disco hace ruidos de clic y está muy lento. ¿Qué hacés primero?", ["Formatear", "Backup de los datos importantes", "Desfragmentar", "Instalar un antivirus"], 1, "Proteger los datos es la prioridad: el disco puede morir en cualquier momento."],
        ["¿Qué atributo S.M.A.R.T. indica sectores dañados reasignados?", ["Power On Hours", "Reallocated Sectors Count (05)", "Temperature", "Start/Stop Count"], 1, "Si crece, el disco se está degradando."],
        ["¿Toda ranura M.2 acepta cualquier SSD M.2?", ["Sí", "No: hay M.2 SATA y M.2 NVMe; hay que ver el manual", "Solo los de 2 TB", "Solo los Samsung"], 1, "Revisar el manual de la placa siempre."]
      ]),
    L("Fuente, gabinete, placa de video y periféricos",
      [
        "**Fuente (PSU)**: convierte 220 V en tensiones de la PC. Elegirla por **potencia real** y **certificación 80 PLUS** (Bronze, Gold…). Una fuente genérica mala puede quemar componentes. Calcular consumo con un calculador online y dejar ~30 % de margen.",
        "**Gabinete**: soporta el factor de forma de la placa, largo de la GPU, altura del cooler y buen flujo de aire (entra adelante/abajo, sale atrás/arriba).",
        "**Placa de video (GPU)**: NVIDIA GeForce, AMD Radeon, Intel Arc. Importa la VRAM y el consumo (conectores PCIe de 6/8 pines o 12VHPWR).",
        "**Puertos y periféricos**: USB 2.0 (negro), 3.x (azul, más rápido), **USB-C** (puede ser datos, video o carga), HDMI, DisplayPort, audio 3,5 mm, RJ-45 (red).",
        "Al conectar el monitor en una PC con placa de video, se conecta **a la placa de video**, no a la salida de la placa madre. Error súper común."
      ],
      [
        "Revisá la etiqueta de tu fuente (si está a la vista) o buscá el modelo. Anotá watts y certificación.",
        "Entrá a un calculador de consumo (ej. el de OuterVision o el de Cooler Master) y calculá cuántos watts necesitaría tu PC.",
        "Identificá todos los puertos de tu PC/notebook y hacé una lista con su uso.",
        "Probá conectar un pendrive en un USB 2.0 y uno 3.0 copiando el mismo archivo grande. Anotá la diferencia de tiempo.",
        "Escribí 3 errores de armado comunes que vas a evitar."
      ],
      [
        ["Un cliente conectó el monitor a la placa madre y no tiene imagen (tiene GPU dedicada). ¿Qué hacés?", ["Cambiar la RAM", "Conectar el cable a la salida de la placa de video", "Formatear", "Cambiar la fuente"], 1, "Con GPU dedicada, la salida integrada suele estar desactivada."],
        ["¿Qué indica la certificación 80 PLUS?", ["Que la fuente tiene 80 W", "La eficiencia de la fuente", "Que tiene 80 cables", "Que es silenciosa"], 1, "Mide eficiencia energética."],
        ["El puerto USB azul suele indicar…", ["USB 1.1", "USB 3.x", "Solo carga", "Puerto de teclado"], 1, "Azul = USB 3.x en la mayoría de equipos."]
      ])
  ],
  lab: {
    titulo: "Presupuesto de 3 PCs",
    pasos: [
      "Armá en una planilla (Excel o LibreOffice Calc) tres presupuestos con precios reales de tiendas argentinas: **Oficina**, **Estudiante/diseño** y **Gamer**.",
      "Para cada uno: CPU, placa madre, RAM, almacenamiento, fuente, gabinete, GPU (si va), sistema operativo.",
      "Verificá la compatibilidad: socket, tipo de RAM, M.2 compatible, potencia de la fuente, tamaño de la placa en el gabinete.",
      "Agregá una columna «Por qué elegí esto» para cada pieza.",
      "Calculá el total y un precio de armado + instalación como servicio."
    ],
    entregable: "Planilla con 3 presupuestos justificados y verificados."
  }
},
{
  fase: 1,
  titulo: "Armado, BIOS/UEFI y mantenimiento físico",
  meta: "Armar, desarmar, configurar el firmware y hacer mantenimiento preventivo con seguridad.",
  lecciones: [
    L("Seguridad eléctrica y herramientas",
      [
        "Antes de abrir un equipo: **desenchufar**, apretar el botón de encendido unos segundos para descargar, y trabajar sobre superficie no alfombrada.",
        "**ESD (descarga electrostática)**: tu cuerpo acumula carga que puede dañar chips sin que lo notes. Usá **pulsera antiestática** o tocá el chasis metálico seguido.",
        "**Nunca abras una fuente** ni un monitor CRT: los capacitores guardan tensión peligrosa aun desenchufados.",
        "Herramientas básicas del técnico: destornilladores Phillips #1 y #2, precisión, pinza, **aire comprimido**, pincel antiestático, alcohol isopropílico, pasta térmica, precintos, **multímetro**, tester de fuente, pendrive booteable con herramientas.",
        "**Multímetro**: para medir continuidad (cables), tensión continua (DC) de la fuente y alterna (AC) del tomacorriente. Siempre elegí la escala correcta antes de medir.",
        "Ordená los tornillos (un recipiente por tipo) y sacá fotos antes de desconectar cables."
      ],
      [
        "Armá una lista de compras de un **kit de herramientas** para técnico con precios.",
        "Mirá un video sobre cómo usar un multímetro para medir una fuente de PC con el conector de 24 pines. Anotá qué color de cable es +12 V (amarillo), +5 V (rojo), +3,3 V (naranja) y masa (negro).",
        "Si tenés multímetro: medí la tensión de una pila AA (debería dar ~1,5 V) y la continuidad de un cable.",
        "Escribí un **protocolo de seguridad** de 8 pasos para abrir un equipo de un cliente.",
        "Guardalo en `01-Hardware/protocolo-seguridad.txt`."
      ],
      [
        ["¿Qué componente NUNCA debe abrir un técnico de PC sin formación específica?", ["El gabinete", "La fuente de alimentación", "La notebook", "El teclado"], 1, "Los capacitores pueden mantener tensión peligrosa."],
        ["¿Para qué sirve la pulsera antiestática?", ["Para no cortarse", "Para evitar descargas electrostáticas que dañan componentes", "Para medir tensión", "Para sostener tornillos"], 1, "Equilibra tu potencial con el del chasis."],
        ["En el conector ATX, el cable amarillo es…", ["+3,3 V", "+5 V", "+12 V", "Masa"], 2, "Amarillo +12 V, rojo +5 V, naranja +3,3 V, negro masa."]
      ]),
    L("Armado paso a paso",
      [
        "Orden recomendado (fuera del gabinete primero):",
        "- 1) CPU en el socket (alinear el triángulo, sin hacer fuerza).",
        "- 2) Cooler con pasta térmica (punto del tamaño de un poroto si no viene aplicada).",
        "- 3) RAM en las ranuras indicadas por el manual (clic en ambos lados).",
        "- 4) SSD M.2 con su tornillo.",
        "- 5) **Prueba en banco**: conectar fuente, GPU si hace falta, monitor y encender. Si entra al BIOS, seguir.",
        "- 6) Montar en el gabinete: separadores (standoffs), placa, fuente, discos, GPU.",
        "- 7) Cables: 24 pines, EPS CPU, PCIe GPU, SATA, panel frontal, USB y audio frontales, ventiladores.",
        "- 8) **Cable management** con precintos para buen flujo de aire.",
        "Si no da imagen: revisar RAM (sacar y volver a poner), cable de monitor en la GPU, conector EPS de CPU y los LEDs de diagnóstico (CPU/DRAM/VGA/BOOT) que traen muchas placas."
      ],
      [
        "Mirá un video completo de armado de PC (recomendado: canales como «Linus Tech Tips — How to build a PC» o equivalentes en español) tomando notas.",
        "Usá un simulador si podés (por ej. **PC Building Simulator** o simuladores web gratuitos) y armá un equipo.",
        "Si tenés una PC vieja disponible: desarmala por completo y volvela a armar, sacando fotos de cada paso.",
        "Escribí tu propio **checklist de armado** de 20 puntos.",
        "Anotá qué harías si al encender todo gira pero no hay imagen."
      ],
      [
        ["¿Por qué conviene la prueba en banco antes de montar en el gabinete?", ["Porque es más lindo", "Para detectar fallas antes de hacer todo el cableado", "Porque lo exige Windows", "No conviene"], 1, "Ahorra tiempo si alguna pieza está fallada."],
        ["Ventiladores giran pero no hay imagen. Primera cosa a revisar:", ["Reinstalar Windows", "RAM bien colocada y cable de video en la GPU", "Cambiar el mouse", "Actualizar drivers"], 1, "Son las causas más frecuentes."],
        ["¿Para qué son los separadores (standoffs)?", ["Decorar", "Evitar que la placa toque el chasis y haga cortocircuito", "Sujetar la RAM", "Enfriar"], 1, "La placa nunca debe apoyar directo sobre el metal."]
      ]),
    L("BIOS/UEFI y arranque",
      [
        "Se entra al firmware apretando **Supr (Del), F2, F10 o Esc** al encender. El **boot menu** de un solo arranque suele ser **F8, F11 o F12**.",
        "**UEFI** es el reemplazo moderno del BIOS: interfaz gráfica, soporta discos **GPT** de más de 2 TB y **Secure Boot**.",
        "Configuraciones que un técnico toca seguido:",
        "- **Orden de arranque** (boot order) para iniciar desde un pendrive.",
        "- **Modo**: UEFI vs Legacy/CSM. Windows 11 exige UEFI, **Secure Boot** y **TPM 2.0** (fTPM en AMD / PTT en Intel).",
        "- **XMP/EXPO**: activa la velocidad real de la RAM.",
        "- **Virtualización** (Intel VT-x / AMD SVM): necesaria para VirtualBox, WSL y Hyper-V.",
        "- Fecha/hora, contraseña de BIOS, ventiladores.",
        "**Load optimized defaults** restaura la configuración de fábrica. **Clear CMOS** (jumper o sacar la pila) sirve si la PC no arranca tras un cambio.",
        "Actualizar BIOS solo cuando hace falta (soporte de CPU nueva, bug), con energía estable y el archivo exacto del modelo."
      ],
      [
        "Reiniciá y entrá al BIOS/UEFI de tu PC (o desde Windows: Configuración → Recuperación → Inicio avanzado → Opciones avanzadas → Configuración de firmware UEFI).",
        "Sin cambiar nada todavía, recorré y anotá: versión de BIOS, orden de arranque, modo (UEFI/CSM), estado de Secure Boot, TPM y virtualización.",
        "Verificá si la virtualización está activa: Administrador de tareas → Rendimiento → CPU → «Virtualización: Habilitado».",
        "Si está deshabilitada, activala (la vas a necesitar la semana que viene para VirtualBox). Guardá con F10.",
        "Win + R → `tpm.msc` para ver la versión de TPM."
      ],
      [
        ["¿Qué requisito de firmware exige Windows 11?", ["Legacy BIOS", "UEFI con Secure Boot y TPM 2.0", "Disco MBR", "Nada especial"], 1, "Son requisitos oficiales de Windows 11."],
        ["Querés arrancar una sola vez desde un pendrive. ¿Qué usás?", ["El boot menu (F8/F11/F12 según la marca)", "El Administrador de tareas", "El Panel de control", "Formatear"], 0, "El boot menu evita cambiar el orden permanente."],
        ["VirtualBox no puede iniciar máquinas de 64 bits. ¿Qué revisás?", ["La RAM", "Que la virtualización (VT-x/SVM) esté activada en el BIOS", "El monitor", "La fuente"], 1, "Sin VT-x/AMD-V no hay máquinas virtuales de 64 bits."]
      ]),
    L("POST, códigos de error y diagnóstico de hardware",
      [
        "Si el POST falla, la placa avisa con **pitidos (beep codes)**, **LEDs de diagnóstico** o un **código en display** (Q-Code). El significado depende del fabricante del BIOS (AMI, Award, Phoenix) — siempre buscá el manual.",
        "Ejemplos comunes en AMI: 1 pitido corto = OK; pitidos largos repetidos = problema de RAM; 1 largo + 2 o 3 cortos = video.",
        "Método de diagnóstico por **mínima configuración**: dejar solo CPU, cooler, 1 módulo de RAM, fuente y video. Si arranca, ir sumando piezas una a una hasta encontrar la culpable.",
        "Síntomas y sospechosos:",
        "- No enciende nada → tomacorriente, fuente, botón del gabinete, cortocircuito.",
        "- Enciende y se apaga enseguida → cooler mal puesto, falta conector EPS, corto.",
        "- Se apaga al jugar → temperatura o fuente insuficiente.",
        "- Rayas o artefactos en pantalla → GPU, cable, monitor.",
        "Para probar la fuente sin placa: **tester de fuente** o el truco del clip entre el cable verde (PS_ON) y un negro (solo para verificar que arranca, con cuidado)."
      ],
      [
        "Buscá la tabla de beep codes de AMI BIOS y copiá en `01-Hardware/beep-codes.txt` los 8 más comunes.",
        "Escribí un **árbol de diagnóstico** (si/entonces) para «La PC no da imagen».",
        "Escribí otro para «La PC se reinicia sola».",
        "Mirá en el manual de tu placa si tiene LEDs de diagnóstico (EZ Debug LED, Q-LED) y qué significan.",
        "Practicá explicar en voz alta, como si fuera un cliente, por qué vas a hacer una prueba de mínima configuración."
      ],
      [
        ["¿Qué es la prueba de mínima configuración?", ["Instalar Windows liviano", "Dejar solo lo esencial para arrancar e ir agregando piezas", "Bajar la resolución", "Desinstalar programas"], 1, "Aísla el componente culpable."],
        ["La PC se apaga solo al jugar. Sospechosos principales:", ["Teclado", "Temperatura o fuente insuficiente", "El navegador", "La pila CMOS"], 1, "La carga alta exige más energía y genera más calor."],
        ["¿Los beep codes significan lo mismo en todas las placas?", ["Sí", "No, dependen del fabricante del BIOS: hay que consultar el manual", "Solo en Intel", "Solo en notebooks"], 1, "AMI, Award y Phoenix tienen tablas distintas."]
      ]),
    L("Mantenimiento preventivo y notebooks",
      [
        "El **mantenimiento preventivo** evita fallas. Plan típico cada 6–12 meses:",
        "- **Físico**: limpieza de polvo (aire comprimido sosteniendo los ventiladores para que no giren), cambio de pasta térmica, revisión de cables y ventiladores ruidosos.",
        "- **Lógico**: actualizaciones de Windows y drivers, limpieza de archivos temporales, revisión de programas de inicio, análisis antivirus, salud del disco y **verificación de backups**.",
        "**Notebooks**: más delicadas. Siempre **desconectar la batería** antes de tocar la placa. Los tornillos suelen ser de distintos largos: anotá dónde va cada uno. Fallas típicas: bisagras rotas, ventilador tapado, batería hinchada (¡no perforar! reemplazar), teclado con líquido.",
        "Batería: `powercfg /batteryreport` genera un informe con la capacidad de diseño vs la actual.",
        "**Registro de trabajo**: cada intervención se documenta (fecha, cliente, problema, qué hiciste, piezas, tiempo, costo). Es parte de tu perfil: autogestión."
      ],
      [
        "Abrí **CMD** y ejecutá `powercfg /batteryreport` (en notebook). Abrí el HTML generado y calculá el % de desgaste.",
        "Ejecutá **Liberador de espacio en disco** (`cleanmgr`) → «Limpiar archivos del sistema» y anotá cuánto liberó.",
        "Administrador de tareas → **Inicio** (Aplicaciones de arranque): deshabilitá lo innecesario y anotá qué dejaste.",
        "Creá una **planilla de órdenes de trabajo** con columnas: N°, fecha, cliente, equipo, problema, diagnóstico, solución, repuestos, horas, precio, estado.",
        "Cargá tu propia PC como el primer «cliente» con el mantenimiento que hiciste hoy."
      ],
      [
        ["Al limpiar con aire comprimido, ¿qué hay que hacer con los ventiladores?", ["Hacerlos girar rápido", "Sostenerlos para que no giren", "Sacarles las aspas", "Mojarlos"], 1, "Girar de más puede dañar el motor o generar corriente."],
        ["Una batería de notebook está hinchada. ¿Qué hacés?", ["La perforás para desinflarla", "La reemplazás y la desechás de forma segura", "La cargás al 100%", "La congelás"], 1, "Una batería de litio hinchada es peligrosa."],
        ["¿Qué comando genera un informe de salud de la batería?", ["ipconfig", "powercfg /batteryreport", "chkdsk", "sfc /scannow"], 1, "Genera battery-report.html."]
      ])
  ],
  lab: {
    titulo: "Servicio técnico completo a tu propia PC",
    pasos: [
      "Hacé un **backup** de tus archivos importantes a un pendrive o a la nube antes de empezar.",
      "Mantenimiento físico: limpieza con PC desenchufada (y pasta térmica si tenés cómo y te animás).",
      "Mantenimiento lógico: actualizaciones, limpieza de disco, programas de inicio, salud del disco con CrystalDiskInfo.",
      "Medí antes y después: tiempo de arranque (cronometrá), temperatura de CPU en reposo, espacio libre en disco.",
      "Completá la orden de trabajo y escribí un **informe para el cliente** de media página, en lenguaje simple."
    ],
    entregable: "Orden de trabajo + informe al cliente con mediciones antes/después."
  }
},
{
  fase: 1,
  titulo: "Instalación de sistemas operativos",
  meta: "Instalar Windows y Linux desde cero, en máquina virtual y en equipo real, con drivers y particiones correctas.",
  lecciones: [
    L("Máquinas virtuales con VirtualBox",
      [
        "Una **máquina virtual (VM)** es una computadora simulada dentro de tu PC. Te deja practicar instalaciones, romper cosas y probar virus de laboratorio sin riesgo.",
        "Conceptos: **host** (tu PC real), **guest** (el sistema dentro de la VM), **hipervisor** (VirtualBox, VMware, Hyper-V).",
        "Para crear una VM elegís: RAM (ej. 4 GB para Windows, 2 GB para Linux liviano), CPU (2 núcleos), disco virtual (VDI de 50 GB dinámico) y la **ISO** de instalación.",
        "Funciones clave:",
        "- **Instantáneas (snapshots)**: guardás el estado y volvés atrás si algo sale mal.",
        "- **Guest Additions**: drivers que mejoran resolución, mouse y carpetas compartidas.",
        "- **Red**: NAT (sale a internet a través del host) o Adaptador puente (la VM aparece como otra PC en tu red).",
        "Si tu PC tiene poca RAM (8 GB), usá 1 VM por vez y un Linux liviano como Lubuntu o Linux Mint XFCE."
      ],
      [
        "Descargá e instalá **VirtualBox** desde virtualbox.org.",
        "Descargá la ISO de **Linux Mint** (Cinnamon o XFCE) o **Ubuntu** desde su sitio oficial.",
        "Creá una VM: 2–4 GB RAM, 2 CPU, 30 GB de disco dinámico. Montá la ISO.",
        "Arrancá la VM en modo «Live» (probar sin instalar) y explorá el escritorio.",
        "Antes de instalar, sacá una **instantánea** llamada «antes de instalar»."
      ],
      [
        ["En virtualización, ¿qué es el host?", ["El sistema instalado dentro de la VM", "La computadora física que ejecuta las VMs", "El instalador", "La ISO"], 1, "Host = anfitrión real; guest = invitado."],
        ["¿Para qué sirve una instantánea (snapshot)?", ["Sacar captura de pantalla", "Guardar el estado de la VM para poder volver atrás", "Comprimir el disco", "Aumentar la RAM"], 1, "Es tu botón de «deshacer» al practicar."],
        ["Querés que la VM aparezca como otro equipo en tu red local. ¿Qué modo de red usás?", ["NAT", "Adaptador puente (bridged)", "Sin red", "Solo anfitrión"], 1, "Bridged le da una IP de tu red real."]
      ]),
    L("Particiones, MBR/GPT y sistemas de archivos",
      [
        "Un disco se divide en **particiones**. La **tabla de particiones** puede ser:",
        "- **MBR**: antigua, máximo 2 TB y 4 particiones primarias. Va con BIOS Legacy.",
        "- **GPT**: moderna, discos enormes, hasta 128 particiones. Va con **UEFI**.",
        "Una instalación UEFI de Windows crea: partición **EFI** (~100 MB, FAT32), **MSR** (16 MB), la partición de **Windows** (NTFS) y **Recuperación** (WinRE).",
        "Sistemas de archivos:",
        "- **NTFS**: Windows. Permisos, archivos grandes, journaling.",
        "- **FAT32**: compatible con todo, pero archivos de máx. **4 GB**.",
        "- **exFAT**: pendrives y discos externos entre Windows y Mac, sin límite de 4 GB.",
        "- **ext4**: Linux. **APFS**: macOS.",
        "**Formatear** crea un sistema de archivos nuevo (los datos se vuelven inaccesibles, pero un formateo rápido no los borra físicamente: a veces se pueden recuperar)."
      ],
      [
        "Abrí **Administración de discos** y anotá el esquema de tu disco (clic derecho en «Disco 0» → Propiedades → Volúmenes → Estilo de partición).",
        "Con un pendrive vacío: formatealo en FAT32, intentá copiar un archivo de más de 4 GB (o simulalo leyendo el error) y después formatealo en exFAT.",
        "Abrí CMD como administrador y escribí `diskpart` → `list disk` → `list volume` → `exit` (solo mirar, no modificar).",
        "En la VM de Linux live abrí **GParted** y mirá el disco virtual vacío.",
        "Anotá en la bitácora qué sistema de archivos recomendarías para: pendrive de un cliente que usa Windows y Mac; disco del sistema Windows; tarjeta de cámara."
      ],
      [
        ["¿Cuál es el límite de tamaño de archivo en FAT32?", ["2 GB", "4 GB", "16 GB", "No tiene"], 1, "Por eso una ISO o película grande no entra en un pendrive FAT32."],
        ["UEFI se usa normalmente con tablas de partición…", ["MBR", "GPT", "FAT", "ext4"], 1, "UEFI + GPT es el estándar moderno."],
        ["Para un disco externo que se usa en Windows y Mac, conviene…", ["NTFS", "ext4", "exFAT", "APFS"], 2, "exFAT es leído y escrito por ambos."]
      ]),
    L("Instalar Linux",
      [
        "Linux es un **kernel**; una **distribución** (distro) le suma herramientas, escritorio e instalador. Distros recomendadas para empezar: **Linux Mint**, **Ubuntu**. En servidores: **Debian**, **Ubuntu Server**, **Rocky Linux**.",
        "Pasos de instalación típicos: idioma → teclado (Español Latinoamericano) → conexión → tipo de instalación (borrar disco o manual) → zona horaria → usuario y contraseña.",
        "Particionado manual básico en Linux: `/` (raíz, ext4), opcional `/home` separado para los datos del usuario, y swap (hoy se suele usar un archivo swap).",
        "**Dual boot**: Windows y Linux en el mismo disco. Se instala primero Windows, después Linux; el gestor **GRUB** permite elegir al arrancar. Antes de tocar particiones de un disco con datos: **backup siempre**.",
        "Linux sirve para revivir equipos viejos, para servidores y para recuperar datos de discos que Windows no puede leer (desde un pendrive live)."
      ],
      [
        "En tu VM, instalá Linux Mint/Ubuntu usando «Borrar disco e instalar».",
        "Cuando termine, quitá la ISO, reiniciá y sacá una instantánea «Linux recién instalado».",
        "Instalá las **Guest Additions** (o `virtualbox-guest-utils`) y ajustá la resolución.",
        "Abrí el gestor de actualizaciones y actualizá todo el sistema.",
        "Explorá el Gestor de software e instalá VLC y GIMP."
      ],
      [
        ["¿Qué es GRUB?", ["Un antivirus", "El gestor de arranque de Linux que permite elegir sistema", "Un sistema de archivos", "Una distro"], 1, "Permite el dual boot."],
        ["En un dual boot, ¿qué se instala normalmente primero?", ["Linux", "Windows", "Da igual siempre", "El BIOS"], 1, "Windows sobrescribe el gestor de arranque, por eso va primero."],
        ["Linux es técnicamente…", ["Un programa de Windows", "Un kernel; las distros agregan el resto", "Una marca de PC", "Un navegador"], 1, "Linux = kernel. Ubuntu/Mint = distribuciones."]
      ]),
    L("Instalar Windows correctamente",
      [
        "Crear el medio de instalación: **Media Creation Tool** de Microsoft o **Rufus** con la ISO oficial (esquema GPT para UEFI).",
        "En la instalación: elegir edición, **«Personalizada: instalar solo Windows»**, eliminar particiones viejas (si se va a reinstalar limpio y los datos ya están respaldados) y elegir el espacio no asignado: Windows crea solo las particiones.",
        "Ediciones: **Home** (hogar), **Pro** (BitLocker, escritorio remoto entrante, unirse a dominio, directivas de grupo). La licencia moderna es **digital** y queda asociada al hardware o a la cuenta Microsoft.",
        "**Postinstalación** (checklist profesional):",
        "- Windows Update completo (varias pasadas).",
        "- Drivers: chipset, video, red, audio desde la web del fabricante.",
        "- Activación de Windows. Navegador, compresor (7-Zip), lector PDF, Office o LibreOffice, antivirus (Defender alcanza en hogar).",
        "- Crear punto de restauración y configurar backup.",
        "Nunca uses «activadores» ni ISOs modificadas: son la principal vía de malware."
      ],
      [
        "Descargá la ISO oficial de Windows 10/11 desde la web de Microsoft.",
        "Creá una VM nueva (4 GB RAM, 60 GB disco, activar EFI y TPM en VirtualBox 7) e instalá Windows. Podés usarlo sin activar para practicar.",
        "Durante la instalación, en la pantalla de discos, mirá las particiones que crea automáticamente.",
        "Después de instalar, hacé el **checklist de postinstalación** y cronometrá cuánto tardás.",
        "Sacá una instantánea «Windows limpio»."
      ],
      [
        ["¿Qué edición de Windows trae BitLocker y escritorio remoto entrante?", ["Home", "Pro", "Las dos", "Ninguna"], 1, "Esas funciones son de Pro/Enterprise."],
        ["¿De dónde conviene descargar los drivers?", ["De cualquier página que aparezca primero", "De la web del fabricante del equipo o componente", "De un «driver booster» pirata", "De foros"], 1, "Fuente oficial = menos problemas y nada de malware."],
        ["¿Cuál es una buena práctica tras instalar?", ["Desactivar actualizaciones", "Crear un punto de restauración", "Instalar 3 antivirus", "Borrar la partición EFI"], 1, "Te deja volver a un estado limpio."]
      ]),
    L("Drivers, actualizaciones y puntos de restauración",
      [
        "Los **drivers** se actualizan desde: Windows Update (opcionales), web del fabricante de la notebook (Dell, Lenovo, HP tienen asistentes) o del componente (NVIDIA, AMD, Intel, Realtek).",
        "Si un driver nuevo da problemas: Administrador de dispositivos → Propiedades → **Revertir al controlador anterior**.",
        "Para video problemático se usa **DDU (Display Driver Uninstaller)** en modo seguro y se instala limpio.",
        "**Restaurar sistema** vuelve archivos de sistema, drivers y registro a un punto anterior **sin tocar documentos personales**. No reemplaza al backup.",
        "**Windows Update**: actualizaciones de calidad (mensuales, «martes de parches») y de características (anuales). Se pueden pausar, no conviene desactivarlas.",
        "Si Windows no arranca: **WinRE** (entorno de recuperación) aparece tras 2–3 arranques fallidos: reparación de inicio, restaurar sistema, desinstalar actualizaciones, modo seguro, símbolo del sistema."
      ],
      [
        "Activá la protección del sistema en C: (Win + R → `sysdm.cpl` → Protección del sistema) si estaba desactivada.",
        "Creá un punto de restauración manual llamado «Antes de pruebas».",
        "Entrá a Windows Update → Historial de actualizaciones y anotá las últimas 3 instaladas.",
        "En la VM de Windows, entrá a WinRE (Configuración → Recuperación → Inicio avanzado) y recorré todas las opciones sin aplicar nada.",
        "Desde WinRE iniciá en **modo seguro** y volvé al modo normal."
      ],
      [
        ["¿Restaurar sistema borra tus documentos?", ["Sí, todos", "No, revierte sistema/drivers/registro pero no documentos", "Solo las fotos", "Solo si es Pro"], 1, "Por eso es útil, pero no reemplaza un backup."],
        ["Un driver nuevo de video causa pantallas negras. Primer intento:", ["Formatear", "Revertir el controlador anterior", "Cambiar la placa", "Desactivar Windows Update para siempre"], 1, "Es rápido y no destructivo."],
        ["¿Qué es WinRE?", ["Un juego", "El entorno de recuperación de Windows", "Un virus", "Un tipo de RAM"], 1, "Aparece cuando Windows no arranca o desde Inicio avanzado."]
      ])
  ],
  lab: {
    titulo: "Pendrive del técnico",
    pasos: [
      "Conseguí un pendrive de 16 GB o más.",
      "Instalá **Ventoy** en el pendrive (permite poner varias ISO y elegir al arrancar).",
      "Copiá: ISO de Windows, ISO de Linux Mint, y si querés **Hiren's BootCD PE** (herramientas de rescate, gratis desde su web oficial).",
      "Creá una carpeta `Portables` con: CPU-Z, CrystalDiskInfo, HWiNFO, 7-Zip portable, navegador portable.",
      "Probá arrancar desde el pendrive en tu PC (boot menu) y verificá que aparece el menú de Ventoy. No instales nada: solo verificá."
    ],
    entregable: "Pendrive booteable multi-ISO funcionando + lista de su contenido."
  }
}
);
