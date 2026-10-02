// FASE 2 — Sistemas operativos y soporte al usuario (semanas 5 a 8)

CURSO.semanas.push(
{
  fase: 2,
  titulo: "Administración de Windows",
  meta: "Manejar usuarios, permisos, servicios, procesos y registros de eventos como un técnico de soporte.",
  lecciones: [
    L("Cuentas de usuario y UAC",
      [
        "Tipos de cuenta: **Administrador** (puede instalar y cambiar el sistema) y **Estándar** (uso diario). Buena práctica: el usuario trabaja con cuenta estándar y el técnico tiene una cuenta admin aparte.",
        "Cuenta **local** vs **cuenta Microsoft** (sincroniza OneDrive, licencia, contraseñas). En empresas: cuentas de **dominio** (Active Directory) o **Entra ID**.",
        "**UAC (Control de cuentas de usuario)** pide confirmación cuando un programa quiere permisos de administrador. No se desactiva: es una barrera contra malware.",
        "Herramientas:",
        "- Configuración → Cuentas.",
        "- `netplwiz` y `lusrmgr.msc` (usuarios y grupos locales, en Pro).",
        "- Desde la consola: `net user` lista usuarios; `net user pepe /add` crea uno; `net localgroup administradores` muestra admins.",
        "Si un usuario olvidó la contraseña de una cuenta Microsoft, se recupera online. Si es local, otro admin puede cambiarla; por eso siempre conviene una **segunda cuenta admin**."
      ],
      [
        "En tu VM de Windows, creá un usuario estándar `alumno` y uno administrador `soporte`.",
        "Iniciá sesión como `alumno` e intentá instalar un programa: observá el pedido de UAC.",
        "Abrí CMD como administrador y ejecutá `net user` y `net localgroup administradores`.",
        "Creá por consola un usuario `prueba` con `net user prueba Clave123! /add` y borralo con `net user prueba /delete`.",
        "Anotá en la bitácora por qué el usuario no debería trabajar como administrador."
      ],
      [
        ["¿Por qué conviene que el usuario diario sea estándar?", ["Porque es más rápido", "Porque reduce el daño que puede hacer el malware o un error", "Porque Windows lo exige", "Para que no use internet"], 1, "Sin privilegios de admin, el malware tiene menos alcance."],
        ["¿Qué comando lista los usuarios locales?", ["ipconfig", "net user", "dir", "tasklist"], 1, "net user muestra las cuentas locales."],
        ["¿Qué hace el UAC?", ["Acelera la PC", "Pide confirmación antes de acciones con privilegios de admin", "Hace backups", "Bloquea internet"], 1, "Es una capa de protección."]
      ]),
    L("Permisos NTFS y carpetas compartidas",
      [
        "En NTFS cada archivo/carpeta tiene una lista de permisos (**ACL**): Control total, Modificar, Lectura y ejecución, Lectura, Escritura.",
        "Los permisos se **heredan** de la carpeta padre. Un **Denegar** explícito gana sobre un Permitir.",
        "Se asignan preferentemente a **grupos**, no a usuarios sueltos: es más fácil de mantener.",
        "Al compartir una carpeta en red se combinan los **permisos de recurso compartido** y los **NTFS**: gana el más restrictivo.",
        "El **propietario** de un archivo puede cambiar sus permisos. Si un archivo «no deja abrirse» tras copiarlo de otro disco, puede que haya que **tomar posesión** (Propiedades → Seguridad → Opciones avanzadas → Propietario).",
        "Consola: `icacls carpeta` muestra los permisos."
      ],
      [
        "Creá `C:\\Datos\\Contabilidad` en la VM. Quitale la herencia y dale permiso de Modificar solo a `soporte` y Lectura a `alumno`.",
        "Iniciá sesión como `alumno` y verificá que podés leer pero no crear archivos.",
        "Ejecutá `icacls C:\\Datos\\Contabilidad` y analizá la salida.",
        "Compartí la carpeta en red (Propiedades → Compartir) y anotá la ruta UNC (`\\\\NOMBRE-PC\\Contabilidad`).",
        "Escribí cómo le explicarías a una secretaria por qué no puede borrar archivos de esa carpeta."
      ],
      [
        ["Si un usuario tiene «Permitir lectura» por un grupo y «Denegar» explícito por otro…", ["Puede leer", "Gana el Denegar", "Se elige al azar", "Puede modificar"], 1, "Denegar explícito tiene prioridad."],
        ["Recurso compartido = Control total, NTFS = Lectura. ¿Qué puede hacer por red?", ["Control total", "Solo leer", "Nada", "Modificar"], 1, "Gana el más restrictivo."],
        ["¿A quién conviene asignar permisos?", ["A cada usuario", "A grupos", "A Todos", "A nadie"], 1, "Grupos = administración ordenada."]
      ]),
    L("Procesos, servicios e inicio",
      [
        "Un **programa** es un archivo; al ejecutarse se vuelve un **proceso** con PID, uso de CPU, RAM, disco y red.",
        "Un **servicio** es un proceso que corre en segundo plano, incluso sin sesión iniciada (Windows Update, Cola de impresión, Defender). Se administran en `services.msc`: tipo de inicio Automático, Manual, Deshabilitado.",
        "Herramientas del técnico:",
        "- **Administrador de tareas**: procesos, rendimiento, inicio, usuarios, detalles.",
        "- **Monitor de recursos** (`resmon`): qué proceso usa disco o red en detalle.",
        "- **Process Explorer** (Sysinternals): versión avanzada, muestra firma digital y procesos sospechosos.",
        "- **Autoruns** (Sysinternals): todo lo que arranca con Windows.",
        "- `msconfig`: arranque selectivo y modo seguro.",
        "Caso clásico: «la impresora no imprime» → reiniciar el servicio **Cola de impresión (Spooler)** y vaciar la carpeta de trabajos."
      ],
      [
        "Abrí `services.msc`, buscá **Cola de impresión**, mirá su tipo de inicio y reinicialo.",
        "Abrí `resmon` y encontrá qué proceso está usando más disco ahora.",
        "Descargá **Sysinternals Suite** desde la web de Microsoft. Abrí **Process Explorer** y activá la verificación de firmas (Options → Verify Image Signatures).",
        "Abrí **Autoruns** y revisá la pestaña Logon. No borres nada; solo identificá cada entrada.",
        "En CMD: `tasklist` y `taskkill /IM notepad.exe /F` (abrí antes un Bloc de notas)."
      ],
      [
        ["¿Qué servicio reiniciás si se trabó la cola de impresión?", ["Windows Update", "Spooler (Cola de impresión)", "DHCP", "Audio"], 1, "Reiniciar el Spooler destraba trabajos colgados."],
        ["¿Qué herramienta muestra TODO lo que arranca con Windows?", ["Paint", "Autoruns", "Calculadora", "WordPad"], 1, "Autoruns de Sysinternals."],
        ["¿Qué comando cierra a la fuerza un proceso?", ["tasklist", "taskkill /F", "net user", "ping"], 1, "taskkill /IM nombre.exe /F."]
      ]),
    L("Visor de eventos y registro de Windows",
      [
        "El **Visor de eventos** (`eventvwr.msc`) guarda lo que pasa en el sistema. Registros principales: **Aplicación**, **Sistema**, **Seguridad**. Niveles: Información, Advertencia, **Error**, **Crítico**.",
        "Eventos útiles para diagnóstico:",
        "- **Kernel-Power 41**: el equipo se apagó sin un cierre correcto (corte, cuelgue, fuente).",
        "- **6008**: apagado inesperado anterior.",
        "- **Disk 7 / 153**: problemas de disco.",
        "- **BugCheck 1001**: hubo pantallazo azul (incluye el código).",
        "El **Registro de Windows** (`regedit`) es la base de datos de configuración: claves HKEY_LOCAL_MACHINE (equipo) y HKEY_CURRENT_USER (usuario). **Siempre exportá la clave antes de modificarla.** Un error puede dejar el sistema sin arrancar.",
        "Para revisar estabilidad general: **Monitor de confiabilidad** (`perfmon /rel`), que muestra un gráfico día por día de errores."
      ],
      [
        "Abrí `perfmon /rel` y buscá el último error crítico de tu PC. Anotá fecha y aplicación.",
        "Abrí `eventvwr.msc` → Registros de Windows → Sistema → Filtrar registro actual → nivel Error y Crítico.",
        "Buscá si hay eventos Kernel-Power 41 y anotá cuándo fueron.",
        "Abrí `regedit`, navegá a `HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Run` (programas de inicio del usuario). Exportá la clave a un .reg como backup.",
        "Escribí un procedimiento de 5 pasos para investigar «la PC se reinició sola anoche»."
      ],
      [
        ["El evento Kernel-Power 41 indica…", ["Inicio de sesión exitoso", "Que el equipo se apagó sin cierre correcto", "Actualización instalada", "Virus detectado"], 1, "Típico de cortes, cuelgues o fuente."],
        ["¿Qué hacés antes de modificar el registro?", ["Nada", "Exportar la clave como backup", "Desactivar el antivirus", "Formatear"], 1, "Así podés volver atrás."],
        ["¿Qué herramienta muestra un historial gráfico de estabilidad?", ["Monitor de confiabilidad (perfmon /rel)", "Paint", "Bloc de notas", "Explorador"], 0, "Muy útil para mostrarle al cliente qué pasó y cuándo."]
      ]),
    L("Configuración profesional del escritorio del usuario",
      [
        "Parte de tu perfil es **optimizar el ambiente de trabajo** y **organizar los archivos** del usuario.",
        "- **Estructura de carpetas** clara: por cliente/año/tema. Nombres de archivo con fecha ISO: `2026-10-15_presupuesto_cliente.xlsx` (así se ordenan solos).",
        "- **Bibliotecas y OneDrive/Google Drive**: sincronizar Documentos y Escritorio para tener copia en la nube.",
        "- **Programas predeterminados**: PDF, navegador, correo.",
        "- **Energía**: plan equilibrado; en notebooks, ajustar suspensión.",
        "- **Accesibilidad**: tamaño de texto, contraste, lupa (para usuarios mayores).",
        "- **Atajos de teclado** que todo usuario debería saber: Win + E (explorador), Win + L (bloquear), Win + V (historial del portapapeles), Win + Shift + S (captura), Alt + Tab, Ctrl + Z.",
        "Capacitar al usuario es parte del trabajo: que entienda y adopte la solución como propia."
      ],
      [
        "Reorganizá tu carpeta Descargas: creá subcarpetas por tipo y mové los archivos.",
        "Activá el **historial del portapapeles** (Win + V) y probalo.",
        "Configurá OneDrive o Google Drive para que respalde una carpeta de tu `Mochila`.",
        "Armá una **hoja de atajos** de 15 atajos de Windows en una página para entregarle a un cliente.",
        "Enseñale a alguien de tu familia 3 atajos y anotá cómo reaccionó y qué tuviste que explicar mejor."
      ],
      [
        ["¿Por qué usar fechas tipo 2026-10-15 al inicio del nombre?", ["Es más lindo", "Los archivos se ordenan cronológicamente solos", "Lo exige Windows", "Ocupa menos espacio"], 1, "Formato ISO año-mes-día ordena bien alfabéticamente."],
        ["¿Qué atajo bloquea la PC rápidamente?", ["Win + L", "Ctrl + C", "Alt + F4", "Win + D"], 0, "Fundamental al dejar el puesto."],
        ["¿Qué atajo abre la herramienta de recorte?", ["Win + Shift + S", "Ctrl + P", "Win + R", "Alt + Tab"], 0, "Captura de una zona de la pantalla."]
      ])
  ],
  lab: {
    titulo: "Puesto de trabajo de una oficina",
    pasos: [
      "En la VM de Windows, simulá una oficina: usuarios `recepcion`, `contador` (estándar) y `soporte` (admin).",
      "Creá `C:\\Empresa` con carpetas `Administracion`, `Recepcion`, `Publico` y asigná permisos coherentes con los roles.",
      "Compartí `Publico` en red con solo lectura.",
      "Configurá para `recepcion`: accesos directos, impresora predeterminada (puede ser Microsoft Print to PDF) y fondo con el logo de la empresa.",
      "Documentá todo en una página: usuarios, contraseñas de ejemplo (nunca reales), permisos y cómo restaurarlo."
    ],
    entregable: "Documento de configuración de la oficina + instantánea de la VM."
  }
},
{
  fase: 2,
  titulo: "Línea de comandos: CMD y PowerShell",
  meta: "Resolver problemas y automatizar tareas desde la consola, sin depender del mouse.",
  lecciones: [
    L("CMD: navegación y archivos",
      [
        "La consola permite trabajar más rápido y hacer cosas que la interfaz no muestra. Abrí **cmd** (o «Terminal») — y como **administrador** cuando el comando lo pida.",
        ">>cd C:\\Users          (cambiar de carpeta)\ncd ..                 (subir un nivel)\ndir /a                (listar, incluidos ocultos)\nmkdir pruebas         (crear carpeta)\ncopy a.txt b.txt      (copiar)\nmove a.txt carpeta\\   (mover)\nren a.txt c.txt       (renombrar)\ndel *.tmp             (borrar)\nrmdir /s carpeta      (borrar carpeta con contenido)\ncls                   (limpiar pantalla)",
        "**Tab** autocompleta nombres. **Flecha arriba** repite comandos. `comando /?` muestra la ayuda.",
        "Comodines: `*` (cualquier texto) y `?` (un carácter). `dir *.pdf` lista todos los PDF.",
        "Rutas con espacios van entre comillas: `cd \"C:\\Program Files\"`.",
        "**Robocopy** es la herramienta profesional para copiar mucho: reintenta, copia permisos, puede espejar carpetas. `robocopy C:\\Origen D:\\Destino /E` copia todo con subcarpetas."
      ],
      [
        "Creá por consola la estructura `C:\\pruebas\\cliente1\\fotos` y `C:\\pruebas\\cliente1\\docs` usando solo `cd` y `mkdir`.",
        "Creá archivos de prueba: `echo hola > docs\\nota.txt` y `echo foto > fotos\\a.jpg`.",
        "Usá `dir /s C:\\pruebas` para ver todo.",
        "Copiá todo a `C:\\respaldo` con `robocopy C:\\pruebas C:\\respaldo /E` y leé el resumen final.",
        "Borrá `C:\\respaldo` con `rmdir /s /q`. Anotá los 10 comandos en tu bitácora con un ejemplo cada uno."
      ],
      [
        ["¿Qué comando lista también archivos ocultos?", ["dir", "dir /a", "ls -x", "show all"], 1, "/a incluye todos los atributos."],
        ["¿Cómo entrás a una carpeta con espacios en el nombre?", ["cd Program Files", "cd \"C:\\Program Files\"", "cd Program_Files", "No se puede"], 1, "Entre comillas."],
        ["¿Qué herramienta conviene para copiar grandes volúmenes con reintentos?", ["copy", "robocopy", "ren", "type"], 1, "Robocopy es robusta y profesional."]
      ]),
    L("CMD: comandos de diagnóstico y reparación",
      [
        "Los comandos que más vas a usar en soporte:",
        ">>systeminfo            (info del equipo, instalación, parches)\nsfc /scannow           (repara archivos de sistema dañados)\nDISM /Online /Cleanup-Image /RestoreHealth   (repara la imagen de Windows)\nchkdsk C: /f           (revisa y corrige errores del sistema de archivos)\ntasklist / taskkill    (procesos)\nshutdown /r /t 0       (reiniciar ya)\nshutdown /s /t 3600    (apagar en 1 hora; /a cancela)\ngpupdate /force        (aplica directivas)\nwinget upgrade --all   (actualiza programas instalados)",
        "Orden recomendado cuando Windows tiene errores raros: primero **DISM /RestoreHealth**, después **sfc /scannow**, reiniciar.",
        "`chkdsk /f` en el disco del sistema se programa para el próximo reinicio. En un disco con fallas físicas, **primero backup**: chkdsk puede empeorar un disco que se está muriendo.",
        "**winget** es el gestor de paquetes de Windows: `winget install 7zip.7zip`, `winget search vlc`. Permite instalar un equipo nuevo en minutos."
      ],
      [
        "Ejecutá `systeminfo` y encontrá: fecha de instalación original, tiempo de arranque y cantidad de revisiones (hotfix).",
        "Como administrador ejecutá `DISM /Online /Cleanup-Image /CheckHealth` y después `sfc /scannow`. Anotá los resultados.",
        "Ejecutá `winget list` y después `winget upgrade` para ver qué programas tienen actualizaciones.",
        "Instalá un programa con winget: `winget install VideoLAN.VLC` (en la VM si preferís).",
        "Programá un apagado en 10 minutos y cancelalo con `shutdown /a`."
      ],
      [
        ["Windows tiene archivos de sistema corruptos. ¿Qué ejecutás?", ["ipconfig /all", "DISM /RestoreHealth y luego sfc /scannow", "format C:", "del *.*"], 1, "DISM repara la imagen; SFC repara archivos."],
        ["¿Qué comando instala programas desde la consola en Windows?", ["apt", "winget", "brew", "pip"], 1, "winget = gestor de paquetes oficial."],
        ["¿Qué riesgo tiene correr chkdsk /f en un disco físicamente dañado?", ["Ninguno", "Puede empeorarlo: primero hay que hacer backup", "Lo arregla siempre", "Borra Windows"], 1, "Datos primero."]
      ]),
    L("Scripts .bat",
      [
        "Un archivo **.bat** es una lista de comandos que se ejecutan en orden. Ideal para tareas repetitivas del usuario (backup, limpieza, mapear unidades).",
        ">>@echo off\necho Iniciando respaldo...\nset FECHA=%date:~-4%-%date:~3,2%-%date:~0,2%\nrobocopy \"%USERPROFILE%\\Documents\" \"D:\\Respaldo\\%FECHA%\" /E /R:1 /W:1\nif %errorlevel% LSS 8 (echo Respaldo OK) else (echo Hubo errores)\npause",
        "Elementos clave:",
        "- `@echo off` oculta los comandos; `echo` muestra mensajes; `pause` espera una tecla.",
        "- Variables: `set NOMBRE=valor` y se usan `%NOMBRE%`. Variables del sistema: `%USERPROFILE%`, `%DATE%`, `%COMPUTERNAME%`.",
        "- `if`, `goto :etiqueta`, `for %%f in (*.txt) do echo %%f`.",
        "- `%errorlevel%` indica si el último comando salió bien.",
        "La fecha `%date%` depende del formato regional; en Argentina es dd/mm/aaaa, por eso el recorte del ejemplo arma aaaa-mm-dd. Con **Programador de tareas** (`taskschd.msc`) podés ejecutar el .bat todos los días."
      ],
      [
        "Creá `respaldo.bat` con el ejemplo, adaptando la ruta de destino a un pendrive o a otra carpeta.",
        "Ejecutalo y verificá la carpeta con la fecha.",
        "Creá `limpieza.bat` que borre `%TEMP%\\*` (con `del /q /f /s`) y muestre «Listo».",
        "Creá un menú: `menu.bat` con opciones 1) respaldo, 2) limpieza, 3) info del equipo (`systeminfo`), usando `set /p OP=Elegí:` y `goto`.",
        "Programá `respaldo.bat` en el Programador de tareas para que corra todos los días a las 20 h."
      ],
      [
        ["¿Qué hace @echo off?", ["Apaga la PC", "Evita que se muestren los comandos al ejecutar el script", "Borra la pantalla", "Desactiva el sonido"], 1, "Hace la salida más limpia."],
        ["¿Cómo se usa una variable llamada DESTINO en un .bat?", ["$DESTINO", "%DESTINO%", "{DESTINO}", "DESTINO()"], 1, "En batch se rodea con %."],
        ["¿Qué herramienta ejecuta un script automáticamente cada día?", ["Programador de tareas", "Paint", "Visor de eventos", "Regedit"], 0, "taskschd.msc."]
      ]),
    L("PowerShell: lo esencial",
      [
        "PowerShell es la consola moderna de Windows. Trabaja con **objetos**, no solo texto. Los comandos se llaman **cmdlets** con forma **Verbo-Sustantivo**.",
        ">>Get-Help Get-Process        (ayuda)\nGet-Command *service*        (buscar comandos)\nGet-Process | Sort-Object CPU -Descending | Select-Object -First 5\nGet-Service | Where-Object Status -eq 'Running'\nGet-ChildItem C:\\Users -Recurse -Filter *.pdf\nGet-ComputerInfo | Select-Object OsName, CsProcessors\nRestart-Service Spooler\nTest-Connection google.com",
        "El **pipe** `|` pasa objetos al siguiente comando. `Where-Object` filtra, `Select-Object` elige columnas, `Sort-Object` ordena, `Export-Csv` guarda en planilla.",
        "Variables: `$nombre = \"Bauti\"`. Bucle: `foreach ($f in Get-ChildItem) { $f.Name }`.",
        "Por seguridad, Windows bloquea scripts `.ps1` por defecto. Para tus propios scripts: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`."
      ],
      [
        "Abrí PowerShell y listá los 5 procesos que más CPU usan.",
        "Listá los servicios detenidos que tienen inicio automático: `Get-Service | Where-Object {$_.Status -eq 'Stopped' -and $_.StartType -eq 'Automatic'}`.",
        "Encontrá los 10 archivos más grandes de tu carpeta de usuario: `Get-ChildItem $HOME -Recurse -File -ErrorAction SilentlyContinue | Sort-Object Length -Descending | Select-Object -First 10 FullName, Length`.",
        "Exportá la lista de programas a CSV: `Get-Package | Select-Object Name, Version | Export-Csv programas.csv -NoTypeInformation` y abrila en Excel.",
        "Anotá en la bitácora 10 cmdlets con su función."
      ],
      [
        ["¿Qué forma tienen los cmdlets de PowerShell?", ["Sustantivo_Verbo", "Verbo-Sustantivo", "verbo.sustantivo", "Libre"], 1, "Ej.: Get-Process, Restart-Service."],
        ["¿Qué hace Where-Object?", ["Ordena", "Filtra objetos según una condición", "Borra", "Exporta"], 1, "Es el filtro del pipeline."],
        ["¿Qué comando reinicia el servicio de impresión?", ["Restart-Service Spooler", "Stop-Computer", "Get-Printer", "Kill-Print"], 0, "Restart-Service + nombre del servicio."]
      ]),
    L("PowerShell aplicado al soporte",
      [
        "Scripts que un técnico usa de verdad:",
        ">>$equipo = Get-ComputerInfo\n$disco = Get-PSDrive C\n\"Equipo: $($equipo.CsName)\"\n\"Windows: $($equipo.OsName)\"\n\"RAM GB: {0:N1}\" -f ($equipo.CsTotalPhysicalMemory/1GB)\n\"Libre C: {0:N1} GB\" -f ($disco.Free/1GB)\nif ($disco.Free -lt 20GB) { Write-Warning \"Poco espacio en disco\" }",
        "Funciones: `function Saludar($n) { \"Hola $n\" }`.",
        "Manejo de errores: `try { ... } catch { Write-Host \"Error: $_\" }`.",
        "Remoto (en redes de empresa): `Invoke-Command -ComputerName PC01 -ScriptBlock { Get-Service }` permite administrar varias PCs a la vez.",
        "Guardá tus scripts en una carpeta con nombres claros y comentarios con `#`. Con el tiempo armás tu **caja de herramientas** personal: es algo que podés mostrar en una entrevista."
      ],
      [
        "Creá `diagnostico.ps1` con el ejemplo y agregale: modelo de CPU, uptime (`(Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime`) e IP (`Get-NetIPAddress -AddressFamily IPv4`).",
        "Hacé que el script guarde el resultado en `informe_NOMBREPC_FECHA.txt` con `Out-File`.",
        "Agregá una advertencia si hay menos de 8 GB de RAM.",
        "Ejecutalo y revisá el informe.",
        "Subí el script a tu carpeta `02-Sistemas/scripts` con comentarios que expliquen cada línea."
      ],
      [
        ["¿Cómo se escribe un comentario en PowerShell?", ["// comentario", "# comentario", "-- comentario", "' comentario"], 1, "# inicia un comentario."],
        ["¿Para qué sirve try/catch?", ["Para repetir", "Para manejar errores sin que el script se corte de golpe", "Para comentar", "Para pedir datos"], 1, "Captura la excepción."],
        ["En PowerShell, 20GB es…", ["Un texto", "Un número: 20 gigabytes en bytes", "Un error", "Una variable"], 1, "PowerShell entiende KB, MB, GB, TB como multiplicadores."]
      ])
  ],
  lab: {
    titulo: "Kit de scripts del técnico",
    pasos: [
      "Reuní en `02-Sistemas/scripts`: `respaldo.bat`, `limpieza.bat`, `menu.bat` y `diagnostico.ps1`.",
      "Agregá `instalar-basicos.ps1` que use winget para instalar: 7-Zip, VLC, navegador, lector PDF y LibreOffice.",
      "Probá `instalar-basicos.ps1` en la VM de Windows limpia (restaurá la instantánea primero).",
      "Escribí un `LEEME.txt` que explique qué hace cada script y cómo se usa.",
      "Cronometrá cuánto tardás en dejar lista una PC nueva usando tus scripts."
    ],
    entregable: "Carpeta de scripts documentada y probada en la VM."
  }
},
{
  fase: 2,
  titulo: "Linux y la terminal Bash",
  meta: "Moverte con soltura en la terminal de Linux: archivos, permisos, paquetes, procesos y usuarios.",
  lecciones: [
    L("Estructura de Linux y navegación",
      [
        "En Linux todo cuelga de una sola raíz `/`. No hay C: ni D:; los discos se **montan** en carpetas.",
        "- `/home/usuario`: archivos personales (`~` es atajo).",
        "- `/etc`: configuración. `/var/log`: registros. `/bin`, `/usr/bin`: programas. `/tmp`: temporales. `/media` o `/mnt`: discos montados. `/dev`: dispositivos.",
        ">>pwd              (dónde estoy)\nls -la           (listar todo con detalles)\ncd /etc          (ir a /etc)\ncd ~             (ir a home)\nmkdir -p a/b/c   (crear carpetas anidadas)\ntouch nota.txt   (crear archivo vacío)\ncp -r a b        (copiar carpeta)\nmv x y           (mover/renombrar)\nrm -r carpeta    (borrar; ¡sin papelera!)",
        "Linux distingue **mayúsculas**: `Foto.jpg` y `foto.jpg` son distintos. Los archivos que empiezan con `.` son ocultos.",
        "`man comando` o `comando --help` muestran la ayuda. Tab autocompleta, flecha arriba repite."
      ],
      [
        "Abrí la terminal en tu VM de Linux (Ctrl + Alt + T).",
        "Recorré `/`, `/etc`, `/var/log` y `/home` con `cd` y `ls -la`. Anotá qué hay en cada una.",
        "Creá `~/practica/{docs,fotos,scripts}` con `mkdir -p ~/practica/{docs,fotos,scripts}`.",
        "Creá 3 archivos con `touch`, movelos entre carpetas y renombralos.",
        "Usá `man ls` y encontrá qué hace `ls -h` y `ls -t`."
      ],
      [
        ["¿Qué representa ~ en la terminal?", ["La raíz", "La carpeta personal del usuario", "La papelera", "/tmp"], 1, "~ = /home/tu_usuario."],
        ["¿Dónde se guarda la configuración del sistema en Linux?", ["/home", "/etc", "/tmp", "/dev"], 1, "/etc contiene los archivos de configuración."],
        ["¿rm envía los archivos a la papelera?", ["Sí", "No, los borra directamente", "Solo con -r", "Solo los ocultos"], 1, "Cuidado: no hay papelera en la terminal."]
      ]),
    L("Ver y buscar contenido",
      [
        ">>cat archivo        (mostrar todo)\nless archivo       (paginar; q para salir)\nhead -n 20 / tail -n 20   (primeras/últimas líneas)\ntail -f /var/log/syslog   (seguir un log en vivo)\ngrep -i error archivo     (buscar texto)\ngrep -r \"192.168\" /etc    (buscar en carpetas)\nfind / -name \"*.conf\" 2>/dev/null\nwc -l archivo      (contar líneas)\ndu -sh *           (tamaño de carpetas)\ndf -h              (espacio en discos)",
        "**Redirecciones**: `>` guarda la salida en un archivo (pisa), `>>` agrega al final, `2>` redirige errores.",
        "**Pipes** `|`: `ps aux | grep firefox`, `cat log | grep error | wc -l`.",
        "Editores en terminal: **nano** (simple: Ctrl+O guarda, Ctrl+X sale) y **vim** (potente; para salir: Esc y `:q!`)."
      ],
      [
        "Ejecutá `df -h` y `du -sh ~/*`: ¿qué carpeta ocupa más?",
        "Mirá los últimos 30 eventos del sistema: `journalctl -n 30` (o `tail -n 30 /var/log/syslog`).",
        "Buscá todos los archivos `.conf` en `/etc` y contalos: `find /etc -name \"*.conf\" 2>/dev/null | wc -l`.",
        "Creá con nano `~/practica/docs/clientes.txt` con 10 nombres y buscá uno con `grep`.",
        "Guardá la salida de `ls -la /etc` en un archivo con `>` y agregá la fecha con `date >> archivo`."
      ],
      [
        ["¿Qué hace `>>`?", ["Pisa el archivo", "Agrega la salida al final del archivo", "Borra", "Compara"], 1, "> sobrescribe, >> agrega."],
        ["¿Qué comando muestra el espacio libre en discos de forma legible?", ["du", "df -h", "ls", "free"], 1, "df -h (human readable)."],
        ["¿Cómo salís de vim sin guardar?", ["Ctrl + C", "Esc y :q!", "exit", "Alt + F4"], 1, "El chiste más viejo de la informática."]
      ]),
    L("Permisos y usuarios en Linux",
      [
        "Cada archivo tiene **dueño**, **grupo** y **otros**, con permisos **r** (leer, 4), **w** (escribir, 2), **x** (ejecutar, 1).",
        ">>-rwxr-x--- 1 bauti tecnicos 512 oct 10 script.sh\n dueño: rwx (7)   grupo: r-x (5)   otros: --- (0)  → 750",
        ">>chmod 750 script.sh       (permisos en número)\nchmod +x script.sh         (hacer ejecutable)\nchown bauti:tecnicos archivo\nsudo comando               (ejecutar como administrador)\nsudo adduser juan          (crear usuario)\nsudo usermod -aG sudo juan (darle permisos de admin)\nwhoami / id                (quién soy)\npasswd                     (cambiar contraseña)",
        "**root** es el superusuario. En Ubuntu/Mint no se usa directamente: se usa `sudo`, que deja registro y pide tu contraseña.",
        "Nunca hagas `chmod 777` «para que ande»: le da permiso total a cualquiera. Es un error de seguridad clásico."
      ],
      [
        "Creá un usuario `invitado` con `sudo adduser invitado`.",
        "Creá `~/practica/secreto.txt`, ponele permisos `600` y verificá con `ls -l`.",
        "Cambiá a invitado con `su - invitado` e intentá leer el archivo. Anotá el error. Salí con `exit`.",
        "Creá un grupo `tecnicos`, agregate y verificá con `id`.",
        "Calculá el número de permisos para: rw-r--r--, rwxrwxr-x, rw-------."
      ],
      [
        ["¿Qué número equivale a rwxr-xr-x?", ["777", "755", "644", "700"], 1, "rwx=7, r-x=5, r-x=5."],
        ["¿Por qué evitar chmod 777?", ["Es lento", "Le da permisos totales a cualquier usuario: inseguro", "No existe", "Borra el archivo"], 1, "Abrís todo a todos."],
        ["¿Qué comando hace ejecutable un script?", ["chmod +x script.sh", "chown script.sh", "run script.sh", "exec +x"], 0, "Agrega el permiso x."]
      ]),
    L("Paquetes, procesos y servicios",
      [
        "En Debian/Ubuntu/Mint se usa **apt**:",
        ">>sudo apt update            (actualiza la lista de paquetes)\nsudo apt upgrade           (actualiza lo instalado)\nsudo apt install htop      (instalar)\nsudo apt remove htop       (quitar)\napt search editor          (buscar)",
        "En Fedora/Rocky: `dnf`. Además existen **Flatpak** y **Snap** para apps de escritorio.",
        "Procesos:",
        ">>ps aux        (todos los procesos)\ntop / htop    (monitor en vivo)\nkill PID      (terminar)\nkill -9 PID   (forzar)\nfree -h       (memoria)\nuptime        (tiempo encendido y carga)",
        "Servicios con **systemd**:",
        ">>systemctl status ssh\nsudo systemctl start|stop|restart ssh\nsudo systemctl enable ssh   (arranca solo al iniciar)\njournalctl -u ssh           (log del servicio)"
      ],
      [
        "Actualizá el sistema con `sudo apt update && sudo apt upgrade -y`.",
        "Instalá `htop`, `neofetch` (o `fastfetch`) y `tree`. Probá cada uno.",
        "Con `htop`, ordená por memoria y encontrá el proceso que más usa.",
        "Instalá el servidor SSH: `sudo apt install openssh-server` y verificá con `systemctl status ssh`.",
        "Desde Windows (si la VM está en modo puente), conectate con `ssh usuario@IP-de-la-VM` (la IP la ves con `ip a`)."
      ],
      [
        ["¿Qué hace `sudo apt update`?", ["Instala actualizaciones", "Actualiza la lista de paquetes disponibles", "Borra paquetes", "Reinicia"], 1, "Después, `upgrade` instala las actualizaciones."],
        ["¿Qué comando hace que un servicio arranque siempre al iniciar?", ["systemctl start", "systemctl enable", "service on", "apt enable"], 1, "enable lo deja habilitado en el arranque."],
        ["¿Qué comando muestra la memoria libre?", ["df -h", "free -h", "ls -m", "mem"], 1, "free -h."]
      ]),
    L("Scripts en Bash",
      [
        "Un script Bash automatiza tareas en Linux:",
        ">>#!/bin/bash\n# respaldo.sh: comprime una carpeta con fecha\nORIGEN=\"$HOME/practica\"\nDESTINO=\"$HOME/respaldos\"\nFECHA=$(date +%Y-%m-%d_%H%M)\nmkdir -p \"$DESTINO\"\ntar -czf \"$DESTINO/practica_$FECHA.tar.gz\" \"$ORIGEN\"\nif [ $? -eq 0 ]; then\n  echo \"Respaldo OK: practica_$FECHA.tar.gz\"\nelse\n  echo \"Error en el respaldo\"\nfi",
        "- La primera línea `#!/bin/bash` (shebang) indica el intérprete.",
        "- Variables sin espacios alrededor del `=`. Se usan con `$VARIABLE`, entre comillas.",
        "- `$(comando)` guarda la salida de un comando. `$?` es el código del último comando (0 = OK).",
        "- Bucles: `for f in *.txt; do echo \"$f\"; done`.",
        "- Ejecutar: `chmod +x respaldo.sh` y `./respaldo.sh`.",
        "Para programarlo: **cron** con `crontab -e` → `0 20 * * * /home/bauti/respaldo.sh` (todos los días a las 20:00)."
      ],
      [
        "Creá `respaldo.sh` con el ejemplo, hacelo ejecutable y probalo.",
        "Listá los respaldos con `ls -lh ~/respaldos` y descomprimí uno en `/tmp` con `tar -xzf archivo -C /tmp`.",
        "Escribí `info.sh` que muestre: usuario, nombre del equipo (`hostname`), IP (`hostname -I`), espacio libre (`df -h /`) y memoria (`free -h`).",
        "Programá `respaldo.sh` con cron para cada día a las 20.",
        "Guardá ambos scripts comentados en tu carpeta de Windows `02-Sistemas/scripts`."
      ],
      [
        ["¿Qué indica `$?` igual a 0?", ["Error", "Que el último comando terminó bien", "Que no hay archivos", "Fin del script"], 1, "0 = éxito."],
        ["¿Cómo se declara una variable en Bash?", ["VAR = 5", "VAR=5", "$VAR=5", "set VAR 5"], 1, "Sin espacios alrededor del =."],
        ["¿Qué hace `0 20 * * *` en cron?", ["Cada 20 minutos", "Todos los días a las 20:00", "El día 20 de cada mes", "Nunca"], 1, "minuto 0, hora 20, todos los días."]
      ])
  ],
  lab: {
    titulo: "Revivir una PC con Linux",
    pasos: [
      "Imaginá un cliente con una PC de 4 GB de RAM y HDD que «ya no anda con Windows». Elegí una distro liviana (Linux Mint XFCE, Lubuntu o Zorin Lite) y justificá.",
      "Instalala en una VM con 2 GB de RAM para simular el equipo.",
      "Dejala lista para el cliente: navegador, LibreOffice, lector PDF, impresora (si podés), actualizaciones automáticas.",
      "Creá el usuario del cliente (estándar) y dejá un usuario admin para vos.",
      "Escribí una **guía de 1 página para el cliente**: cómo prender, dónde están sus archivos, cómo abrir documentos de Word y a quién llamar."
    ],
    entregable: "VM lista + guía para el cliente."
  }
},
{
  fase: 2,
  titulo: "Diagnóstico y atención al usuario",
  meta: "Resolver problemas con método y tratar al usuario de forma profesional, como en una mesa de ayuda real.",
  lecciones: [
    L("Metodología de resolución de problemas",
      [
        "La metodología que usa la industria (CompTIA A+) tiene 6 pasos:",
        "- **1. Identificar el problema**: preguntar al usuario, reproducir la falla, revisar cambios recientes, **hacer backup** si hay riesgo.",
        "- **2. Establecer una teoría de causa probable** (empezar por lo obvio: ¿está enchufado?).",
        "- **3. Probar la teoría**. Si no se confirma, nueva teoría o escalar.",
        "- **4. Plan de acción** e implementación de la solución.",
        "- **5. Verificar** que todo el sistema funciona y aplicar medidas preventivas.",
        "- **6. Documentar** hallazgos, acciones y resultados.",
        "Preguntas clave al usuario: ¿Qué estabas haciendo? ¿Desde cuándo? ¿Aparece algún mensaje? (pedí una foto/captura) ¿Cambiaste o instalaste algo? ¿Le pasa a otros?",
        "Regla de oro: **un cambio a la vez**. Si cambiás tres cosas juntas, no sabés cuál lo arregló."
      ],
      [
        "Escribí los 6 pasos de memoria en tu bitácora.",
        "Aplicalos a este caso: «Mi impresora dice que está desconectada». Escribí qué preguntarías y 3 teorías ordenadas de más a menos probable.",
        "Repetí con: «Internet anda lento solo en mi notebook».",
        "Repetí con: «Word se cierra solo cuando abro un archivo específico».",
        "Pedile a alguien de tu casa que te cuente un problema real de su celular o PC y aplicá el método en vivo."
      ],
      [
        ["¿Cuál es el primer paso de la metodología?", ["Formatear", "Identificar el problema", "Comprar repuestos", "Documentar"], 1, "Sin entender el problema no hay diagnóstico."],
        ["¿Por qué hacer un cambio a la vez?", ["Por pereza", "Para saber qué cambio resolvió (o empeoró) el problema", "Porque Windows no deja más", "No importa"], 1, "Es la base del diagnóstico ordenado."],
        ["¿Cuándo se documenta?", ["Nunca", "Al final, siempre, con hallazgos, acciones y resultados", "Solo si sale mal", "Solo si lo pide el jefe"], 1, "Documentar ahorra tiempo la próxima vez."]
      ]),
    L("Problemas de arranque y pantallazos azules",
      [
        "**Pantallazo azul (BSOD)**: Windows se detiene ante un error grave. El **código de detención** orienta:",
        "- `MEMORY_MANAGEMENT`, `PAGE_FAULT_IN_NONPAGED_AREA` → RAM o driver.",
        "- `IRQL_NOT_LESS_OR_EQUAL`, `SYSTEM_SERVICE_EXCEPTION` → drivers.",
        "- `CRITICAL_PROCESS_DIED` → archivos de sistema (sfc/DISM) o disco.",
        "- `INACCESSIBLE_BOOT_DEVICE` → disco, controlador SATA/RAID/AHCI cambiado en BIOS.",
        "- `VIDEO_TDR_FAILURE` → driver o placa de video.",
        "Herramienta: **BlueScreenView** o **WhoCrashed** leen los archivos de volcado (`C:\\Windows\\Minidump`) y te dicen qué driver estuvo involucrado.",
        "Windows no arranca: 1) desconectar periféricos (USB, discos extra), 2) Reparación de inicio en WinRE, 3) modo seguro y desinstalar lo último, 4) restaurar sistema, 5) `bootrec /fixmbr`, `bootrec /rebuildbcd` o `bcdboot C:\\Windows` desde la consola de WinRE, 6) rescatar datos con un Linux live y reinstalar."
      ],
      [
        "Instalá **BlueScreenView** (NirSoft) y abrí la carpeta Minidump (puede estar vacía si nunca tuviste BSOD: es buena señal).",
        "Buscá en la web 5 códigos de BSOD más comunes y armá una tabla «código → causas → qué probar».",
        "En la VM de Windows, entrá a WinRE → Símbolo del sistema y ejecutá `bcdedit` (solo lectura) para ver la configuración de arranque.",
        "Arrancá la VM de Windows con la ISO de Linux live y accedé a los archivos de la partición de Windows desde el explorador de Linux (técnica de rescate de datos).",
        "Escribí el procedimiento de rescate de datos con Linux live paso a paso."
      ],
      [
        ["Un BSOD MEMORY_MANAGEMENT apunta primero a…", ["La impresora", "RAM o un driver", "El monitor", "La red"], 1, "Probar la RAM con mdsched/MemTest86."],
        ["¿Dónde guarda Windows los volcados de los pantallazos?", ["C:\\Temp", "C:\\Windows\\Minidump", "Documentos", "No los guarda"], 1, "BlueScreenView los interpreta."],
        ["Windows no arranca y el cliente necesita sus fotos YA. ¿Qué hacés?", ["Formatear", "Arrancar con un Linux live y copiar los datos a un disco externo", "Esperar", "Cambiar la placa"], 1, "Rescatar los datos es lo primero."]
      ]),
    L("Lentitud y rendimiento",
      [
        "«La PC está lenta» es la consulta más común. Diagnóstico ordenado:",
        "- **Administrador de tareas**: ¿CPU, RAM o **disco al 100%**? ¿Qué proceso?",
        "- **Disco al 100%** con HDD → casi siempre la solución real es **pasar a SSD**. Revisar también salud con CrystalDiskInfo.",
        "- **RAM al límite** → cerrar pestañas/programas, ampliar RAM.",
        "- **CPU alta** sin motivo → malware (minero), Windows Update en curso, indexación, antivirus escaneando.",
        "- **Programas de inicio** excesivos → deshabilitar.",
        "- **Temperatura** → throttling por polvo o pasta seca.",
        "- **Poco espacio libre** (menos del 10–15 %) → limpiar, mover archivos.",
        "Herramientas: Administrador de tareas, `resmon`, Monitor de rendimiento (`perfmon`), CrystalDiskInfo, HWiNFO, Malwarebytes.",
        "**No uses «optimizadores» milagrosos ni limpiadores de registro**: casi nunca mejoran algo y a veces rompen el sistema."
      ],
      [
        "Generá un informe de rendimiento: `perfmon /report` (como admin). Esperá 60 segundos y leé el diagnóstico.",
        "Medí el tiempo de arranque de tu PC (desde el botón hasta escritorio usable).",
        "Deshabilitá programas de inicio innecesarios y medí otra vez.",
        "Armá una **checklist de 12 puntos para PC lenta** ordenada de lo más rápido/barato a lo más caro.",
        "Escribí el presupuesto que le darías a un cliente para pasar su notebook de HDD a SSD (pieza + clonado + mano de obra)."
      ],
      [
        ["Disco al 100% constante en un HDD. Mejor solución de fondo:", ["Formatear cada mes", "Reemplazar por SSD", "Comprar un optimizador", "Agregar otro monitor"], 1, "El HDD es el cuello de botella."],
        ["CPU alta constante con un proceso desconocido. Sospecha:", ["Normal", "Malware (por ejemplo un minero)", "Falta de RAM", "Monitor"], 1, "Revisar con Process Explorer + Malwarebytes."],
        ["¿Conviene usar limpiadores de registro?", ["Sí, siempre", "No: rara vez ayudan y pueden romper el sistema", "Solo en Linux", "Solo de noche"], 1, "El registro no «se ensucia» de forma que afecte el rendimiento."]
      ]),
    L("Atención al usuario y comunicación",
      [
        "El perfil dice que el técnico «se asimila al espacio social del usuario». En concreto:",
        "- **Escuchar sin interrumpir** y repetir para confirmar: «Entonces, desde ayer la impresora no imprime desde tu PC, ¿es así?».",
        "- **Lenguaje simple**: nada de jerga. En vez de «el DNS no resuelve», «la computadora no encuentra la dirección de las páginas».",
        "- **Empatía**: el usuario está apurado o frustrado. No lo hagas sentir tonto.",
        "- **Expectativas claras**: qué vas a hacer, cuánto puede tardar, qué riesgo hay, cuánto cuesta.",
        "- **Confidencialidad**: no mirar fotos, mails ni archivos personales. Pedir permiso. Nunca compartir datos de un cliente.",
        "- **Capacitar**: al terminar, enseñale cómo evitar el problema.",
        "En empresas se usan sistemas de **tickets** (GLPI, Jira Service Management, osTicket, Zendesk): cada pedido tiene número, prioridad, estado y registro. Niveles de soporte: **N1** (mesa de ayuda, problemas comunes), **N2** (técnico en sitio/especialista), **N3** (ingeniería/proveedor)."
      ],
      [
        "Reescribí en lenguaje simple estas frases: «Hay que flashear el BIOS», «El disco tiene sectores reasignados», «Tenés el DHCP caído», «Se corrompió el perfil de usuario».",
        "Escribí un **guion de atención telefónica**: saludo, toma de datos, preguntas, cierre.",
        "Armá una **plantilla de ticket**: N°, fecha, usuario, contacto, categoría, prioridad, descripción, pasos realizados, solución, tiempo, estado.",
        "Grabate (audio) explicando a un cliente por qué conviene cambiar su HDD por SSD en 1 minuto. Escuchate y mejorá.",
        "Investigá qué es **GLPI** y anotá para qué lo usan las empresas."
      ],
      [
        ["Un cliente te deja la PC con sus fotos privadas. ¿Qué hacés?", ["Las miro para ver si están bien", "Respeto la confidencialidad: solo accedo a lo necesario y con permiso", "Las copio por si acaso", "Las borro"], 1, "Confidencialidad es obligación profesional."],
        ["¿Qué es el soporte de Nivel 1?", ["Ingeniería del fabricante", "Mesa de ayuda que resuelve problemas comunes y deriva los complejos", "El gerente", "Desarrollo"], 1, "N1 es el primer contacto."],
        ["¿Cómo explicás «el DNS no resuelve» a un usuario?", ["Igual, que aprenda", "La computadora no encuentra la dirección de las páginas web", "Es un virus", "No le explico"], 1, "Lenguaje simple y preciso."]
      ]),
    L("Impresoras y periféricos",
      [
        "Las impresoras son el dolor de cabeza número uno de la mesa de ayuda.",
        "Tipos: **inyección de tinta** (hogar, fotos; cabezales que se tapan si no se usan), **láser** (oficina, rápida, tóner; fusor y tambor como consumibles), **térmica** (tickets, etiquetas), **sistema continuo** (tinta en tanques, barata por página).",
        "Conexión: USB, red cableada (IP fija recomendada) o Wi-Fi. En red, la impresora debe tener **IP fija o reservada** en el router: si cambia de IP, «desaparece».",
        "Checklist «no imprime»:",
        "- ¿Encendida, con papel, sin atasco, sin error en el panel?",
        "- ¿Es la impresora predeterminada correcta? ¿Está «en pausa» o «trabajar sin conexión»?",
        "- Cola de impresión trabada → reiniciar el servicio Spooler y vaciar `C:\\Windows\\System32\\spool\\PRINTERS`.",
        "- Driver: instalar el del fabricante; quitar y volver a agregar.",
        "- En red: `ping` a la IP de la impresora, revisar la página de configuración que se imprime desde el panel.",
        "Otros periféricos: escáner (driver TWAIN/WIA), lectores de código de barras (actúan como teclado), monitores (cable, entrada seleccionada, resolución nativa)."
      ],
      [
        "Agregá en tu PC la impresora virtual **Microsoft Print to PDF** e imprimí una página de prueba.",
        "Escribí un script `.bat` que detenga el Spooler, borre los trabajos trabados y lo vuelva a iniciar (`net stop spooler`, `del /q %systemroot%\\System32\\spool\\PRINTERS\\*`, `net start spooler`).",
        "Buscá cómo imprimir la **página de configuración de red** en una impresora HP, Epson y Brother. Anotá cómo se hace en cada una.",
        "Armá una tabla comparativa: costo por página de una tinta, una láser y una de sistema continuo (precios reales).",
        "Anotá qué impresora recomendarías a: un estudiante, un comercio que imprime tickets y una oficina de 10 personas."
      ],
      [
        ["Una impresora de red «desaparece» cada tanto. Causa probable:", ["Falta de tinta", "Cambia de IP: hay que darle IP fija o reservada", "Virus", "Monitor apagado"], 1, "DHCP le asigna otra IP y el equipo apunta a la vieja."],
        ["Para una oficina que imprime mucho texto, conviene…", ["Inyección de tinta de cartucho", "Láser", "Térmica", "Plotter"], 1, "Láser: rápida y bajo costo por página de texto."],
        ["¿Cómo destrabás una cola de impresión?", ["Formateando", "Deteniendo el Spooler, vaciando la carpeta PRINTERS y reiniciando el servicio", "Desenchufando el router", "Cambiando el papel"], 1, "Procedimiento clásico de N1."]
      ])
  ],
  lab: {
    titulo: "Mesa de ayuda simulada: 5 tickets",
    pasos: [
      "En la VM de Windows (con instantánea previa) provocá 5 problemas: 1) servicio de impresión detenido y deshabilitado, 2) adaptador de red deshabilitado, 3) usuario quitado del grupo que accede a una carpeta, 4) programa raro en el inicio, 5) disco casi lleno con un archivo gigante en Temp (`fsutil file createnew %TEMP%\\grande.tmp 5000000000`).",
      "Esperá un día (o pedí a alguien que elija cuál activar sin decirte) y resolvé cada uno como ticket, aplicando los 6 pasos.",
      "Cargá cada ticket en tu plantilla con tiempo de resolución.",
      "Escribí para cada uno la explicación al usuario en lenguaje simple.",
      "Restaurá la instantánea al terminar."
    ],
    entregable: "5 tickets documentados y resueltos."
  }
}
);
