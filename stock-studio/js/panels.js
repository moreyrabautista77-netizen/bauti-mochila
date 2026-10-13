'use strict';
/* =====================================================================
   Controles de UI, panel de capas, propiedades, estilos rápidos, plantillas
   ===================================================================== */
const UI = {
  range(label, obj, key, min, max, step, opt = {}) {
    const dec = opt.dec ?? (step >= 1 ? 0 : step >= 0.1 ? 1 : 2);
    const num = el('input', { type: 'number', class: 'num', min, max, step, value: (+obj[key]).toFixed(dec) });
    const inp = el('input', { type: 'range', min, max, step, value: obj[key] });
    inp.addEventListener('input', () => {
      obj[key] = +inp.value;
      num.value = (+inp.value).toFixed(dec);
      opt.onInput && opt.onInput();
      App.changed(true);
    });
    inp.addEventListener('change', () => { opt.onChange && opt.onChange(); App.commit(); });
    num.addEventListener('change', () => {
      obj[key] = clamp(+num.value, opt.hardMin ?? -1e9, opt.hardMax ?? 1e9);
      inp.value = obj[key];
      opt.onInput && opt.onInput();
      App.changed();
      App.commit();
    });
    const lab = el('label', { title: opt.def !== undefined ? 'Doble clic: restablecer' : '' }, label);
    if (opt.def !== undefined) lab.addEventListener('dblclick', () => { obj[key] = opt.def; inp.value = opt.def; num.value = (+opt.def).toFixed(dec); App.changed(); App.commit(); });
    return el('div', { class: 'ctl' }, lab, inp, num);
  },
  color(label, obj, key, opt = {}) {
    const inp = el('input', { type: 'color', value: obj[key] });
    const txt = el('input', { type: 'text', value: obj[key], style: 'width:84px' });
    inp.addEventListener('input', () => { obj[key] = inp.value; txt.value = inp.value; opt.onInput && opt.onInput(); App.changed(true); });
    inp.addEventListener('change', () => App.commit());
    txt.addEventListener('change', () => {
      const v = txt.value.trim();
      if (/^#?[0-9a-f]{3}([0-9a-f]{3})?$/i.test(v)) { obj[key] = v[0] === '#' ? v : '#' + v; inp.value = obj[key]; App.changed(); App.commit(); }
    });
    const sw = (opt.swatches || []).map(c => el('button', { class: 'sw', style: `background:${c};width:18px;height:18px`, title: c, onclick: () => { obj[key] = c; inp.value = c; txt.value = c; App.changed(); App.commit(); } }));
    return el('div', { class: 'ctl2' }, el('label', {}, label), el('div', { class: 'row' }, inp, txt, ...sw));
  },
  select(label, obj, key, options, opt = {}) {
    const s = el('select', {}, options.map(o => {
      const [v, t] = Array.isArray(o) ? o : [o, o];
      return el('option', { value: v, selected: String(obj[key]) === String(v) }, t);
    }));
    s.addEventListener('change', () => {
      const v = s.value;
      obj[key] = typeof obj[key] === 'number' ? +v : v;
      opt.onChange && opt.onChange();
      App.changed();
      App.commit();
    });
    if (opt.fontPreview) s.querySelectorAll('option').forEach(o => (o.style.fontFamily = cssFont(o.value)));
    return el('div', { class: 'ctl2' }, el('label', {}, label), s);
  },
  check(label, obj, key, opt = {}) {
    const c = el('input', { type: 'checkbox', checked: !!obj[key] });
    c.addEventListener('change', () => { obj[key] = c.checked; opt.onChange && opt.onChange(); App.changed(); App.commit(); });
    return el('label', { class: 'chk' }, c, label);
  },
  text(label, obj, key, opt = {}) {
    const t = opt.multi ? el('textarea', { rows: 2 }) : el('input', { type: 'text', style: 'width:100%' });
    t.value = obj[key] ?? '';
    t.placeholder = opt.ph || '';
    t.addEventListener('input', () => { obj[key] = t.value; App.changed(true); });
    t.addEventListener('change', () => App.commit());
    t.addEventListener('keydown', e => e.stopPropagation());
    return label ? el('div', { class: 'ctl2' }, el('label', {}, label), t) : t;
  },
  btns(list) { return el('div', { class: 'row' }, list.map(([t, fn, title]) => el('button', { onclick: fn, title: title || '' }, t))); },
  sec(title, kids, open = false, tag = '') {
    const d = el('details', { class: 'sec', open }, el('summary', {}, title, tag ? el('span', { class: 'tag' }, tag) : null), el('div', { class: 'secbody' }, kids));
    const k = 'sec:' + title;
    try { const v = localStorage.getItem(k); if (v !== null) d.open = v === '1'; } catch (_) { }
    d.addEventListener('toggle', () => { try { localStorage.setItem(k, d.open ? '1' : '0'); } catch (_) { } });
    return d;
  },
  seg(options, get, set) {
    const wrap = el('div', { class: 'seg' });
    for (const [v, t] of options) {
      const b = el('button', { class: get() === v ? 'active' : '', onclick: () => { set(v); [...wrap.children].forEach(c => c.classList.remove('active')); b.classList.add('active'); } }, t);
      wrap.append(b);
    }
    return wrap;
  }
};

const ICONS = {
  move: '<path d="M5 3l6 16 2.5-6.5L20 10z"/>',
  hand: '<path d="M8 13V5.5a1.5 1.5 0 013 0V11m0-6.5a1.5 1.5 0 013 0V11m0-4.5a1.5 1.5 0 013 0V14a7 7 0 01-7 7h-1a6 6 0 01-5-3l-2.6-4.4a1.5 1.5 0 012.5-1.6L8 13"/>',
  erase: '<path d="M7 21h12M4.5 15.5l9-9a2 2 0 012.8 0l3.2 3.2a2 2 0 010 2.8L13 19H8.5z"/><path d="M9.5 10.5l5 5"/>',
  restore: '<path d="M18 3l3 3-9.5 9.5-4 1 1-4z"/><path d="M4 21c1.5-2 3-2.5 4.5-2.5"/>',
  wand: '<path d="M4 20L15 9M14 4v2M18 6l-1.4 1.4M20 10h-2M12.6 7.4L11 6"/><path d="M15 9l1.5 1.5"/>',
  text: '<path d="M5 6V4h14v2M12 4v16M9 20h6"/>',
  picker: '<path d="M14.5 4.5l5 5M7 14l7.5-7.5 3 3L10 17H7z"/><path d="M7 17l-3 3"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
  shape: '<rect x="3" y="3" width="9" height="9" rx="1"/><circle cx="16.5" cy="16.5" r="4.5"/>',
  tpl: '<path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z"/>',
  fit: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  guide: '<path d="M8 3L3 7l3 3v11h12V10l3-3-5-4c-1 2-2.5 3-4 3S9 5 8 3z"/>'
};
const svg = n => `<svg viewBox="0 0 24 24">${ICONS[n]}</svg>`;

const Panels = {
  init() {
    this.buildToolbar();
    this.buildLayerFoot();
  },
  refreshAll() {
    this.refreshLayers();
    this.refreshProps();
    this.refreshOptbar();
    $('#projName').value = App.project.name;
    if (App.view === 'mockup') Mockup.buildPanel();
    if (App.view === 'video') Anim.buildPanel();
  },

  /* ---------- barra de herramientas ---------- */
  buildToolbar() {
    const tb = $('#toolbar');
    tb.innerHTML = '';
    const tools = [['move', 'Mover / escalar / rotar', 'V'], ['hand', 'Mano (o mantené Espacio)', 'H'], ['erase', 'Borrador de fondo (pincel)', 'E'],
      ['restore', 'Restaurar (deshacer borrado)', 'R'], ['wand', 'Varita: borrar por color', 'W'], ['text', 'Texto', 'T'], ['picker', 'Cuentagotas', 'I']];
    for (const [id, title, k] of tools) {
      tb.append(el('button', { class: 'tool' + (App.tool === id ? ' active' : ''), 'data-tool': id, title: `${title} (${k})`, html: svg(id) + `<span class="k">${k}</span>`, onclick: () => App.setTool(id) }));
    }
    tb.append(el('div', { class: 'tb-sep' }));
    tb.append(el('button', { class: 'tool', title: 'Agregar imagen', html: svg('image'), onclick: () => $('#fileImg').click() }));
    tb.append(el('button', { class: 'tool', title: 'Plantillas de texto y formas', html: svg('tpl'), onclick: () => this.showTemplates() }));
    tb.append(el('button', { class: 'tool', title: 'Agregar forma', html: svg('shape'), onclick: () => this.addShape('rect') }));
    tb.append(el('div', { class: 'tb-sep' }));
    tb.append(el('button', { class: 'tool' + (Editor.showGuide ? ' active' : ''), title: 'Mostrar remera de guía', html: svg('guide'), onclick: e => { Editor.showGuide = !Editor.showGuide; e.currentTarget.classList.toggle('active', Editor.showGuide); Editor.requestRender(); } }));
    tb.append(el('button', { class: 'tool', title: 'Ajustar a pantalla (Ctrl+0)', html: svg('fit'), onclick: () => Editor.fit() }));
  },

  /* ---------- barra de opciones ---------- */
  refreshOptbar() {
    const ob = $('#optbar');
    ob.innerHTML = '';
    ob.append(UI.seg([['front', 'Frente'], ['back', 'Espalda']], () => App.side, v => { App.side = v; App.sel = null; this.refreshAll(); Editor.requestRender(); }));
    ob.append(el('button', { title: 'Copiar todas las capas de este lado al otro', onclick: () => this.copySide() }, App.side === 'front' ? 'Copiar a espalda →' : '← Copiar a frente'));
    ob.append(el('span', { class: 'sep' }));
    const sw = el('div', { class: 'swatches', title: 'Color de la remera' });
    const cols = ['#141414', '#f3f2ee', '#8e8e90', '#e8dfca', '#4b3a2c', '#4a5232', '#1b2236', '#7a1f24'];
    for (const c of cols) sw.append(el('button', { class: 'sw' + (App.project.shirt.color === c ? ' active' : ''), style: `background:${c}`, title: c, onclick: () => this.setShirtColor(c) }));
    const ci = el('input', { type: 'color', value: App.project.shirt.color, title: 'Otro color' });
    ci.addEventListener('input', () => { App.project.shirt.color = ci.value; App.changed(true); });
    ci.addEventListener('change', () => this.setShirtColor(ci.value));
    sw.append(ci);
    ob.append(el('label', {}, 'Remera'), sw);
    ob.append(el('span', { class: 'sep' }));
    const t = App.tool;
    if (t === 'erase' || t === 'restore') {
      ob.append(el('div', { class: 'grp' }, el('label', {}, 'Tamaño'), this.miniRange(App.brush, 'size', 4, 500, 1), el('label', {}, 'Dureza'), this.miniRange(App.brush, 'hard', 0, 1, 0.05)));
      ob.append(el('span', { class: 'hint' }, '[ y ] cambian el tamaño'));
    } else if (t === 'wand') {
      ob.append(el('div', { class: 'grp' }, el('label', {}, 'Tolerancia'), this.miniRange(App.wand, 'tol', 2, 120, 1)));
      const g = el('input', { type: 'checkbox', checked: App.wand.global });
      g.onchange = () => (App.wand.global = g.checked);
      ob.append(el('label', { class: 'chk' }, g, 'Todo el color (no contiguo)'));
      ob.append(el('button', { onclick: () => { const L = App.selected(); if (L && L.type === 'image') { autoRemoveBg(L, App.wand.tol); toast('Fondo quitado. Retocá con el borrador (E) o restaurar (R).'); } else toast('Seleccioná una imagen'); } }, 'Quitar fondo automático'));
    } else {
      ob.append(el('div', { class: 'grp' }, el('button', { class: 'ghost', onclick: () => Editor.zoomBy(1 / 1.25) }, '−'), el('span', { id: 'zoomLbl' }, ''), el('button', { class: 'ghost', onclick: () => Editor.zoomBy(1.25) }, '+')));
    }
    $('#sideLbl').textContent = App.side === 'front' ? 'FRENTE' : 'ESPALDA';
  },
  miniRange(obj, key, min, max, step) {
    const r = el('input', { type: 'range', min, max, step, value: obj[key] });
    r.oninput = () => { obj[key] = +r.value; Editor.requestRender(); };
    return r;
  },
  setShirtColor(c) {
    App.project.shirt.color = c;
    App.commit();
    this.refreshOptbar();
  },

  /* ---------- capas ---------- */
  buildLayerFoot() {
    const f = $('#layersFoot');
    f.append(
      el('button', { onclick: () => $('#fileImg').click(), title: 'Agregar imagen' }, '+ Imagen'),
      el('button', { onclick: () => this.addText(), title: 'Agregar texto' }, '+ Texto'),
      el('button', { onclick: () => this.addShape('rect'), title: 'Agregar forma' }, '+ Forma'),
      el('span', { class: 'spacer', style: 'flex:1' }),
      el('button', { onclick: () => this.reorder(1), title: 'Subir capa (Ctrl+])' }, '↑'),
      el('button', { onclick: () => this.reorder(-1), title: 'Bajar capa (Ctrl+[)' }, '↓'),
      el('button', { onclick: () => this.duplicate(), title: 'Duplicar (Ctrl+D)' }, '⧉'),
      el('button', { onclick: () => this.remove(), title: 'Eliminar (Supr)' }, '🗑')
    );
  },
  refreshLayers() {
    const list = $('#layersList');
    list.innerHTML = '';
    const ls = App.layers();
    if (!ls.length) list.append(el('div', { class: 'empty' }, 'Sin capas en este lado'));
    for (let i = ls.length - 1; i >= 0; i--) {
      const L = ls[i];
      const th = el('canvas', { width: 68, height: 68 });
      this.thumb(th, L);
      const row = el('div', { class: 'lrow' + (L.id === App.sel ? ' sel' : '') + (L.visible ? '' : ' hidden'), draggable: true },
        el('button', { class: 'ib', title: 'Mostrar/ocultar', onclick: e => { e.stopPropagation(); L.visible = !L.visible; App.commit(); } }, L.visible ? '👁' : '◌'),
        th,
        el('span', { class: 'lname', title: 'Doble clic para renombrar' }, L.name),
        el('button', { class: 'ib', title: 'Bloquear', onclick: e => { e.stopPropagation(); L.locked = !L.locked; App.commit(); } }, L.locked ? '🔒' : '🔓'));
      row.addEventListener('click', () => App.select(L.id));
      row.querySelector('.lname').addEventListener('dblclick', e => {
        const n = prompt('Nombre de la capa', L.name);
        if (n) { L.name = n; App.commit(); }
        e.stopPropagation();
      });
      row.addEventListener('dragstart', e => { e.dataTransfer.setData('text/layer', L.id); });
      row.addEventListener('dragover', e => { e.preventDefault(); row.classList.add('drag-over'); });
      row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
      row.addEventListener('drop', e => {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/layer');
        if (!id || id === L.id) return;
        const arr = App.layers(), from = arr.findIndex(l => l.id === id);
        const [m] = arr.splice(from, 1);
        const to = arr.findIndex(l => l.id === L.id);
        arr.splice(to + 1, 0, m);
        App.commit();
      });
      list.append(row);
    }
    $('#sideLbl').textContent = App.side === 'front' ? 'FRENTE' : 'ESPALDA';
    Editor.requestRender();
  },
  thumb(cv, L) {
    const x = ctx2d(cv);
    x.fillStyle = App.project.shirt.color;
    x.fillRect(0, 0, 68, 68);
    const R = Proc.cache.get(L.id + '@' + Editor.rs()) || [...Proc.cache.entries()].find(([k]) => k.startsWith(L.id + '@'))?.[1];
    const c = R && R.out && R.out.canvas;
    if (!c) { setTimeout(() => { if (cv.isConnected) this.thumb(cv, L); }, 300); return; }
    const s = Math.min(60 / c.width, 60 / c.height);
    x.drawImage(c, (68 - c.width * s) / 2, (68 - c.height * s) / 2, c.width * s, c.height * s);
  },
  addLayer(L, side) {
    L.id = uid();
    App.layers(side).push(L);
    App.sel = L.id;
    App.commit();
    this.refreshProps();
  },
  async addImageFiles(files) {
    const imgs = [...files].filter(f => f.type.startsWith('image/'));
    if (!imgs.length) return;
    busy(true, 'Cargando imagen…');
    try {
      for (const f of imgs) {
        const url = await readFile(f);
        await this.addImageURL(url, f.name.replace(/\.[^.]+$/, ''), /jpe?g/i.test(f.type));
      }
    } catch (e) { toast('Error al cargar: ' + e.message); }
    busy(false);
  },
  async addImageURL(url, name = 'Imagen', jpeg = false) {
    const id = await Assets.addImage(url, { jpeg });
    const a = Assets.get(id);
    const L = Defaults.image();
    L.assetId = id;
    L.name = name.slice(0, 40);
    L.w = a.w; L.h = a.h;
    L.scale = Math.min(DESIGN_W * 0.9 / a.w, DESIGN_H * 0.85 / a.h);
    L.x = DESIGN_W / 2;
    L.y = DESIGN_H / 2;
    const isDark = lumHex(App.project.shirt.color) < 0.45;
    if (!isDark) { L.fx.ink = '#141414'; L.fx.invertTone = true; L.fx.duoB = '#141414'; }
    this.addLayer(L);
    if (App.view !== 'design') App.setView('design');
  },
  addText(o = {}) {
    const L = Object.assign(Defaults.text(), o);
    if (lumHex(App.project.shirt.color) >= 0.45 && !o.color) L.color = '#141414';
    L.name = o.name || ('Texto: ' + String(L.text).slice(0, 18));
    this.addLayer(L);
  },
  addShape(kind, o = {}) {
    const L = Object.assign(Defaults.shape(), { shape: kind }, o);
    if (lumHex(App.project.shirt.color) >= 0.45 && !o.fill) { L.fill = '#141414'; L.strokeColor = '#141414'; }
    L.name = o.name || ({ rect: 'Rectángulo', ellipse: 'Círculo', line: 'Línea', star: 'Estrella', triangle: 'Triángulo' })[kind] || 'Forma';
    if (kind === 'line') { L.shape = 'rect'; L.h = 14; L.w = 1600; }
    this.addLayer(L);
  },
  duplicate() {
    const L = App.selected();
    if (!L) return;
    const c = deepClone(L);
    c.id = uid();
    c.name = L.name + ' copia';
    c.x += 60; c.y += 60;
    const arr = App.layers();
    arr.splice(arr.indexOf(L) + 1, 0, c);
    App.sel = c.id;
    App.commit();
    this.refreshProps();
  },
  remove() {
    const L = App.selected();
    if (!L) return;
    const arr = App.layers();
    arr.splice(arr.indexOf(L), 1);
    App.sel = null;
    App.commit();
    this.refreshProps();
  },
  reorder(dir) {
    const L = App.selected();
    if (!L) return;
    const arr = App.layers(), i = arr.indexOf(L), j = clamp(i + dir, 0, arr.length - 1);
    if (i === j) return;
    arr.splice(i, 1);
    arr.splice(j, 0, L);
    App.commit();
  },
  copySide() {
    const from = App.side, to = from === 'front' ? 'back' : 'front';
    const src = App.layers(from);
    if (!src.length) { toast('No hay capas para copiar'); return; }
    const dst = App.layers(to);
    if (dst.length && !confirm(`El ${to === 'back' ? 'dorso' : 'frente'} ya tiene capas. ¿Agregar las copias encima?`)) return;
    for (const L of src) { const c = deepClone(L); c.id = uid(); dst.push(c); }
    App.commit();
    toast('Copiado. Cambiá a ' + (to === 'back' ? 'Espalda' : 'Frente') + ' para editarlo.');
  },

  /* ---------- plantillas ---------- */
  showTemplates() {
    const script = Fonts.pick('Segoe Script', 'Brush Script MT', 'Lucida Handwriting', 'Ink Free', 'Snell Roundhand', 'cursive');
    const gothic = Fonts.pick('Old English Text MT', 'Engravers MT', 'Algerian', 'Impact');
    const impact = Fonts.pick('Impact', 'Haettenschweiler', 'Arial Black');
    const clean = Fonts.pick('Bahnschrift', 'Segoe UI', 'Helvetica', 'Arial');
    const T = [
      ['Firma', () => this.addText({ text: 'Tu Firma', font: script, weight: 400, size: 190, rot: -8, x: 1050, y: 1500, name: 'Firma' })],
      ['Título gótico', () => this.addText({ text: 'LEGENDS', font: gothic, weight: 400, size: 460, y: 380, name: 'Título' })],
      ['Número grande', () => this.addText({ text: '23', font: impact, weight: 400, size: 1500, color: '#d0202c', strokeWidth: 12, strokeColor: '#f1e7d3', name: 'Número' })],
      ['Texto curvo', () => this.addText({ text: 'STOCKSTORE  CLUB', font: clean, size: 230, spacing: 20, arc: 80, y: 650, name: 'Texto curvo' })],
      ['Logo pecho', () => this.addText({ text: 'STOCK', font: clean, size: 150, spacing: 40, weight: 700, x: 2150, y: 420, name: 'Logo pecho' })],
      ['Minimal', () => this.addText({ text: 'stockstore®', font: clean, weight: 300, size: 140, spacing: 45, y: 520, name: 'Minimal' })],
      ['Pie de diseño', () => this.addText({ text: 'EST. 2024 — BUENOS AIRES', font: clean, weight: 400, size: 95, spacing: 30, y: 3350, name: 'Pie' })],
      ['Dos líneas', () => this.addText({ text: 'NOTHING\nBUT NET', font: impact, weight: 400, size: 380, lineHeight: 0.95, y: 900, name: 'Dos líneas' })],
      ['Línea', () => this.addShape('line', { y: 3200 })],
      ['Marco', () => this.addShape('rect', { fillOn: false, strokeWidth: 18, w: 2600, h: 3200, name: 'Marco' })],
      ['Círculo', () => this.addShape('ellipse', { w: 1400, h: 1400 })],
      ['Estrella', () => this.addShape('star', { w: 700, h: 700 })]
    ];
    const card = $('#helpCard');
    card.innerHTML = '';
    card.append(el('h2', {}, 'Plantillas'), el('p', { class: 'hint' }, 'Se agregan al lado actual (' + (App.side === 'front' ? 'frente' : 'espalda') + '). Después las movés y editás como cualquier capa.'));
    const g = el('div', { class: 'presets', style: 'grid-template-columns:repeat(4,1fr);margin-top:12px' });
    for (const [n, fn] of T) g.append(el('button', { style: 'padding:14px 6px', onclick: () => { fn(); $('#helpModal').classList.remove('show'); App.setTool('move'); } }, n));
    card.append(g, el('div', { class: 'row', style: 'margin-top:14px;justify-content:flex-end' }, el('button', { onclick: () => $('#helpModal').classList.remove('show') }, 'Cerrar')));
    $('#helpModal').classList.add('show');
  },

  /* ---------- propiedades ---------- */
  refreshProps() {
    const P = $('#propsPanel');
    const st = P.scrollTop;
    P.innerHTML = '';
    const L = App.selected();
    $('#propsTitle').textContent = L ? 'Propiedades · ' + ({ image: 'Imagen', text: 'Texto', shape: 'Forma' })[L.type] : 'Propiedades';
    if (!L) {
      P.append(el('div', { class: 'empty' }, 'Seleccioná una capa o agregá una imagen.'),
        el('div', { class: 'secbody' },
          el('button', { class: 'primary', onclick: () => $('#fileImg').click() }, 'Agregar imagen'),
          el('button', { onclick: () => this.showTemplates() }, 'Plantillas de texto'),
          el('p', { class: 'hint' }, 'Tip: pegá una imagen copiada de Pinterest/Google con Ctrl+V.')));
      return;
    }
    if (L.type === 'image') this.imageProps(P, L);
    else if (L.type === 'text') this.textProps(P, L);
    else this.shapeProps(P, L);
    this.commonProps(P, L);
    P.scrollTop = st;
  },
  rebuild() { this.refreshProps(); },

  imageProps(P, L) {
    // estilos rápidos
    const grid = el('div', { class: 'presets' });
    for (const pr of Presets.list) {
      const cv = el('canvas', { width: 120, height: 120 });
      const b = el('button', { class: 'preset', title: pr.tip || pr.name, onclick: () => { Presets.apply(L, pr.id); App.commit(); this.refreshProps(); } }, cv, el('span', {}, pr.name));
      grid.append(b);
      Presets.thumbQueue.push([cv, L, pr.id]);
    }
    Presets.runThumbs();
    P.append(UI.sec('Estilos rápidos', [grid, el('p', { class: 'hint' }, 'Aplicá uno y después ajustá todo abajo.')], true));

    const fx = L.fx, rb = () => this.refreshProps();
    const modes = [['color', 'Color original'], ['gray', 'Blanco y negro'], ['ink', 'Tinta 1 color (vintage)'], ['halftone', 'Semitono (puntos)'],
      ['stencil', 'Stencil / alto contraste'], ['dither', 'Grano / dither'], ['duotone', 'Duotono']];
    const fxk = [UI.select('Efecto', fx, 'mode', modes, { onChange: rb })];
    if (fx.mode !== 'color' && fx.mode !== 'gray') {
      if (fx.mode !== 'duotone') fxk.push(UI.color('Color tinta', fx, 'ink', { swatches: ['#f1e7d3', '#ffffff', '#d9c3a0', '#141414', '#d0202c', '#ff7a1a'] }));
      fxk.push(UI.check('Invertir tonos (para remera clara)', fx, 'invertTone'));
    }
    if (fx.mode === 'halftone') {
      fxk.push(UI.select('Forma punto', fx, 'shape', [['circle', 'Círculo'], ['square', 'Cuadrado'], ['diamond', 'Rombo'], ['line', 'Líneas'], ['cross', 'Cruz']]));
      fxk.push(UI.range('Tamaño trama', fx, 'cell', 6, 140, 1, { def: 30 }));
      fxk.push(UI.range('Ángulo', fx, 'angle', 0, 90, 1, { def: 45 }));
      fxk.push(UI.range('Escala punto', fx, 'dotScale', 0.3, 1.6, 0.01, { def: 1 }));
      fxk.push(UI.range('Punto mínimo', fx, 'minDot', 0, 0.5, 0.01, { def: 0.05 }));
      fxk.push(UI.range('Suavizado', fx, 'smooth', 0, 1.5, 0.05, { def: 0.6 }));
      fxk.push(UI.check('Puntos con el color de la foto', fx, 'colorDots'));
    }
    if (fx.mode === 'stencil') {
      fxk.push(UI.range('Umbral', fx, 'threshold', 0.02, 0.98, 0.01, { def: 0.5 }));
      fxk.push(UI.range('Suavidad borde', fx, 'softness', 0, 0.3, 0.005, { def: 0.04, dec: 3 }));
    }
    if (fx.mode === 'dither') fxk.push(UI.range('Tamaño grano', fx, 'ditherSize', 2, 40, 1, { def: 8 }));
    if (fx.mode === 'duotone') {
      fxk.push(UI.color('Sombras', fx, 'duoA'));
      fxk.push(UI.color('Luces', fx, 'duoB'));
      fxk.push(UI.check('Sombras transparentes', fx, 'duoTransparent'));
    }
    if (fx.mode !== 'color') fxk.push(UI.range('Ruido / grano', fx, 'grain', 0, 0.6, 0.01, { def: 0 }));
    P.append(UI.sec('Efecto', fxk, true, modes.find(m => m[0] === fx.mode)[1]));

    const ac = L.accent;
    P.append(UI.sec('Color de acento', [
      el('p', { class: 'hint' }, 'Conserva un color de la foto (ej. el rojo de la camiseta o los anteojos) mientras el resto queda en 1 tinta. Con el cuentagotas (I) clic sobre la foto para elegirlo.'),
      UI.check('Activar', ac, 'on'),
      UI.color('Color a conservar', ac, 'color'),
      UI.range('Rango de tono', ac, 'range', 2, 90, 1, { def: 22 }),
      UI.range('Saturación mín.', ac, 'minSat', 0, 1, 0.01, { def: 0.4 }),
      UI.check('Acento también en puntos', ac, 'halftone')
    ], false, ac.on ? 'activo' : ''));

    const a = L.adj;
    P.append(UI.sec('Ajustes de imagen', [
      UI.range('Exposición', a, 'exposure', -2, 2, 0.01, { def: 0 }),
      UI.range('Brillo', a, 'brightness', -1, 1, 0.01, { def: 0 }),
      UI.range('Contraste', a, 'contrast', -1, 0.95, 0.01, { def: 0 }),
      UI.range('Negros', a, 'black', 0, 0.6, 0.01, { def: 0 }),
      UI.range('Blancos', a, 'white', 0.4, 1, 0.01, { def: 1 }),
      UI.range('Gamma', a, 'gamma', 0.2, 3, 0.01, { def: 1 }),
      UI.range('Saturación', a, 'saturation', -1, 1, 0.01, { def: 0 }),
      UI.range('Nitidez', a, 'sharpen', 0, 2, 0.01, { def: 0 }),
      UI.range('Desenfoque', a, 'blur', 0, 40, 0.5, { def: 0 }),
      UI.check('Invertir (negativo)', a, 'invert'),
      UI.btns([['Auto-contraste', () => { autoLevels(L); App.commit(); this.refreshProps(); }], ['Restablecer', () => { L.adj = Defaults.image().adj; App.commit(); this.refreshProps(); }]])
    ], true));

    const f = L.fade;
    P.append(UI.sec('Fundido de bordes', [
      el('p', { class: 'hint' }, 'Para que la foto se “funda” con la remera como en los diseños vintage.'),
      UI.range('Todos los bordes', f, 'edge', 0, 1, 0.01, { def: 0 }),
      UI.range('Abajo', f, 'bottom', 0, 1, 0.01, { def: 0 }),
      UI.range('Arriba', f, 'top', 0, 1, 0.01, { def: 0 }),
      UI.range('Izquierda', f, 'left', 0, 1, 0.01, { def: 0 }),
      UI.range('Derecha', f, 'right', 0, 1, 0.01, { def: 0 }),
      UI.range('Radial (viñeta)', f, 'radial', 0, 1, 0.01, { def: 0 })
    ], false));

    P.append(UI.sec('Fondo / recorte', [
      el('p', { class: 'hint' }, 'Borrador (E) y Restaurar (R) pintan la máscara. Varita (W) borra un color con un clic.'),
      UI.btns([['Quitar fondo auto', () => { autoRemoveBg(L, App.wand.tol); toast('Listo. Ajustá la tolerancia en la Varita (W) si quedó mal.'); }],
        ['Restaurar todo', () => { L.maskId = null; App.commit(); }]]),
      UI.btns([['Borrador', () => App.setTool('erase')], ['Restaurar', () => App.setTool('restore')], ['Varita', () => App.setTool('wand')]]),
      UI.range('Recorte izq.', L.crop, 'l', 0, 0.9, 0.005, { def: 0, dec: 3 }),
      UI.range('Recorte der.', L.crop, 'r', 0, 0.9, 0.005, { def: 0, dec: 3 }),
      UI.range('Recorte arriba', L.crop, 't', 0, 0.9, 0.005, { def: 0, dec: 3 }),
      UI.range('Recorte abajo', L.crop, 'b', 0, 0.9, 0.005, { def: 0, dec: 3 })
    ], false));
    this.postProps(P, L);
  },

  postProps(P, L) {
    const p = L.post;
    P.append(UI.sec('Contorno y desgaste', [
      UI.range('Contorno', p, 'outline', 0, 80, 1, { def: 0 }),
      UI.color('Color contorno', p, 'outlineColor', { swatches: ['#c9a27a', '#f1e7d3', '#d0202c', '#000000'] }),
      UI.range('Desgaste vintage', p, 'distress', 0, 1, 0.01, { def: 0 }),
      UI.range('Escala desgaste', p, 'distressScale', 0.2, 4, 0.05, { def: 1 })
    ], false, (p.outline || p.distress) ? 'activo' : ''));
  },

  textProps(P, L) {
    const fonts = Fonts.all();
    P.append(UI.sec('Texto', [
      UI.text('', L, 'text', { multi: true }),
      UI.select('Fuente', L, 'font', fonts.includes(L.font) ? fonts : [L.font, ...fonts], { fontPreview: true }),
      UI.btns([['Cargar fuente .ttf/.otf…', () => $('#fileFont').click(), 'Fuentes descargadas (dafont, etc.)']]),
      UI.select('Grosor', L, 'weight', [[100, 'Fino'], [300, 'Light'], [400, 'Normal'], [600, 'Semi'], [700, 'Negrita'], [900, 'Black']]),
      UI.check('Cursiva', L, 'italic'),
      UI.range('Tamaño', L, 'size', 20, 2400, 1),
      UI.color('Color', L, 'color', { swatches: ['#f1e7d3', '#ffffff', '#141414', '#d0202c', '#ff7a1a', '#c9a27a'] }),
      UI.range('Espaciado', L, 'spacing', -50, 300, 1, { def: 0 }),
      UI.range('Interlineado', L, 'lineHeight', 0.6, 2, 0.01, { def: 1.05 }),
      UI.select('Alineación', L, 'align', [['left', 'Izquierda'], ['center', 'Centro'], ['right', 'Derecha']]),
      UI.range('Curva (arco)', L, 'arc', -300, 300, 1, { def: 0 }),
      UI.range('Borde', L, 'strokeWidth', 0, 80, 1, { def: 0 }),
      UI.color('Color borde', L, 'strokeColor')
    ], true));
    this.postProps(P, L);
  },

  shapeProps(P, L) {
    P.append(UI.sec('Forma', [
      UI.select('Tipo', L, 'shape', [['rect', 'Rectángulo'], ['ellipse', 'Elipse'], ['triangle', 'Triángulo'], ['star', 'Estrella']]),
      UI.range('Ancho', L, 'w', 4, 3000, 1),
      UI.range('Alto', L, 'h', 4, 3600, 1),
      UI.range('Redondeo', L, 'radius', 0, 1, 0.01, { def: 0 }),
      UI.check('Relleno', L, 'fillOn'),
      UI.color('Color relleno', L, 'fill', { swatches: ['#f1e7d3', '#141414', '#d0202c', '#ff7a1a'] }),
      UI.range('Borde', L, 'strokeWidth', 0, 120, 1, { def: 0 }),
      UI.color('Color borde', L, 'strokeColor')
    ], true));
    this.postProps(P, L);
  },

  commonProps(P, L) {
    const blends = [['source-over', 'Normal'], ['screen', 'Trama (aclarar)'], ['multiply', 'Multiplicar'], ['overlay', 'Superponer'], ['lighten', 'Aclarar'], ['darken', 'Oscurecer'], ['difference', 'Diferencia']];
    const al = (fn) => () => { fn(); App.commit(); this.refreshProps(); };
    P.append(UI.sec('Capa y posición', [
      UI.range('Opacidad', L, 'opacity', 0, 1, 0.01, { def: 1 }),
      UI.select('Fusión', L, 'blend', blends),
      UI.range('Escala', L, 'scale', 0.01, 10, 0.001, { dec: 3 }),
      UI.range('Rotación', L, 'rot', -180, 180, 0.5, { def: 0 }),
      UI.range('Posición X', L, 'x', -1000, DESIGN_W + 1000, 1),
      UI.range('Posición Y', L, 'y', -1000, DESIGN_H + 1000, 1),
      UI.btns([['Centrar H', al(() => (L.x = DESIGN_W / 2))], ['Centrar V', al(() => (L.y = DESIGN_H / 2))], ['Arriba', al(() => { const b = Proc.bounds(L, Editor.rs()); L.y = b.h / 2 + 60; })]]),
      UI.btns([['Ajustar ancho', al(() => { const b = Proc.bounds(L, Editor.rs()); L.scale *= DESIGN_W / b.w; L.x = DESIGN_W / 2; })],
        ['Espejo H', al(() => (L.flipX = !L.flipX))], ['Espejo V', al(() => (L.flipY = !L.flipY))], ['Rotar 90°', al(() => (L.rot = ((L.rot + 90 + 180) % 360) - 180))]]),
      UI.btns([['Mover al otro lado', () => {
        const to = App.side === 'front' ? 'back' : 'front';
        const arr = App.layers(); arr.splice(arr.indexOf(L), 1);
        App.layers(to).push(L); App.sel = null; App.commit(); this.refreshProps();
        toast('Capa movida a ' + (to === 'back' ? 'la espalda' : 'el frente'));
      }]])
    ], false));
  }
};

/* auto-niveles: estira el histograma de la imagen */
function autoLevels(L) {
  const a = Assets.get(L.assetId);
  if (!a) return;
  const w = Math.min(400, a.w), h = Math.round(a.h * w / a.w);
  const d = Assets.sourceData(L.assetId, w, h);
  const hist = new Uint32Array(256);
  let n = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 20) { hist[(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) | 0]++; n++; }
  let acc = 0, lo = 0, hi = 255;
  for (let i = 0; i < 256; i++) { acc += hist[i]; if (acc > n * 0.01) { lo = i; break; } }
  acc = 0;
  for (let i = 255; i >= 0; i--) { acc += hist[i]; if (acc > n * 0.01) { hi = i; break; } }
  L.adj.black = clamp(lo / 255, 0, 0.6);
  L.adj.white = clamp(hi / 255, 0.4, 1);
  L.adj.contrast = Math.max(L.adj.contrast, 0.1);
}

