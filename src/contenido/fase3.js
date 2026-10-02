// FASE 3 — Redes (semanas 9 a 12)

CURSO.semanas.push(
{
  fase: 3,
  titulo: "Fundamentos de redes y cableado",
  meta: "Entender cómo viajan los datos y armar el cableado de una red pequeña.",
  lecciones: [
    L("Qué es una red y sus tipos",
      [
        "Una **red** es un conjunto de dispositivos conectados para compartir información y recursos (internet, archivos, impresoras).",
        "Por alcance: **PAN** (Bluetooth, personal), **LAN** (casa, oficina), **WLAN** (LAN inalámbrica), **MAN** (ciudad), **WAN** (países; internet es la WAN más grande).",
        "Topologías: **estrella** (todos a un switch: la más usada hoy), bus, anillo, malla (redundante, típica en Wi-Fi mesh y en internet).",
        "Arquitecturas: **cliente-servidor** (un servidor centraliza servicios) y **punto a punto** (P2P, todos iguales).",
        "Medidas: **ancho de banda** (cuánto puede pasar, Mbps), **latencia** (cuánto tarda, ms), **jitter** (variación de la latencia: arruina las videollamadas) y **pérdida de paquetes**.",
        "Para un usuario, «internet lento» puede ser poco ancho de banda, alta latencia, Wi-Fi débil o un problema del proveedor (ISP). Hay que medir antes de opinar."
      ],
      [
        "Dibujá (en papel o en draw.io) la red de tu casa: módem/router, dispositivos cableados, dispositivos Wi-Fi.",
        "Contá cuántos dispositivos hay conectados entrando a la página del router (normalmente `192.168.0.1` o `192.168.1.1`; la contraseña suele estar en la etiqueta del equipo).",
        "Medí con fast.com: velocidad y latencia por cable (si podés) y por Wi-Fi cerca y lejos del router.",
        "Ejecutá `ping -n 20 8.8.8.8` y anotá latencia mínima, máxima y promedio.",
        "Escribí qué topología tiene tu red y por qué."
      ],
      [
        ["La red de una oficina en un mismo edificio es una…", ["WAN", "LAN", "MAN", "PAN"], 1, "Red de área local."],
        ["¿Qué topología usan casi todas las LAN modernas?", ["Bus", "Anillo", "Estrella", "Ninguna"], 2, "Todo conectado a un switch central."],
        ["Las videollamadas se cortan aunque la velocidad sea buena. Sospechás de…", ["Mucho ancho de banda", "Jitter o pérdida de paquetes", "Poca RAM en el router", "El color del cable"], 1, "La estabilidad importa tanto como la velocidad."]
      ]),
    L("Modelo OSI y TCP/IP",
      [
        "El **modelo OSI** divide la comunicación en 7 capas. Sirve para **diagnosticar por capas**:",
        "- **7 Aplicación** (HTTP, DNS, correo) · **6 Presentación** (cifrado, formatos) · **5 Sesión**",
        "- **4 Transporte**: TCP (confiable, con confirmación) y UDP (rápido, sin confirmación: streaming, juegos, DNS).",
        "- **3 Red**: direcciones **IP** y **routers**.",
        "- **2 Enlace**: direcciones **MAC** y **switches**.",
        "- **1 Física**: cables, señales, Wi-Fi, conectores.",
        "Truco para recordar de abajo hacia arriba: «**F**ísica, **E**nlace, **R**ed, **T**ransporte, **S**esión, **P**resentación, **A**plicación».",
        "El modelo real de internet es **TCP/IP** (4 capas: Acceso a red, Internet, Transporte, Aplicación).",
        "Diagnóstico por capas, de abajo hacia arriba: ¿hay luz en el puerto? (1) → ¿el switch ve la MAC? (2) → ¿tiene IP y hace ping al gateway? (3) → ¿abre el puerto? (4) → ¿la aplicación responde? (7)."
      ],
      [
        "Escribí las 7 capas de memoria con un ejemplo de cada una.",
        "Descargá **Wireshark** (lo vas a usar más adelante) e instalalo.",
        "Clasificá en capas: cable UTP, switch, router, dirección IP, MAC, HTTPS, Wi-Fi, TCP, puerto 443, navegador.",
        "Para el problema «no puedo entrar a una página», escribí qué verificarías en cada capa.",
        "Explicale el modelo a alguien con una analogía (por ejemplo el correo postal) y anotala."
      ],
      [
        ["¿En qué capa trabaja un router?", ["Física", "Enlace", "Red", "Aplicación"], 2, "Enruta con direcciones IP (capa 3)."],
        ["¿Qué protocolo de transporte confirma la entrega?", ["UDP", "TCP", "IP", "ARP"], 1, "TCP es orientado a conexión."],
        ["Un switch trabaja principalmente con…", ["Direcciones IP", "Direcciones MAC", "Nombres de dominio", "Puertos 80"], 1, "Capa 2: MAC."]
      ]),
    L("Cableado UTP, normas y conectores",
      [
        "El cable de red más usado es **UTP** (par trenzado sin blindaje) con conector **RJ-45**. Categorías:",
        "- **Cat 5e**: hasta 1 Gbps. **Cat 6**: 1 Gbps (10 Gbps en tramos cortos). **Cat 6A**: 10 Gbps hasta 100 m.",
        "- Distancia máxima de un tramo: **100 metros**.",
        "Orden de colores **T568B** (el más usado):",
        ">>1 blanco-naranja  2 naranja  3 blanco-verde  4 azul\n5 blanco-azul     6 verde    7 blanco-marrón 8 marrón",
        "**T568A** cambia naranja por verde: blanco-verde, verde, blanco-naranja, azul, blanco-azul, naranja, blanco-marrón, marrón.",
        "**Cable directo**: misma norma en ambos extremos (lo normal hoy). **Cable cruzado**: A en un extremo y B en el otro (antes para PC-PC; hoy casi todos los equipos tienen **Auto MDI-X**).",
        "Otros medios: **fibra óptica** (monomodo para largas distancias, multimodo en edificios; inmune a interferencias), **coaxial** (cablemódem).",
        "Herramientas: crimpeadora, pelacables, **tester de cable**, ponchadora para patch panel y rosetas."
      ],
      [
        "Escribí de memoria el orden T568B tres veces.",
        "Si tenés crimpeadora, cable y fichas: armá un cable directo de 1 m y probalo con tester o conectando una PC al router.",
        "Si no tenés materiales: mirá un video de crimpado completo y anotá cada paso, incluido cuánto destrenzar (máx. ~1,3 cm).",
        "Mirá la inscripción impresa en un cable de red de tu casa: categoría, norma y fabricante.",
        "Presupuestá el cableado de una oficina con 6 puestos: metros de cable, fichas, rosetas, patch panel, switch."
      ],
      [
        ["¿Cuál es la distancia máxima de un tramo UTP?", ["10 m", "50 m", "100 m", "1 km"], 2, "100 metros por norma."],
        ["Primer color en T568B:", ["Blanco-verde", "Blanco-naranja", "Azul", "Marrón"], 1, "B empieza blanco-naranja, naranja."],
        ["¿Qué medio conviene entre dos edificios a 500 m?", ["UTP Cat 6", "Fibra óptica", "Cable USB", "Coaxial de TV"], 1, "La fibra supera ampliamente los 100 m."]
      ]),
    L("Dispositivos de red",
      [
        "- **Módem / ONT**: convierte la señal del proveedor (cable, fibra, ADSL) en una conexión Ethernet. ONT = fibra óptica.",
        "- **Router**: conecta tu red con internet; hace **NAT**, reparte IP por **DHCP** y suele tener firewall. El «router» hogareño es en realidad router + switch + access point en una caja.",
        "- **Switch**: conecta equipos dentro de la LAN y envía cada trama solo al puerto correcto (usa la tabla de MAC). Puede ser **no administrable** o **administrable** (VLAN, monitoreo).",
        "- **Access Point (AP)**: da Wi-Fi a una red cableada.",
        "- **Repetidor / extensor Wi-Fi**: repite la señal (reduce la velocidad a la mitad en muchos casos). **Mesh**: varios nodos coordinados, mejor solución para casas grandes.",
        "- **Hub**: obsoleto; repetía todo a todos los puertos.",
        "- **Firewall**: filtra tráfico según reglas.",
        "- **PoE (Power over Ethernet)**: el cable de red alimenta cámaras IP, APs y teléfonos.",
        "- **Patch panel** y **rack**: organizan el cableado en una oficina."
      ],
      [
        "Identificá cada equipo de red de tu casa y anotá modelo y función.",
        "Entrá a la configuración del router y encontrá: lista de clientes DHCP, nombre de la red Wi-Fi, canal y tipo de seguridad. **No cambies nada todavía.**",
        "Buscá el precio de: un switch de 8 puertos no administrable, uno administrable, un AP y un kit mesh de 2 nodos.",
        "Dibujá la red ideal para una casa de 2 pisos con 3 PCs, 2 Smart TV, cámaras IP y celulares.",
        "Justificá dónde iría cable y dónde Wi-Fi."
      ],
      [
        ["¿Qué dispositivo reparte direcciones IP en una red hogareña?", ["Switch", "El router (servicio DHCP)", "El cable", "La impresora"], 1, "El router suele ser el servidor DHCP."],
        ["¿Qué diferencia a un switch de un hub?", ["El color", "El switch envía cada trama solo al puerto de destino", "El hub es más moderno", "Ninguna"], 1, "El hub repite a todos: más colisiones."],
        ["Una cámara IP se alimenta por el cable de red gracias a…", ["Wi-Fi", "PoE", "USB", "HDMI"], 1, "Power over Ethernet."]
      ]),
    L("Wi-Fi: estándares, bandas y seguridad",
      [
        "Estándares: **Wi-Fi 4** (802.11n), **Wi-Fi 5** (802.11ac), **Wi-Fi 6/6E** (802.11ax), **Wi-Fi 7** (802.11be).",
        "Bandas:",
        "- **2,4 GHz**: más alcance y atraviesa mejor paredes, pero más lenta y saturada. Canales que no se superponen: **1, 6 y 11**.",
        "- **5 GHz**: más rápida, menos alcance, más canales.",
        "- **6 GHz** (Wi-Fi 6E/7): muy rápida, poco alcance.",
        "Seguridad: **WPA2-AES** como mínimo, **WPA3** si todos los equipos lo soportan. **Nunca WEP ni red abierta**. Desactivar **WPS** (tiene vulnerabilidades).",
        "Buenas prácticas: cambiar la contraseña de administración del router, actualizar su firmware, red de **invitados** separada para visitas y dispositivos IoT.",
        "Problemas típicos: interferencia (microondas, otros routers), distancia, paredes de hormigón, router dentro de un mueble."
      ],
      [
        "Instalá una app de análisis Wi-Fi (WiFi Analyzer en Android o **WinFi**/**inSSIDer** en Windows).",
        "Mirá qué canales usan las redes vecinas en 2,4 GHz y cuál es el menos saturado.",
        "En Windows: `netsh wlan show interfaces` muestra señal (%), velocidad, canal y banda de tu conexión.",
        "Generá un informe: `netsh wlan show wlanreport` (como admin) y abrí el HTML.",
        "Recorré tu casa midiendo la señal en cada ambiente y armá un «mapa de calor» a mano."
      ],
      [
        ["¿Qué canales de 2,4 GHz no se superponen?", ["1, 2 y 3", "1, 6 y 11", "5, 10 y 15", "Todos"], 1, "Elegí uno de esos tres."],
        ["¿Qué seguridad Wi-Fi es la más recomendada hoy?", ["WEP", "Abierta", "WPA3 (o WPA2-AES como mínimo)", "WPS"], 2, "WEP se rompe en minutos."],
        ["Un televisor está lejos del router detrás de 3 paredes. ¿Qué banda conecta mejor?", ["5 GHz", "2,4 GHz", "6 GHz", "Ninguna"], 1, "2,4 GHz tiene más alcance."]
      ])
  ],
  lab: {
    titulo: "Relevamiento de red de un cliente",
    pasos: [
      "Hacé un relevamiento profesional de la red de tu casa (o de un familiar con permiso).",
      "Inventario: equipos de red (modelo, ubicación), dispositivos conectados, tipo de conexión del proveedor y plan contratado.",
      "Mediciones: velocidad por cable y Wi-Fi en 3 lugares, latencia, canal Wi-Fi, seguridad configurada.",
      "Detectá al menos 3 problemas o riesgos (contraseña por defecto, WPS activo, canal saturado, firmware viejo…).",
      "Entregá un **informe con diagrama, mediciones y recomendaciones** con presupuesto."
    ],
    entregable: "Informe de relevamiento de red con diagrama y presupuesto."
  }
},
{
  fase: 3,
  titulo: "Direccionamiento IP",
  meta: "Dominar IPv4, máscaras, subredes, DHCP y DNS: lo que más se pregunta en entrevistas de soporte.",
  lecciones: [
    L("Direcciones IPv4 y MAC",
      [
        "Una **IPv4** tiene 32 bits escritos en 4 octetos decimales: `192.168.1.25`. Cada octeto va de 0 a 255.",
        "La **MAC** es la dirección física de la placa de red (48 bits en hex: `3C-52-82-1A-FF-01`). La IP puede cambiar; la MAC viene de fábrica (aunque se puede «falsificar» y los celulares usan MAC aleatoria por red).",
        "**IP privadas** (no salen directo a internet, se usan dentro de las LAN):",
        ">>10.0.0.0    – 10.255.255.255\n172.16.0.0  – 172.31.255.255\n192.168.0.0 – 192.168.255.255",
        "Especiales: `127.0.0.1` (**localhost**, la propia PC); `169.254.x.x` (**APIPA**: la PC no consiguió IP del DHCP → señal de problema); `0.0.0.0`; `255.255.255.255` (broadcast).",
        "La **IP pública** es la que te asigna tu proveedor y con la que te ve internet. Muchos equipos comparten una pública gracias al **NAT** del router."
      ],
      [
        "Ejecutá `ipconfig /all` y anotá: IPv4, máscara, puerta de enlace, servidores DNS, servidor DHCP y dirección física (MAC).",
        "Buscá tu IP pública en una web como ifconfig.me o «cuál es mi IP» y compará con la privada.",
        "Desactivá el DHCP (poné una IP manual inválida) en la VM y mirá qué pasa; o desconectá el cable y reconectá rápido viendo `ipconfig` (si aparece 169.254 es APIPA). Volvé todo a automático.",
        "Ejecutá `ping 127.0.0.1`: ¿por qué responde aunque no haya internet?",
        "Clasificá como privada o pública: 10.5.3.1, 172.20.0.5, 172.40.1.1, 192.168.100.1, 8.8.8.8."
      ],
      [
        ["Una PC tiene la IP 169.254.10.3. ¿Qué significa?", ["Funciona perfecto", "No obtuvo IP del servidor DHCP (APIPA)", "Es una IP pública", "Es el router"], 1, "Revisar cable, Wi-Fi y DHCP."],
        ["¿Cuál de estas es privada?", ["8.8.8.8", "172.20.0.5", "200.45.1.1", "172.40.1.1"], 1, "172.16.0.0 a 172.31.255.255 es privado."],
        ["¿Qué es 127.0.0.1?", ["El router", "La propia computadora (localhost)", "Google", "El DNS"], 1, "Loopback."]
      ]),
    L("Máscara de subred y gateway",
      [
        "La **máscara** indica qué parte de la IP es la **red** y qué parte es el **host**. Se escribe decimal (`255.255.255.0`) o en notación **CIDR** (`/24` = 24 bits de red).",
        ">>IP:      192.168.1.25\nMáscara: 255.255.255.0  (/24)\nRed:     192.168.1.0\nHosts:   192.168.1.1 a 192.168.1.254\nBroadcast: 192.168.1.255",
        "Hosts utilizables = 2^(bits de host) − 2 (se restan la dirección de red y la de broadcast). En /24: 2^8 − 2 = **254**.",
        "Máscaras comunes: `/8` = 255.0.0.0 · `/16` = 255.255.0.0 · `/24` = 255.255.255.0 · `/25` = 255.255.255.128 · `/26` = .192 · `/27` = .224 · `/28` = .240 · `/30` = .252.",
        "Dos equipos se comunican directamente solo si están en la **misma red**. Si el destino está en otra red, el paquete va a la **puerta de enlace (gateway)**, que normalmente es el router (`192.168.1.1`).",
        "Error típico: una PC con IP fija en `192.168.0.50` dentro de una red `192.168.1.0/24` → no se comunica con nadie."
      ],
      [
        "Para cada caso calculá dirección de red, primer host, último host, broadcast y cantidad de hosts: `192.168.10.77/24`, `10.0.5.200/16`, `172.16.4.9/24`.",
        "Verificá tus resultados con una calculadora de subredes online (buscá «subnet calculator»).",
        "Pasá a CIDR: 255.255.255.0, 255.255.0.0, 255.255.255.192, 255.255.255.252.",
        "En tu `ipconfig`, identificá la red de tu casa y cuántos hosts admite.",
        "Explicá en la bitácora para qué sirve la puerta de enlace con un ejemplo."
      ],
      [
        ["¿Cuántos hosts utilizables tiene una /24?", ["256", "254", "255", "128"], 1, "2^8 − 2 = 254."],
        ["255.255.255.192 en CIDR es…", ["/24", "/25", "/26", "/27"], 2, "192 = 11000000 → 24 + 2 = 26 bits."],
        ["PC 192.168.1.10/24 quiere llegar a 8.8.8.8. ¿A quién le envía el paquete?", ["Directo a 8.8.8.8", "A la puerta de enlace", "Al switch", "A sí misma"], 1, "Otra red → gateway."]
      ]),
    L("Subnetting práctico",
      [
        "**Subnetear** es dividir una red en redes más chicas: separar áreas (administración, invitados, cámaras), mejorar seguridad y ordenar.",
        "Método rápido con el **número mágico** (para el último octeto): tamaño de bloque = 256 − valor de la máscara en ese octeto.",
        ">>/26 → máscara .192 → bloque 256−192 = 64\nRedes: .0  .64  .128  .192\nRed .64: hosts .65 a .126, broadcast .127",
        "¿Qué máscara necesito para N hosts? Buscá la potencia de 2 que alcance N + 2:",
        "- 50 hosts → 64 → 6 bits de host → **/26**.",
        "- 10 hosts → 16 → 4 bits → **/28**.",
        "- 2 hosts (enlace punto a punto) → 4 → **/30**.",
        "¿Cuántas subredes salen? 2^(bits que pediste prestados). Dividir una /24 en /26 = 2 bits prestados = **4 subredes** de 62 hosts.",
        "La práctica es lo que te da velocidad: en entrevistas te pueden pedir que lo hagas en el momento."
      ],
      [
        "Dividí `192.168.10.0/24` en 4 subredes iguales. Escribí red, rango de hosts y broadcast de cada una.",
        "Dividila en 8 subredes: ¿qué máscara? ¿cuántos hosts por subred?",
        "Para una empresa: Administración 25 hosts, Ventas 50, Invitados 100, Enlace router-router 2. Asigná subredes de `192.168.20.0/24` empezando por la más grande (VLSM).",
        "¿En qué subred está `192.168.10.150/27`? Calculá red y broadcast.",
        "Hacé 10 ejercicios en un sitio de práctica como **subnettingpractice.com** y cronometrate."
      ],
      [
        ["¿Cuál es el tamaño de bloque de una /27?", ["16", "32", "64", "128"], 1, "Máscara .224 → 256 − 224 = 32."],
        ["Necesitás 50 hosts. ¿Qué máscara mínima?", ["/27", "/26", "/25", "/28"], 1, "/26 da 62 hosts."],
        ["¿Broadcast de 192.168.10.150/27?", ["192.168.10.159", "192.168.10.127", "192.168.10.191", "192.168.10.255"], 0, "Bloques de 32: .128–.159 → broadcast .159."]
      ]),
    L("DHCP, DNS y NAT",
      [
        "**DHCP** asigna automáticamente IP, máscara, gateway y DNS. Proceso **DORA**: Discover → Offer → Request → Acknowledge. Las asignaciones duran un tiempo (**lease**). Una **reserva DHCP** asocia una MAC a una IP fija (ideal para impresoras y servidores).",
        "**DNS** traduce nombres a IP (`google.com` → `142.250.x.x`). Tipos de registro: **A** (IPv4), **AAAA** (IPv6), **CNAME** (alias), **MX** (correo), **TXT**. DNS públicos: `8.8.8.8` (Google), `1.1.1.1` (Cloudflare), `9.9.9.9` (Quad9, filtra sitios maliciosos).",
        "Si hay internet por IP pero no abren las páginas por nombre → problema de **DNS**. `ipconfig /flushdns` limpia la caché.",
        "El archivo `C:\\Windows\\System32\\drivers\\etc\\hosts` resuelve nombres antes que el DNS (el malware a veces lo modifica).",
        "**NAT** permite que muchas IP privadas salgan por una sola IP pública. **Port forwarding (abrir puertos)**: redirige un puerto de la IP pública a un equipo interno (ej. un DVR de cámaras). Abrir puertos es un riesgo: hacerlo solo si hace falta y con contraseñas fuertes; mejor usar VPN.",
        "**CGNAT**: muchos proveedores comparten una IP pública entre varios clientes; ahí el port forwarding no funciona."
      ],
      [
        "Ejecutá `ipconfig /release` y `ipconfig /renew` y observá la nueva asignación.",
        "Usá `nslookup google.com` y `nslookup google.com 1.1.1.1`. Compará.",
        "Buscá los registros MX de un dominio: `nslookup -type=mx gmail.com`.",
        "Abrí con el Bloc de notas (como admin) el archivo `hosts` y mirá su contenido. No lo modifiques.",
        "En el router, buscá la sección DHCP: rango de direcciones, tiempo de concesión y si permite reservas."
      ],
      [
        ["Hay ping a 8.8.8.8 pero no abre google.com. ¿Qué falla?", ["El cable", "El DNS", "La RAM", "El monitor"], 1, "La conectividad IP anda; falla la resolución de nombres."],
        ["¿Qué significa DORA en DHCP?", ["Discover, Offer, Request, Acknowledge", "Data, Order, Route, Access", "Download, Open, Run, Apply", "Nada"], 0, "Las 4 fases de la asignación."],
        ["Para que una impresora tenga siempre la misma IP sin configurarla a mano:", ["Reserva DHCP por MAC", "Cambiar el cable", "Apagar el DHCP", "Usar 169.254"], 0, "La reserva fija la IP desde el router."]
      ]),
    L("Puertos, protocolos e IPv6",
      [
        "Un **puerto** identifica el servicio dentro de un equipo (IP:puerto). Puertos conocidos que hay que saber:",
        ">>20/21 FTP      22 SSH      23 Telnet   25 SMTP\n53 DNS        67/68 DHCP  80 HTTP     110 POP3\n143 IMAP      443 HTTPS   445 SMB (carpetas compartidas)\n3389 RDP (escritorio remoto)   3306 MySQL",
        "Correo: **SMTP** envía (puertos 587/465 con cifrado), **IMAP** sincroniza (993 cifrado) y **POP3** descarga (995).",
        "Protocolos inseguros (texto plano): Telnet, FTP, HTTP. Sus reemplazos seguros: **SSH**, **SFTP**, **HTTPS**.",
        "**IPv6**: 128 bits en hexadecimal (`2800:810:4b2:1a::25`). Resuelve la falta de direcciones de IPv4. `::` reemplaza grupos de ceros. `fe80::` son direcciones locales de enlace; `::1` es localhost. Muchos proveedores argentinos ya entregan IPv6."
      ],
      [
        "Ejecutá `netstat -ano` y encontrá qué puertos están escuchando (LISTENING) en tu PC.",
        "Con `tasklist /FI \"PID eq NUMERO\"` identificá qué programa usa uno de esos puertos.",
        "Probá si un puerto responde: `Test-NetConnection google.com -Port 443` en PowerShell.",
        "Mirá si tenés IPv6 en `ipconfig` y probá en test-ipv6.com.",
        "Hacé flashcards en papel con los 15 puertos de la lista y repasalos hasta saberlos."
      ],
      [
        ["¿Qué puerto usa el escritorio remoto de Windows?", ["22", "80", "3389", "445"], 2, "RDP = 3389."],
        ["¿Cuál es el reemplazo seguro de Telnet?", ["FTP", "SSH", "HTTP", "SMB"], 1, "SSH cifra la sesión."],
        ["¿Cuántos bits tiene una dirección IPv6?", ["32", "64", "128", "256"], 2, "IPv6 = 128 bits."]
      ])
  ],
  lab: {
    titulo: "Plan de direccionamiento de una pyme",
    pasos: [
      "Empresa ficticia «Ferretería del Litoral»: 12 PCs administración, 20 PCs ventas, 8 cámaras IP, 4 impresoras, Wi-Fi para 40 clientes.",
      "Partiendo de `192.168.50.0/24`, diseñá subredes para: Administración, Ventas, Cámaras, Impresoras/servidores, Invitados.",
      "Armá una planilla con: subred, máscara, gateway, rango DHCP, IPs fijas reservadas (impresoras, servidor, cámaras).",
      "Definí qué DNS usar y por qué.",
      "Justificá por qué separar invitados y cámaras del resto mejora la seguridad."
    ],
    entregable: "Planilla de direccionamiento con justificación."
  }
},
{
  fase: 3,
  titulo: "Configuración de redes",
  meta: "Configurar routers, compartir recursos y simular redes de empresa con Cisco Packet Tracer.",
  lecciones: [
    L("Configurar un router hogareño",
      [
        "Checklist profesional al instalar un router:",
        "- Cambiar la **contraseña de administración** (nunca dejar admin/admin).",
        "- **Actualizar el firmware**.",
        "- Wi-Fi: nombre (SSID) sin datos personales, **WPA2/WPA3**, contraseña larga, **WPS desactivado**.",
        "- Separar o unificar bandas (band steering) según los dispositivos.",
        "- Elegir canales poco saturados.",
        "- **Red de invitados** aislada.",
        "- DHCP: rango y **reservas** para impresoras/cámaras.",
        "- Desactivar **UPnP** si no se necesita y la administración remota desde internet.",
        "- Anotar todo en la ficha del cliente (y entregarle las contraseñas en papel o gestor, nunca por WhatsApp sin cuidado).",
        "Modos útiles: **router**, **access point** (para usar un router viejo como AP, desactivando su DHCP), **repetidor**.",
        "Reset de fábrica: botón reset 10–30 s. Usarlo solo si no hay otra opción: se pierde toda la configuración."
      ],
      [
        "Usá un **emulador de router** online (TP-Link y otras marcas publican simuladores de su interfaz web) para recorrer toda la configuración sin riesgo.",
        "En tu router real (con permiso del dueño): verificá la versión de firmware y si hay actualización.",
        "Revisá si WPS está activo y si hay red de invitados.",
        "Escribí la **ficha de red del cliente**: modelo, IP de administración, SSID, seguridad, canal, rango DHCP, reservas.",
        "Escribí el procedimiento para convertir un router viejo en access point."
      ],
      [
        ["Al usar un router viejo como access point, ¿qué hay que desactivarle?", ["El Wi-Fi", "Su servidor DHCP", "Las luces", "Los puertos LAN"], 1, "Si no, habría dos DHCP repartiendo IPs."],
        ["¿Qué conviene hacer con WPS?", ["Dejarlo siempre activo", "Desactivarlo", "Usarlo como contraseña", "Nada"], 1, "WPS tiene vulnerabilidades conocidas."],
        ["Lo primero al instalar un router nuevo:", ["Abrir todos los puertos", "Cambiar la contraseña de administración", "Desactivar el firewall", "Poner red abierta"], 1, "Credenciales por defecto = riesgo."]
      ]),
    L("Compartir archivos e impresoras",
      [
        "En Windows se comparte con **SMB** (puerto 445):",
        "- Perfil de red **Privado** (no Público) para que el equipo sea visible.",
        "- Carpeta → Propiedades → Compartir → elegir usuarios y permisos.",
        "- Acceso: Explorador → `\\\\NOMBRE-PC` o `\\\\192.168.1.20`.",
        "- **Asignar unidad de red**: «Este equipo» → Conectar unidad de red, o `net use Z: \\\\SERVIDOR\\Datos /persistent:yes`.",
        "Requiere una cuenta con contraseña en el equipo que comparte. Evitar el acceso «Todos» con Control total.",
        "Para impresoras compartidas: compartir desde el equipo donde está conectada, o mejor conectarla **directo a la red** con IP fija.",
        "En pymes se usa un **NAS** (Synology, QNAP, o una PC con TrueNAS/OpenMediaVault): almacenamiento en red con usuarios, permisos, RAID y backups.",
        "Entre Linux y Windows se comparte con **Samba**."
      ],
      [
        "Asegurate de que tu red esté como **Privada** (Configuración → Red → Propiedades).",
        "Compartí una carpeta desde tu PC y accedé desde la VM (modo puente) o desde otra PC con `\\\\IP`.",
        "Mapeala como unidad Z: con `net use`.",
        "Listá recursos compartidos con `net share` y conexiones con `net use`.",
        "Investigá qué es RAID 1 y RAID 5 y por qué **RAID no es backup**. Anotalo."
      ],
      [
        ["¿Qué protocolo usa Windows para compartir carpetas?", ["FTP", "SMB", "HTTP", "SSH"], 1, "SMB, puerto 445."],
        ["¿En qué perfil de red conviene compartir archivos?", ["Público", "Privado", "Cualquiera", "Ninguno"], 1, "El perfil Público oculta el equipo."],
        ["¿RAID 1 reemplaza al backup?", ["Sí", "No: protege ante falla de un disco, no ante borrados, virus o robo", "Solo en Linux", "Solo si son SSD"], 1, "Si borrás un archivo, se borra en los dos discos."]
      ]),
    L("Cisco Packet Tracer: primera red",
      [
        "**Packet Tracer** es el simulador gratuito de Cisco. Se descarga creando una cuenta en **Cisco Networking Academy (netacad.com)**, donde además hay cursos gratis con certificado (muy valorados en el CV).",
        "Con Packet Tracer armás redes con routers, switches, PCs y servidores, y ves cómo viajan los paquetes (modo **Simulación**).",
        "Primera red:",
        "- 1 switch 2960, 3 PCs, cables **directos** (Copper Straight-Through).",
        "- Configurar cada PC: Desktop → IP Configuration → `192.168.1.10/24`, `.11`, `.12`.",
        "- Probar: Desktop → Command Prompt → `ping 192.168.1.11`.",
        "- Modo Simulación: ver el ARP y el ICMP paso a paso.",
        "Comandos básicos de un equipo Cisco (CLI):",
        ">>enable\nconfigure terminal\nhostname SW-OFICINA\nend\nshow running-config\nshow mac address-table\ncopy running-config startup-config"
      ],
      [
        "Creá tu cuenta en netacad.com y descargá Packet Tracer.",
        "Inscribite en el curso gratuito **«Networking Basics»** o **«Getting Started with Cisco Packet Tracer»**.",
        "Armá la red de 3 PCs y un switch. Hacé ping entre todas.",
        "En modo Simulación, seguí un ping y anotá qué protocolos aparecen (ARP, ICMP).",
        "En el switch, ejecutá `show mac address-table` después de los pings."
      ],
      [
        ["¿Qué comando muestra la configuración actual de un equipo Cisco?", ["show running-config", "ipconfig", "ls", "config show"], 0, "show run, abreviado."],
        ["¿Qué protocolo descubre la MAC a partir de una IP?", ["DNS", "ARP", "DHCP", "HTTP"], 1, "ARP aparece antes del primer ping."],
        ["¿Qué guarda `copy running-config startup-config`?", ["Nada", "La configuración actual para que sobreviva un reinicio", "Un backup en la nube", "Los logs"], 1, "Si no lo hacés, al reiniciar se pierde."]
      ]),
    L("Router, DHCP y varias redes en Packet Tracer",
      [
        "Ahora unimos dos redes con un router Cisco (ej. 2911):",
        ">>enable\nconf t\ninterface g0/0\n ip address 192.168.1.1 255.255.255.0\n no shutdown\ninterface g0/1\n ip address 192.168.2.1 255.255.255.0\n no shutdown\nend",
        "Cada PC usa como **gateway** la IP del router en su red.",
        "DHCP en el router:",
        ">>conf t\nip dhcp excluded-address 192.168.1.1 192.168.1.9\nip dhcp pool OFICINA\n network 192.168.1.0 255.255.255.0\n default-router 192.168.1.1\n dns-server 8.8.8.8\nend",
        "Seguridad básica del equipo: `enable secret`, contraseñas en consola, `service password-encryption`, banner de aviso.",
        "**VLAN** (introducción): divide un switch en varias redes lógicas (ej. VLAN 10 Administración, VLAN 20 Invitados). Es como tener varios switches en uno."
      ],
      [
        "En Packet Tracer: 2 switches, 2 redes de 2 PCs cada una, un router en el medio.",
        "Configurá las interfaces del router y los gateways de las PCs. Hacé ping de una red a la otra.",
        "Configurá DHCP en el router para la red 192.168.1.0 y poné esas PCs en DHCP.",
        "Agregá `enable secret` y guardá la configuración.",
        "Guardá el archivo `.pkt` en `03-Redes/` y sacá una captura de la topología."
      ],
      [
        ["¿Qué hace `no shutdown` en una interfaz?", ["La apaga", "La activa", "La borra", "Le cambia la IP"], 1, "Las interfaces de router vienen apagadas."],
        ["¿Qué gateway usa una PC de la red 192.168.2.0/24 en el ejemplo?", ["192.168.1.1", "192.168.2.1", "8.8.8.8", "Ninguno"], 1, "La IP del router en su propia red."],
        ["¿Para qué sirve una VLAN?", ["Para acelerar el Wi-Fi", "Para dividir un switch en varias redes lógicas", "Para cifrar", "Para dar energía"], 1, "Separa tráfico sin comprar más switches."]
      ]),
    L("Acceso remoto y VPN",
      [
        "El soporte remoto ahorra viajes. Herramientas:",
        "- **AnyDesk**, **TeamViewer**, **RustDesk** (open source): el usuario te da un código y vos ves su pantalla.",
        "- **Asistencia rápida** de Windows (Quick Assist): incluida en Windows.",
        "- **Escritorio remoto (RDP)**: para Windows Pro dentro de una red o vía VPN. **Nunca expongas el puerto 3389 a internet**: es uno de los vectores de ataque de ransomware más usados.",
        "- **SSH** para Linux y equipos de red.",
        "**VPN**: túnel cifrado entre un equipo y una red remota, como si estuvieras adentro. Opciones: **WireGuard**, OpenVPN, **Tailscale** (muy fácil, basado en WireGuard), VPN integradas en routers.",
        "Ética del soporte remoto: siempre con **consentimiento**, el usuario ve lo que hacés, no accedés a datos personales, cerrás la sesión al terminar.",
        "Alerta: los estafadores se hacen pasar por soporte técnico para que la víctima instale AnyDesk. Enseñale a tus clientes a **no dar códigos a desconocidos**."
      ],
      [
        "Instalá **RustDesk** o AnyDesk en tu PC y en la VM (o en la PC de un familiar con permiso) y conectate.",
        "Probá Asistencia rápida de Windows (Win + Ctrl + Q) entre dos equipos.",
        "Habilitá Escritorio remoto en la VM de Windows (si es Pro) y conectate con `mstsc` desde tu PC usando la IP local.",
        "Investigá Tailscale: cómo conectarías la PC de un cliente con tu notebook de forma segura.",
        "Escribí un mensaje modelo para advertir a clientes sobre estafas de falso soporte técnico."
      ],
      [
        ["¿Por qué no abrir el puerto 3389 (RDP) a internet?", ["Es lento", "Es blanco frecuente de ataques y ransomware", "No funciona", "Lo prohíbe la ley"], 1, "Usá VPN para acceder."],
        ["¿Qué herramienta de soporte remoto viene incluida en Windows?", ["AnyDesk", "Asistencia rápida (Quick Assist)", "TeamViewer", "WinRAR"], 1, "Win + Ctrl + Q."],
        ["¿Qué hace una VPN?", ["Acelera internet", "Crea un túnel cifrado hacia una red remota", "Elimina virus", "Cambia el DNS"], 1, "Te conecta de forma segura como si estuvieras adentro."]
      ])
  ],
  lab: {
    titulo: "Red de la ferretería en Packet Tracer",
    pasos: [
      "Usando tu plan de direccionamiento de la semana pasada, armá en Packet Tracer la red de «Ferretería del Litoral».",
      "Router con 2 o 3 interfaces (o subinterfaces si te animás con VLAN), switches por área, PCs, impresora y un servidor.",
      "DHCP configurado para PCs; IP fija para impresoras y servidor.",
      "Probá conectividad entre todas las áreas y documentá las pruebas.",
      "Guardá el `.pkt` y un documento con la topología y la configuración del router."
    ],
    entregable: "Archivo .pkt funcional + documentación."
  }
},
{
  fase: 3,
  titulo: "Diagnóstico de redes",
  meta: "Encontrar la causa de cualquier problema de conexión con comandos y método por capas.",
  lecciones: [
    L("ping y tracert",
      [
        "**ping** envía paquetes ICMP y mide si hay respuesta y cuánto tarda.",
        ">>ping 192.168.1.1        (¿llego al router?)\nping 8.8.8.8             (¿llego a internet por IP?)\nping google.com          (¿funciona el DNS?)\nping -t 8.8.8.8          (continuo; Ctrl+C corta)\nping -n 100 8.8.8.8      (100 paquetes: ver pérdida)",
        "Ese orden es la **escalera de diagnóstico**: si falla el router, el problema es local; si anda el router pero no 8.8.8.8, es el proveedor o el módem; si anda 8.8.8.8 pero no google.com, es DNS.",
        "Respuestas: «Tiempo de espera agotado» (no hay respuesta, o un firewall bloquea ICMP), «Host de destino inaccesible» (no hay ruta), «Error general».",
        "**tracert** (en Linux `traceroute`) muestra cada salto (router) hasta el destino y dónde se demora o corta. `pathping` combina ambos y mide pérdida por salto."
      ],
      [
        "Hacé la escalera completa: ping a 127.0.0.1, a tu IP, al gateway, a 8.8.8.8 y a google.com.",
        "Ejecutá `tracert google.com` y contá los saltos. Identificá cuál es tu router y cuál el primer salto del proveedor.",
        "Ejecutá `pathping 8.8.8.8` (tarda unos minutos) y mirá en qué salto hay pérdida.",
        "Hacé `ping -n 100 8.8.8.8` por Wi-Fi y por cable y compará pérdida y promedio.",
        "Escribí la escalera de diagnóstico como diagrama de flujo."
      ],
      [
        ["Ping al router OK, ping a 8.8.8.8 falla. El problema está…", ["En la placa de red de la PC", "Entre el router y el proveedor (módem/ISP)", "En el DNS", "En el navegador"], 1, "La red local funciona; la salida a internet no."],
        ["¿Qué comando muestra los saltos hasta un destino?", ["ping", "tracert", "ipconfig", "arp"], 1, "tracert / traceroute."],
        ["Ping a 8.8.8.8 OK pero a google.com falla. Culpable:", ["Cable", "DNS", "Wi-Fi", "Router apagado"], 1, "Si la IP responde, la conexión anda."]
      ]),
    L("ipconfig, netsh, arp y netstat",
      [
        ">>ipconfig /all          (todo: IP, MAC, DNS, DHCP)\nipconfig /release /renew  (pedir IP nueva)\nipconfig /flushdns     (limpiar caché DNS)\narp -a                 (tabla IP ↔ MAC conocida)\nnetstat -ano           (conexiones y puertos con PID)\nnslookup dominio       (consultar DNS)\nnetsh wlan show profiles             (redes Wi-Fi guardadas)\nnetsh wlan show profile \"Red\" key=clear   (ver la clave guardada)\nnetsh int ip reset  y  netsh winsock reset (resetear pila de red)",
        "En Linux: `ip a` (direcciones), `ip r` (rutas), `ss -tulpn` (puertos), `dig` o `nslookup`, `nmcli`.",
        "**Restablecer red** en Windows (Configuración → Red → Configuración de red avanzada → Restablecimiento de red) reinstala adaptadores y borra configuraciones: útil tras malware o VPNs que dejaron todo roto.",
        "**Conflicto de IP**: dos equipos con la misma IP → Windows avisa, la conexión es intermitente. Se ve con `arp -a` y en la lista DHCP del router."
      ],
      [
        "Ejecutá `arp -a` y identificá la MAC de tu router.",
        "Usá `netsh wlan show profiles` y recuperá la clave de tu Wi-Fi con `key=clear` (útil cuando un cliente olvidó su contraseña).",
        "Con `netstat -ano | findstr ESTABLISHED` mirá a qué IPs está conectada tu PC ahora.",
        "En la VM Linux ejecutá `ip a`, `ip r` y `ss -tulpn`.",
        "Armá una tabla de equivalencias Windows ↔ Linux para 8 comandos de red."
      ],
      [
        ["¿Cómo recuperás la clave de un Wi-Fi guardado en Windows?", ["ipconfig /all", "netsh wlan show profile \"Red\" key=clear", "arp -a", "ping"], 1, "Muestra el «Contenido de la clave»."],
        ["¿Qué muestra arp -a?", ["Procesos", "La tabla de IP y sus MAC conocidas", "El DNS", "Puertos"], 1, "Caché ARP."],
        ["¿Equivalente Linux de ipconfig?", ["ip a", "ls", "ps", "df"], 0, "ip address."]
      ]),
    L("Wireshark: ver el tráfico",
      [
        "**Wireshark** captura los paquetes que pasan por tu placa de red y los muestra decodificados. Es la herramienta definitiva para ver qué está pasando.",
        "Uso básico: elegir la interfaz (Wi-Fi o Ethernet) → iniciar captura → reproducir el problema → detener.",
        "**Filtros de visualización** útiles:",
        ">>dns                       (consultas DNS)\nip.addr == 192.168.1.10   (tráfico de un equipo)\ntcp.port == 443           (HTTPS)\nicmp                      (pings)\ndhcp                      (proceso DORA)\nhttp                      (web sin cifrar)\ntcp.analysis.retransmission  (retransmisiones: mala conexión)",
        "Vas a ver que con **HTTPS** el contenido está cifrado: solo ves a qué servidor te conectás. Con HTTP o FTP se ve todo, incluso contraseñas. Por eso se usan siempre protocolos cifrados.",
        "Ética y ley: **solo capturá en redes tuyas o con autorización**. Capturar tráfico ajeno es ilegal."
      ],
      [
        "Capturá 30 segundos mientras abrís una página. Filtrá `dns` y encontrá la consulta y la respuesta.",
        "Filtrá `icmp` y hacé un ping: mirá el Echo request y reply.",
        "Hacé `ipconfig /release` y `/renew` capturando con filtro `dhcp`: identificá las 4 fases DORA.",
        "Entrá a un sitio de prueba HTTP (como `http://neverssl.com`) y mirá que el contenido se ve en texto plano.",
        "Guardá una captura `.pcapng` en `03-Redes/` con notas de lo que encontraste."
      ],
      [
        ["¿Qué filtro muestra solo consultas DNS?", ["dns", "port 80", "tcp", "dhcp"], 0, "Filtro de visualización dns."],
        ["Con HTTPS, en Wireshark…", ["Se ve todo el contenido", "El contenido está cifrado", "No se ve nada de nada", "Se ven las contraseñas"], 1, "Se ve el destino pero no el contenido."],
        ["¿Cuándo es legítimo capturar tráfico?", ["Siempre", "En redes propias o con autorización", "En el Wi-Fi del vecino", "En un bar"], 1, "Hacerlo sin permiso es delito."]
      ]),
    L("Problemas comunes de red y sus soluciones",
      [
        "Casos frecuentes y por dónde empezar:",
        "- **Sin conexión, IP 169.254**: cable/Wi-Fi, DHCP del router caído → reiniciar router, revisar cable, `ipconfig /renew`.",
        "- **Conectado sin internet**: ping escalera; problema del proveedor (revisar luces del módem/ONT: luz **LOS** roja en fibra = corte de fibra, llamar al ISP).",
        "- **Algunas páginas no abren**: DNS (cambiar a 1.1.1.1), `flushdns`, revisar archivo hosts, proxy configurado por malware.",
        "- **Wi-Fi lento**: canal saturado, distancia, banda 2,4 vs 5, demasiados equipos, plan de internet chico.",
        "- **Se corta cada tanto**: conflicto de IP, ahorro de energía de la placa de red (Administrador de dispositivos → Administración de energía), driver, router recalentado.",
        "- **No ve la impresora/carpeta compartida**: perfil de red Público, firewall, IP cambiada, credenciales.",
        "- **Tras desinstalar una VPN quedó sin internet**: `netsh winsock reset` y `netsh int ip reset`, reiniciar.",
        "Regla del técnico: **reiniciar el router soluciona mucho, pero hay que entender por qué** para que no vuelva a pasar."
      ],
      [
        "Hacé una tabla síntoma → causa probable → comando de prueba → solución para 8 problemas.",
        "Ejecutá un **solucionador de problemas de red** de Windows y anotá qué revisa.",
        "Revisá en el Administrador de dispositivos si tu placa de red tiene activado el ahorro de energía.",
        "Investigá qué significan las luces de un módem/ONT de los proveedores de tu zona (PON, LOS, LAN, Internet).",
        "Escribí un instructivo de 5 pasos para que un cliente pruebe antes de llamarte."
      ],
      [
        ["Una ONT de fibra tiene la luz LOS en rojo. ¿Qué pasa?", ["Falta Wi-Fi", "Hay pérdida de señal de fibra: hay que llamar al proveedor", "Virus", "Falta RAM"], 1, "LOS = Loss Of Signal."],
        ["Tras desinstalar una VPN la PC quedó sin internet. Intento rápido:", ["Formatear", "netsh winsock reset y netsh int ip reset, reiniciar", "Comprar router", "Cambiar el monitor"], 1, "Restaura la pila de red."],
        ["La conexión se corta cada tanto y Windows avisa de un conflicto de IP. Causa:", ["DNS", "Dos equipos con la misma IP", "Cable largo", "Navegador viejo"], 1, "Revisar IPs fijas y el rango DHCP."]
      ]),
    L("Escaneo de red y monitoreo",
      [
        "Conocer qué hay en una red es parte del relevamiento:",
        "- **Advanced IP Scanner** o **Angry IP Scanner**: listan equipos, IP, MAC y fabricante.",
        "- **nmap**: escáner profesional de puertos (`nmap -sn 192.168.1.0/24` descubre equipos; `nmap 192.168.1.20` muestra puertos abiertos).",
        "- Monitoreo en empresas: **Zabbix**, **PRTG**, **Uptime Kuma** (avisa si un servicio se cae).",
        "Usos legítimos: encontrar una impresora perdida, detectar equipos desconocidos (¿alguien usa tu Wi-Fi?), verificar que un servicio esté expuesto solo donde debe.",
        "**Escanear redes ajenas sin permiso es ilegal** y puede considerarse un ataque. Solo en tu red o con autorización escrita del cliente.",
        "Documentación de red: diagrama (draw.io), inventario de equipos y planilla de IPs. Es lo primero que pide un técnico al llegar a una empresa."
      ],
      [
        "Instalá Advanced IP Scanner y escaneá tu red. Identificá cada dispositivo.",
        "Instalá **nmap** (incluye Zenmap) y ejecutá `nmap -sn` sobre tu red.",
        "Escaneá los puertos de tu propio router: `nmap 192.168.1.1` (con tu IP de gateway). ¿Qué servicios tiene abiertos?",
        "Hacé el diagrama de tu red en **draw.io** (diagrams.net) con íconos de red.",
        "Si querés: instalá **Uptime Kuma** más adelante para monitorear (lo vas a poder hacer con Docker en el futuro)."
      ],
      [
        ["¿Qué comando de nmap descubre equipos sin escanear puertos?", ["nmap -sn red/24", "nmap --attack", "nmap -kill", "ping -all"], 0, "-sn = ping scan."],
        ["¿Es legal escanear la red de una empresa sin permiso?", ["Sí", "No", "Solo de noche", "Solo con nmap"], 1, "Siempre con autorización escrita."],
        ["¿Qué herramienta sirve para hacer diagramas de red gratis?", ["draw.io (diagrams.net)", "Paint", "Calculadora", "CMD"], 0, "Muy usada en empresas."]
      ])
  ],
  lab: {
    titulo: "Diagnóstico de red con informe",
    pasos: [
      "Resolvé en Packet Tracer 4 fallas que vos mismo introduzcas en la red de la ferretería (con un amigo es mejor: que él las ponga): gateway mal configurado, máscara incorrecta, interfaz apagada, DHCP sin pool correcto.",
      "Para cada una aplicá la escalera de diagnóstico y anotá cada comando y resultado.",
      "En tu red real, hacé un diagnóstico completo con: ipconfig, ping escalera, tracert, nslookup, escaneo de equipos y prueba de velocidad.",
      "Redactá un **informe técnico** de 1 página con hallazgos y recomendaciones.",
      "Repasá y completá el curso de Netacad que empezaste (o al menos 2 módulos)."
    ],
    entregable: "Informe de diagnóstico + 4 fallas resueltas documentadas."
  }
}
);
