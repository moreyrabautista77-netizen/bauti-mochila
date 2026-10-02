// Estructura general del curso, fases, metas e hitos.
// Las semanas se agregan desde fase1.js … fase6.js.

const CURSO = {
  inicio: "2026-10-02",
  minutosPorDia: 60,
  // Colores de las fases tomados del código de colores de resistencias (1 marrón … 6 azul)
  fases: [
    {
      n: 1, nombre: "Fundamentos y hardware", color: "marron",
      objetivo: "Conocer la computadora por dentro: armar, configurar el BIOS, diagnosticar el hardware e instalar sistemas operativos.",
      metas: [
        "Convertir números entre decimal, binario y hexadecimal sin calculadora",
        "Armar la ficha técnica completa de tu PC",
        "Presupuestar 3 PCs compatibles con precios reales",
        "Hacer un servicio técnico completo (físico + lógico) con orden de trabajo",
        "Instalar Windows y Linux en máquinas virtuales",
        "Tener tu pendrive del técnico booteable con Ventoy"
      ]
    },
    {
      n: 2, nombre: "Sistemas operativos y soporte", color: "rojo",
      objetivo: "Administrar Windows y Linux, dominar la consola y resolver problemas de usuarios con método.",
      metas: [
        "Configurar usuarios, permisos NTFS y carpetas compartidas de una oficina",
        "Usar 30 comandos de CMD/PowerShell de memoria",
        "Escribir 5 scripts (.bat, .ps1, .sh) útiles y documentados",
        "Moverte en la terminal de Linux: archivos, permisos, paquetes y servicios",
        "Resolver 5 tickets simulados aplicando los 6 pasos de diagnóstico",
        "Explicar un problema técnico en lenguaje simple a un usuario"
      ]
    },
    {
      n: 3, nombre: "Redes", color: "naranja",
      objetivo: "Diseñar, configurar y diagnosticar redes pequeñas y medianas.",
      metas: [
        "Recitar el orden de colores T568B y las 7 capas OSI",
        "Calcular una subred en menos de 2 minutos",
        "Saber de memoria los 15 puertos más usados",
        "Armar en Packet Tracer la red de una pyme con router, DHCP y varias subredes",
        "Diagnosticar cualquier falta de conexión con la escalera de ping",
        "Completar al menos un curso gratuito de Cisco Netacad"
      ]
    },
    {
      n: 4, nombre: "Seguridad, datos y ofimática", color: "amarillo",
      objetivo: "Proteger y recuperar datos, y resolver necesidades de oficina con Excel, Word y SQL.",
      metas: [
        "Auditar la seguridad de un hogar y dejarlo en verde",
        "Tener tu propio backup 3-2-1 funcionando y probado",
        "Recuperar archivos borrados de un pendrive con Recuva y PhotoRec",
        "Hacer un sistema de gestión en Excel con BUSCARX, tablas dinámicas y macros",
        "Escribir consultas SQL con JOIN y GROUP BY",
        "Activar 2FA y gestor de contraseñas en tus cuentas"
      ]
    },
    {
      n: 5, nombre: "Programación y automatización", color: "verde",
      objetivo: "Programar en Python, automatizar tareas de soporte y publicar tus proyectos.",
      metas: [
        "Escribir programas en Python con funciones, listas, diccionarios y archivos",
        "Automatizar un backup con rotación y logging",
        "Crear tu caja de herramientas de soporte en Python",
        "Publicar tu sitio personal en GitHub Pages",
        "Tener al menos 3 repositorios en GitHub con README",
        "Resolver un problema real con automatización y medir el tiempo ahorrado"
      ]
    },
    {
      n: 6, nombre: "Profesional y pasantías", color: "azul",
      objetivo: "Llegar a la pasantía con CV, portfolio, entrevista practicada y criterio profesional.",
      metas: [
        "CV de 1 página revisado por un docente",
        "Perfil de LinkedIn completo con certificados",
        "Presentación de 1 minuto grabada y practicada",
        "Simulacro de entrevista técnica completo",
        "Lista de precios y plantillas de presupuesto propias",
        "Plan de certificaciones para los próximos 6 meses"
      ]
    }
  ],
  objetivosGenerales: [
    "Cubrir las 7 funciones de tu perfil profesional de Técnico en Informática Profesional y Personal.",
    "Estudiar 1 hora todos los días: 15 min de teoría, 35 de práctica en la PC y 10 de prueba.",
    "Llegar a la pasantía con promedio de 9 o más en los exámenes semanales.",
    "Terminar con un portfolio público (sitio + GitHub) que demuestre lo que sabés hacer.",
    "Obtener al menos 2 certificados gratuitos (Cisco Netacad) antes de marzo de 2027."
  ],
  certificaciones: [
    { nombre: "Cisco Netacad — Introducción a la Ciberseguridad", cuando: "Semana 13", gratis: true },
    { nombre: "Cisco Netacad — Networking Basics", cuando: "Semanas 9–12", gratis: true },
    { nombre: "Cisco Netacad — Getting Started with Packet Tracer", cuando: "Semana 11", gratis: true },
    { nombre: "Microsoft Learn — Fundamentos de Azure (módulos)", cuando: "Semana 21", gratis: true },
    { nombre: "CompTIA A+ (Core 1 y 2)", cuando: "Después del curso", gratis: false },
    { nombre: "Google IT Support (Coursera, con ayuda financiera)", cuando: "Después del curso", gratis: false }
  ],
  semanas: []
};

// Constructor compacto de lecciones
function L(titulo, teoria, practica, preguntas) {
  return { titulo, teoria, practica, preguntas };
}
