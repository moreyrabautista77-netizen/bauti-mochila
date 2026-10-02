// Mochila de Bauti — app de estudio diario (1 hora por día)
(function () {
  "use strict";

  const DIA_MS = 86400000;
  const CLAVE_LOCAL = "mochila-bauti-v1";
  const COLORES = { marron: "--f1", rojo: "--f2", naranja: "--f3", amarillo: "--f4", verde: "--f5", azul: "--f6" };
  const DIAS_SEM = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const RANGOS = ["Aprendiz", "Técnico en formación", "Técnico N1", "Técnico N2", "Técnico de primer nivel"];
  const APROBADO = 0.7;

  // ---------- Estado ----------
  function estadoVacio() {
    return { v: 1, updatedAt: 0, inicio: CURSO.inicio, done: {}, steps: {}, quiz: {}, exams: {}, goals: {}, notes: {}, wrong: {} };
  }
  let S = estadoVacio();
  try {
    const t = localStorage.getItem(CLAVE_LOCAL);
    if (t) S = Object.assign(estadoVacio(), JSON.parse(t));
  } catch (e) { /* sin almacenamiento local: se sigue en memoria */ }

  let vista = { nombre: "hoy" };
  let examen = null; // sesión de examen o repaso en curso
  let sync = "local"; // "local" | "nube"

  // ---------- Calendario ----------
  function fechaLocal(iso) { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); }
  function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function hoyISO() { return iso(new Date()); }
  function fmt(d, conDia) { return (conDia ? DIAS_SEM[d.getDay()] + " " : "") + d.getDate() + " " + MESES[d.getMonth()]; }

  const DIAS = [];
  CURSO.semanas.forEach((sem, w) => {
    for (let k = 0; k < 7; k++) {
      let tipo = k < 5 ? "leccion" : k === 5 ? "lab" : "examen";
      if (w === CURSO.semanas.length - 1 && k === 6) tipo = "final";
      DIAS.push({ idx: w * 7 + k, w, k, tipo });
    }
  });
  const TOTAL = DIAS.length;
  function fechaDe(idx) { const d = fechaLocal(S.inicio); d.setDate(d.getDate() + idx); return d; }
  function idxHoy() {
    const diff = Math.floor((fechaLocal(hoyISO()) - fechaLocal(S.inicio)) / DIA_MS);
    return diff;
  }
  function tituloDia(d) {
    const sem = CURSO.semanas[d.w];
    if (d.tipo === "leccion") return sem.lecciones[d.k].titulo;
    if (d.tipo === "lab") return "Laboratorio: " + sem.lab.titulo;
    if (d.tipo === "examen") return "Examen semanal: " + sem.titulo;
    return "Examen final del curso";
  }
  function tipoTexto(t) { return { leccion: "Lección", lab: "Laboratorio", examen: "Examen", final: "Examen final" }[t]; }
  function faseDe(w) { return CURSO.fases[CURSO.semanas[w].fase - 1]; }
  function colorFase(f) { return "var(" + COLORES[f.color] + ")"; }

  // ---------- Preguntas ----------
  function pregunta(qid) {
    const [w, k, i] = qid.split("-").map(Number);
    const p = CURSO.semanas[w].lecciones[k].preguntas[i];
    return { qid, w, k, texto: p[0], opciones: p[1], correcta: p[2], porque: p[3] };
  }
  function qidsSemana(w) {
    const out = [];
    CURSO.semanas[w].lecciones.forEach((l, k) => l.preguntas.forEach((_, i) => out.push(w + "-" + k + "-" + i)));
    return out;
  }
  function mezclar(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  // ---------- Métricas ----------
  function hecho(idx) { return !!S.done[idx]; }
  function totalHechos() { return Object.keys(S.done).length; }
  function pendientesHasta(n) { const out = []; for (let i = 0; i <= Math.min(n, TOTAL - 1); i++) if (!hecho(i)) out.push(i); return out; }
  function racha() {
    const fechas = new Set(Object.values(S.done));
    let d = fechaLocal(hoyISO());
    if (!fechas.has(iso(d))) d.setDate(d.getDate() - 1);
    let n = 0;
    while (fechas.has(iso(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function promedioExamenes() {
    const v = Object.values(S.exams).map(e => e.best);
    if (!v.length) return null;
    return v.reduce((a, b) => a + b, 0) / v.length;
  }
  function aciertosQuiz() {
    let ok = 0, tot = 0;
    for (const idx in S.quiz) {
      const d = DIAS[idx]; if (!d) continue;
      const ans = S.quiz[idx];
      CURSO.semanas[d.w].lecciones[d.k].preguntas.forEach((p, i) => { if (ans[i] !== undefined) { tot++; if (ans[i] === p[2]) ok++; } });
    }
    return { ok, tot };
  }
  function puntos() {
    let p = 0;
    for (const idx in S.done) { const d = DIAS[idx]; if (!d) continue; p += d.tipo === "leccion" ? 10 : d.tipo === "lab" ? 25 : 30; }
    p += aciertosQuiz().ok * 2;
    return p;
  }
  function nivel() { const pct = totalHechos() / TOTAL; return Math.min(RANGOS.length - 1, Math.floor(pct * RANGOS.length)); }
  function progresoFase(n) {
    const ds = DIAS.filter(d => CURSO.semanas[d.w].fase === n);
    return ds.filter(d => hecho(d.idx)).length / ds.length;
  }
  function finFase(n) { const ds = DIAS.filter(d => CURSO.semanas[d.w].fase === n); return ds[ds.length - 1].idx; }

  // ---------- Guardado ----------
  let timerNube = null, enVuelo = Promise.resolve(), refNube = null;
  function guardar() {
    S.updatedAt = Date.now();
    try { localStorage.setItem(CLAVE_LOCAL, JSON.stringify(S)); } catch (e) { /* ignorar */ }
    if (refNube) {
      clearTimeout(timerNube);
      timerNube = setTimeout(() => {
        const datos = { json: JSON.stringify(S), updatedAt: S.updatedAt };
        enVuelo = enVuelo.then(() => refNube.set(datos)).catch(() => {});
      }, 1200);
    }
  }
  async function conectarNube() {
    for (let i = 0; i < 12 && !(window.claude && window.claude.use); i++) await new Promise(r => setTimeout(r, 250));
    if (!(window.claude && window.claude.use)) return;
    try {
      const db = await window.claude.use("db");
      const user = await window.claude.use("user");
      if (!db || !user) return;
      const id = await user.id();
      if (!id) return;
      const ref = db.doc("data/users/" + id + "/progreso");
      const snap = await ref.get();
      if (snap.exists) {
        const r = snap.data();
        if (r && r.updatedAt > S.updatedAt && r.json) {
          S = Object.assign(estadoVacio(), JSON.parse(r.json));
          try { localStorage.setItem(CLAVE_LOCAL, JSON.stringify(S)); } catch (e) { /* ignorar */ }
          refNube = ref; sync = "nube"; render();
          return;
        }
      }
      refNube = ref; sync = "nube";
      if (S.updatedAt) await ref.set({ json: JSON.stringify(S), updatedAt: S.updatedAt });
      render();
    } catch (e) { /* queda en modo local */ }
  }

  // ---------- Utilidades de render ----------
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function inline(s) {
    return esc(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  }
  function teoriaHTML(items) {
    let html = "", lista = [];
    const cerrar = () => { if (lista.length) { html += "<ul>" + lista.map(x => "<li>" + inline(x) + "</li>").join("") + "</ul>"; lista = []; } };
    items.forEach(t => {
      if (t.startsWith("- ")) { lista.push(t.slice(2)); return; }
      cerrar();
      if (t.startsWith(">>")) html += "<pre><code>" + esc(t.slice(2)) + "</code></pre>";
      else html += "<p>" + inline(t) + "</p>";
    });
    cerrar();
    return html;
  }
  function band(f, alto) { return '<span class="band" style="background:' + colorFase(f) + (alto ? ";height:" + alto : "") + '"></span>'; }
  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast"; t.setAttribute("role", "status"); t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  }
  const $main = () => document.getElementById("app");

  function ir(v) { vista = v; examen = null; render(); window.scrollTo(0, 0); }

  // ---------- Vistas ----------
  function render() {
    const hoy = idxHoy();
    document.getElementById("daytag").textContent =
      hoy < 0 ? "Empieza el " + fmt(fechaLocal(S.inicio), true)
      : hoy >= TOTAL ? "Curso terminado"
      : "DÍA " + String(hoy + 1).padStart(3, "0") + "/" + TOTAL;
    document.querySelectorAll(".nav button").forEach(b => {
      const activo = b.dataset.v === vista.nombre || (vista.nombre === "dia" && b.dataset.v === "plan");
      if (activo) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    });
    const m = $main();
    if (vista.nombre === "hoy") m.innerHTML = vHoy();
    else if (vista.nombre === "plan") m.innerHTML = vPlan();
    else if (vista.nombre === "dia") m.innerHTML = vDia(vista.idx);
    else if (vista.nombre === "metas") m.innerHTML = vMetas();
    else if (vista.nombre === "repaso") m.innerHTML = vRepaso();
    else if (vista.nombre === "datos") m.innerHTML = vDatos();
  }

  function vHoy() {
    const hoy = idxHoy();
    const idx = Math.max(0, Math.min(TOTAL - 1, hoy));
    const d = DIAS[idx], sem = CURSO.semanas[d.w], f = faseDe(d.w);
    const pend = pendientesHasta(Math.min(hoy, TOTAL) - 1);
    const prom = promedioExamenes();
    const nv = nivel();
    let aviso = "";
    if (hoy < 0) aviso = '<span class="chip copper">Arranca el ' + fmt(fechaLocal(S.inicio), true) + ': podés adelantar</span>';
    else if (pend.length) aviso = '<span class="chip warn">' + pend.length + (pend.length === 1 ? " sesión atrasada" : " sesiones atrasadas") + '</span> <button class="btn small" data-ir="' + pend[0] + '">Ir a la primera pendiente</button>';
    else if (hoy >= 0) aviso = '<span class="chip ok">Al día</span>';

    // Semana actual
    let strip = "";
    for (let k = 0; k < 7; k++) {
      const di = d.w * 7 + k, dd = DIAS[di], fe = fechaDe(di);
      const cls = ["ws-day", hecho(di) ? "done" : (di < hoy ? "behind" : ""), di === hoy ? "today" : ""].join(" ");
      strip += '<button class="' + cls + '" data-ir="' + di + '" title="' + esc(tituloDia(dd)) + '"><small>' + DIAS_SEM[fe.getDay()] + '</small><b>' + fe.getDate() + '</b><small>' + (dd.tipo === "leccion" ? "L" + (k + 1) : dd.tipo === "lab" ? "LAB" : "EX") + "</small></button>";
    }

    return '' +
      '<section class="hero">' +
        '<div class="hero-band" style="background:' + colorFase(f) + '"></div>' +
        '<div class="hero-body">' +
          '<div class="eyebrow">' + (hoy < 0 ? "Primera sesión" : "Sesión de hoy") + ' · ' + fmt(fechaDe(idx), true) + ' · Semana ' + (d.w + 1) + ' · Fase ' + f.n + '</div>' +
          '<h2>' + esc(tituloDia(d)) + '</h2>' +
          '<p class="muted">' + esc(sem.meta) + '</p>' +
          (d.tipo === "leccion" ? '<div class="timeline-day" aria-label="Plan de la hora"><div class="td-t">15′ teoría</div><div class="td-p">35′ práctica en la PC</div><div class="td-q">10′ prueba</div></div>' : "") +
          '<div class="row"><button class="btn primary" data-ir="' + idx + '">' + (hecho(idx) ? "Repasar la sesión" : "Empezar") + '</button>' + aviso + '</div>' +
        '</div>' +
      '</section>' +
      '<section class="stats">' +
        stat(totalHechos() + '<small> / ' + TOTAL + '</small>', "sesiones completas") +
        stat(racha() + '<small> días</small>', "racha actual") +
        stat(prom === null ? "—" : (prom * 10).toFixed(1), "promedio de exámenes (sobre 10)") +
        stat(puntos(), "puntos de experiencia") +
      '</section>' +
      '<section class="panel">' +
        '<div class="row"><h3>Semana ' + (d.w + 1) + ': ' + esc(sem.titulo) + '</h3></div>' +
        '<div class="week-strip">' + strip + '</div>' +
      '</section>' +
      '<section class="grid2">' +
        '<div class="panel"><div class="eyebrow">Objetivo de la fase ' + f.n + '</div><div class="row">' + band(f) + '<h3>' + esc(f.nombre) + '</h3></div><p>' + esc(f.objetivo) + '</p>' +
          '<div class="bar" aria-label="Progreso de la fase"><span style="width:' + Math.round(progresoFase(f.n) * 100) + '%;background:' + colorFase(f) + '"></span></div>' +
          '<button class="btn small ghost" data-v="metas">Ver metas de la fase</button></div>' +
        '<div class="panel"><div class="eyebrow">Tu rango</div><h3>' + RANGOS[nv] + '</h3>' +
          '<div class="rank">' + RANGOS.map((_, i) => '<i class="' + (i <= nv ? "on" : "") + '"></i>').join("") + '</div>' +
          '<p class="muted">' + (nv < RANGOS.length - 1 ? "Siguiente: " + RANGOS[nv + 1] + ". Completá sesiones y aprobá exámenes para subir." : "Nivel máximo: listo para la pasantía.") + '</p></div>' +
      '</section>';
  }
  function stat(valor, etiqueta) { return '<div class="stat"><b>' + valor + '</b><small>' + etiqueta + '</small></div>'; }

  function vPlan() {
    const hoy = idxHoy();
    let html = '<div class="row"><div><div class="eyebrow">' + TOTAL + ' sesiones de 1 hora · ' + fmt(fechaDe(0)) + ' → ' + fmt(fechaDe(TOTAL - 1)) + ' ' + fechaDe(TOTAL - 1).getFullYear() + '</div><h2>Plan completo</h2></div></div>';
    CURSO.fases.forEach(f => {
      const semanas = CURSO.semanas.map((s, w) => ({ s, w })).filter(x => x.s.fase === f.n);
      const desde = fechaDe(semanas[0].w * 7), hasta = fechaDe(semanas[semanas.length - 1].w * 7 + 6);
      html += '<section class="phase"><div class="phase-head">' + band(f, "22px") + '<h3>Fase ' + f.n + ' · ' + esc(f.nombre) + '</h3><span class="muted">' + fmt(desde) + ' – ' + fmt(hasta) + '</span><span class="spacer"></span><span class="chip">' + Math.round(progresoFase(f.n) * 100) + '%</span></div><div class="weeks">';
      semanas.forEach(({ s, w }) => {
        const abierta = hoy >= w * 7 && hoy < w * 7 + 7;
        let dots = "", dias = "";
        for (let k = 0; k < 7; k++) {
          const di = w * 7 + k, dd = DIAS[di];
          dots += '<i class="' + (hecho(di) ? "on" : "") + '"></i>';
          dias += '<button class="day-link" data-ir="' + di + '"><span class="date">' + fmt(fechaDe(di), true) + '</span><span class="t"><span class="kind">' + tipoTexto(dd.tipo) + '</span><br>' + esc(tituloDia(dd)) + '</span><span class="check ' + (hecho(di) ? "on" : "") + '" aria-label="' + (hecho(di) ? "completa" : "pendiente") + '">✓</span></button>';
        }
        const ex = S.exams[w];
        html += '<details class="week"' + (abierta ? " open" : "") + '><summary><span class="wk-num">SEM ' + String(w + 1).padStart(2, "0") + '</span><span class="wk-title"><b>' + esc(s.titulo) + '</b><small>' + esc(s.meta) + '</small></span>' + (ex ? '<span class="chip ' + (ex.best >= APROBADO ? "ok" : "bad") + '">' + Math.round(ex.best * 10) + '/10</span>' : "") + '<span class="wk-dots">' + dots + '</span></summary><div class="days">' + dias + '</div></details>';
      });
      html += '</div></section>';
    });
    return html;
  }

  function cabeceraDia(d) {
    const f = faseDe(d.w), sem = CURSO.semanas[d.w];
    const sub = d.tipo === "leccion" ? "Lección " + (d.k + 1) + " de 5" : tipoTexto(d.tipo);
    return '<header class="session-head"><div class="row">' + band(f) + '<span class="eyebrow">Día ' + String(d.idx + 1).padStart(3, "0") + ' · ' + fmt(fechaDe(d.idx), true) + ' · Semana ' + (d.w + 1) + ' · ' + sub + '</span></div><h2>' + esc(tituloDia(d)) + '</h2><p class="muted">Fase ' + f.n + ' · ' + esc(f.nombre) + ' — ' + esc(sem.titulo) + '</p></header>';
  }
  function barraHecho(d) {
    const h = S.done[d.idx];
    return '<div class="done-bar">' + (h
      ? '<span><strong>Sesión completa</strong> <span class="muted">(' + fmt(fechaLocal(h), true) + ')</span></span><button class="btn small ghost" data-act="deshacer">Marcar como pendiente</button>'
      : '<span>¿Terminaste la hora de hoy?</span><button class="btn primary" data-act="completar">Marcar sesión como completa</button>') + '</div>';
  }
  function pager(idx) {
    return '<nav class="pager">' + (idx > 0 ? '<button class="btn ghost" data-ir="' + (idx - 1) + '">← Día anterior</button>' : "<span></span>") + (idx < TOTAL - 1 ? '<button class="btn ghost" data-ir="' + (idx + 1) + '">Día siguiente →</button>' : "") + '</nav>';
  }
  function notas(idx) {
    return '<section class="panel"><div class="sec-title"><h3>Bitácora del día</h3><span class="min">qué aprendiste · qué te costó</span></div><textarea id="nota-' + idx + '" data-nota="' + idx + '" placeholder="Escribí acá tus notas. Se guardan solas.">' + esc(S.notes[idx] || "") + '</textarea></section>';
  }
  function pasos(lista, prefijo) {
    return '<ul class="steps">' + lista.map((p, i) => {
      const key = prefijo + ":" + i, on = !!S.steps[key];
      return '<li class="' + (on ? "done" : "") + '"><label><input type="checkbox" id="paso-' + key.replace(":", "-") + '" data-paso="' + key + '"' + (on ? " checked" : "") + '><span>' + inline(p) + '</span></label></li>';
    }).join("") + '</ul>';
  }

  function vDia(idx) {
    const d = DIAS[idx];
    if (d.tipo === "leccion") return vLeccion(d);
    if (d.tipo === "lab") return vLab(d);
    return vExamen(d);
  }

  function vLeccion(d) {
    const l = CURSO.semanas[d.w].lecciones[d.k];
    const ans = S.quiz[d.idx] || {};
    const respondidas = Object.keys(ans).length;
    const ok = l.preguntas.filter((p, i) => ans[i] === p[2]).length;
    const qs = l.preguntas.map((p, i) => preguntaHTML({ texto: p[0], opciones: p[1], correcta: p[2], porque: p[3] }, ans[i], "quiz", d.idx + ":" + i, true, d.w + "-" + d.k + "-" + i)).join("");
    return cabeceraDia(d) +
      '<div class="timeline-day"><div class="td-t">15′ teoría</div><div class="td-p">35′ práctica en la PC</div><div class="td-q">10′ prueba</div></div>' +
      '<section class="panel"><div class="sec-title"><h3>Teoría</h3><span class="min">15 min</span></div><div class="theory">' + teoriaHTML(l.teoria) + '</div></section>' +
      '<section class="panel"><div class="sec-title"><h3>Práctica en la PC</h3><span class="min">35 min · tildá cada paso</span></div>' + pasos(l.practica, d.idx) + '</section>' +
      '<section class="panel"><div class="sec-title"><h3>Prueba</h3><span class="min">10 min</span><span class="spacer"></span>' + (respondidas === l.preguntas.length ? '<span class="score">' + ok + '/' + l.preguntas.length + '</span><button class="btn small ghost" data-act="reintentar">Reintentar</button>' : "") + '</div>' + qs + '</section>' +
      notas(d.idx) + barraHecho(d) + pager(d.idx);
  }

  function vLab(d) {
    const lab = CURSO.semanas[d.w].lab;
    return cabeceraDia(d) +
      '<section class="panel"><div class="sec-title"><h3>Proyecto práctico</h3><span class="min">60 min</span></div><p>Hoy no hay teoría nueva: aplicás lo de la semana en un trabajo como los que vas a hacer en la pasantía.</p>' + pasos(lab.pasos, d.idx) +
      '<p><span class="chip copper">Entregable</span> ' + inline(lab.entregable) + '</p></section>' +
      notas(d.idx) + barraHecho(d) + pager(d.idx);
  }

  // Orden de opciones mezclado pero estable para cada pregunta (siempre igual para la misma semilla)
  function ordenOpciones(n, semilla) {
    let h = 2166136261;
    for (let i = 0; i < semilla.length; i++) { h ^= semilla.charCodeAt(i); h = Math.imul(h, 16777619); }
    const orden = [...Array(n).keys()];
    for (let i = n - 1; i > 0; i--) { h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; const j = h % (i + 1); [orden[i], orden[j]] = [orden[j], orden[i]]; }
    return orden;
  }

  function preguntaHTML(p, elegida, modo, clave, inmediata, semilla) {
    const respondida = elegida !== undefined && elegida !== null;
    const mostrar = inmediata ? respondida : (modo === "examen" && examen && examen.corregido);
    const orden = ordenOpciones(p.opciones.length, semilla);
    const letraCorrecta = "ABCD"[orden.indexOf(p.correcta)];
    const opts = orden.map((j, pos) => { const o = p.opciones[j];
      let cls = "opt";
      if (mostrar) { if (j === p.correcta) cls += " right"; else if (j === elegida) cls += " wrong"; }
      else if (respondida && j === elegida) cls += " right";
      const dis = (inmediata && respondida) || (!inmediata && examen && examen.corregido);
      return '<button class="' + cls + '" data-resp="' + modo + '|' + clave + '|' + j + '"' + (dis ? " disabled" : "") + '><span class="letter">' + "ABCD"[pos] + '</span><span>' + inline(o) + '</span></button>';
    }).join("");
    return '<div class="q"><div class="q-text">' + inline(p.texto) + '</div><div class="opts">' + opts + '</div>' +
      (mostrar ? '<div class="why"><strong>' + (elegida === p.correcta ? "Correcto. " : "Respuesta: " + letraCorrecta + ". ") + '</strong>' + inline(p.porque) + '</div>' : "") + '</div>';
  }

  function vExamen(d) {
    const final = d.tipo === "final";
    const key = final ? "final" : d.w;
    const prev = S.exams[key];
    const cant = final ? 30 : 10;
    let cuerpo;
    if (!examen || examen.key !== key) {
      cuerpo = '<section class="panel"><div class="sec-title"><h3>' + (final ? "Examen final" : "Examen semanal") + '</h3><span class="min">' + cant + ' preguntas · aprobás con ' + Math.round(cant * APROBADO) + '</span></div>' +
        '<p>' + (final ? "Preguntas al azar de las 22 semanas. Es tu simulacro antes de la pasantía." : "Preguntas al azar de las 5 lecciones de la semana. Después de corregir, las que falles van a la sección Repaso.") + '</p>' +
        (prev ? '<p>Mejor resultado: <strong>' + Math.round(prev.best * cant) + '/' + cant + '</strong> · último: ' + Math.round(prev.last * cant) + '/' + cant + '</p>' : "") +
        '<p class="muted">Usá el resto de la hora para releer la teoría de los temas que falles.</p>' +
        '<div class="row"><button class="btn primary" data-act="empezar-examen">' + (prev ? "Rendir de nuevo" : "Empezar examen") + '</button></div></section>';
    } else {
      cuerpo = vSesionPreguntas();
    }
    return cabeceraDia(d) + cuerpo + notas(d.idx) + barraHecho(d) + pager(d.idx);
  }

  function nuevaSesion(key, qids, titulo) {
    examen = { key, titulo, qids, ans: {}, corregido: false };
  }
  function vSesionPreguntas() {
    const e = examen;
    const n = e.qids.length;
    const resp = Object.keys(e.ans).length;
    const qs = e.qids.map((qid, i) => {
      const p = pregunta(qid);
      return '<div class="eyebrow">Pregunta ' + (i + 1) + ' de ' + n + ' · Semana ' + (p.w + 1) + '</div>' + preguntaHTML(p, e.ans[i], "examen", i, false, qid);
    }).join("");
    let pie;
    if (e.corregido) {
      const ok = e.qids.filter((q, i) => e.ans[i] === pregunta(q).correcta).length;
      const aprob = ok / n >= APROBADO;
      pie = '<div class="done-bar"><span class="score">' + ok + '/' + n + '</span><span class="chip ' + (aprob ? "ok" : "bad") + '">' + (aprob ? "Aprobado" : "A repasar") + '</span><span class="spacer"></span><button class="btn" data-act="otra-vez">Otra vez</button></div>';
    } else {
      pie = '<div class="done-bar"><span>' + resp + ' de ' + n + ' respondidas</span><button class="btn primary" data-act="corregir"' + (resp < n ? " disabled" : "") + '>Corregir</button></div>';
    }
    return '<section class="panel"><div class="sec-title"><h3>' + esc(e.titulo) + '</h3></div>' + qs + '</section>' + pie;
  }

  function vMetas() {
    const nv = nivel();
    let html = '<div><div class="eyebrow">Hacia la pasantía · ' + fmt(fechaDe(TOTAL - 1)) + ' ' + fechaDe(TOTAL - 1).getFullYear() + '</div><h2>Objetivos y metas</h2></div>';
    html += '<section class="panel"><h3>Objetivos generales</h3><ul class="goal-list">' + CURSO.objetivosGenerales.map(o => '<li><span>' + inline(o) + '</span></li>').join("") + '</ul></section>';

    html += '<section class="grid2"><div class="panel"><div class="eyebrow">Rango actual</div><h3>' + RANGOS[nv] + '</h3><div class="rank">' + RANGOS.map((_, i) => '<i class="' + (i <= nv ? "on" : "") + '"></i>').join("") + '</div><p class="muted">' + RANGOS.join(" → ") + '</p></div>';
    html += '<div class="panel"><div class="eyebrow">Avance por área</div>' + CURSO.fases.map(f => {
      const p = Math.round(progresoFase(f.n) * 100);
      return '<div class="skill">' + band(f, "12px") + '<span>' + esc(f.nombre) + '</span><div class="bar"><span style="width:' + p + '%;background:' + colorFase(f) + '"></span></div><span class="pct">' + p + '%</span></div>';
    }).join("") + '</div></section>';

    // Hitos
    const hoy = idxHoy();
    let proximo = false;
    html += '<section class="panel"><h3>Hitos</h3><div class="milestones">' + CURSO.fases.map(f => {
      const fin = finFase(f.n), ok = progresoFase(f.n) === 1;
      let cls = ok ? "done" : "";
      if (!ok && !proximo && fin >= hoy) { cls = "next"; proximo = true; }
      return '<div class="ms ' + cls + '"><span class="date">' + fmt(fechaDe(fin), true) + '</span><span class="node"></span><span><strong>Fin de la fase ' + f.n + ':</strong> ' + esc(f.nombre) + '<br><span class="muted">' + esc(f.objetivo) + '</span></span></div>';
    }).join("") + '</div></section>';

    // Metas por fase
    CURSO.fases.forEach(f => {
      const hechas = f.metas.filter((_, i) => S.goals[f.n + "-" + i]).length;
      html += '<section class="panel"><div class="row">' + band(f) + '<h3>Fase ' + f.n + ' · ' + esc(f.nombre) + '</h3><span class="spacer"></span><span class="chip">' + hechas + '/' + f.metas.length + ' metas</span></div><p class="muted">' + esc(f.objetivo) + '</p><ul class="goal-list">' +
        f.metas.map((m, i) => { const k = f.n + "-" + i, on = !!S.goals[k]; return '<li class="' + (on ? "done" : "") + '"><label><input type="checkbox" id="meta-' + k + '" data-meta="' + k + '"' + (on ? " checked" : "") + '><span>' + esc(m) + '</span></label></li>'; }).join("") +
        '</ul></section>';
    });

    html += '<section class="panel"><h3>Certificaciones y cursos recomendados</h3><ul class="goal-list">' + CURSO.certificaciones.map(c => '<li><span><strong>' + esc(c.nombre) + '</strong> <span class="muted">· ' + esc(c.cuando) + '</span> <span class="chip ' + (c.gratis ? "ok" : "") + '">' + (c.gratis ? "gratis" : "pago / beca") + '</span></span></li>').join("") + '</ul></section>';
    return html;
  }

  function vRepaso() {
    if (examen && examen.key === "repaso") return '<div><div class="eyebrow">Repaso</div><h2>Práctica</h2></div>' + vSesionPreguntas();
    const errores = Object.keys(S.wrong).filter(q => { try { pregunta(q); return true; } catch (e) { return false; } });
    const hoy = Math.max(0, Math.min(TOTAL - 1, idxHoy()));
    const semHasta = DIAS[hoy].w;
    let html = '<div><div class="eyebrow">Repaso espaciado</div><h2>Repaso</h2></div>';
    html += '<section class="grid2"><div class="panel"><h3>Preguntas que fallaste</h3><p class="score">' + errores.length + '</p><p class="muted">Cuando la respondés bien en el repaso, sale de la lista.</p><div class="row"><button class="btn primary" data-act="repaso-errores"' + (errores.length ? "" : " disabled") + '>Practicar errores</button></div></div>' +
      '<div class="panel"><h3>Práctica libre</h3><p class="muted">10 preguntas al azar de las semanas 1 a ' + (semHasta + 1) + '. Ideal para los 10 minutos finales o un día con poco tiempo.</p><div class="row"><button class="btn" data-act="repaso-libre">Practicar 10 al azar</button></div></div></section>';
    if (errores.length) {
      html += '<section class="panel"><h3>Temas a reforzar</h3><ul class="goal-list">' + [...new Set(errores.map(q => { const p = pregunta(q); return p.w + "-" + p.k; }))].map(x => {
        const [w, k] = x.split("-").map(Number);
        return '<li><button class="day-link" data-ir="' + (w * 7 + k) + '"><span class="date">SEM ' + (w + 1) + '</span><span class="t">' + esc(CURSO.semanas[w].lecciones[k].titulo) + '</span></button></li>';
      }).join("") + '</ul></section>';
    }
    return html;
  }

  function vDatos() {
    const ac = aciertosQuiz();
    return '<div><div class="eyebrow">Tu progreso</div><h2>Datos y ajustes</h2></div>' +
      '<section class="panel"><h3>Dónde se guarda</h3><p>' + (sync === "nube"
        ? '<span class="chip ok">Sincronizado con tu cuenta</span> Tu avance se guarda en tu cuenta de Claude y aparece en cualquier dispositivo donde abras esta página.'
        : '<span class="chip warn">Solo en este navegador</span> Tu avance se guarda en este navegador. Para pasarlo a otro dispositivo, usá el código de respaldo.') + '</p>' +
      '<p class="muted">Respuestas de prueba correctas: ' + ac.ok + ' de ' + ac.tot + ' · Notas escritas: ' + Object.values(S.notes).filter(Boolean).length + '</p></section>' +
      '<section class="panel"><h3>Código de respaldo</h3><p class="muted">Copiá este código y guardalo (por ejemplo en tu bitácora). Pegándolo abajo recuperás todo tu avance.</p><textarea id="exportar" readonly>' + esc(btoa(unescape(encodeURIComponent(JSON.stringify(S))))) + '</textarea><div class="row"><button class="btn" data-act="copiar">Copiar código</button></div>' +
      '<label for="importar"><strong>Restaurar desde un código</strong></label><textarea id="importar" placeholder="Pegá acá un código de respaldo"></textarea><div class="row"><button class="btn" data-act="importar">Restaurar</button></div></section>' +
      '<section class="panel"><h3>Fecha de inicio</h3><p class="muted">Si empezás otro día, cambiá la fecha y todo el calendario se reacomoda. Hoy es ' + fmt(new Date(), true) + '.</p><div class="row"><input type="date" id="inicio" value="' + S.inicio + '" style="max-width:220px"><button class="btn" data-act="inicio">Guardar fecha</button></div></section>' +
      '<section class="panel"><h3>Empezar de cero</h3><p class="muted">Borra todo el avance, notas y resultados.</p><div class="row" id="reset-row"><button class="btn" data-act="reset-1">Borrar mi avance</button></div></section>';
  }

  // ---------- Eventos ----------
  document.addEventListener("click", ev => {
    const t = ev.target.closest("button");
    if (!t) return;
    if (t.dataset.v) { ir({ nombre: t.dataset.v }); return; }
    if (t.dataset.ir !== undefined) { ir({ nombre: "dia", idx: Number(t.dataset.ir) }); return; }
    if (t.dataset.resp) { responder(t.dataset.resp); return; }
    const a = t.dataset.act;
    if (!a) return;
    if (a === "completar") { S.done[vista.idx] = hoyISO(); guardar(); render(); toast("Sesión completa. ¡Bien ahí!"); }
    else if (a === "deshacer") { delete S.done[vista.idx]; guardar(); render(); }
    else if (a === "reintentar") { delete S.quiz[vista.idx]; guardar(); render(); }
    else if (a === "empezar-examen") {
      const d = DIAS[vista.idx];
      if (d.tipo === "final") { let all = []; CURSO.semanas.forEach((_, w) => { all = all.concat(qidsSemana(w)); }); nuevaSesion("final", mezclar(all).slice(0, 30), "Examen final"); }
      else nuevaSesion(d.w, mezclar(qidsSemana(d.w)).slice(0, 10), "Examen semana " + (d.w + 1));
      render();
    }
    else if (a === "corregir") corregir();
    else if (a === "otra-vez") {
      if (examen.key === "repaso") { examen = null; render(); }
      else { const k = examen.key; examen = null; render(); if (k !== undefined) document.querySelector('[data-act="empezar-examen"]')?.click(); }
    }
    else if (a === "repaso-errores") { const e = mezclar(Object.keys(S.wrong)).slice(0, 10); nuevaSesion("repaso", e, "Repaso de errores"); render(); }
    else if (a === "repaso-libre") {
      const hasta = DIAS[Math.max(0, Math.min(TOTAL - 1, idxHoy()))].w;
      let all = []; for (let w = 0; w <= hasta; w++) all = all.concat(qidsSemana(w));
      nuevaSesion("repaso", mezclar(all).slice(0, 10), "Práctica libre"); render();
    }
    else if (a === "copiar") {
      const ta = document.getElementById("exportar");
      navigator.clipboard?.writeText(ta.value).then(() => toast("Código copiado"), () => { ta.select(); toast("Seleccionado: copialo con Ctrl+C"); });
      if (!navigator.clipboard) { ta.select(); toast("Seleccionado: copialo con Ctrl+C"); }
    }
    else if (a === "importar") {
      try {
        const txt = document.getElementById("importar").value.trim();
        const obj = JSON.parse(decodeURIComponent(escape(atob(txt))));
        if (!obj || typeof obj.done !== "object") throw new Error();
        S = Object.assign(estadoVacio(), obj); guardar(); render(); toast("Avance restaurado");
      } catch (e) { toast("Ese código no es válido. Copialo completo y probá de nuevo."); }
    }
    else if (a === "inicio") {
      const v = document.getElementById("inicio").value;
      if (/^\d{4}-\d{2}-\d{2}$/.test(v)) { S.inicio = v; guardar(); render(); toast("Calendario actualizado"); }
    }
    else if (a === "reset-1") {
      document.getElementById("reset-row").innerHTML = '<span>¿Seguro? No se puede deshacer.</span><button class="btn" data-act="reset-2">Sí, borrar todo</button><button class="btn ghost" data-v="datos">Cancelar</button>';
    }
    else if (a === "reset-2") { const ini = S.inicio; S = estadoVacio(); S.inicio = ini; guardar(); ir({ nombre: "hoy" }); toast("Avance borrado"); }
  });

  function responder(dato) {
    const [modo, clave, j] = dato.split("|");
    const op = Number(j);
    if (modo === "quiz") {
      const [idx, i] = clave.split(":").map(Number);
      S.quiz[idx] = S.quiz[idx] || {};
      if (S.quiz[idx][i] !== undefined) return;
      S.quiz[idx][i] = op;
      const d = DIAS[idx], qid = d.w + "-" + d.k + "-" + i;
      if (op === CURSO.semanas[d.w].lecciones[d.k].preguntas[i][2]) delete S.wrong[qid]; else S.wrong[qid] = 1;
      guardar();
      const y = window.scrollY; render(); window.scrollTo(0, y);
    } else if (modo === "examen" && examen && !examen.corregido) {
      examen.ans[Number(clave)] = op;
      const y = window.scrollY; render(); window.scrollTo(0, y);
    }
  }

  function corregir() {
    const e = examen;
    let ok = 0;
    e.qids.forEach((qid, i) => {
      const bien = e.ans[i] === pregunta(qid).correcta;
      if (bien) { ok++; delete S.wrong[qid]; } else S.wrong[qid] = 1;
    });
    e.corregido = true;
    const pct = ok / e.qids.length;
    if (e.key !== "repaso") {
      const prev = S.exams[e.key];
      S.exams[e.key] = { best: Math.max(pct, prev ? prev.best : 0), last: pct };
      if (pct >= APROBADO && vista.nombre === "dia" && !S.done[vista.idx]) { S.done[vista.idx] = hoyISO(); toast("Examen aprobado: sesión completa"); }
    }
    guardar(); render();
  }

  let timerNota = null;
  document.addEventListener("input", ev => {
    const t = ev.target;
    if (t.dataset.nota !== undefined) {
      clearTimeout(timerNota);
      timerNota = setTimeout(() => { S.notes[t.dataset.nota] = t.value; guardar(); }, 700);
    }
  });
  document.addEventListener("change", ev => {
    const t = ev.target;
    if (t.dataset.paso) {
      if (t.checked) S.steps[t.dataset.paso] = 1; else delete S.steps[t.dataset.paso];
      t.closest("li").classList.toggle("done", t.checked); guardar();
    } else if (t.dataset.meta) {
      if (t.checked) S.goals[t.dataset.meta] = 1; else delete S.goals[t.dataset.meta];
      t.closest("li").classList.toggle("done", t.checked); guardar();
    }
  });

  render();
  conectarNube();
})();
