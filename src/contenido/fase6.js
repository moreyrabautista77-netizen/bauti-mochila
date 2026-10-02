// FASE 6 — Profesional y pasantías (semana 22)

CURSO.semanas.push(
{
  fase: 6,
  titulo: "Listo para las pasantías",
  meta: "Venderte bien, asesorar en compras, gestionar tu trabajo y llegar a la entrevista con todo preparado.",
  lecciones: [
    L("Asesorar en compra y venta",
      [
        "Tu perfil incluye **asesorar y apoyar la compra y venta** de productos y servicios informáticos. Proceso profesional:",
        "- **1. Relevar requerimientos**: ¿para qué lo usa? ¿qué programas? ¿movilidad? ¿presupuesto? ¿cuántos años debe durar?",
        "- **2. Identificar productos** que cumplan, sin vender de más ni de menos.",
        "- **3. Fuentes de aprovisionamiento**: mayoristas, tiendas, importación; comparar **garantía**, **soporte**, disponibilidad de repuestos y forma de pago (cuotas, financiación).",
        "- **4. Comparar** en una tabla: especificaciones, precio, garantía, costo total (incluyendo licencias e instalación).",
        "- **5. Recomendar** con fundamentos y dejar que el cliente decida.",
        "- **6. Gestionar la compra, instalar y capacitar**.",
        "Ética comercial: recomendar lo que el cliente **necesita**, transparentar comisiones o márgenes si los hay, no vender software sin licencia.",
        "Saber explicar especificaciones en términos de beneficios: «16 GB de RAM = podés tener muchas pestañas y programas abiertos sin que se trabe»."
      ],
      [
        "Caso: una contadora necesita notebook para trabajar en casa y en el estudio, con Excel pesado y sistemas AFIP/ARCA, presupuesto medio. Hacé el relevamiento (las preguntas) y una tabla comparando 3 notebooks reales.",
        "Agregá a la comparación: garantía oficial, peso, autonomía, posibilidad de ampliar RAM/SSD.",
        "Escribí la recomendación final en 5 líneas, en lenguaje simple.",
        "Caso 2: un comercio quiere 3 PCs para caja. Proponé equipos, UPS, impresora fiscal/térmica y presupuesto total.",
        "Guardá todo en `06-Profesional/asesoramiento.xlsx`."
      ],
      [
        ["¿Cuál es el primer paso del asesoramiento de compra?", ["Mostrar el equipo más caro", "Relevar las necesidades y el presupuesto del cliente", "Pedir seña", "Instalar"], 1, "Sin requerimientos no hay buena recomendación."],
        ["Además del precio, ¿qué hay que comparar?", ["Solo el color", "Garantía, soporte, repuestos y costo total", "Solo la marca", "Nada más"], 1, "El costo total incluye licencias, instalación y garantía."],
        ["¿Cómo explicás «SSD NVMe» a un cliente?", ["Igual, que lo busque", "La compu arranca y abre programas mucho más rápido", "Es un procesador", "Es un virus"], 1, "Hablá de beneficios, no de siglas."]
      ]),
    L("Autogestión y emprendimiento",
      [
        "El perfil dice que el técnico **autogestiona** sus actividades y puede tener su **microemprendimiento**.",
        "Organización personal:",
        "- **Agenda** y lista de tareas (Google Calendar, Trello, Notion). Priorizar por urgencia e importancia.",
        "- **Registro de trabajos** (tu planilla de órdenes o tu base de datos): tiempo, materiales, resultado.",
        "- **Actualización permanente**: la tecnología cambia rápido; reservá tiempo semanal para aprender.",
        "Emprender como técnico en Argentina:",
        "- **Monotributo** (ARCA, ex AFIP): régimen simplificado para facturar. Categoría según ingresos.",
        "- **Precio**: costo de tu hora (lo que querés ganar + gastos + impuestos ÷ horas trabajadas), más materiales. Investigá precios de mercado de tu zona.",
        "- **Presupuesto por escrito** antes de trabajar, con validez y condiciones.",
        "- **Garantía** de tu trabajo (ej. 30 días sobre la mano de obra).",
        "- **Marca personal**: nombre, Instagram/WhatsApp Business, Google Business Profile, recomendaciones de clientes.",
        "- **Comparar resultados técnicos y económicos** de cada trabajo para mejorar (lo dice textual tu perfil)."
      ],
      [
        "Calculá tu **precio por hora**: definí ingreso mensual deseado, gastos (herramientas, internet, transporte, monotributo) y horas disponibles.",
        "Armá una **lista de precios** de 10 servicios (formateo + instalación, limpieza, cambio a SSD, configuración de router, recuperación de datos, etc.).",
        "Diseñá una **plantilla de presupuesto** en Word/Excel con tus datos, condiciones y validez.",
        "Investigá en la web de ARCA qué es el monotributo y cuál sería la categoría inicial.",
        "Creá un tablero en Trello o Notion con columnas: Pendiente, En curso, Esperando repuesto, Terminado, Entregado."
      ],
      [
        ["¿Qué régimen simplificado usa un técnico independiente en Argentina para facturar?", ["Sociedad anónima", "Monotributo", "Ninguno", "Ganancias de empresa"], 1, "Se gestiona en ARCA (ex AFIP)."],
        ["¿Qué conviene entregar antes de empezar un trabajo?", ["Nada", "Un presupuesto por escrito con condiciones", "La factura", "El equipo reparado"], 1, "Evita malentendidos."],
        ["¿Por qué registrar cada trabajo?", ["Por obligación escolar", "Para comparar resultados técnicos y económicos y mejorar", "No sirve", "Para el antivirus"], 1, "Es autogestión profesional."]
      ]),
    L("Ética, legalidad y conducta profesional",
      [
        "Un técnico tiene acceso a información sensible. La confianza es tu capital.",
        "- **Confidencialidad**: no mirar, copiar ni comentar datos de clientes (Ley 25.326 de Protección de Datos Personales).",
        "- **Software legal**: no instalar copias piratas ni activadores (Ley 11.723 de Propiedad Intelectual).",
        "- **Delitos informáticos** (Ley 26.388): acceder sin autorización a sistemas, interceptar comunicaciones o dañar datos es delito. Todo lo que aprendiste de redes y seguridad se usa **solo con permiso**.",
        "- **Consentimiento**: antes de borrar, formatear, acceder remotamente o cambiar algo importante, el cliente debe estar informado y de acuerdo (mejor por escrito).",
        "- **Respeto de políticas** de la organización: en una pasantía, seguí los procedimientos aunque sepas «otra forma».",
        "- **Saber derivar**: si algo excede tu capacidad (recuperación de disco con falla física, una placa con soldaduras complejas), decilo y derivá. Es profesionalismo, no debilidad.",
        "Conducta en la pasantía: puntualidad, preguntar sin miedo, anotar todo, pedir feedback, ser proactivo y documentar lo que hacés."
      ],
      [
        "Leé un resumen de las leyes 25.326, 11.723 y 26.388 y escribí 2 situaciones de soporte técnico que podrían violar cada una.",
        "Redactá un **formulario de conformidad** para que el cliente firme antes de un formateo o recuperación de datos.",
        "Escribí 3 situaciones éticamente difíciles (ej.: encontrás algo ilegal en una PC, un cliente te pide entrar al Facebook de su pareja) y cómo actuarías.",
        "Escribí tu **código de conducta personal** como técnico (10 puntos).",
        "Pedile a un adulto que trabaje (familiar, docente) que te cuente qué valora en un pasante. Anotalo."
      ],
      [
        ["Un cliente te pide que entres a la cuenta de otra persona. ¿Qué hacés?", ["Lo hago si paga", "Me niego: es un acceso no autorizado y puede ser delito", "Lo hago en secreto", "Le enseño a hacerlo"], 1, "Ley 26.388 de delitos informáticos."],
        ["¿Qué ley protege los datos personales en Argentina?", ["Ley 25.326", "Ley 11.723", "Ley 26.388", "Ninguna"], 0, "Protección de Datos Personales."],
        ["Un disco tiene falla mecánica grave. Lo profesional es…", ["Abrirlo en casa", "Informar al cliente y derivar a un laboratorio especializado", "Golpearlo", "Formatearlo"], 1, "Saber derivar es parte del perfil."]
      ]),
    L("CV, LinkedIn y portfolio",
      [
        "**CV** de 1 página, claro y sin faltas:",
        "- Datos de contacto (mail profesional, teléfono, ciudad, enlace a LinkedIn y GitHub/portfolio).",
        "- **Perfil** de 3 líneas: quién sos y qué ofrecés. Ej.: «Estudiante de último año de Técnico en Informática Profesional y Personal. Experiencia práctica en armado y mantenimiento de PC, redes, scripting en PowerShell y Python. Busco pasantía en soporte técnico».",
        "- **Formación**: escuela técnica, cursos (Cisco Netacad, etc.) con certificados.",
        "- **Habilidades técnicas** agrupadas: Hardware, Sistemas (Windows, Linux), Redes, Seguridad, Ofimática, Programación.",
        "- **Proyectos**: 3 a 5 de este curso, con resultado concreto (verbo + qué + resultado: «Automaticé el backup diario de un comercio con Python, reduciendo el riesgo de pérdida de datos»).",
        "- Idiomas y habilidades blandas (con ejemplos).",
        "**LinkedIn**: foto profesional, titular claro, «Acerca de», proyectos, certificados, y conectá con gente del rubro de tu zona.",
        "Tu **portfolio** ya existe: tu sitio en GitHub Pages + repos. Llevalo en el CV y en la entrevista."
      ],
      [
        "Escribí tu CV de 1 página (Word o Google Docs) con todo lo hecho en el curso.",
        "Exportalo a PDF con nombre `CV_Nombre_Apellido.pdf`.",
        "Creá o mejorá tu perfil de LinkedIn y cargá los certificados de Netacad.",
        "Revisá que tus repos de GitHub tengan README y que tu sitio funcione.",
        "Pedile a un docente que revise tu CV y anotá las correcciones."
      ],
      [
        ["¿Qué largo debe tener un CV de pasante?", ["5 páginas", "1 página", "Media línea", "No importa"], 1, "Conciso y fácil de leer."],
        ["¿Cómo conviene describir un proyecto?", ["«Hice cosas de redes»", "Verbo + qué hiciste + resultado concreto", "Solo el nombre", "Con muchos emojis"], 1, "Muestra impacto."],
        ["¿Qué demuestra mejor tus habilidades?", ["Decir que sabés", "Proyectos visibles (GitHub, portfolio) y certificados", "La foto", "El color del CV"], 1, "Evidencia concreta."]
      ]),
    L("La entrevista técnica",
      [
        "Preparación:",
        "- Investigá la empresa: qué hace, qué tecnología usa.",
        "- Practicá tu **presentación de 1 minuto**: quién sos, qué sabés hacer, qué te interesa, por qué ahí.",
        "- Respondé situaciones con el método **STAR**: **S**ituación, **T**area, **A**cción, **R**esultado.",
        "Preguntas técnicas típicas de soporte:",
        "- ¿Qué hacés si una PC no enciende? ¿Y si no da imagen?",
        "- Un usuario no tiene internet: ¿cómo lo diagnosticás? (escalera de ping).",
        "- Diferencia entre RAM y almacenamiento; entre HDD y SSD; entre switch y router.",
        "- ¿Qué es DHCP? ¿DNS? ¿Qué es una IP 169.254?",
        "- ¿Cómo eliminás un malware? ¿Qué es la regla 3-2-1?",
        "- Puertos de RDP, HTTPS, SSH, DNS.",
        "- ¿Cómo tratás a un usuario enojado?",
        "Si no sabés algo: **«No lo sé, pero lo buscaría así…»**. Mostrar método vale más que inventar.",
        "Al final, hacé preguntas: ¿cómo es un día típico? ¿qué herramientas usan? ¿qué esperan de un pasante?"
      ],
      [
        "Escribí y grabá tu presentación de 1 minuto. Repetila hasta que salga natural.",
        "Respondé por escrito con método STAR: «Contame un problema técnico que resolviste».",
        "Respondé en voz alta las 7 preguntas técnicas de la teoría, cronometrando 1–2 minutos cada una.",
        "Hacé un **simulacro de entrevista** con un familiar o compañero usando tus preguntas.",
        "Prepará 3 preguntas para hacerle al entrevistador."
      ],
      [
        ["¿Qué significa STAR?", ["Una marca", "Situación, Tarea, Acción, Resultado", "Un protocolo de red", "Un tipo de CV"], 1, "Estructura para contar experiencias."],
        ["Te preguntan algo que no sabés. Lo mejor es…", ["Inventar", "Decir que no lo sabés y explicar cómo lo averiguarías", "Quedarte callado", "Cambiar de tema"], 1, "Mostrás honestidad y método."],
        ["Una PC tiene IP 169.254.x.x. En la entrevista respondés que…", ["Está perfecta", "No obtuvo IP del DHCP: reviso cable/Wi-Fi, router y renuevo la IP", "Tiene virus", "Falta RAM"], 1, "Pregunta clásica de soporte."]
      ])
  ],
  lab: {
    titulo: "Examen final y carpeta profesional",
    pasos: [
      "Rendí el **examen final** de la app (todas las semanas) y repasá los temas donde fallaste.",
      "Armá tu **carpeta profesional**: CV en PDF, enlace a portfolio, certificados, 3 informes técnicos de ejemplo (de tus labs), lista de precios y plantillas.",
      "Hacé un último **simulacro de entrevista** completo (técnico + personal).",
      "Revisá tus metas del curso en la app y escribí qué lograste y qué te falta.",
      "Escribí tu plan de los próximos 6 meses: certificación, cursos y proyectos."
    ],
    entregable: "Carpeta profesional completa + plan de los próximos 6 meses."
  }
}
);
