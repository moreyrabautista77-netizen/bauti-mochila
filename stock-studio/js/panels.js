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
  marquee: '<rect x="4" y="5" width="16" height="14" stroke-dasharray="3 2"/>',
  ellipseSel: '<ellipse cx="12" cy="12" rx="8" ry="6.5" stroke-dasharray="3 2"/>',
  lasso: '<path d="M6 15c-3-3 0-9 7-9s8 5 5 8-8 2-9 1"/><path d="M8 15c-1 2 0 5 2 5"/>',
  polyLasso: '<path d="M4 9l7-5 9 6-4 8H7z"/><path d="M7 18l-1 3"/>',
  magLasso: '<path d="M6 15c-3-3 0-9 7-9s8 5 5 8-8 2-9 1"/><path d="M8 15v6M5 18h6"/>',
  quickSel: '<path d="M14 4l6 6-8 8H6v-6z" stroke-dasharray="3 2"/><path d="M4 20l4-4"/>',
  wandSel: '<path d="M4 20L15 9M14 4v2M18 6l-1.4 1.4M20 10h-2M12.6 7.4L11 6"/><path d="M15 9l1.5 1.5"/>',
  crop: '<path d="M6 2v16h16M2 6h16v16"/>',
  picker: '<path d="M14.5 4.5l5 5M7 14l7.5-7.5 3 3L10 17H7z"/><path d="M7 17l-3 3"/>',
  spotHeal: '<rect x="4" y="9" width="16" height="6" rx="3" transform="rotate(-45 12 12)"/><path d="M11 11h2M12 10v2"/><circle cx="18" cy="18" r="2" stroke-dasharray="1 1"/>',
  heal: '<rect x="4" y="9" width="16" height="6" rx="3" transform="rotate(-45 12 12)"/><path d="M10.5 12h3M12 10.5v3"/>',
  patch: '<path d="M4 6h10v8H4z" stroke-dasharray="2 2"/><path d="M10 12h10v8H10z"/>',
  redEye: '<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3" fill="currentColor"/>',
  brush: '<path d="M18 3l3 3-9.5 9.5-4 1 1-4z"/><path d="M4 21c1.5-2 3-2.5 4.5-2.5"/>',
  pencil: '<path d="M4 20l2-6L16 4l4 4L10 18z"/><path d="M14 6l4 4"/>',
  colorReplace: '<path d="M18 3l3 3-9.5 9.5-4 1 1-4z"/><circle cx="6" cy="18" r="3"/>',
  clone: '<path d="M8 3h8v5H8zM12 8v5M5 13h14v4H5zM5 21h14"/>',
  pattern: '<path d="M8 3h8v5H8zM12 8v5M5 13h14v4H5z"/><path d="M5 21h2M9 21h2M13 21h2M17 21h2"/>',
  erase: '<path d="M7 21h12M4.5 15.5l9-9a2 2 0 012.8 0l3.2 3.2a2 2 0 010 2.8L13 19H8.5z"/><path d="M9.5 10.5l5 5"/>',
  restore: '<path d="M3 12a9 9 0 109-9 9 9 0 00-7 3.5"/><path d="M3 3v5h5"/>',
  bgErase: '<path d="M7 21h12M4.5 15.5l9-9a2 2 0 012.8 0l3.2 3.2a2 2 0 010 2.8L13 19H8.5z"/><path d="M12 3v3M3 12h3"/>',
  magicErase: '<path d="M7 21h12M4.5 15.5l9-9a2 2 0 012.8 0l3.2 3.2a2 2 0 010 2.8L13 19H8.5z"/><path d="M19 2l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/>',
  gradient: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 5v14M11 5v14" opacity=".5"/>',
  bucket: '<path d="M5 11l7-7 7 7-7 7z"/><path d="M19 15s2 2.5 2 3.5a2 2 0 01-4 0c0-1 2-3.5 2-3.5"/>',
  blur: '<path d="M12 3s6 7 6 11a6 6 0 01-12 0c0-4 6-11 6-11z"/>',
  sharpen: '<path d="M12 3l5 16H7z"/>',
  smudge: '<path d="M9 21v-8l-3-3a2 2 0 013-3l2 2V4a2 2 0 014 0v8"/>',
  dodge: '<circle cx="9" cy="9" r="5"/><path d="M12.5 12.5L20 20"/>',
  burn: '<path d="M4 20c2-1 4-1 6 0V9a3 3 0 016 0v11c2-1 4-1 4-1"/>',
  sponge: '<rect x="4" y="6" width="16" height="12" rx="4"/><circle cx="9" cy="11" r="1"/><circle cx="14" cy="13" r="1"/>',
  pen: '<path d="M12 3l6 9-6 9-6-9z"/><circle cx="12" cy="12" r="1.5"/>',
  freePen: '<path d="M12 3l6 9-6 9-6-9z"/><path d="M3 21c3-4 6 2 9-2"/>',
  text: '<path d="M5 6V4h14v2M12 4v16M9 20h6"/>',
  vtext: '<path d="M6 5h2v14H6M8 12h10M18 9v6"/>',
  direct: '<path d="M6 3l11 11-5 1-2 5z" fill="currentColor"/>',
  shape: '<rect x="3" y="3" width="9" height="9" rx="1"/><circle cx="16.5" cy="16.5" r="4.5"/>',
  hand: '<path d="M8 13V5.5a1.5 1.5 0 013 0V11m0-6.5a1.5 1.5 0 013 0V11m0-4.5a1.5 1.5 0 013 0V14a7 7 0 01-7 7h-1a6 6 0 01-5-3l-2.6-4.4a1.5 1.5 0 012.5-1.6L8 13"/>',
  rotView: '<path d="M20 12a8 8 0 11-3-6.2"/><path d="M20 4v5h-5"/>',
  zoom: '<circle cx="10" cy="10" r="6"/><path d="M14.5 14.5L20 20M7.5 10h5M10 7.5v5"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
  tpl: '<path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z"/>',
  fit: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  guide: '<path d="M8 3L3 7l3 3v11h12V10l3-3-5-4c-1 2-2.5 3-4 3S9 5 8 3z"/>'
};
const svg = n => `<svg viewBox="0 0 24 24">${ICONS[n] || ''}</svg>`;
const TOOL_GROUPS = [['move'], ['marquee', 'ellipseSel'], ['lasso', 'polyLasso', 'magLasso'], ['quickSel', 'wandSel'], ['crop'], ['picker'],
  ['spotHeal', 'heal', 'patch', 'redEye'], ['brush', 'pencil', 'colorReplace'], ['clone', 'pattern'], ['erase', 'restore', 'bgErase', 'magicErase'],
  ['gradient', 'bucket'], ['blur', 'sharpen', 'smudge'], ['dodge', 'burn', 'sponge'], ['pen', 'freePen'], ['text', 'vtext'], ['direct'], ['shape'],
  ['hand', 'rotView'], ['zoom']];
