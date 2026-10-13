'use strict';
/* =====================================================================
   Arranque, vistas, atajos, archivos, exportación para imprenta
   ===================================================================== */
App.setTool = function (t) {
  this.tool = t;
  $$('#toolbar .tool[data-tool]').forEach(b => b.classList.toggle('active', b.dataset.tool === t));
  Panels.refreshOptbar();
  Editor.requestRender();
};
App.setView = function (v) {
  this.view = v;
  $$('#viewTabs button').forEach(b => b.classList.toggle('active', b.dataset.view === v));
  $$('.view').forEach(s => s.classList.toggle('active', s.id === 'view-' + v));
  if (v === 'design') { Panels.refreshAll(); Editor.requestRender(); }
  if (v === 'mockup') { Mockup.buildPanel(); Mockup.render(); }
  if (v === 'video') { Anim.buildPanel(); Anim.invalidate(); requestAnimationFrame(() => fitPreview($('#vidCanvas'))); }
};

/* ---------- PNG con 300 dpi (chunk pHYs) ---------- */
const CRC_TABLE = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(buf) { let c = 0xFFFFFFFF; for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
async function pngWithDpi(blob, dpi) {
  const src = new Uint8Array(await blob.arrayBuffer());
  const ppm = Math.round(dpi / 0.0254);
  const chunk = new Uint8Array(21);
  const dv = new DataView(chunk.buffer);
  dv.setUint32(0, 9);
  chunk.set([112, 72, 89, 115], 4); // pHYs
  dv.setUint32(8, ppm); dv.setUint32(12, ppm); chunk[16] = 1;
  dv.setUint32(17, crc32(chunk.subarray(4, 17)));
  const at = 33; // firma (8) + IHDR (25)
  const out = new Uint8Array(src.length + 21);
  out.set(src.subarray(0, at), 0);
  out.set(chunk, at);
  out.set(src.subarray(at), at + 21);
  return new Blob([out], { type: 'image/png' });
}
function trimCanvas(c) {
  const x = ctx2d(c, true), d = x.getImageData(0, 0, c.width, c.height).data;
  let t = c.height, b = -1, l = c.width, r = -1;
  for (let y = 0; y < c.height; y++) for (let xx = 0; xx < c.width; xx++) if (d[(y * c.width + xx) * 4 + 3] > 4) { if (y < t) t = y; if (y > b) b = y; if (xx < l) l = xx; if (xx > r) r = xx; }
  if (r < 0) return c;
  const o = mkCanvas(r - l + 1, b - t + 1);
  ctx2d(o).drawImage(c, -l, -t);
  return o;
}

const PrintExport = {
  opts: { side: 'front', res: 3000, bg: 'transparent', trim: false },
  open() {
    const o = this.opts;
    o.side = App.side;
    const card = $('#helpCard');
    card.innerHTML = '';
    card.append(el('h2', {}, 'Exportar para imprimir'),
      el('p', { class: 'hint' }, 'PNG en alta resolución, sin la remera, listo para DTF / serigrafía / sublimación. Se guarda a 300 dpi.'),
      el('div', { class: 'secbody', style: 'padding:12px 0' },
        UI.select('Lado', o, 'side', [['front', 'Frente'], ['back', 'Espalda'], ['both', 'Los dos (2 archivos)']]),
        UI.select('Tamaño', o, 'res', [[2400, '20 × 24 cm (2400×2880)'], [3000, '25 × 30 cm (3000×3600)'], [3600, '30 × 36 cm (3600×4320)'], [4200, '35 × 42 cm (4200×5040)']]),
        UI.select('Fondo', o, 'bg', [['transparent', 'Transparente'], ['shirt', 'Color de la remera']]),
        UI.check('Recortar al contenido (quita bordes vacíos)', o, 'trim')),
      el('div', { class: 'row', style: 'justify-content:flex-end' },
        el('button', { onclick: () => $('#helpModal').classList.remove('show') }, 'Cancelar'),
        el('button', { class: 'primary', onclick: () => { $('#helpModal').classList.remove('show'); this.run(); } }, 'Descargar PNG')));
    $('#helpModal').classList.add('show');
  },
  async run() {
    const o = this.opts;
    const sides = o.side === 'both' ? ['front', 'back'] : [o.side];
    const rs = o.res / DESIGN_W;
    for (const s of sides) {
      if (!sideHasContent(s)) { toast('El ' + (s === 'front' ? 'frente' : 'dorso') + ' está vacío'); continue; }
      busy(true, 'Renderizando ' + (s === 'front' ? 'frente' : 'espalda') + ' en alta resolución…');
      await nextFrame();
      try {
        let c = renderSide(s, rs, { fresh: true, bg: o.bg === 'shirt' ? App.project.shirt.color : null });
        if (o.trim) c = trimCanvas(c);
        const blob = await pngWithDpi(await canvasToBlob(c, 'image/png'), 300);
        downloadBlob(blob, `${safeName(App.project.name)}-${s === 'front' ? 'frente' : 'espalda'}-${o.res}px.png`);
      } catch (e) { console.error(e); toast('Error al exportar: ' + e.message); }
      Proc.dropRs(rs);
      busy(false);
      await new Promise(r => setTimeout(r, 300));
    }
  }
};

/* ---------- ayuda ---------- */
function showHelp() {
  const card = $('#helpCard');
  card.innerHTML = `
  <h2>Cómo se usa</h2>
  <ol style="color:var(--muted);line-height:1.6;margin-top:0">
    <li><b style="color:#fff">Diseño:</b> agregá una foto (arrastrar, Ctrl+V o botón). Elegí un <b>Estilo rápido</b> (Semitono, Vintage, Stencil…) y ajustá trama, contraste y fundido.</li>
    <li>Quitá el fondo con <b>Quitar fondo auto</b>, la <b>Varita (W)</b> o el <b>Borrador (E)</b>. Si te pasás, <b>Restaurar (R)</b>.</li>
    <li>Sumá textos, firmas y formas desde <b>Plantillas</b>. Cambiá a <b>Espalda</b> arriba para diseñar el dorso.</li>
    <li><b style="color:#fff">Maqueta y posts:</b> elegí formato (post, story, cuadrado), vista y fondo; agregá logo, precio y usuario. Descargá imagen o carrusel.</li>
    <li><b style="color:#fff">Video 360°:</b> la remera gira en la percha. Exportá a 9:16 para TikTok / Reels.</li>
    <li>Todo se guarda solo en este navegador. Usá <b>Guardar</b> para tener el archivo del proyecto.</li>
  </ol>
  <h2>Atajos</h2>
  <table>
   <tr><td>V / H / E / R / W / T / I</td><td>Mover · Mano · Borrador · Restaurar · Varita · Texto · Cuentagotas</td></tr>
   <tr><td>Espacio + arrastrar</td><td>Desplazar el lienzo</td></tr>
   <tr><td>Rueda del mouse</td><td>Zoom</td></tr>
   <tr><td>Ctrl+0</td><td>Ajustar a pantalla</td></tr>
   <tr><td>[ y ]</td><td>Tamaño del pincel</td></tr>
   <tr><td>Flechas (Shift ×10)</td><td>Mover capa</td></tr>
   <tr><td>Shift al rotar</td><td>Girar de a 15°</td></tr>
   <tr><td>Alt + arrastrar</td><td>Duplicar capa</td></tr>
   <tr><td>Ctrl+Z / Ctrl+Y</td><td>Deshacer / Rehacer</td></tr>
   <tr><td>Ctrl+D</td><td>Duplicar capa</td></tr>
   <tr><td>Ctrl+C / Ctrl+V</td><td>Copiar capa / Pegar capa o imagen</td></tr>
   <tr><td>Ctrl+[ / Ctrl+]</td><td>Bajar / subir capa</td></tr>
   <tr><td>Supr</td><td>Borrar capa</td></tr>
   <tr><td>Ctrl+S / Ctrl+O</td><td>Guardar / abrir proyecto</td></tr>
   <tr><td>Tab</td><td>Cambiar Frente ↔ Espalda</td></tr>
  </table>
  <p class="hint" style="margin-top:12px">Doble clic sobre el nombre de un control lo vuelve al valor original. Doble clic en una capa de texto para editarla.</p>
  <div class="row" style="justify-content:flex-end;margin-top:10px"><button id="helpClose">Cerrar</button></div>`;
  $('#helpClose').onclick = () => $('#helpModal').classList.remove('show');
  $('#helpModal').classList.add('show');
}

/* ---------- archivos ---------- */
async function saveProject() {
  App.project.name = $('#projName').value || 'Mi diseño';
  busy(true, 'Guardando proyecto…');
  await nextFrame();
  try {
    const data = Persist.serialize();
    downloadBlob(new Blob([JSON.stringify(data)], { type: 'application/json' }), safeName(App.project.name) + '.stock.json');
    toast('Proyecto guardado');
  } catch (e) { toast('Error al guardar: ' + e.message); }
  busy(false);
}
async function openProjectFile(f) {
  busy(true, 'Abriendo proyecto…');
  try {
    const data = JSON.parse(await readFile(f, 'text'));
    await Persist.loadData(data);
    Editor.fit();
    toast('Proyecto abierto');
  } catch (e) { toast('No se pudo abrir: ' + e.message); }
  busy(false);
}
async function loadFontFile(f) {
  const url = await readFile(f);
  const family = f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
  const ok = await Fonts.addFromURL(family, url);
  if (!ok) { toast('No se pudo cargar la fuente'); return; }
  const id = Assets.add({ kind: 'font', url });
  App.project.fonts.push({ family, assetId: id });
  const L = App.selected();
  if (L && L.type === 'text') L.font = family;
  App.commit();
  Panels.refreshProps();
  toast('Fuente “' + family + '” cargada');
}

/* ---------- arranque ---------- */
async function boot() {
  Fonts.init();
  App.project = Defaults.project();
  Panels.init();
  Editor.init();
  History.reset();
  Panels.refreshAll();
  Anim.start();
  Mockup.initPhotoDrag();
  for (const id of ['#mockCanvas', '#vidCanvas']) new ResizeObserver(() => fitPreview($(id))).observe($(id).parentElement);

  $$('#viewTabs button').forEach(b => (b.onclick = () => App.setView(b.dataset.view)));
  $('#btnUndo').onclick = () => History.undo();
  $('#btnRedo').onclick = () => History.redo();
  $('#btnHelp').onclick = showHelp;
  $('#btnSave').onclick = saveProject;
  $('#btnOpen').onclick = () => { $('#fileProj').value = ''; $('#fileProj').click(); };
  $('#btnNew').onclick = () => {
    if (!confirm('¿Empezar un proyecto nuevo? (Guardá antes si querés conservar el actual)')) return;
    const keep = App.project.mockup;
    App.project = Defaults.project();
    Object.assign(App.project.mockup, { logoAssetId: keep.logoAssetId, handle: keep.handle, font: keep.font, accent: keep.accent, bg: keep.bg, bgColor: keep.bgColor, bgAssetId: keep.bgAssetId });
    App.sel = null; App.side = 'front';
    History.reset();
    App.commit();
    Panels.refreshAll();
  };
  $('#btnEmptyAdd').onclick = () => $('#fileImg').click();
  $('#projName').addEventListener('change', () => { App.project.name = $('#projName').value; App.commit(); });
  $('#projName').addEventListener('keydown', e => e.stopPropagation());
  $('#fileImg').onchange = e => { Panels.addImageFiles(e.target.files); e.target.value = ''; };
  $('#fileProj').onchange = e => { if (e.target.files[0]) openProjectFile(e.target.files[0]); };
  $('#fileFont').onchange = e => { if (e.target.files[0]) loadFontFile(e.target.files[0]); e.target.value = ''; };
  $('#helpModal').addEventListener('click', e => { if (e.target.id === 'helpModal') e.currentTarget.classList.remove('show'); });

  $('#btnPrint').onclick = () => PrintExport.open();

  // arrastrar y soltar
  let dragN = 0;
  window.addEventListener('dragenter', e => { if (e.dataTransfer.types.includes('Files')) { dragN++; document.body.classList.add('dropping'); } });
  window.addEventListener('dragleave', () => { dragN = Math.max(0, dragN - 1); if (!dragN) document.body.classList.remove('dropping'); });
  window.addEventListener('dragover', e => e.preventDefault());
  window.addEventListener('drop', e => {
    e.preventDefault();
    dragN = 0;
    document.body.classList.remove('dropping');
    const files = [...(e.dataTransfer.files || [])];
    const proj = files.find(f => /\.json$/i.test(f.name));
    if (proj) { openProjectFile(proj); return; }
    const font = files.find(f => /\.(ttf|otf|woff2?)$/i.test(f.name));
    if (font) { loadFontFile(font); return; }
    if (files.length) Panels.addImageFiles(files);
  });

  // pegar
  document.addEventListener('paste', e => {
    if (/INPUT|TEXTAREA/.test(document.activeElement?.tagName)) return;
    const items = [...(e.clipboardData?.items || [])];
    const img = items.find(i => i.type.startsWith('image/'));
    if (img) { e.preventDefault(); Panels.addImageFiles([img.getAsFile()]); return; }
    if (App.clipboard) {
      e.preventDefault();
      const L = deepClone(App.clipboard);
      L.x += 40; L.y += 40;
      Panels.addLayer(L);
    }
  });

  // teclado
  window.addEventListener('keydown', e => {
    const tag = document.activeElement?.tagName;
    if (/INPUT|TEXTAREA|SELECT/.test(tag) && e.key !== 'Escape') return;
    const ctrl = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
    if (e.key === 'Escape') { $('#helpModal').classList.remove('show'); document.activeElement?.blur(); if (App.view === 'design') App.select(null); return; }
    if (ctrl && k === 'z' && !e.shiftKey) { e.preventDefault(); History.undo(); return; }
    if (ctrl && (k === 'y' || (k === 'z' && e.shiftKey))) { e.preventDefault(); History.redo(); return; }
    if (ctrl && k === 's') { e.preventDefault(); saveProject(); return; }
    if (ctrl && k === 'o') { e.preventDefault(); $('#btnOpen').click(); return; }
    if (App.view !== 'design') { if (e.key === ' ' && App.view === 'video') { e.preventDefault(); $('#vidBar button').click(); } return; }
    if (ctrl && k === 'd') { e.preventDefault(); Panels.duplicate(); return; }
    if (ctrl && k === 'c') { const L = App.selected(); if (L) { App.clipboard = deepClone(L); toast('Capa copiada'); } return; }
    if (ctrl && k === '0') { e.preventDefault(); Editor.fit(); return; }
    if (ctrl && (k === '=' || k === '+')) { e.preventDefault(); Editor.zoomBy(1.25); return; }
    if (ctrl && k === '-') { e.preventDefault(); Editor.zoomBy(0.8); return; }
    if (ctrl && e.key === ']') { e.preventDefault(); Panels.reorder(1); return; }
    if (ctrl && e.key === '[') { e.preventDefault(); Panels.reorder(-1); return; }
    if (ctrl) return;
    if (e.key === ' ') { e.preventDefault(); Editor.space = true; Editor.canvas.style.cursor = 'grab'; return; }
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); Panels.remove(); return; }
    if (e.key === 'Tab') { e.preventDefault(); App.side = App.side === 'front' ? 'back' : 'front'; App.sel = null; Panels.refreshAll(); return; }
    if (e.key.startsWith('Arrow')) {
      const L = App.selected();
      if (!L || L.locked) return;
      e.preventDefault();
      const s = e.shiftKey ? 50 : 5;
      if (e.key === 'ArrowLeft') L.x -= s; if (e.key === 'ArrowRight') L.x += s;
      if (e.key === 'ArrowUp') L.y -= s; if (e.key === 'ArrowDown') L.y += s;
      App.changed();
      clearTimeout(App._nudge);
      App._nudge = setTimeout(() => App.commit(), 400);
      return;
    }
    if (e.key === '[') { App.brush.size = Math.max(4, Math.round(App.brush.size / 1.2)); Panels.refreshOptbar(); Editor.requestRender(); return; }
    if (e.key === ']') { App.brush.size = Math.min(500, Math.round(App.brush.size * 1.2)); Panels.refreshOptbar(); Editor.requestRender(); return; }
    const map = { v: 'move', h: 'hand', e: 'erase', r: 'restore', w: 'wand', t: 'text', i: 'picker' };
    if (map[k]) App.setTool(map[k]);
  });
  window.addEventListener('keyup', e => { if (e.key === ' ') { Editor.space = false; Editor.canvas.style.cursor = 'default'; } });
  $('#stage').addEventListener('contextmenu', e => e.preventDefault());

  // autoguardado: recuperar último proyecto
  await Persist.open();
  const saved = await Persist.loadAutosave();
  if (saved && saved.project && (saved.project.sides.front.layers.length || saved.project.sides.back.layers.length)) {
    try {
      busy(true, 'Recuperando tu último proyecto…');
      await Persist.loadData(saved);
      Editor.fit();
      toast('Se recuperó tu último proyecto');
    } catch (e) { console.warn(e); }
    busy(false);
  }
  window.addEventListener('beforeunload', () => Persist.save());
}
window.addEventListener('DOMContentLoaded', boot);
