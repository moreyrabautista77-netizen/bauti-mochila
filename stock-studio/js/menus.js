'use strict';
/* =====================================================================
   Menús tipo Photopea: Archivo, Editar, Imagen, Capa, Selección, Filtro, Ver
   ===================================================================== */
function askNumber(title, def, min, max, unit = 'px') {
  return new Promise(res => {
    const card = $('#helpCard');
    const o = { v: def };
    card.innerHTML = '';
    const num = el('input', { type: 'number', value: def, min, max, step: 'any', style: 'width:90px' });
    const rng = el('input', { type: 'range', value: def, min, max, step: (max - min) / 200 });
    rng.oninput = () => (num.value = rng.value);
    num.oninput = () => (rng.value = num.value);
    const done = v => { $('#helpModal').classList.remove('show'); res(v); };
    num.onkeydown = e => { e.stopPropagation(); if (e.key === 'Enter') done(+num.value); };
    card.append(el('h2', {}, title), el('div', { class: 'row', style: 'gap:12px;margin:10px 0 16px' }, rng, num, el('span', { class: 'hint' }, unit)),
      el('div', { class: 'row', style: 'justify-content:flex-end' }, el('button', { onclick: () => done(null) }, 'Cancelar'), el('button', { class: 'primary', onclick: () => done(+num.value) }, 'Aplicar')));
    $('#helpModal').classList.add('show');
    setTimeout(() => num.focus(), 30);
  });
}

const needImage = () => { const L = App.selected(); if (!L || L.type !== 'image') { toast('Seleccioná una capa de imagen'); return null; } return L; };