const groupOf = t => TOOL_GROUPS.find(g => g.includes(t));

const Panels = {
  tab: 'layers',
  groupCur: {},
  init() {
    this.buildToolbar();
    this.buildLayerFoot();
    $$('#layerTabs button').forEach(b => (b.onclick = () => { this.tab = b.dataset.tab; $$('#layerTabs button').forEach(x => x.classList.toggle('active', x === b)); this.refreshLayers(); }));
    document.addEventListener('pointerdown', e => { const f = $('#flyout'); if (f && !f.contains(e.target)) f.remove(); });
  },
  refreshAll() {
    this.refreshLayers();
    this.refreshProps();
    this.refreshOptbar();
    this.refreshColors();
    $('#projName').value = App.project.name;
    if (App.view === 'mockup') Mockup.buildPanel();
    if (App.view === 'video') Anim.buildPanel();
  },

  /* ---------- barra de herramientas (agrupada como Photopea) ---------- */
  buildToolbar() {
    const tb = $('#toolbar');
    tb.innerHTML = '';
    const grid = el('div', { class: 'tgrid' });
    for (const g of TOOL_GROUPS) {
      const cur = g.includes(App.tool) ? App.tool : (this.groupCur[g[0]] || g[0]);
      const [name, key] = TOOL_INFO[cur];
      const b = el('button', { class: 'tool' + (g.includes(App.tool) ? ' active' : ''), 'data-group': g[0], title: `${name}${key ? ' (' + key + ')' : ''}${g.length > 1 ? ' — clic derecho: más herramientas' : ''}`, html: svg(cur) + (g.length > 1 ? '<span class="tri"></span>' : '') });
      b.onclick = () => { if (g.includes(App.tool) && g.length > 1) this.flyout(b, g); else App.setTool(cur); };
      b.oncontextmenu = e => { e.preventDefault(); if (g.length > 1) this.flyout(b, g); };
      let hold = 0;
      b.onpointerdown = () => { hold = setTimeout(() => g.length > 1 && this.flyout(b, g), 380); };
      b.onpointerup = b.onpointerleave = () => clearTimeout(hold);
      grid.append(b);
    }
    tb.append(grid, el('div', { class: 'tb-sep' }));
    // colores principal / secundario
    const fg = el('input', { type: 'color', id: 'fgColor', title: 'Color principal', value: App.colors.fg });
    const bg = el('input', { type: 'color', id: 'bgColor', title: 'Color secundario', value: App.colors.bg });
    fg.oninput = () => { App.colors.fg = fg.value; };
    bg.oninput = () => { App.colors.bg = bg.value; };
    tb.append(el('div', { class: 'colors' }, fg, bg,
      el('button', { class: 'cbtn swap', title: 'Intercambiar (X)', onclick: () => this.swapColors() }, '⇄'),
      el('button', { class: 'cbtn reset', title: 'Colores por defecto (D)', onclick: () => this.resetColors() }, '◩')));
    tb.append(el('div', { class: 'tb-sep' }));
    const extra = el('div', { class: 'tgrid' },
      el('button', { class: 'tool', title: 'Agregar imagen', html: svg('image'), onclick: () => $('#fileImg').click() }),
      el('button', { class: 'tool', title: 'Plantillas de texto y formas', html: svg('tpl'), onclick: () => this.showTemplates() }),
      el('button', { class: 'tool' + (Editor.showGuide ? ' active' : ''), title: 'Mostrar remera / foto de guía', html: svg('guide'), onclick: e => { Editor.showGuide = !Editor.showGuide; e.currentTarget.classList.toggle('active', Editor.showGuide); Editor.requestRender(); } }),
      el('button', { class: 'tool', title: 'Ajustar a pantalla (Ctrl+0)', html: svg('fit'), onclick: () => Editor.fit() }));
    tb.append(extra);
  },
  flyout(btn, g) {
    $('#flyout')?.remove();
    const r = btn.getBoundingClientRect();
    const f = el('div', { id: 'flyout', class: 'flyout', style: `left:${r.right + 6}px;top:${r.top}px` });
    for (const t of g) {
      const [name, key] = TOOL_INFO[t];
      f.append(el('button', { class: App.tool === t ? 'active' : '', html: svg(t) + `<span>${name}</span><span class="k">${key}</span>`, onclick: () => { f.remove(); App.setTool(t); } }));
    }
    document.body.append(f);
  },
  refreshColors() {
    const f = $('#fgColor'), b = $('#bgColor');
    if (f) f.value = App.colors.fg;
    if (b) b.value = App.colors.bg;
  },
  swapColors() { const c = App.colors; [c.fg, c.bg] = [c.bg, c.fg]; this.refreshColors(); },
  resetColors() {
    const dark = lumHex(App.project.shirt.color) < 0.45;
    App.colors.fg = dark ? '#f1e7d3' : '#141414';
    App.colors.bg = dark ? '#141414' : '#f3f2ee';
    this.refreshColors();
  },

  /* ---------- barra de opciones (cambia según la herramienta) ---------- */
  refreshOptbar() {
    const ob = $('#optbar');
    if (!ob) return;
    ob.innerHTML = '';
    const t = App.tool, T = App.t;
    const grp = (...k) => el('div', { class: 'grp' }, ...k);
    const lab = s => el('label', {}, s);
    const sel = (obj, key, opts, cb) => {
      const s = el('select', {}, opts.map(([v, n]) => el('option', { value: v, selected: String(obj[key]) === String(v) }, n)));
      s.onchange = () => { obj[key] = typeof obj[key] === 'number' ? +s.value : s.value; cb && cb(); };
      return s;
    };
    const chk = (obj, key, text) => { const c = el('input', { type: 'checkbox', checked: !!obj[key] }); c.onchange = () => (obj[key] = c.checked); return el('label', { class: 'chk' }, c, text); };
    ob.append(el('b', { class: 'tname' }, TOOL_INFO[t] ? TOOL_INFO[t][0].split(' (')[0] : ''));
    if (usesBrush(t)) ob.append(grp(lab('Tamaño'), this.miniRange(App.brush, 'size', 2, 600, 1), lab('Dureza'), this.miniRange(App.brush, 'hard', 0, 1, 0.05)));
    if (['brush', 'pencil', 'colorReplace', 'clone', 'pattern', 'heal', 'spotHeal', 'bucket', 'gradient'].includes(t)) ob.append(grp(lab('Opacidad'), this.miniRange(T, 'opacity', 0.02, 1, 0.01)));
    if (['blur', 'sharpen', 'smudge', 'dodge', 'burn', 'sponge'].includes(t)) ob.append(grp(lab('Intensidad'), this.miniRange(T, 'strength', 0.02, 1, 0.01)));
    if (t === 'sponge') ob.append(sel(T, 'spongeMode', [['desat', 'Desaturar'], ['sat', 'Saturar']]));
    if (t === 'pattern') ob.append(grp(lab('Motivo'), sel(T, 'pattern', Patterns.list)));
    if (t === 'clone' || t === 'heal') ob.append(el('span', { class: 'hint' }, 'Alt+clic para tomar la muestra'));
    if (t === 'redEye') ob.append(el('span', { class: 'hint' }, 'Clic sobre el ojo'));
    if (t === 'spotHeal') ob.append(el('span', { class: 'hint' }, 'Pintá sobre la mancha y soltá'));
    if (t === 'patch') ob.append(el('span', { class: 'hint' }, '1) Seleccioná la zona con el lazo  2) Arrastrala hacia una zona sana'));
    if (SEL_TOOLS.includes(t)) {
      if (['wandSel', 'quickSel'].includes(t)) ob.append(grp(lab('Tolerancia'), this.miniRange(T, 'tol', 2, 120, 1)));
      if (t === 'wandSel') ob.append(chk(T, 'contiguous', 'Contiguo'));
      if (['marquee', 'ellipseSel', 'lasso', 'polyLasso', 'magLasso'].includes(t)) ob.append(grp(lab('Desvanecer'), this.miniRange(T, 'feather', 0, 120, 1)));
      ob.append(el('span', { class: 'hint' }, 'Shift: sumar · Alt: restar'));
      ob.append(el('button', { onclick: () => Menus.run('selSubject') }, 'Seleccionar sujeto'), el('button', { onclick: () => Menus.run('selInvert') }, 'Invertir'), el('button', { onclick: () => Sel.none() }, 'Deseleccionar'));
    }
    if (['magicErase', 'bgErase', 'bucket'].includes(t)) ob.append(grp(lab('Tolerancia'), this.miniRange(T, 'tol', 2, 120, 1)));
    if (['magicErase', 'bucket'].includes(t)) ob.append(chk(T, 'contiguous', 'Contiguo'));
    if (['erase', 'restore', 'bgErase', 'magicErase'].includes(t)) ob.append(el('button', { onclick: () => Menus.run('autoBg') }, 'Quitar fondo automático'));
    if (t === 'gradient') ob.append(sel(T, 'gradType', [['linear', 'Lineal'], ['radial', 'Radial']]), chk(T, 'gradReverse', 'Invertir'), chk(T, 'gradTransparent', 'A transparente'));
    if (t === 'shape') {
      ob.append(grp(lab('Forma'), sel(T, 'shape', SHAPES, () => this.refreshOptbar())));
      if (T.shape === 'polygon') ob.append(grp(lab('Lados'), this.miniRange(T, 'sides', 3, 12, 1)));
      ob.append(el('span', { class: 'hint' }, 'Arrastrá para dibujar (Shift: proporcional). Usa el color principal.'));
    }
    if (t === 'crop') ob.append(el('span', { class: 'hint' }, 'Arrastrá sobre la imagen seleccionada'), el('button', { onclick: () => Menus.run('cropToSel') }, 'Recortar a selección'));
    if (t === 'pen') ob.append(el('span', { class: 'hint' }, 'Clic = punto · arrastrar = curva · clic en el 1º punto = cerrar'), el('button', { onclick: () => Editor.finishPen(false) }, 'Terminar (Enter)'));
    if (t === 'move') ob.append(el('span', { class: 'hint' }, 'Esquinas: escalar (Shift = libre) · lados: estirar · círculo: rotar'));
    if (['move', 'hand', 'zoom', 'rotView', 'text', 'vtext', 'direct', 'picker', 'freePen'].includes(t)) {
      ob.append(grp(el('button', { class: 'ghost', onclick: () => Editor.zoomBy(1 / 1.25) }, '−'), el('span', { id: 'zoomLbl' }, ''), el('button', { class: 'ghost', onclick: () => Editor.zoomBy(1.25) }, '+')));
      if (Editor.vr) ob.append(el('button', { onclick: () => { Editor.vr = 0; Editor.requestRender(); this.refreshOptbar(); } }, 'Enderezar vista'));
    }
    if (t === 'picker') ob.append(el('span', { class: 'hint' }, 'Clic: color principal · Alt: secundario · Shift sobre foto: color de acento'));
    ob.append(el('span', { style: 'flex:1' }));
    ob.append(UI.seg([['front', 'Frente'], ['back', 'Espalda']], () => App.side, v => { App.side = v; App.sel = null; this.refreshAll(); Editor.requestRender(); }));
    const sw = el('div', { class: 'swatches', title: 'Color de la remera' });
    for (const c of ['#141414', '#f3f2ee', '#8e8e90', '#e8dfca']) sw.append(el('button', { class: 'sw' + (App.project.shirt.color === c ? ' active' : ''), style: `background:${c}`, title: c, onclick: () => this.setShirtColor(c) }));
    const ci = el('input', { type: 'color', value: App.project.shirt.color, title: 'Otro color de remera' });
    ci.addEventListener('input', () => { App.project.shirt.color = ci.value; App.changed(true); });
    ci.addEventListener('change', () => this.setShirtColor(ci.value));
    sw.append(ci);
    ob.append(sw);
    $('#sideLbl').textContent = App.side === 'front' ? 'FRENTE' : 'ESPALDA';
    Editor.requestRender();
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
      el('button', { onclick: () => $('#fileImg').click(), title: 'Agregar imagen' }, '+ Img'),
      el('button', { onclick: () => this.addEmptyLayer(), title: 'Nueva capa vacía para pintar (Ctrl+Shift+N)' }, '+ Capa'),
      el('button', { onclick: e => Menus.open(e.currentTarget, 'adjustNew'), title: 'Nueva capa de ajuste' }, '+ Ajuste'),
      el('span', { class: 'spacer', style: 'flex:1' }),
      el('button', { onclick: () => this.reorder(1), title: 'Subir capa (Ctrl+])' }, '↑'),
      el('button', { onclick: () => this.reorder(-1), title: 'Bajar capa (Ctrl+[)' }, '↓'),
      el('button', { onclick: () => this.duplicate(), title: 'Duplicar (Ctrl+J)' }, '⧉'),
      el('button', { onclick: () => this.remove(), title: 'Eliminar capa' }, '🗑')
    );
  },
  refreshHistory() {
    if (this.tab !== 'history') return;
    const list = $('#layersList');
    list.innerHTML = '';
    History.stack.forEach((h, i) => {
      const row = el('div', { class: 'hrow' + (i === History.idx ? ' sel' : '') + (i > History.idx ? ' future' : '') }, el('span', {}, h.label || 'Edición'), el('span', { class: 'hint' }, new Date(h.t || Date.now()).toLocaleTimeString().slice(0, 5)));
      row.onclick = () => History.go(i);
      list.append(row);
    });
    const cur = list.querySelector('.sel');
    if (cur) cur.scrollIntoView({ block: 'nearest' });
  },
  refreshLayers() {
    if (this.tab === 'history') { this.refreshHistory(); $('#sideLbl').textContent = App.side === 'front' ? 'FRENTE' : 'ESPALDA'; Editor.requestRender(); return; }
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
        el('span', { class: 'lname', title: 'Doble clic para renombrar' }, L.clip ? '↳ ' : '', L.name, L.maskId ? el('span', { class: 'mtag', title: 'Tiene máscara' }, '▣') : null),
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
    if (L.type === 'adjust') { x.fillStyle = '#26262e'; x.fillRect(0, 0, 68, 68); x.fillStyle = '#ddd'; x.beginPath(); x.arc(34, 34, 18, Math.PI / 2, Math.PI * 1.5); x.fill(); x.strokeStyle = '#ddd'; x.lineWidth = 3; x.beginPath(); x.arc(34, 34, 18, 0, 7); x.stroke(); return; }
    x.fillStyle = App.project.shirt.color;
    x.fillRect(0, 0, 68, 68);
    const R = Proc.cache.get(L.id + '@' + Editor.rs()) || [...Proc.cache.entries()].find(([k]) => k.startsWith(L.id + '@'))?.[1];
    const c = R && R.out && R.out.canvas;
    if (!c) { setTimeout(() => { if (cv.isConnected) this.thumb(cv, L); }, 300); return; }
    const s = Math.min(60 / c.width, 60 / c.height);
    x.drawImage(c, (68 - c.width * s) / 2, (68 - c.height * s) / 2, c.width * s, c.height * s);
  },
  addLayer(L, side, label) {
    L.id = uid();
    const arr = App.layers(side), cur = App.selected();
    if (cur && !side && arr.includes(cur)) arr.splice(arr.indexOf(cur) + 1, 0, L); else arr.push(L);
    App.sel = L.id;
    App.commit(label || 'Nueva capa');
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
  /* capa vacía para pintar (media resolución del diseño) */
  addEmptyLayer(silent) {
    const c = mkCanvas(DESIGN_W / 2, DESIGN_H / 2);
    ctx2d(c, true);
    const id = Assets.add({ kind: 'img', img: c, w: c.width, h: c.height, url: null, revs: [], cur: 0, _rw: true });
    const L = Defaults.image();
    L.assetId = id; L.w = c.width; L.h = c.height; L.scale = 2;
    L.name = 'Capa ' + (App.layers().filter(l => l.type === 'image').length + 1);
    this.addLayer(L, undefined, 'Nueva capa');
    if (!silent) toast('Capa vacía creada: pintá con el Pincel (B), Degradado (G) o Bote (G)');
    return L;
  },
  addPath(pts, closed, smooth) {
    const b = pathBox(pts), cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2;
    const L = Defaults.path();
    L.pts = pts.map(p => ({ x: p.x - cx, y: p.y - cy }));
    L.x = cx; L.y = cy; L.closed = closed; L.smooth = smooth;
    L.fill = App.colors.fg; L.strokeColor = App.colors.fg;
    if (!closed) { L.fillOn = false; L.strokeWidth = 14; }
    L.name = closed ? 'Trazado' : 'Línea a mano';
    this.addLayer(L, undefined, 'Pluma');
    return L;
  },
  addAdjust(o = {}) {
    const L = Object.assign(Defaults.adjust(), o);
    const arr = App.layers(), cur = App.selected();
    L.id = uid();
    arr.splice(cur ? arr.indexOf(cur) + 1 : arr.length, 0, L);
    App.sel = L.id;
    App.commit('Capa de ajuste');
    this.refreshProps();
    return L;
  },
  /* convierte capas (texto, forma, varias) en una capa de píxeles */
  rasterize(list, name) {
    const rs = 0.75, W = DESIGN_W * rs, H = DESIGN_H * rs;
    const c = mkCanvas(W, H), x = ctx2d(c, true);
    for (const L of list) if (L.visible) { if (L.type === 'adjust') applyAdjust(c, L, rs); else drawLayer(x, L, rs, false); }
    const d = x.getImageData(0, 0, W, H).data;
    let x0 = W, y0 = H, x1 = -1, y1 = -1;
    for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) if (d[(y * W + xx) * 4 + 3] > 2) { if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 < 0) { toast('No hay nada para rasterizar'); return null; }
    const t2 = mkCanvas(x1 - x0 + 1, y1 - y0 + 1);
    ctx2d(t2, true).drawImage(c, -x0, -y0);
    const id = Assets.add({ kind: 'img', img: t2, w: t2.width, h: t2.height, url: null, revs: [], cur: 0, _rw: true });
    const L = Defaults.image();
    L.assetId = id; L.w = t2.width; L.h = t2.height; L.scale = 1 / rs;
    L.x = (x0 + t2.width / 2) / rs; L.y = (y0 + t2.height / 2) / rs;
    L.name = name || 'Rasterizado';
    const arr = App.layers(), idx = Math.min(...list.map(l => arr.indexOf(l)));
    for (const l of list) arr.splice(arr.indexOf(l), 1);
    L.id = uid();
    arr.splice(idx, 0, L);
    App.sel = L.id;
    App.commit(name ? 'Combinar' : 'Rasterizar');
    this.refreshProps();
    return L;
  },
  mergeDown() {
    const L = App.selected(), arr = App.layers();
    if (!L) return;
    const i = arr.indexOf(L);
    if (i <= 0) { toast('No hay capa debajo'); return; }
    this.rasterize([arr[i - 1], L], arr[i - 1].name);
  },
  addShape(kind, o = {}) {
    const L = Object.assign(Defaults.shape(), { shape: kind }, o);
    if (lumHex(App.project.shirt.color) >= 0.45 && !o.fill) { L.fill = '#141414'; L.strokeColor = '#141414'; }
    L.name = o.name || (SHAPES.find(s => s[0] === kind) || [0, 'Forma'])[1];
    if (kind === 'line' && !o.w) { L.h = 14; L.w = 1600; }
    this.addLayer(L, undefined, 'Forma');
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
    $('#propsTitle').textContent = L ? 'Propiedades · ' + ({ image: 'Imagen', text: 'Texto', shape: 'Forma', path: 'Trazado', adjust: 'Ajuste' })[L.type] : 'Propiedades';
    if (!L) {
      P.append(el('div', { class: 'empty' }, 'Seleccioná una capa o agregá una imagen.'),
        el('div', { class: 'secbody' },
          el('button', { class: 'primary', onclick: () => $('#fileImg').click() }, 'Agregar imagen'),
          el('button', { onclick: () => this.showTemplates() }, 'Plantillas de texto'),
          el('p', { class: 'hint' }, 'Tip: pegá una imagen copiada de Pinterest/Google con Ctrl+V.')));
      return;
    }
    if (L.type === 'adjust') { this.adjustProps(P, L); P.scrollTop = st; return; }
    if (L.type === 'image') this.imageProps(P, L);
    else if (L.type === 'text') this.textProps(P, L);
    else if (L.type === 'path') this.pathProps(P, L);
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
      UI.btns([['Quitar fondo auto', () => { autoRemoveBg(L, App.t.tol); toast('Listo. Ajustá la tolerancia en la Varita (W) si quedó mal.'); }],
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
      UI.check('Texto vertical', L, 'vertical'),
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
      UI.select('Tipo', L, 'shape', SHAPES, { onChange: () => this.refreshProps() }),
      L.shape === 'polygon' ? UI.range('Lados', L, 'sides', 3, 16, 1) : null,
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
      UI.range('Estirar H', L, 'sx', -4, 4, 0.01, { def: 1 }),
      UI.range('Estirar V', L, 'sy', -4, 4, 0.01, { def: 1 }),
      UI.check('Máscara de recorte (se ve solo dentro de la capa de abajo)', L, 'clip', { onChange: () => this.refreshLayers() }),
      UI.btns([['Mover al otro lado', () => {
        const to = App.side === 'front' ? 'back' : 'front';
        const arr = App.layers(); arr.splice(arr.indexOf(L), 1);
        App.layers(to).push(L); App.sel = null; App.commit(); this.refreshProps();
        toast('Capa movida a ' + (to === 'back' ? 'la espalda' : 'el frente'));
      }], ...(L.type !== 'image' ? [['Rasterizar', () => this.rasterize([L], null)]] : [])])
    ], false));
    const w = L.warp;
    P.append(UI.sec('Deformar', [
      UI.select('Tipo', w, 'type', [['none', 'Ninguno'], ['arc', 'Arco'], ['wave', 'Ola'], ['flag', 'Bandera'], ['bulge', 'Inflar'], ['pinch', 'Comprimir'], ['rise', 'Subir']]),
      UI.range('Intensidad', w, 'amount', -1, 1, 0.01, { def: 0.5 })
    ], false, w.type !== 'none' ? 'activo' : ''));
    const st = L.style;
    P.append(UI.sec('Estilos de capa', [
      UI.check('Sombra paralela', st, 'shadow'),
      st.shadow ? [UI.color('Color', st, 'shColor'), UI.range('Opacidad', st, 'shOpacity', 0, 1, 0.01), UI.range('Desenfoque', st, 'shBlur', 0, 200, 1), UI.range('Distancia X', st, 'shX', -300, 300, 1), UI.range('Distancia Y', st, 'shY', -300, 300, 1)] : null,
      UI.check('Resplandor exterior', st, 'glow'),
      st.glow ? [UI.color('Color', st, 'glColor'), UI.range('Opacidad', st, 'glOpacity', 0, 1, 0.01), UI.range('Tamaño', st, 'glBlur', 2, 250, 1)] : null,
      UI.check('Superposición de color', st, 'overlay'),
      st.overlay ? [UI.color('Color', st, 'ovColor'), UI.range('Opacidad', st, 'ovOpacity', 0, 1, 0.01)] : null,
      UI.check('Superposición de degradado', st, 'grad'),
      st.grad ? [UI.color('Color 1', st, 'grA'), UI.color('Color 2', st, 'grB'), UI.range('Ángulo', st, 'grAngle', 0, 360, 1), UI.range('Opacidad', st, 'grOpacity', 0, 1, 0.01)] : null,
      el('p', { class: 'hint' }, 'El trazo/contorno está en “Contorno y desgaste”.')
    ].flat().filter(Boolean), false, (st.shadow || st.glow || st.overlay || st.grad) ? 'activo' : ''));
    // al tildar/destildar un estilo se rearma el panel
    P.querySelectorAll('details.sec:last-child input[type=checkbox]').forEach(c => c.addEventListener('change', () => setTimeout(() => this.refreshProps(), 0)));
  },

  pathProps(P, L) {
    P.append(UI.sec('Trazado', [
      el('p', { class: 'hint' }, 'Editá los puntos con Selección directa (A).'),
      UI.check('Cerrado', L, 'closed'),
      UI.check('Curvas suaves', L, 'smooth'),
      UI.check('Relleno', L, 'fillOn'),
      UI.color('Color relleno', L, 'fill', { swatches: ['#f1e7d3', '#141414', '#d0202c', '#ff7a1a'] }),
      UI.range('Borde', L, 'strokeWidth', 0, 120, 1, { def: 0 }),
      UI.color('Color borde', L, 'strokeColor'),
      UI.btns([['Convertir en selección', () => { const p = L; Sel.shape(x => { x.translate(p.x, p.y); x.rotate(p.rot * Math.PI / 180); x.scale(p.scale * p.sx, p.scale * p.sy); x.beginPath(); pathFromPts(x, p.pts, true, p.smooth, 1, 0, 0); x.fill(); }, 'new'); }]])
    ], true));
    this.postProps(P, L);
  },

  adjustProps(P, A) {
    const kinds = [['bc', 'Brillo / contraste'], ['hs', 'Tono / saturación'], ['bw', 'Blanco y negro'], ['invert', 'Invertir'], ['threshold', 'Umbral'], ['posterize', 'Posterizar'], ['halftone', 'Semitono (todo lo de abajo)'], ['custom', 'Personalizado']];
    const kids = [el('p', { class: 'hint' }, 'Afecta a todas las capas que están debajo de esta. Ocultala o bajale la opacidad para comparar.'),
      UI.select('Tipo', A, 'kind', kinds, { onChange: () => { setAdjustKind(A); this.refreshProps(); } }),
      UI.range('Opacidad', A, 'opacity', 0, 1, 0.01, { def: 1 })];
    const k = A.kind;
    if (k === 'bc' || k === 'custom') kids.push(UI.range('Brillo', A, 'brightness', 0, 250, 1, { def: 100 }), UI.range('Contraste', A, 'contrast', 0, 300, 1, { def: 100 }));
    if (k === 'hs' || k === 'custom') kids.push(UI.range('Tono (°)', A, 'hue', -180, 180, 1, { def: 0 }), UI.range('Saturación', A, 'saturate', 0, 300, 1, { def: 100 }));
    if (k === 'bw' || k === 'custom') kids.push(UI.range('Blanco y negro', A, 'grayscale', 0, 100, 1, { def: 100 }), UI.range('Sepia', A, 'sepia', 0, 100, 1, { def: 0 }));
    if (k === 'invert' || k === 'custom') kids.push(UI.range('Invertir', A, 'invert', 0, 100, 1, { def: 100 }));
    if (k === 'threshold' || k === 'custom') kids.push(UI.range('Umbral', A, 'threshold', 0, 100, 1, { def: 50 }));
    if (k === 'posterize' || k === 'custom') kids.push(UI.range('Niveles', A, 'posterize', 0, 16, 1, { def: 4 }));
    if (k === 'custom') kids.push(UI.range('Desenfoque', A, 'blur', 0, 60, 0.5, { def: 0 }));
    if (k === 'halftone') kids.push(UI.range('Tamaño trama', A, 'htCell', 6, 140, 1, { def: 30 }), UI.range('Ángulo', A, 'htAngle', 0, 90, 1, { def: 45 }),
      UI.select('Forma punto', A, 'htShape', [['circle', 'Círculo'], ['square', 'Cuadrado'], ['diamond', 'Rombo'], ['line', 'Líneas'], ['cross', 'Cruz']]),
      UI.color('Color tinta', A, 'htInk', { swatches: ['#f1e7d3', '#ffffff', '#141414'] }), UI.check('Puntos con color', A, 'htColor'), UI.check('Invertir tonos', A, 'htInvert'));
    P.append(UI.sec('Capa de ajuste', kids, true));
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

/* valores iniciales de cada tipo de capa de ajuste */
function setAdjustKind(A) {
  const d = Defaults.adjust();
  for (const k of ['brightness', 'contrast', 'saturate', 'hue', 'grayscale', 'sepia', 'invert', 'blur', 'threshold', 'posterize', 'halftone']) A[k] = d[k];
  switch (A.kind) {
    case 'bc': A.contrast = 120; break;
    case 'hs': A.saturate = 140; break;
    case 'bw': A.grayscale = 100; break;
    case 'invert': A.invert = 100; break;
    case 'threshold': A.threshold = 50; break;
    case 'posterize': A.posterize = 4; break;
    case 'halftone': A.halftone = true; A.htInk = lumHex(App.project.shirt.color) < 0.45 ? '#f1e7d3' : '#141414'; A.htInvert = lumHex(App.project.shirt.color) >= 0.45; break;
  }
  A.name = { bc: 'Brillo/contraste', hs: 'Tono/saturación', bw: 'Blanco y negro', invert: 'Invertir', threshold: 'Umbral', posterize: 'Posterizar', halftone: 'Semitono', custom: 'Ajuste' }[A.kind];
}
