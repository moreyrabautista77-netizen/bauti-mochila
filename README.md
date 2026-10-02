# Mochila de Bauti

App de estudio para llegar a las pasantías como **Técnico en Informática Profesional y Personal** de primer nivel, estudiando **1 hora por día** desde el **2 de octubre de 2026** hasta el **4 de marzo de 2027** (154 sesiones).

## Cómo usarla

- **En la PC:** abrí `index.html` con doble clic (funciona sin internet; tu avance queda guardado en ese navegador).
- **Online:** la versión publicada guarda el avance en tu cuenta y la podés abrir también desde el celular.
- Para pasar tu avance de un lugar a otro: sección **Datos → Código de respaldo**.

## Qué tiene

- **22 semanas en 6 fases** que cubren las 7 funciones del perfil profesional:
  1. Fundamentos y hardware (armado, BIOS/UEFI, diagnóstico, instalación de sistemas)
  2. Sistemas operativos y soporte (Windows, CMD/PowerShell, Linux/Bash, mesa de ayuda)
  3. Redes (cableado, IP y subnetting, Packet Tracer, diagnóstico)
  4. Seguridad, backup y recuperación de datos, Excel/Word avanzado y SQL
  5. Programación y automatización (Python, web, Git/GitHub, nube, IA)
  6. Profesional y pasantías (asesoramiento de compra, emprendimiento, ética, CV, entrevista)
- **Cada semana:** 5 lecciones (15′ teoría + 35′ práctica en la PC + 10′ prueba), 1 laboratorio práctico y 1 examen semanal. Al final, examen final de 30 preguntas.
- **110 lecciones, 22 laboratorios, 330 preguntas** con explicación.
- **Metas** por fase para tildar, hitos con fecha, rango (de Aprendiz a Técnico de primer nivel) y certificaciones recomendadas.
- **Repaso** de las preguntas que fallaste, bitácora diaria y racha de días.

## Para modificar el contenido

El contenido está en `src/contenido/` (una fase por archivo), la app en `src/app.js` y los estilos en `src/estilos.css`. Después de editar:

```
python3 build.py
```

Eso regenera `index.html` (para abrir en la PC) y `dist/mochila.html` (para publicar).