const Menus = {
  defs: {
    archivo: ['Archivo', [
      ['Nuevo proyecto', 'new'], ['Abrir proyecto…', 'open', 'Ctrl+O'], ['Guardar proyecto', 'save', 'Ctrl+S'], '-',
      ['Importar imagen…', 'importImg'], ['Nueva capa vacía', 'newLayer', 'Ctrl+Shift+N'], '-',
      ['Exportar para imprimir (PNG 300 dpi)…', 'print'], ['Ir a Maqueta y posts', 'goMockup'], ['Ir a Video 360°', 'goVideo']]],
    editar: ['Editar', [
      ['Deshacer', 'undo', 'Ctrl+Z'], ['Rehacer', 'redo', 'Ctrl+Y'], '-',
      ['Transformación libre', 'freeT', 'Ctrl+T'], ['Espejo horizontal', 'flipH'], ['Espejo vertical', 'flipV'], ['Rotar 90°', 'rot90'], ['Rotar 180°', 'rot180'], '-',
      ['Rellenar con color principal', 'fillFg', 'Alt+Supr'], ['Rellenar con color secundario', 'fillBg', 'Ctrl+Supr'], ['Borrar lo seleccionado', 'clearSel', 'Supr'], '-',
      ['Copiar capa', 'copyLayer', 'Ctrl+C'], ['Pegar capa', 'pasteLayer', 'Ctrl+V']]],
    imagen: ['Imagen', [
      { h: 'Ajustes (capa de ajuste)' }, ['Brillo / contraste', 'adj:bc'], ['Tono / saturación', 'adj:hs'], ['Blanco y negro', 'adj:bw'], ['Invertir', 'adj:invert'], ['Umbral', 'adj:threshold'], ['Posterizar', 'adj:posterize'], ['Semitono de todo lo de abajo', 'adj:halftone'], '-',
      ['Auto-contraste (capa)', 'autoLevels'], ['Quitar fondo automático', 'autoBg'], ['Recortar a la selección', 'cropToSel'], ['Restaurar recorte', 'uncrop']]],
    capa: ['Capa', [
      ['Nueva capa vacía', 'newLayer', 'Ctrl+Shift+N'], ['Nueva capa de ajuste…', 'adjMenu'], ['Duplicar capa / copiar selección', 'dup', 'Ctrl+J'], ['Eliminar capa', 'delLayer'], '-',
      ['Máscara desde la selección', 'maskFromSel'], ['Quitar máscara', 'maskClear'], ['Máscara de recorte', 'clip', 'Ctrl+Alt+G'], '-',
      ['Rasterizar capa', 'rasterize'], ['Combinar hacia abajo', 'mergeDown', 'Ctrl+E'], ['Combinar visibles', 'mergeVisible', 'Ctrl+Shift+E'], '-',
      ['Subir', 'up', 'Ctrl+]'], ['Bajar', 'down', 'Ctrl+['], ['Mover al otro lado (frente/espalda)', 'otherSide']]],
    seleccion: ['Selección', [
      ['Todo', 'selAll', 'Ctrl+A'], ['Deseleccionar', 'selNone', 'Ctrl+D'], ['Invertir', 'selInvert', 'Ctrl+Shift+I'], '-',
      ['Seleccionar sujeto', 'selSubject'], ['Desde la capa (transparencia)', 'selFromLayer'], '-',
      ['Expandir…', 'selExpand'], ['Contraer…', 'selContract'], ['Desvanecer…', 'selFeather'], '-',
      ['Copiar a capa nueva', 'dup', 'Ctrl+J'], ['Borrar contenido', 'clearSel', 'Supr']]],
    filtro: ['Filtro', [
      ['Desenfoque gaussiano…', 'f:blur'], ['Enfocar…', 'f:sharpen'], ['Ruido…', 'f:noise'], ['Pixelar…', 'f:pixelate'], ['Ondas…', 'f:wave'], '-',
      ['Posterizar…', 'f:posterize'], ['Umbral…', 'f:threshold'], ['Blanco y negro', 'f:grayscale'], ['Invertir', 'f:invert'], '-',
      ['Relieve…', 'f:emboss'], ['Detectar bordes…', 'f:edges'], ['Viñeta…', 'f:vignette']]],
    ver: ['Ver', [
      ['Acercar', 'zoomIn', 'Ctrl++'], ['Alejar', 'zoomOut', 'Ctrl+-'], ['Ajustar a pantalla', 'fit', 'Ctrl+0'], ['Enderezar vista', 'unrotate'], '-',
      ['Mostrar/ocultar remera de guía', 'guide'], ['Ver historial', 'history'], ['Ver capas', 'layers'], ['Atajos de teclado', 'help']]]
  },
  build() {
    const bar = $('#menubar');
    bar.innerHTML = '';
    for (const [id, [name]] of Object.entries(this.defs)) bar.append(el('button', { onclick: e => this.open(e.currentTarget, id), onmouseenter: e => { if ($('#menuDrop')) this.open(e.currentTarget, id); } }, name));
  },
  open(anchor, id) {
    $('#menuDrop')?.remove();
    let items;
    if (id === 'adjustNew') items = this.defs.imagen[1].slice(1, 8);
    else items = this.defs[id][1];
    const r = anchor.getBoundingClientRect();
    const m = el('div', { id: 'menuDrop', class: 'menudrop', style: `left:${r.left}px;top:${r.bottom + 2}px` });
    for (const it of items) {
      if (it === '-') { m.append(el('div', { class: 'msep' })); continue; }
      if (it.h) { m.append(el('div', { class: 'mhead' }, it.h)); continue; }
      const [label, act, key] = it;
      m.append(el('button', { onclick: () => { m.remove(); this.run(act); } }, el('span', {}, label), el('span', { class: 'k' }, key || '')));
    }
    document.body.append(m);
    const mr = m.getBoundingClientRect();
    if (mr.bottom > innerHeight) m.style.top = Math.max(4, r.top - mr.height - 2) + 'px';
    setTimeout(() => {
      const close = e => { if (!m.contains(e.target) && !$('#menubar').contains(e.target)) { m.remove(); document.removeEventListener('pointerdown', close); } };
      document.addEventListener('pointerdown', close);
    }, 0);
  },
  async run(act) {
    const L = App.selected();
    if (act.startsWith('adj:')) { const A = Panels.addAdjust({ kind: act.slice(4) }); setAdjustKind(A); App.commit('Ajuste: ' + A.name); Panels.refreshProps(); Panels.refreshLayers(); return; }
    if (act.startsWith('f:')) {
      const T = needImage();
      if (!T) return;
      const f = act.slice(2);
      const ask = { blur: ['Desenfoque gaussiano', 4, 0.5, 60], sharpen: ['Enfocar (cantidad)', 1, 0.1, 4, 'x'], noise: ['Ruido (%)', 12, 1, 100, '%'], pixelate: ['Pixelar (tamaño de celda)', 12, 2, 120], wave: ['Ondas (amplitud)', 10, 1, 120],
        posterize: ['Posterizar (niveles)', 4, 2, 16, 'niveles'], threshold: ['Umbral (%)', 50, 1, 99, '%'], emboss: ['Relieve (intensidad)', 2, 0.5, 6, 'x'], edges: ['Detectar bordes (intensidad)', 3, 0.5, 10, 'x'], vignette: ['Viñeta (intensidad)', 0.7, 0.05, 1, ''] }[f];
      let v = 1;
      if (ask) { v = await askNumber(ask[0], ask[1], ask[2], ask[3], ask[4]); if (v === null) return; }
      busy(true, 'Aplicando filtro…');
      await nextFrame();
      try { Raster.filter(T, f, v); } catch (e) { console.error(e); toast('Error: ' + e.message); }
      busy(false);
      return;
    }
    switch (act) {
      case 'new': $('#btnNew').click(); break;
      case 'open': $('#btnOpen').click(); break;
      case 'save': saveProject(); break;
      case 'importImg': $('#fileImg').click(); break;
      case 'print': PrintExport.open(); break;
      case 'goMockup': App.setView('mockup'); break;
      case 'goVideo': App.setView('video'); break;
      case 'undo': History.undo(); break;
      case 'redo': History.redo(); break;
      case 'freeT': App.setTool('move'); break;
      case 'flipH': if (L) { L.flipX = !L.flipX; App.commit('Espejo'); } break;
      case 'flipV': if (L) { L.flipY = !L.flipY; App.commit('Espejo'); } break;
      case 'rot90': if (L) { L.rot = ((L.rot + 90 + 180) % 360) - 180; App.commit('Rotar 90°'); } break;
      case 'rot180': if (L) { L.rot = ((L.rot + 180 + 180) % 360) - 180; App.commit('Rotar 180°'); } break;
      case 'fillFg': case 'fillBg': fillSelection(act === 'fillFg' ? App.colors.fg : App.colors.bg); break;
      case 'clearSel': clearSelectionOrLayer(); break;
      case 'copyLayer': if (L) { App.clipboard = deepClone(L); toast('Capa copiada'); } break;
      case 'pasteLayer': if (App.clipboard) { const c = deepClone(App.clipboard); c.x += 40; c.y += 40; Panels.addLayer(c, undefined, 'Pegar'); } break;
      case 'autoLevels': { const T = needImage(); if (T) { autoLevels(T); App.commit('Auto-contraste'); Panels.refreshProps(); } break; }
      case 'autoBg': { const T = needImage(); if (T) { autoRemoveBg(T, App.t.tol + 2); toast('Fondo quitado. Retocá con Borrador (E) / Restaurar.'); } break; }
      case 'cropToSel': { const T = needImage(); if (!T) break; if (!Sel.active) { toast('No hay selección'); break; } cropLayerToRect(T, Sel.bounds); break; }
      case 'uncrop': { const T = needImage(); if (T) { const c0 = T.crop; const cx = (c0.l - c0.r) / 2, cy = (c0.t - c0.b) / 2; const p = sourceToDesign(T, { x: T.w / 2, y: T.h / 2 }); T.crop = { l: 0, t: 0, r: 0, b: 0 }; T.x = p.x; T.y = p.y; App.commit('Restaurar recorte'); } break; }
      case 'newLayer': Panels.addEmptyLayer(); break;
      case 'adjMenu': this.open($('#menubar button:nth-child(3)'), 'adjustNew'); break;
      case 'dup': duplicateOrCopySelection(); break;
      case 'delLayer': Panels.remove(); break;
      case 'maskFromSel': { const T = needImage(); if (!T) break; if (!Sel.active) { toast('No hay selección'); break; } maskFromSelection(T); App.commit('Máscara desde selección'); break; }
      case 'maskClear': { const T = needImage(); if (T) { T.maskId = null; App.commit('Quitar máscara'); Panels.refreshLayers(); } break; }
      case 'clip': if (L) { L.clip = !L.clip; App.commit('Máscara de recorte'); Panels.refreshProps(); } break;
      case 'rasterize': if (L) Panels.rasterize([L], null); break;
      case 'mergeDown': Panels.mergeDown(); break;
      case 'mergeVisible': { const vis = App.layers().filter(l => l.visible); if (vis.length > 1) Panels.rasterize(vis, 'Combinado'); break; }
      case 'up': Panels.reorder(1); break;
      case 'down': Panels.reorder(-1); break;
      case 'otherSide': if (L) { const to = App.side === 'front' ? 'back' : 'front'; const arr = App.layers(); arr.splice(arr.indexOf(L), 1); App.layers(to).push(L); App.sel = null; App.commit('Mover de lado'); Panels.refreshProps(); } break;
      case 'selAll': Sel.all(); break;
      case 'selNone': Sel.none(); break;
      case 'selInvert': if (Sel.active) Sel.invert(); else Sel.all(); break;
      case 'selSubject': { const T = needImage(); if (T) { Sel.subject(T); toast('Sujeto seleccionado. Ajustá con Shift/Alt + lazo o selección rápida.'); } break; }
      case 'selFromLayer': if (L) Sel.fromLayer(L); break;
      case 'selExpand': case 'selContract': case 'selFeather': {
        if (!Sel.active) { toast('No hay selección'); break; }
        const v = await askNumber({ selExpand: 'Expandir selección', selContract: 'Contraer selección', selFeather: 'Desvanecer selección' }[act], 20, 1, 200);
        if (v !== null) Sel.morph({ selExpand: 'expand', selContract: 'contract', selFeather: 'feather' }[act], v);
        break;
      }
      case 'zoomIn': Editor.zoomBy(1.25); break;
      case 'zoomOut': Editor.zoomBy(0.8); break;
      case 'fit': Editor.fit(); break;
      case 'unrotate': Editor.vr = 0; Editor.requestRender(); break;
      case 'guide': Editor.showGuide = !Editor.showGuide; Panels.buildToolbar(); Editor.requestRender(); break;
      case 'history': case 'layers': $(`#layerTabs button[data-tab="${act}"]`).click(); break;
      case 'help': showHelp(); break;
    }
  }
};