/* =====================================================================
   Estilos rápidos (inspirados en remeras vintage / streetwear)
   ===================================================================== */
const Presets = {
  list: [
    { id: 'original', name: 'Original', tip: 'Foto a color sin efectos' },
    { id: 'halftone', name: 'Semitono', tip: 'Puntos color crema, fundido abajo (estilo Rodman)' },
    { id: 'accent', name: 'Semitono + color', tip: 'Semitono que conserva el rojo (estilo Jordan 23)' },
    { id: 'vintage', name: 'Foto vintage', tip: 'Una tinta con grano y desgaste (estilo prensa 90s)' },
    { id: 'bw', name: 'B/N suave', tip: 'Blanco y negro con fundido de bordes' },
    { id: 'stencil', name: 'Stencil', tip: 'Alto contraste, una tinta' },
    { id: 'lines', name: 'Líneas', tip: 'Trama de líneas horizontales' },
    { id: 'dither', name: 'Grano', tip: 'Dither tipo serigrafía' },
    { id: 'pop', name: 'Pop contorno', tip: 'Semitono con contorno beige y acento (estilo cara con anteojos)' },
    { id: 'duo', name: 'Duotono', tip: 'Dos colores' },
    { id: 'colordots', name: 'Puntos color', tip: 'Semitono con los colores de la foto' },
    { id: 'squares', name: 'Cuadros', tip: 'Semitono de cuadrados' }
  ],
  apply(L, id) {
    const d = Defaults.image();
    const light = lumHex(App.project.shirt.color) >= 0.45;
    const ink = light ? '#141414' : '#f1e7d3';
    L.adj = d.adj; L.fx = d.fx; L.accent = Object.assign(d.accent, { color: L.accent.color }); L.fade = d.fade; L.post = d.post;
    L.fx.ink = ink; L.fx.duoB = ink; L.fx.invertTone = light;
    const fx = L.fx, a = L.adj, f = L.fade, p = L.post;
    switch (id) {
      case 'halftone': fx.mode = 'halftone'; a.contrast = 0.25; a.sharpen = 0.3; f.bottom = 0.35; f.edge = 0.12; break;
      case 'accent': fx.mode = 'halftone'; fx.cell = 26; a.contrast = 0.2; a.sharpen = 0.3; f.bottom = 0.3; f.edge = 0.1; L.accent.on = true; break;
      case 'vintage': fx.mode = 'ink'; a.contrast = 0.22; a.sharpen = 0.5; fx.grain = 0.12; f.edge = 0.2; f.bottom = 0.25; p.distress = 0.14; break;
      case 'bw': fx.mode = 'gray'; a.contrast = 0.15; f.edge = 0.22; f.radial = 0.25; break;
      case 'stencil': fx.mode = 'stencil'; a.contrast = 0.3; a.blur = 3; fx.threshold = 0.48; break;
      case 'lines': fx.mode = 'halftone'; fx.shape = 'line'; fx.angle = 0; fx.cell = 22; a.contrast = 0.25; f.bottom = 0.3; break;
      case 'dither': fx.mode = 'dither'; fx.ditherSize = 7; a.contrast = 0.2; f.edge = 0.12; break;
      case 'pop': fx.mode = 'halftone'; fx.cell = 22; a.contrast = 0.3; p.outline = 22; p.outlineColor = '#c9a27a'; L.accent.on = true; break;
      case 'duo': fx.mode = 'duotone'; fx.duoA = light ? '#f3f2ee' : '#1a1410'; fx.duoB = light ? '#7a1f24' : '#f1c27a'; a.contrast = 0.2; f.edge = 0.12; break;
      case 'colordots': fx.mode = 'halftone'; fx.colorDots = true; fx.cell = 22; a.saturation = 0.25; a.contrast = 0.15; f.edge = 0.1; break;
      case 'squares': fx.mode = 'halftone'; fx.shape = 'square'; fx.cell = 28; fx.angle = 45; a.contrast = 0.25; f.bottom = 0.3; break;
    }
    if (L.maskId && (id === 'halftone' || id === 'accent' || id === 'pop')) { f.bottom = Math.min(f.bottom, 0.15); f.edge = 0; }
  },
  thumbQueue: [], _running: false,
  runThumbs() {
    if (this._running) return;
    this._running = true;
    const step = () => {
      const job = this.thumbQueue.shift();
      if (!job) { this._running = false; return; }
      const [cv, L, id] = job;
      if (cv.isConnected) {
        try {
          const T = deepClone(L);
          this.apply(T, id);
          const target = 120 / Math.max(T.w * (1 - T.crop.l - T.crop.r), T.h * (1 - T.crop.t - T.crop.b));
          T.scale = target * 1.6;
          T.fx.cell = Math.max(4, T.fx.cell * 0.26);
          T.fx.ditherSize = Math.max(2, T.fx.ditherSize * 0.3);
          T.post.outline *= 0.25;
          T.post.distressScale *= 0.3;
          let out = renderImage(T, 1 / 1.6);
          if (out) out = postProcess(out, T);
          const x = ctx2d(cv);
          x.fillStyle = App.project.shirt.color;
          x.fillRect(0, 0, 120, 120);
          if (out) {
            const c = out.canvas, s = Math.min(110 / c.width, 110 / c.height);
            x.drawImage(c, (120 - c.width * s) / 2, (120 - c.height * s) / 2, c.width * s, c.height * s);
          }
        } catch (e) { console.warn(e); }
      }
      setTimeout(step, 0);
    };
    setTimeout(step, 30);
  }
};
