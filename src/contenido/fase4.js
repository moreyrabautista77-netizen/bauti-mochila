// FASE 4 — Seguridad, datos y ofimática profesional (semanas 13 a 16)

CURSO.semanas.push(
{
  fase: 4,
  titulo: "Seguridad informática",
  meta: "Proteger equipos y usuarios contra malware, estafas y accesos no autorizados.",
  lecciones: [
    L("Principios de seguridad",
      [
        "La seguridad se basa en la **tríada CIA**:",
        "- **Confidencialidad**: solo accede quien debe (contraseñas, cifrado, permisos).",
        "- **Integridad**: los datos no se alteran sin autorización (hashes, permisos, backups).",
        "- **Disponibilidad**: los datos y sistemas están cuando se necesitan (backups, UPS, redundancia).",
        "Conceptos: **amenaza** (lo que puede pasar), **vulnerabilidad** (la debilidad), **riesgo** (probabilidad × impacto), **control** (la medida que lo reduce).",
        "Principios prácticos:",
        "- **Mínimo privilegio**: cada usuario con los permisos justos.",
        "- **Defensa en profundidad**: varias capas (firewall + antivirus + actualizaciones + backup + capacitación).",
        "- **Actualizar** es la medida más efectiva y barata.",
        "- El eslabón más débil suele ser el **usuario**: la capacitación es parte de la seguridad.",
        "En Argentina, los datos personales están protegidos por la **Ley 25.326**: como técnico tenés que cuidar la confidencialidad de lo que ves."
      ],
      [
        "Clasificá estas medidas según protejan C, I o D: backup, contraseña, UPS, cifrado BitLocker, antivirus, RAID, permisos NTFS, firma digital.",
        "Hacé un **análisis de riesgos** de tu propia PC: 5 amenazas, su vulnerabilidad, probabilidad, impacto y control.",
        "Revisá **Seguridad de Windows**: estado de cada sección (virus, firewall, cuenta, navegador, dispositivo).",
        "Inscribite en el curso gratuito **«Introducción a la Ciberseguridad»** de Cisco Netacad.",
        "Leé un resumen de la Ley 25.326 y anotá 3 obligaciones que te afectan como técnico."
      ],
      [
        ["Un backup protege principalmente la…", ["Confidencialidad", "Disponibilidad (y la integridad)", "Velocidad", "Estética"], 1, "Permite recuperar datos si se pierden."],
        ["¿Qué es el principio de mínimo privilegio?", ["Darle admin a todos", "Dar a cada usuario solo los permisos necesarios", "No usar contraseñas", "Usar un solo usuario"], 1, "Reduce daños por errores o ataques."],
        ["¿Cuál suele ser la medida más efectiva y barata?", ["Comprar un firewall caro", "Mantener todo actualizado", "Desconectar internet", "Cambiar de marca"], 1, "La mayoría de los ataques explotan fallas ya parcheadas."]
      ]),
    L("Malware: tipos y cómo actúa",
      [
        "**Malware** = software malicioso. Tipos:",
        "- **Virus**: se adhiere a archivos y se propaga al ejecutarlos.",
        "- **Gusano**: se propaga solo por la red.",
        "- **Troyano**: se disfraza de programa útil (cracks, activadores, «juegos gratis»).",
        "- **Ransomware**: cifra los archivos y pide rescate. El más dañino para pymes.",
        "- **Spyware / keylogger**: roba información y contraseñas.",
        "- **Adware**: llena de publicidad, cambia el buscador.",
        "- **Rootkit**: se oculta en lo profundo del sistema.",
        "- **Botnet**: el equipo infectado obedece a un atacante (spam, ataques).",
        "- **Criptominero**: usa tu CPU/GPU para minar.",
        "Vías de entrada: adjuntos de correo, **software pirata**, pendrives, sitios falsos, extensiones de navegador, vulnerabilidades sin parchear, RDP expuesto.",
        "Señales: lentitud, ventanas emergentes, navegador con otra página de inicio, CPU alta, archivos con extensiones raras, antivirus desactivado solo."
      ],
      [
        "Hacé una tabla de los 9 tipos: cómo entra, qué hace, cómo se detecta, cómo se elimina.",
        "Buscá noticias de 2 ataques de ransomware en Argentina o Latinoamérica y anotá cómo entraron.",
        "Revisá las extensiones de tu navegador y eliminá las que no uses o no conozcas.",
        "En Seguridad de Windows activá **Protección contra ransomware → Acceso controlado a carpetas** y mirá qué carpetas protege.",
        "Descargá el archivo de prueba **EICAR** (eicar.org) en la VM y mirá cómo reacciona el antivirus (es inofensivo, diseñado para pruebas)."
      ],
      [
        ["Un «activador de Office gratis» que instala un acceso remoto oculto es un…", ["Gusano", "Troyano", "Adware", "Firewall"], 1, "Se disfraza de programa útil."],
        ["¿Qué malware cifra archivos y pide rescate?", ["Adware", "Ransomware", "Spyware", "Rootkit"], 1, "La mejor defensa es un buen backup desconectado."],
        ["¿Qué es el archivo EICAR?", ["Un virus real peligroso", "Un archivo de prueba inofensivo para verificar el antivirus", "Un driver", "Un juego"], 1, "Estándar de la industria para probar detección."]
      ]),
    L("Eliminar malware paso a paso",
      [
        "Procedimiento profesional de desinfección:",
        "- **1. Identificar** los síntomas y confirmar la infección.",
        "- **2. Aislar** el equipo: desconectarlo de la red para que no se propague.",
        "- **3. Deshabilitar Restaurar sistema** (en Windows) para no guardar el malware en los puntos de restauración.",
        "- **4. Remediar**: actualizar el antivirus, escanear en **modo seguro** o con **Microsoft Defender sin conexión** (arranca antes que Windows), complementar con **Malwarebytes**, revisar Autoruns, extensiones, tareas programadas, archivo hosts y proxy.",
        "- **5. Programar escaneos y actualizaciones**.",
        "- **6. Rehabilitar Restaurar sistema** y crear un punto limpio.",
        "- **7. Educar al usuario**: cómo se infectó y cómo evitarlo.",
        "Si es **ransomware** o un rootkit grave: lo más seguro suele ser **formatear y reinstalar**, y restaurar desde un backup limpio. Cambiar todas las contraseñas desde **otro equipo**.",
        "Antes de formatear, siempre: respaldar datos (escaneándolos después)."
      ],
      [
        "Escribí el procedimiento de 7 pasos de memoria.",
        "Ejecutá un **análisis sin conexión de Microsoft Defender** (Seguridad de Windows → Protección contra virus → Opciones de examen) en la VM.",
        "Instalá **Malwarebytes** (gratuito) y hacé un análisis.",
        "Revisá en Autoruns las pestañas Scheduled Tasks y Browser Helper / Extensions.",
        "Revisá la configuración de proxy: Configuración → Red → Proxy. Debería estar en automático o desactivado."
      ],
      [
        ["¿Qué es lo primero tras confirmar una infección?", ["Formatear", "Aislar el equipo de la red", "Comprar otro antivirus", "Apagarlo para siempre"], 1, "Evita que se propague."],
        ["¿Por qué deshabilitar Restaurar sistema al desinfectar?", ["Para ganar espacio", "Para no conservar el malware en los puntos de restauración", "Es obligatorio por ley", "No hace falta"], 1, "Luego se reactiva y se crea un punto limpio."],
        ["Tras un ransomware, ¿desde dónde cambiar las contraseñas?", ["Desde el equipo infectado", "Desde otro equipo limpio", "No hace falta", "Por teléfono"], 1, "El infectado podría tener un keylogger."]
      ]),
    L("Contraseñas, MFA e ingeniería social",
      [
        "Contraseñas fuertes: **largas** (frase de 4+ palabras o 14+ caracteres), **únicas** para cada servicio y guardadas en un **gestor de contraseñas** (Bitwarden, KeePassXC, el del navegador).",
        "**MFA / 2FA** (doble factor): algo que sabés + algo que tenés (app autenticadora como Google/Microsoft Authenticator, llave física) o algo que sos (huella). Es la medida que más cuentas salva. El SMS es mejor que nada pero el más débil.",
        "Verificá si tus correos aparecieron en filtraciones en **haveibeenpwned.com**.",
        "**Ingeniería social**: manipular a las personas en lugar de la tecnología.",
        "- **Phishing**: mail falso que imita un banco o servicio. Revisar remitente, enlaces (pasar el mouse sin hacer clic), urgencia, errores.",
        "- **Smishing/Vishing**: por SMS/WhatsApp o llamada. Muy común: «hackeo de WhatsApp» pidiendo el código de 6 dígitos.",
        "- **Pretexting**: el atacante se hace pasar por soporte técnico, el banco o un familiar.",
        "Regla para usuarios: **nadie legítimo te pide el código que te llega por SMS, ni tu contraseña, ni que instales AnyDesk**.",
        "Activá la **verificación en dos pasos de WhatsApp** (PIN) en el celular de cada cliente."
      ],
      [
        "Instalá **Bitwarden** (o KeePassXC) y guardá allí tus contraseñas, empezando por el correo.",
        "Activá 2FA con app autenticadora en tu correo principal.",
        "Revisá tu mail en haveibeenpwned.com.",
        "Hacé el **Phishing Quiz de Google** (phishingquiz.withgoogle.com) y anotá tu puntaje.",
        "Armá una **charla de 5 minutos** para tu familia sobre estafas de WhatsApp y dála. Anotá las preguntas que te hicieron."
      ],
      [
        ["¿Cuál es el factor de autenticación más débil?", ["App autenticadora", "Llave física", "SMS", "Huella"], 2, "El SMS puede ser interceptado o clonado (SIM swapping)."],
        ["Un «técnico del banco» llama y pide el código que te llegó. ¿Qué es?", ["Un trámite normal", "Vishing / ingeniería social", "Phishing por mail", "Un virus"], 1, "Nadie legítimo pide ese código."],
        ["¿Qué hace un gestor de contraseñas?", ["Las adivina", "Guarda y genera contraseñas únicas y fuertes", "Elimina virus", "Cambia la IP"], 1, "Solo tenés que recordar una contraseña maestra."]
      ]),
    L("Firewall, actualizaciones y cifrado",
      [
        "**Firewall de Windows**: filtra conexiones entrantes (y salientes si se configura). Perfiles: Dominio, Privado, Público. Nunca se desactiva «para que ande algo»: se crea una **regla** puntual.",
        "Consola avanzada: `wf.msc`. Allí se crean reglas por programa o puerto.",
        "**Actualizaciones**: sistema, drivers, navegador, Office, y también **firmware del router** y apps del celular. Un equipo sin parches es la puerta más fácil.",
        "**Cifrado de disco**: si roban una notebook sin cifrar, cualquiera saca el disco y lee todo.",
        "- **BitLocker** (Windows Pro) o **Cifrado de dispositivo** (en muchos equipos Home).",
        "- **La clave de recuperación** de BitLocker es crítica: si se pierde, los datos se pierden. Se guarda en la cuenta Microsoft (`aka.ms/myrecoverykey`) o impresa.",
        "- En Linux: **LUKS**. En pendrives: BitLocker To Go o VeraCrypt.",
        "**Navegación segura**: HTTPS (el candado indica cifrado, NO que el sitio sea legítimo), bloqueador de anuncios (uBlock Origin), no guardar tarjetas en sitios dudosos."
      ],
      [
        "Abrí `wf.msc` y revisá las reglas de entrada habilitadas. Creá una regla que bloquee un programa (ej. el Bloc de notas) y después borrala.",
        "Verificá si tu equipo tiene BitLocker o Cifrado de dispositivo: `manage-bde -status` en CMD como admin.",
        "Si está activo, comprobá dónde está guardada la clave de recuperación.",
        "Verificá que el navegador, Office y Windows estén al día.",
        "Armá una **checklist de seguridad de 15 puntos** para entregar a clientes hogareños."
      ],
      [
        ["Un programa no funciona por el firewall. ¿Qué hacés?", ["Desactivar el firewall", "Crear una regla puntual para ese programa", "Formatear", "Desinstalar el antivirus"], 1, "Abrí solo lo necesario."],
        ["El candado HTTPS garantiza que…", ["El sitio es legítimo y seguro", "La conexión está cifrada (no que el sitio sea confiable)", "No hay virus", "Es del gobierno"], 1, "Los sitios de phishing también usan HTTPS."],
        ["Si perdés la clave de recuperación de BitLocker…", ["Microsoft la desbloquea gratis", "Podés perder los datos", "Se recupera con formatear", "No pasa nada"], 1, "Guardala siempre en un lugar seguro."]
      ])
  ],
  lab: {
    titulo: "Auditoría de seguridad hogareña",
    pasos: [
      "Con permiso, auditá la PC y el celular de un familiar (o los tuyos).",
      "Revisá: actualizaciones, antivirus, firewall, cuentas (¿usa admin?), contraseñas (¿se repiten?), 2FA, WhatsApp con PIN, extensiones del navegador, backup, cifrado, router.",
      "Puntuá cada ítem en verde/amarillo/rojo.",
      "Corregí lo que puedas en el momento, con su consentimiento y explicándole.",
      "Entregá un **informe de auditoría** con el puntaje antes/después y las recomendaciones pendientes."
    ],
    entregable: "Informe de auditoría de seguridad con semáforo antes/después."
  }
},
{
  fase: 4,
  titulo: "Backup y recuperación de datos",
  meta: "Diseñar estrategias de respaldo y recuperar datos perdidos: el servicio más valioso que podés ofrecer.",
  lecciones: [
    L("Estrategias de backup",
      [
        "La regla de oro es **3-2-1**: **3** copias de los datos, en **2** medios distintos, con **1** fuera del lugar (nube o en otra casa). Versión moderna: **3-2-1-1-0** (+1 copia desconectada/inmutable, 0 errores al verificar).",
        "Tipos de backup:",
        "- **Completo**: copia todo. Lento y ocupa mucho; restauración simple.",
        "- **Incremental**: solo lo cambiado desde el **último backup** (de cualquier tipo). Rápido; para restaurar necesitás el completo + todos los incrementales.",
        "- **Diferencial**: lo cambiado desde el **último completo**. Crece día a día; restaurar = completo + último diferencial.",
        "- **Imagen de sistema**: copia el disco entero (sistema + programas + datos) para restaurar todo tal cual.",
        "- **Sincronización** (OneDrive, Drive): **no es backup** por sí sola: si borrás o el ransomware cifra, se sincroniza el daño (aunque tienen historial de versiones/papelera limitados).",
        "Conceptos de empresa: **RPO** (cuántos datos podés perder: ¿1 día? ¿1 hora?) y **RTO** (cuánto podés tardar en volver a funcionar).",
        "Un backup que nunca se probó **no es un backup**: hay que hacer pruebas de restauración."
      ],
      [
        "Diseñá la estrategia 3-2-1 para tus propios datos: qué, dónde, cada cuánto y con qué herramienta.",
        "Configurá el **Historial de archivos** de Windows (o «Copia de seguridad de Windows») hacia un pendrive o disco externo.",
        "Hacé un backup de `Mochila` a la nube (Drive/OneDrive/Mega) además del local.",
        "**Probá restaurar** un archivo borrado a propósito desde el backup.",
        "Calculá: si se hace un completo el domingo e incrementales el resto de los días, ¿qué necesitás para restaurar el jueves? ¿Y si fueran diferenciales?"
      ],
      [
        ["¿Qué dice la regla 3-2-1?", ["3 discos, 2 PCs, 1 nube", "3 copias, 2 medios distintos, 1 fuera del lugar", "3 días, 2 semanas, 1 mes", "Nada importante"], 1, "Base de cualquier estrategia de respaldo."],
        ["Completo el domingo + incrementales diarios. Para restaurar el jueves necesitás…", ["Solo el del miércoles", "El completo + los incrementales de lunes a jueves", "Solo el completo", "El completo + el de jueves"], 1, "Cada incremental depende del anterior."],
        ["¿Por qué OneDrive sincronizado no alcanza como backup?", ["Porque es caro", "Porque replica también los borrados y el cifrado por ransomware", "Porque es lento", "Sí alcanza"], 1, "La sincronización copia los errores."]
      ]),
    L("Imágenes de sistema y clonado",
      [
        "Una **imagen** guarda el disco completo para restaurar el equipo tal cual estaba (ideal antes de cambios grandes, o para tener una PC lista en minutos).",
        "Herramientas:",
        "- **Macrium Reflect** (Windows): imágenes y clonado, con medio de rescate.",
        "- **Clonezilla** (live, gratuito): clonado disco a disco o a imagen, multiplataforma.",
        "- **Veeam Agent** (gratuito para uso personal): backups programados con versiones.",
        "- **Rescuezilla**: Clonezilla con interfaz gráfica.",
        "Clonar HDD → SSD más chico: primero reducir el espacio usado para que entre, después clonar, y verificar que se arranque desde el SSD (orden de arranque).",
        "En empresas se usan **despliegues de imágenes** (una imagen «maestra» configurada para muchas PCs iguales).",
        "Siempre verificar la imagen y crear el **medio de rescate** (pendrive para arrancar y restaurar)."
      ],
      [
        "En la VM, agregá un segundo disco virtual vacío.",
        "Arrancá la VM con la ISO de **Clonezilla** o **Rescuezilla** y hacé una imagen del disco del sistema hacia el segundo disco.",
        "Rompé algo en la VM (borrá una carpeta de programa) y **restaurá la imagen**. Verificá que volvió todo.",
        "Escribí el procedimiento completo de clonado HDD → SSD para un cliente.",
        "Anotá cuánto tardó cada etapa: lo vas a usar para presupuestar."
      ],
      [
        ["¿Qué contiene una imagen de sistema?", ["Solo fotos", "El disco completo: sistema, programas y datos", "Solo drivers", "Solo el registro"], 1, "Permite restaurar todo el equipo."],
        ["¿Qué herramienta gratuita arranca desde pendrive y clona discos?", ["Paint", "Clonezilla", "Word", "Chrome"], 1, "Clonezilla / Rescuezilla."],
        ["Antes de confiar en una imagen hay que…", ["Borrarla", "Verificarla y probar la restauración", "Comprimirla 3 veces", "Enviarla por WhatsApp"], 1, "Un backup no probado no es backup."]
      ]),
    L("Recuperación de archivos borrados",
      [
        "Cuando se borra un archivo (incluso vaciando la papelera o con formateo rápido), los datos **siguen en el disco** hasta que se sobrescriben. Por eso:",
        "- **Dejar de usar el disco inmediatamente**. Cada archivo nuevo puede pisar lo borrado.",
        "- **No instalar el programa de recuperación en el mismo disco**. Recuperar **siempre a otro disco**.",
        "- Si es el disco del sistema, sacarlo y conectarlo a otra PC, o arrancar desde un USB live.",
        "Herramientas:",
        "- **Recuva** (simple, Windows).",
        "- **PhotoRec** (busca archivos por firma; recupera aunque el sistema de archivos esté destruido; pierde nombres de archivo).",
        "- **TestDisk** (recupera **particiones** perdidas y repara sectores de arranque).",
        "- **Windows File Recovery** (`winfr`, de Microsoft, consola).",
        "**SSD con TRIM**: al borrar, el SSD limpia los bloques pronto, por lo que la recuperación suele ser **casi imposible**. Más razón para tener backup.",
        "Si el disco tiene **falla física** (ruidos, no lo detecta), no insistir: cada intento empeora. Derivar a un **laboratorio de recuperación** o clonar primero con **ddrescue**.",
        "Saber cuándo derivar es parte de tu perfil profesional."
      ],
      [
        "En un pendrive de prueba, copiá 10 fotos y 5 documentos. Borralos y formateá rápido.",
        "Recuperalos con **Recuva** hacia tu disco (no al pendrive). Anotá cuántos recuperaste.",
        "Repetí con **PhotoRec** y compará resultados.",
        "En la VM con un disco extra, borrá una partición en Administración de discos y recuperala con **TestDisk** (seguí un tutorial paso a paso).",
        "Escribí un **protocolo de recuperación de datos** para clientes, incluyendo qué decirle al cliente sobre probabilidades y costo."
      ],
      [
        ["Un cliente borró fotos. ¿Qué le decís primero?", ["Que siga usando el equipo normalmente", "Que deje de usar ese disco para no sobrescribir los datos", "Que lo formatee", "Que instale juegos"], 1, "Cada escritura nueva reduce las chances."],
        ["¿Dónde guardás los archivos recuperados?", ["En el mismo disco", "En otro disco distinto", "En la papelera", "En la RAM"], 1, "Para no pisar lo que todavía no recuperaste."],
        ["¿Qué herramienta recupera particiones perdidas?", ["Recuva", "TestDisk", "Paint", "Excel"], 1, "TestDisk repara tablas de particiones."]
      ]),
    L("Compresión, formatos y conversión de datos",
      [
        "Tu perfil incluye **convertir datos a formatos diferentes para usarlos en otros ambientes**.",
        "Compresión: **ZIP** (universal), **7z** (más compresión), **RAR**, **tar.gz** (Linux). Se puede proteger con contraseña (7-Zip con AES-256 cifra de verdad).",
        "Formatos que hay que conocer:",
        "- Documentos: DOCX/ODT, XLSX/ODS, PPTX, **PDF** (para entregar, no editar), TXT, **CSV** (datos tabulares simples, compatible con todo).",
        "- Imágenes: JPG (fotos), PNG (capturas, transparencia), WebP, HEIC (iPhone: muchos usuarios no pueden abrirlas en Windows), SVG (vectorial).",
        "- Audio/video: MP3, AAC, MP4 (H.264/H.265), MKV.",
        "- Datos: **JSON**, **XML**, SQL.",
        "Herramientas de conversión: LibreOffice (convierte documentos por lote: `soffice --headless --convert-to pdf *.docx`), **HandBrake** (video), **IrfanView** o **XnConvert** (imágenes por lote), **ffmpeg** (audio/video por consola).",
        "Codificación de texto: **UTF-8** es el estándar. Si en un CSV aparecen «Ã±» en vez de «ñ», es un problema de codificación (abrirlo indicando UTF-8)."
      ],
      [
        "Comprimí la carpeta `Mochila` en 7z con contraseña y verificá que pide la clave al abrir.",
        "Convertí 5 fotos HEIC o PNG a JPG por lote con XnConvert o IrfanView.",
        "Convertí un DOCX a PDF y a ODT con LibreOffice.",
        "Exportá una planilla a CSV, abrilo con el Bloc de notas y mirá su estructura.",
        "Instalá **ffmpeg** y convertí un video corto a MP3: `ffmpeg -i video.mp4 audio.mp3`."
      ],
      [
        ["Un cliente con iPhone manda fotos que no abren en Windows. Formato probable:", ["JPG", "HEIC", "PNG", "BMP"], 1, "Se convierte o se instala la extensión HEIF."],
        ["Aparece «Ã±» en lugar de «ñ» en un CSV. Problema:", ["Virus", "Codificación de caracteres (UTF-8 vs otra)", "Disco roto", "Falta RAM"], 1, "Abrí indicando UTF-8."],
        ["¿Qué formato conviene para enviar un documento final que no se debe editar?", ["DOCX", "PDF", "TXT", "XLSX"], 1, "PDF conserva el diseño."]
      ]),
    L("Sistemas de archivos, mantenimiento de discos y borrado seguro",
      [
        "**Reorganizar datos física y lógicamente** (función de tu perfil):",
        "- **Desfragmentar** solo HDD. Windows lo hace solo («Optimizar unidades»).",
        "- En **SSD** no se desfragmenta: Windows ejecuta **TRIM**. Desfragmentar un SSD lo desgasta sin beneficio.",
        "- **Espacio libre**: dejar al menos 10–15 %. Herramientas para ver qué ocupa: **WinDirStat**, **WizTree**, **TreeSize**.",
        "- **Duplicados**: dupeGuru o la función de búsqueda de duplicados de muchos gestores.",
        "- **Liberador de espacio / Sensor de almacenamiento** de Windows.",
        "**Borrado seguro** (antes de vender o donar un equipo): formatear no alcanza.",
        "- HDD: sobrescribir con herramientas como **DBAN** o `cipher /w:C:` (para espacio libre).",
        "- SSD: usar el **Secure Erase** del fabricante (Samsung Magician, etc.) o el borrado del BIOS. Si el disco estaba cifrado con BitLocker, borrar la clave hace inaccesible todo.",
        "- Windows: «Restablecer este equipo» → **Quitar todo** → **Limpiar la unidad**."
      ],
      [
        "Abrí «Optimizar unidades» (`dfrgui`): mirá el tipo de cada disco y cuándo se optimizó.",
        "Instalá **WizTree** y encontrá las 10 carpetas más pesadas de tu disco.",
        "Activá el **Sensor de almacenamiento** y configuralo.",
        "En la VM, ejecutá «Restablecer este equipo» con «Quitar todo» y observá las opciones (podés cancelar antes de confirmar).",
        "Escribí el procedimiento de **preparación de un equipo para la venta** (backup, cerrar sesiones, desvincular cuentas, borrado seguro, reinstalación)."
      ],
      [
        ["¿Se debe desfragmentar un SSD?", ["Sí, cada semana", "No: se usa TRIM y desfragmentar lo desgasta", "Solo si es NVMe", "Solo en Linux"], 1, "Windows hace TRIM automáticamente."],
        ["Antes de vender una PC, ¿alcanza con formatear rápido?", ["Sí", "No, los datos se pueden recuperar: hay que hacer borrado seguro", "Solo si es Windows 11", "Solo si es HDD"], 1, "Ya viste que el formateo rápido se recupera."],
        ["¿Qué herramienta muestra qué carpetas ocupan más espacio?", ["WizTree / WinDirStat", "Ping", "Regedit", "Paint"], 0, "Muy útil para «disco lleno»."]
      ])
  ],
  lab: {
    titulo: "Plan de continuidad para un comercio",
    pasos: [
      "Cliente ficticio: un estudio contable con 4 PCs, 1 notebook y datos críticos de clientes.",
      "Definí RPO y RTO razonables y explicá por qué.",
      "Diseñá la estrategia 3-2-1: qué se respalda, herramienta, frecuencia, destino local (NAS o disco), destino externo (nube), copia desconectada.",
      "Escribí el **procedimiento de restauración** paso a paso para 3 escenarios: archivo borrado, PC robada, ransomware.",
      "Presupuestá hardware, nube mensual y tus horas de implementación y mantenimiento mensual."
    ],
    entregable: "Documento de plan de backup y recuperación con presupuesto."
  }
},
{
  fase: 4,
  titulo: "Ofimática profesional",
  meta: "Usar Excel y Word a nivel avanzado: lo que más piden las empresas y lo que más podés enseñar.",
  lecciones: [
    L("Excel: fórmulas y referencias",
      [
        "Toda fórmula empieza con `=`. Operadores: `+ - * / ^` y `&` (unir texto).",
        "**Referencias**:",
        "- Relativa `A1`: cambia al copiar la fórmula.",
        "- Absoluta `$A$1`: queda fija (F4 la alterna). Ej.: `=B2*$E$1` donde E1 es el % de IVA.",
        "- Mixta `$A1` o `A$1`.",
        "Funciones básicas: `SUMA`, `PROMEDIO`, `MAX`, `MIN`, `CONTAR` (números), `CONTARA` (no vacías), `REDONDEAR(valor;2)`, `HOY()`, `AHORA()`.",
        "En Excel en español con configuración regional argentina, los argumentos se separan con **punto y coma** `;` y los decimales con coma.",
        "Buenas prácticas: datos en forma de tabla (una fila por registro, una columna por campo, sin filas vacías), encabezados claros, formato de número/moneda/fecha correcto, **Ctrl + T** para convertir en Tabla (se expande sola y tiene filtros)."
      ],
      [
        "Creá una planilla de presupuesto: columnas Producto, Cantidad, Precio unitario, Subtotal (`=B2*C2`), IVA 21 % usando una celda fija con `$`, Total.",
        "Agregá al final SUMA de totales, el producto más caro (MAX) y el promedio.",
        "Convertí el rango en Tabla con Ctrl + T y agregá una fila nueva: mirá cómo se extienden las fórmulas.",
        "Aplicá formato moneda ($) y redondeo a 2 decimales.",
        "Guardala en `06-Profesional/presupuesto-plantilla.xlsx`: la vas a usar para tus clientes."
      ],
      [
        ["¿Qué referencia queda fija al copiar la fórmula?", ["A1", "$A$1", "A$", "#A1"], 1, "El $ fija columna y fila."],
        ["¿Qué tecla alterna los tipos de referencia?", ["F2", "F4", "F5", "F12"], 1, "F4 en Windows."],
        ["¿Qué cuenta CONTARA?", ["Solo números", "Celdas no vacías", "Celdas vacías", "Filas"], 1, "CONTAR solo cuenta números."]
      ]),
    L("Excel: funciones lógicas y de búsqueda",
      [
        "**SI**: `=SI(condición; valor_si_verdadero; valor_si_falso)`. Ej.: `=SI(C2>=6;\"Aprobado\";\"Desaprobado\")`.",
        "Combinadas: `Y()`, `O()`, `SI.CONJUNTO()` (varias condiciones), `SI.ERROR(fórmula;\"texto\")`.",
        "Condicionales de resumen: `CONTAR.SI(rango;criterio)`, `SUMAR.SI(rango;criterio;rango_suma)`, `SUMAR.SI.CONJUNTO`, `PROMEDIO.SI`.",
        "**Búsqueda**:",
        "- `BUSCARV(valor; tabla; columna; FALSO)` → busca en la primera columna y devuelve la columna indicada. **FALSO = coincidencia exacta** (casi siempre se usa así).",
        "- `BUSCARX(valor; rango_búsqueda; rango_resultado; \"No encontrado\")` → la versión moderna (Excel 365/2021), más flexible.",
        "- `INDICE` + `COINCIDIR`: la combinación clásica más potente.",
        "Texto: `CONCAT`, `IZQUIERDA`, `DERECHA`, `EXTRAE`, `ESPACIOS` (limpia espacios de más), `MAYUSC`, `NOMPROPIO`, `TEXTO(fecha;\"dd/mm/aaaa\")`."
      ],
      [
        "Creá una hoja `Productos` (código, nombre, precio) con 10 productos y otra `Venta` donde, al escribir el código, BUSCARV (o BUSCARX) traiga nombre y precio.",
        "Agregá SI.ERROR para que muestre «Código inexistente».",
        "En una lista de 15 alumnos con 3 notas: promedio, condición (SI), cantidad de aprobados (CONTAR.SI).",
        "Usá SUMAR.SI para sumar ventas por vendedor.",
        "Limpiá una lista de nombres mal escritos usando ESPACIOS y NOMPROPIO."
      ],
      [
        ["En BUSCARV, ¿qué indica FALSO como último argumento?", ["Buscar aproximado", "Coincidencia exacta", "Devolver error", "Ordenar"], 1, "Casi siempre se usa FALSO."],
        ["¿Qué función cuenta celdas que cumplen un criterio?", ["SUMA", "CONTAR.SI", "BUSCARV", "SI"], 1, "CONTAR.SI(rango;criterio)."],
        ["Para mostrar «No encontrado» en vez de #N/A usás…", ["SI.ERROR", "MAX", "HOY", "REDONDEAR"], 0, "SI.ERROR(fórmula;\"No encontrado\")."]
      ]),
    L("Excel: tablas dinámicas, gráficos y validación",
      [
        "**Tabla dinámica** (Insertar → Tabla dinámica): resume miles de filas en segundos arrastrando campos a Filas, Columnas, Valores y Filtros. Ej.: ventas por mes y por vendedor.",
        "**Gráficos**: columnas (comparar), líneas (evolución en el tiempo), circular (partes de un todo, pocas categorías), barras (categorías con nombres largos). Título claro y ejes con unidades.",
        "**Formato condicional**: colores automáticos según el valor (ej. stock bajo en rojo).",
        "**Validación de datos**: listas desplegables y restricciones (Datos → Validación de datos) para que el usuario no cargue cualquier cosa.",
        "**Filtros y ordenamiento**, **Inmovilizar paneles** (fijar encabezados), **Quitar duplicados**, **Texto en columnas**.",
        "**Proteger hoja**: bloquear fórmulas para que el usuario solo complete celdas de entrada.",
        "Con esto ya podés hacerle a un comercio un sistema de stock, caja diaria o cuenta corriente de clientes: es «optimizar el ambiente de trabajo del usuario» con las herramientas que ya tiene."
      ],
      [
        "Generá o descargá una planilla de 200 ventas (fecha, vendedor, producto, cantidad, importe).",
        "Hacé una tabla dinámica: total por vendedor y por mes.",
        "Creá un gráfico de columnas de ventas por mes y uno circular por producto.",
        "Agregá formato condicional (importes mayores a cierto valor en verde) y una lista desplegable de vendedores.",
        "Protegé la hoja dejando editables solo las celdas de carga."
      ],
      [
        ["¿Qué herramienta resume grandes volúmenes arrastrando campos?", ["Formato condicional", "Tabla dinámica", "BUSCARV", "Ortografía"], 1, "Es una de las habilidades más pedidas."],
        ["Para mostrar la evolución mensual de ventas conviene un gráfico de…", ["Torta", "Líneas o columnas", "Dispersión 3D", "Ninguno"], 1, "Las líneas muestran tendencia en el tiempo."],
        ["¿Cómo evitás que el usuario escriba cualquier cosa en una celda?", ["Validación de datos", "Inmovilizar paneles", "Ctrl + Z", "Zoom"], 0, "Listas y restricciones."]
      ]),
    L("Word y documentos profesionales",
      [
        "Un documento profesional se arma con **estilos** (Título 1, Título 2, Normal), no con formato a mano. Ventajas: **índice automático**, coherencia y cambios globales en un clic.",
        "Funciones clave:",
        "- **Tabla de contenido** (Referencias → Tabla de contenido).",
        "- **Saltos de sección** para cambiar orientación o encabezados en una parte.",
        "- **Encabezado y pie** con número de página.",
        "- **Combinar correspondencia**: una carta o certificado por cada fila de una planilla Excel (muy útil en oficinas).",
        "- **Control de cambios** y comentarios para revisar entre varios.",
        "- **Plantillas** (.dotx) para presupuestos, informes técnicos, órdenes de trabajo.",
        "- Exportar a **PDF**.",
        "Presentaciones (PowerPoint/Impress/Canva): poco texto, una idea por diapositiva, imágenes grandes, letra legible. Las vas a usar para capacitar usuarios (función de tu perfil).",
        "Alternativas libres: **LibreOffice** (Writer, Calc, Impress) y en la nube **Google Docs/Sheets** o **Office online** gratis."
      ],
      [
        "Creá una **plantilla de informe técnico** con estilos: portada, índice automático, secciones (problema, diagnóstico, solución, recomendaciones), pie con número de página.",
        "Pasá a esa plantilla uno de los informes que ya escribiste (por ejemplo, el de seguridad).",
        "Hacé una **combinación de correspondencia**: 10 «certificados de servicio técnico» a partir de una planilla de clientes.",
        "Armá una presentación de 6 diapositivas: «Cómo cuidar tu PC» para capacitar a un cliente.",
        "Exportá todo a PDF y guardalo en `06-Profesional`."
      ],
      [
        ["¿Qué necesitás para generar un índice automático en Word?", ["Escribir los títulos en negrita", "Usar estilos de título", "Usar mayúsculas", "Nada"], 1, "El índice se arma a partir de los estilos."],
        ["¿Qué función genera una carta por cada fila de una planilla?", ["Control de cambios", "Combinar correspondencia", "Tabla de contenido", "Autocorrección"], 1, "Ideal para certificados y notas."],
        ["¿Para qué sirve un salto de sección?", ["Para borrar páginas", "Para cambiar formato (orientación, encabezado) en una parte del documento", "Para guardar", "Para imprimir"], 1, "Permite configuraciones distintas por sección."]
      ]),
    L("Automatizar la oficina: macros y nube",
      [
        "**Macros** (Excel/Word): graban acciones repetitivas y las reproducen con un botón. Se guardan en archivos **.xlsm** y están escritas en **VBA**.",
        ">>Sub LimpiarCarga()\n    Range(\"B2:B20\").ClearContents\n    Range(\"B2\").Select\n    MsgBox \"Planilla lista para una nueva carga\"\nEnd Sub",
        "Seguridad: las macros de archivos de internet vienen **bloqueadas** porque son una vía de malware muy usada. Habilitá solo las de fuentes confiables.",
        "Para activar la pestaña Programador: Archivo → Opciones → Personalizar cinta → Programador.",
        "**Microsoft 365 / Google Workspace**: correo corporativo, almacenamiento compartido, edición simultánea. Mucho soporte de N1 es de estas plataformas (contraseñas, permisos de carpetas compartidas, configuración de Outlook).",
        "Automatización moderna sin programar: **Power Automate**, **Google Apps Script**, formularios (Forms) que cargan datos en una planilla.",
        "La semana 17 vas a empezar con Python, que permite automatizar mucho más."
      ],
      [
        "Activá la pestaña Programador en Excel.",
        "Grabá una macro que dé formato a una tabla (negrita en encabezados, bordes, ancho automático) y ejecutala en otra hoja.",
        "Abrí el editor VBA (Alt + F11), mirá el código generado y escribí la macro `LimpiarCarga` del ejemplo. Asignala a un botón.",
        "Creá un Google Form de «pedido de soporte técnico» que guarde las respuestas en una Google Sheet.",
        "Configurá una cuenta de correo en Outlook o Thunderbird con IMAP y anotá los parámetros usados."
      ],
      [
        ["¿Con qué extensión se guarda un Excel con macros?", [".xlsx", ".xlsm", ".csv", ".docx"], 1, "xlsx no admite macros."],
        ["¿Por qué Office bloquea macros de internet?", ["Por licencia", "Porque son una vía frecuente de malware", "Porque son lentas", "No las bloquea"], 1, "Habilitar solo de fuentes confiables."],
        ["¿En qué lenguaje se escriben las macros de Office?", ["Python", "VBA", "Java", "HTML"], 1, "Visual Basic for Applications."]
      ])
  ],
  lab: {
    titulo: "Sistema de gestión para un kiosco en Excel",
    pasos: [
      "Hoja **Productos**: código, nombre, categoría, costo, % de ganancia, precio de venta calculado, stock, stock mínimo.",
      "Hoja **Ventas**: fecha, código (con validación), nombre y precio con BUSCARX/BUSCARV, cantidad, total.",
      "Hoja **Resumen**: ventas del día (SUMAR.SI por fecha), tabla dinámica por categoría, gráfico mensual, productos bajo stock mínimo con formato condicional.",
      "Protegé las fórmulas y agregá una macro con botón para «Nueva venta».",
      "Escribí un **manual de uso de 1 página** para el kiosquero."
    ],
    entregable: "Archivo .xlsm funcional + manual de usuario."
  }
},
{
  fase: 4,
  titulo: "Bases de datos y SQL",
  meta: "Entender bases de datos relacionales y consultar datos con SQL, una habilidad que te diferencia.",
  lecciones: [
    L("Qué es una base de datos relacional",
      [
        "Una **base de datos** guarda información organizada para consultarla rápido y sin duplicados. Casi todos los sistemas de gestión (facturación, stock, sueldos) usan una.",
        "Modelo **relacional**: los datos se guardan en **tablas** (filas = registros, columnas = campos) relacionadas entre sí.",
        "- **Clave primaria (PK)**: identifica cada fila sin repetirse (ej. `id_cliente`).",
        "- **Clave foránea (FK)**: columna que apunta a la PK de otra tabla (ej. `ventas.id_cliente`).",
        "- Relaciones: **1 a N** (un cliente tiene muchas ventas), **N a N** (productos y ventas, mediante una tabla intermedia).",
        "**Normalizar**: no repetir datos. En vez de escribir el nombre del cliente en cada venta, se guarda su id.",
        "Motores: **SQLite** (un archivo, ideal para aprender), **MySQL/MariaDB**, **PostgreSQL**, **SQL Server**. También existen bases **NoSQL** (MongoDB) para otros usos.",
        "Un técnico de soporte se cruza con bases de datos al hacer backups de sistemas de gestión, instalar servidores de bases de datos para un programa o sacar reportes."
      ],
      [
        "Descargá **DB Browser for SQLite** (gratuito).",
        "Diseñá en papel la base de un servicio técnico: tablas `clientes`, `equipos`, `ordenes` con sus campos, PK y FK.",
        "Dibujá las relaciones (un cliente tiene N equipos, un equipo tiene N órdenes).",
        "Comparalo con tu planilla de órdenes de trabajo: ¿qué datos se repetían que ahora no?",
        "Creá la base `servicio.db` en DB Browser (todavía vacía)."
      ],
      [
        ["¿Qué es una clave primaria?", ["Una contraseña", "Un campo que identifica cada fila de forma única", "El nombre de la tabla", "Una copia de seguridad"], 1, "No puede repetirse."],
        ["Un cliente con muchas órdenes es una relación…", ["1 a 1", "1 a N", "N a N", "Ninguna"], 1, "Un cliente → muchas órdenes."],
        ["¿Qué motor guarda toda la base en un solo archivo y es ideal para aprender?", ["SQL Server", "SQLite", "Oracle", "MongoDB"], 1, "SQLite: sin servidor."]
      ]),
    L("Crear tablas e insertar datos",
      [
        "**SQL** es el lenguaje estándar para bases relacionales.",
        ">>CREATE TABLE clientes (\n  id INTEGER PRIMARY KEY,\n  nombre TEXT NOT NULL,\n  telefono TEXT,\n  ciudad TEXT\n);\n\nCREATE TABLE ordenes (\n  id INTEGER PRIMARY KEY,\n  id_cliente INTEGER REFERENCES clientes(id),\n  fecha TEXT,\n  equipo TEXT,\n  problema TEXT,\n  precio REAL,\n  estado TEXT DEFAULT 'pendiente'\n);",
        ">>INSERT INTO clientes (nombre, telefono, ciudad)\nVALUES ('Ana Gómez', '379-4123456', 'Corrientes');\n\nUPDATE ordenes SET estado = 'terminada' WHERE id = 3;\nDELETE FROM ordenes WHERE id = 7;",
        "**¡Cuidado!** Un `UPDATE` o `DELETE` **sin WHERE** afecta a **todas** las filas. Antes de modificar, hacé un `SELECT` con el mismo WHERE para ver qué vas a tocar.",
        "Tipos comunes: INTEGER, REAL, TEXT, DATE (en SQLite las fechas se guardan como texto ISO `2026-11-20`)."
      ],
      [
        "En DB Browser → pestaña «Ejecutar SQL», creá las tablas `clientes` y `ordenes` del ejemplo.",
        "Insertá 8 clientes y 15 órdenes con datos inventados (distintas ciudades, estados y precios).",
        "Actualizá el estado de 3 órdenes a «terminada».",
        "Borrá una orden con WHERE (verificando antes con SELECT).",
        "Guardá los cambios (Ctrl + S) y el script SQL en `05-Programacion/sql/`."
      ],
      [
        ["¿Qué pasa con `DELETE FROM ordenes;` sin WHERE?", ["Nada", "Borra todas las filas", "Borra la primera", "Da error siempre"], 1, "Por eso siempre verificar con SELECT antes."],
        ["¿Qué comando agrega filas?", ["ADD", "INSERT INTO", "UPDATE", "CREATE"], 1, "INSERT INTO tabla (campos) VALUES (...)."],
        ["¿Qué hace REFERENCES clientes(id)?", ["Crea un índice", "Define una clave foránea hacia clientes", "Borra clientes", "Ordena"], 1, "Vincula la orden con su cliente."]
      ]),
    L("Consultas con SELECT",
      [
        ">>SELECT * FROM clientes;\nSELECT nombre, ciudad FROM clientes WHERE ciudad = 'Corrientes';\nSELECT * FROM ordenes WHERE precio > 20000 AND estado = 'pendiente';\nSELECT * FROM clientes WHERE nombre LIKE 'A%';     -- empieza con A\nSELECT * FROM ordenes ORDER BY fecha DESC LIMIT 5;\nSELECT DISTINCT ciudad FROM clientes;",
        "Operadores: `=`, `<>` (distinto), `>`, `<`, `BETWEEN 1000 AND 5000`, `IN ('Corrientes','Resistencia')`, `IS NULL`, `LIKE` con `%` (cualquier texto) y `_` (un carácter).",
        "`ORDER BY` ordena (ASC por defecto, DESC descendente). `LIMIT` limita la cantidad de filas.",
        "Los comentarios en SQL se escriben con `--`.",
        "SQL no distingue mayúsculas en las palabras clave, pero por convención se escriben en MAYÚSCULAS."
      ],
      [
        "Listá todos los clientes ordenados por nombre.",
        "Listá las órdenes pendientes con precio mayor a un valor que elijas.",
        "Buscá clientes cuyo teléfono empiece con `379`.",
        "Mostrá las 3 órdenes más caras.",
        "Mostrá las ciudades distintas donde tenés clientes."
      ],
      [
        ["¿Qué devuelve `LIKE 'A%'`?", ["Textos que terminan en A", "Textos que empiezan con A", "Solo «A»", "Nada"], 1, "% = cualquier secuencia de caracteres."],
        ["¿Cómo ordenás de mayor a menor?", ["ORDER BY campo ASC", "ORDER BY campo DESC", "SORT campo", "GROUP BY"], 1, "DESC = descendente."],
        ["¿Qué operador significa «distinto» en SQL estándar?", ["!=", "<>", "Ambos suelen funcionar, <> es el estándar", "=="], 2, "<> es el estándar; muchos motores aceptan !=."]
      ]),
    L("Agrupar y unir tablas (GROUP BY y JOIN)",
      [
        "Funciones de agregado: `COUNT`, `SUM`, `AVG`, `MAX`, `MIN`.",
        ">>SELECT estado, COUNT(*) AS cantidad, SUM(precio) AS total\nFROM ordenes\nGROUP BY estado;\n\nSELECT ciudad, COUNT(*) FROM clientes\nGROUP BY ciudad HAVING COUNT(*) > 1;",
        "`WHERE` filtra filas **antes** de agrupar; `HAVING` filtra **después** de agrupar.",
        "**JOIN** combina tablas relacionadas:",
        ">>SELECT c.nombre, o.fecha, o.equipo, o.precio\nFROM ordenes o\nJOIN clientes c ON o.id_cliente = c.id\nWHERE o.estado = 'pendiente';",
        "- `INNER JOIN` (o `JOIN`): solo filas con coincidencia en ambas tablas.",
        "- `LEFT JOIN`: todas las filas de la izquierda, aunque no tengan pareja (ej. clientes sin órdenes).",
        "Con JOIN + GROUP BY sacás reportes de negocio: facturación por cliente, por mes, el cliente que más gasta."
      ],
      [
        "Contá las órdenes por estado.",
        "Calculá cuánto facturó cada cliente (JOIN + GROUP BY + SUM) ordenado de mayor a menor.",
        "Listá los clientes que **no tienen** órdenes (LEFT JOIN … WHERE o.id IS NULL).",
        "Calculá el precio promedio de las órdenes por ciudad.",
        "Guardá todas las consultas en `05-Programacion/sql/reportes.sql` con un comentario que explique cada una."
      ],
      [
        ["¿Qué diferencia hay entre WHERE y HAVING?", ["Ninguna", "WHERE filtra antes de agrupar; HAVING después", "HAVING es más rápido", "WHERE solo sirve con JOIN"], 1, "HAVING trabaja con los grupos."],
        ["¿Qué JOIN muestra también los clientes sin órdenes?", ["INNER JOIN", "LEFT JOIN (con clientes a la izquierda)", "CROSS JOIN", "Ninguno"], 1, "LEFT conserva todas las filas de la tabla izquierda."],
        ["¿Qué función cuenta filas?", ["SUM", "COUNT", "AVG", "MAX"], 1, "COUNT(*)."]
      ]),
    L("Bases de datos en el mundo real",
      [
        "Tareas de soporte relacionadas con bases de datos:",
        "- **Backup** de la base de un sistema de gestión: con la herramienta del sistema o `mysqldump -u usuario -p base > backup.sql` (MySQL) / `pg_dump` (PostgreSQL). Copiar el archivo de una base **en uso** puede dar una copia corrupta.",
        "- **Instalar** un motor (ej. SQL Server Express para un sistema contable) y abrir el puerto en el firewall solo para la red local.",
        "- **Usuarios y permisos**: cada sistema con su usuario, nunca usar el administrador (root/sa) para todo.",
        "- **Exportar** a Excel/CSV para reportes.",
        "**Inyección SQL**: un ataque donde el atacante mete código SQL en un formulario (`' OR '1'='1`). Se previene con **consultas parametrizadas** (lo vas a ver en Python).",
        "Herramientas: **DBeaver** (cliente universal gratuito), MySQL Workbench, pgAdmin, SQL Server Management Studio.",
        "Saber SQL básico es un diferencial en pasantías: muchos puestos de soporte piden «consultas SQL básicas»."
      ],
      [
        "Instalá **DBeaver** y abrí con él tu `servicio.db`.",
        "Exportá el resultado de tu reporte de facturación por cliente a CSV y abrilo en Excel.",
        "Desde DB Browser, exportá toda la base a un archivo `.sql` (Archivo → Exportar → Base de datos a archivo SQL). Ese es un backup lógico.",
        "Borrá la base, creá una nueva e **importá** el `.sql`: verificá que volvió todo.",
        "Investigá qué es la inyección SQL y escribí con tus palabras cómo funciona y cómo se evita."
      ],
      [
        ["¿Qué riesgo tiene copiar el archivo de una base de datos mientras está en uso?", ["Ninguno", "La copia puede quedar corrupta", "Se borra la base", "Se duplica el tamaño"], 1, "Usar la herramienta de backup del motor."],
        ["¿Cómo se previene la inyección SQL?", ["Con contraseñas largas", "Con consultas parametrizadas", "Con antivirus", "Con un firewall"], 1, "Nunca concatenar texto del usuario en una consulta."],
        ["¿Qué hace mysqldump?", ["Borra la base", "Genera un backup en SQL de una base MySQL", "Instala MySQL", "Acelera consultas"], 1, "Backup lógico."]
      ])
  ],
  lab: {
    titulo: "Base de datos de tu servicio técnico",
    pasos: [
      "Completá `servicio.db` con tablas `clientes`, `equipos`, `ordenes` y `repuestos` (con claves foráneas).",
      "Cargá datos realistas: 15 clientes, 20 equipos, 30 órdenes.",
      "Escribí 10 consultas de negocio: órdenes pendientes con datos del cliente, facturación mensual, equipo más reparado, clientes frecuentes, etc.",
      "Exportá un reporte a Excel con gráfico.",
      "Guardá el backup `.sql` y un documento con el diagrama de tablas (podés usar draw.io)."
    ],
    entregable: "Base de datos + 10 consultas + reporte en Excel."
  }
}
);