/* rellena la selección (o toda la capa) con un color */
function fillSelection(color) {
  const T = Editor.rasterTarget(true);
  if (!T) return;
  const s = Raster.begin(T);
  const x = ctx2d(s.c, true);
  if (s.sel) {
    const t = mkCanvas(s.W, s.H), tx = ctx2d(t), id = tx.createImageData(s.W, s.H);
    const c = hexToRgb(color);
    for (let p = 0; p < s.sel.length; p++) { const i = p * 4; id.data[i] = c[0]; id.data[i + 1] = c[1]; id.data[i + 2] = c[2]; id.data[i + 3] = s.sel[p]; }
    tx.putImageData(id, 0, 0);
    x.drawImage(t, 0, 0);
  } else { x.fillStyle = color; x.fillRect(0, 0, s.W, s.H); }
  Raster.dirty(0, 0, s.W, s.H);
  Raster.end('Rellenar');
}
/* Supr: con selección borra lo seleccionado; sin selección borra la capa */
function clearSelectionOrLayer() {
  const L = App.selected();
  if (!Sel.active) { Panels.remove(); return; }
  if (!L || L.type !== 'image') { toast('Seleccioná una capa de imagen'); return; }
  eraseSelectionFromMask(L);
  App.commit('Borrar selección');
}
/* Ctrl+J: con selección copia esa parte a una capa nueva */
function duplicateOrCopySelection() {
  const L = App.selected();
  if (!L) return;
  Panels.duplicate();
  if (Sel.active && L.type === 'image') {
    const C = App.selected();
    C.x = L.x; C.y = L.y;
    C.name = L.name + ' (selección)';
    maskFromSelection(C);
    App.commit('Copiar selección a capa');
  }
}
