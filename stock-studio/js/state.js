'use strict';
/* Espacio del diseño: 3000 x 3600 px (≈ 25 x 30 cm a 300 dpi) */
const DESIGN_W = 3000, DESIGN_H = 3600;

/* ---------- recursos binarios (imágenes, máscaras, logos, fuentes) ---------- */
const Assets = {
  map: new Map(),
  rev: new Map(),
  add(entry, id) {
    id = id || uid();
    this.map.set(id, entry);
    this.rev.set(id, 0);
    return id;
  },
  get(id) { return id ? this.map.get(id) : null; },
  bump(id) {
    this.rev.set(id, (this.rev.get(id) || 0) + 1);
    const a = this.map.get(id);
    if (a) { a.url = null; a._src = null; }
  },
  /* importa una imagen, la achica a maxSide y la guarda */
  async addImage(url, opts = {}) {
    const img = await loadImage(url);
    let w = img.naturalWidth, h = img.naturalHeight, src = img;
    const maxSide = opts.maxSide || 3000;
    if (Math.max(w, h) > maxSide) {
      const f = maxSide / Math.max(w, h);
      const c = mkCanvas(w * f, h * f);
      const x = ctx2d(c);
      x.imageSmoothingQuality = 'high';
      x.drawImage(img, 0, 0, c.width, c.height);
      src = c; w = c.width; h = c.height;
      url = opts.jpeg ? c.toDataURL('image/jpeg', 0.93) : c.toDataURL('image/png');
    }
    return this.add({ kind: 'img', img: src, w, h, url }, opts.id);
  },
  async addMaskFromURL(url, id) {
    const img = await loadImage(url);
    const c = mkCanvas(img.naturalWidth, img.naturalHeight);
    ctx2d(c).drawImage(img, 0, 0);
    return this.add({ kind: 'mask', canvas: c, url }, id);
  },
  urlOf(id) {
    const a = this.get(id);
    if (!a) return null;
    if (!a.url) a.url = a.kind === 'mask' ? a.canvas.toDataURL('image/png') : a.img.toDataURL ? a.img.toDataURL('image/png') : a.img.src;
    return a.url;
  },
  /* píxeles de la imagen original a un tamaño dado (para varita / cuentagotas) */
  sourceData(id, w, h) {
    const a = this.get(id);
    if (!a) return null;
    const k = w + 'x' + h;
    if (a._src && a._src.k === k) return a._src.data;
    const c = mkCanvas(w, h), x = ctx2d(c, true);
    x.drawImage(a.img, 0, 0, w, h);
    const data = x.getImageData(0, 0, w, h).data;
    a._src = { k, data };
    return data;
  }
};

/* ---------- valores por defecto ---------- */
const Defaults = {
  base() {
    return { visible: true, locked: false, opacity: 1, blend: 'source-over', x: DESIGN_W / 2, y: DESIGN_H / 2, scale: 1, rot: 0, flipX: false, flipY: false };
  },
  image() {
    return Object.assign(this.base(), {
      type: 'image', name: 'Imagen', assetId: null, maskId: null, w: 100, h: 100,
      crop: { l: 0, t: 0, r: 0, b: 0 },
      adj: { exposure: 0, brightness: 0, contrast: 0, black: 0, white: 1, gamma: 1, saturation: 0, sharpen: 0, blur: 0, invert: false },
      fx: { mode: 'color', ink: '#f1e7d3', invertTone: false, cell: 30, angle: 45, shape: 'circle', dotScale: 1, minDot: 0.05,
        smooth: 0.6, colorDots: false, threshold: 0.5, softness: 0.04, ditherSize: 8, duoA: '#101010', duoB: '#f1e7d3', duoTransparent: true, grain: 0 },
      accent: { on: false, color: '#d0202c', range: 22, minSat: 0.4, halftone: true },
      fade: { edge: 0, bottom: 0, top: 0, left: 0, right: 0, radial: 0 },
      post: { outline: 0, outlineColor: '#c9a27a', distress: 0, distressScale: 1 }
    });
  },
  text() {
    return Object.assign(this.base(), {
      type: 'text', name: 'Texto', text: 'TEXTO', font: Fonts.pick('Bahnschrift', 'Arial Black', 'Impact'), weight: 700, italic: false,
      size: 260, color: '#f1e7d3', spacing: 0, lineHeight: 1.05, align: 'center', strokeColor: '#000000', strokeWidth: 0, arc: 0,
      post: { outline: 0, outlineColor: '#c9a27a', distress: 0, distressScale: 1 }
    });
  },
  shape() {
    return Object.assign(this.base(), {
      type: 'shape', name: 'Forma', shape: 'rect', w: 1200, h: 600, fillOn: true, fill: '#f1e7d3', strokeColor: '#f1e7d3', strokeWidth: 0, radius: 0,
      post: { outline: 0, outlineColor: '#c9a27a', distress: 0, distressScale: 1 }
    });
  },
  mockup() {
    return {
      format: 'post', layout: 'front', bg: 'concrete', bgColor: '#cdc8c0', bgColor2: '#8f8a83', bgAssetId: null,
      shirtScale: 1, printScale: 1, printYFront: 0, printYBack: 0, wrinkles: 0.7, shadow: 0.55, quality: 1,
      logoAssetId: null, logoPos: 'top', logoSize: 0.32, title: '', subtitle: '', price: '', handle: '@stockstore.arg', badge: '',
      photo: { on: false, strength: 0.8, front: { assetId: null, x: 0.5, y: 0.45, w: 0.36, rot: 0 }, back: { assetId: null, x: 0.5, y: 0.42, w: 0.38, rot: 0 } },
      textColor: 'auto', font: Fonts.pick('Bahnschrift', 'Arial Black', 'Impact'), accent: '#ff7a1a'
    };
  },
  video() {
    return { format: 'story', motion: 'spinPause', period: 4, loops: 2, hanger: true, sway: 0.5, zoom: 1, light: 0.6, showTexts: true, fps: 30, intro: true };
  },
  project() {
    return {
      v: 1, name: 'Mi diseño',
      sides: { front: { layers: [] }, back: { layers: [] } },
      shirt: { color: '#141414' },
      mockup: this.mockup(), video: this.video(), fonts: []
    };
  }
};

/* completa claves faltantes (proyectos viejos) */
function fillDefaults(obj, def) {
  for (const k in def) {
    if (obj[k] === undefined) obj[k] = deepClone(def[k]);
    else if (def[k] && typeof def[k] === 'object' && !Array.isArray(def[k]) && obj[k] && typeof obj[k] === 'object') fillDefaults(obj[k], def[k]);
  }
  return obj;
}
function normalizeProject(p) {
  fillDefaults(p, Defaults.project());
  for (const s of ['front', 'back']) for (const L of p.sides[s].layers) fillDefaults(L, Defaults[L.type] ? Defaults[L.type]() : {});
  return p;
}

/* ---------- estado global ---------- */
const App = {
  project: null,
  side: 'front',
  sel: null,
  tool: 'move',
  view: 'design',
  version: 0,
  interactive: false,
  brush: { size: 80, hard: 0.55 },
  wand: { tol: 34, global: false },
  clipboard: null,
  _iT: 0,
  layers(side) { return this.project.sides[side || this.side].layers; },
  selected() { return this.layers().find(l => l.id === this.sel) || null; },
  select(id) {
    this.sel = id;
    Panels.refreshLayers();
    Panels.refreshProps();
    Editor.requestRender();
  },
  /* cambio en vivo (sin guardar en historial) */
  changed(interactive) {
    this.version++;
    if (interactive) {
      this.interactive = true;
      clearTimeout(this._iT);
      this._iT = setTimeout(() => { this.interactive = false; this.renderActive(); }, 260);
    }
    this.renderActive();
  },
  renderActive() {
    if (this.view === 'design') Editor.requestRender();
    else if (this.view === 'mockup') Mockup.requestRender();
    else if (this.view === 'video') Anim.invalidate();
  },
  /* cambio confirmado: historial + autoguardado */
  commit() {
    const dark = lumHex(this.project.shirt.color) < 0.45;
    if (this._dark !== undefined && dark !== this._dark) adaptInk(dark);
    this._dark = dark;
    this.version++;
    History.push();
    Panels.refreshLayers();
    Persist.schedule();
    Proc.prune();
    this.renderActive();
  },
  findLayer(id) {
    for (const s of ['front', 'back']) {
      const L = this.project.sides[s].layers.find(l => l.id === id);
      if (L) return L;
    }
    return null;
  }
};

/* ---------- historial (deshacer / rehacer) ---------- */
const History = {
  stack: [], idx: -1,
  snap() { return { p: JSON.stringify(App.project), side: App.side, sel: App.sel }; },
  reset() { this.stack = [this.snap()]; this.idx = 0; this.ui(); },
  push() {
    const s = this.snap();
    const cur = this.stack[this.idx];
    if (cur && cur.p === s.p) { this.stack[this.idx] = s; return; }
    this.stack.splice(this.idx + 1);
    this.stack.push(s);
    if (this.stack.length > 120) this.stack.shift();
    this.idx = this.stack.length - 1;
    this.ui();
  },
  restore(s) {
    const np = JSON.parse(s.p);
    // si el cambio fue en el otro lado, mostrar ese lado
    if (s.side !== App.side && JSON.stringify(np.sides[App.side]) === JSON.stringify(App.project.sides[App.side])) App.side = s.side;
    App.project = np;
    App._dark = lumHex(np.shirt.color) < 0.45;
    App.sel = np.sides[App.side].layers.some(l => l.id === s.sel) ? s.sel : (np.sides[App.side].layers.some(l => l.id === App.sel) ? App.sel : null);
    App.version++;
    Panels.refreshAll();
    Persist.schedule();
    App.renderActive();
  },
  undo() { if (this.idx > 0) { this.idx--; this.restore(this.stack[this.idx]); } this.ui(); },
  redo() { if (this.idx < this.stack.length - 1) { this.idx++; this.restore(this.stack[this.idx]); } this.ui(); },
  ui() {
    const u = $('#btnUndo'), r = $('#btnRedo');
    if (u) u.disabled = this.idx <= 0;
    if (r) r.disabled = this.idx >= this.stack.length - 1;
  }
};

/* ---------- guardar / abrir / autoguardado (IndexedDB, sin internet) ---------- */
const Persist = {
  db: null, timer: 0,
  open() {
    return new Promise(res => {
      try {
        const r = indexedDB.open('stock-studio', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('kv');
        r.onsuccess = () => { this.db = r.result; res(true); };
        r.onerror = () => res(false);
      } catch (e) { res(false); }
    });
  },
  schedule() { clearTimeout(this.timer); this.timer = setTimeout(() => this.save(), 2000); },
  usedAssets(p) {
    const ids = new Set();
    for (const s of ['front', 'back']) for (const L of p.sides[s].layers) { if (L.assetId) ids.add(L.assetId); if (L.maskId) ids.add(L.maskId); }
    if (p.mockup.logoAssetId) ids.add(p.mockup.logoAssetId);
    if (p.mockup.bgAssetId) ids.add(p.mockup.bgAssetId);
    for (const s of ['front', 'back']) if (p.mockup.photo && p.mockup.photo[s].assetId) ids.add(p.mockup.photo[s].assetId);
    for (const f of p.fonts) ids.add(f.assetId);
    return ids;
  },
  serialize() {
    const assets = {};
    for (const id of this.usedAssets(App.project)) {
      const a = Assets.get(id);
      if (!a) continue;
      assets[id] = { kind: a.kind, url: a.kind === 'font' ? a.url : Assets.urlOf(id) };
    }
    return { app: 'stock-studio', v: 1, project: App.project, assets };
  },
  async save() {
    if (!this.db) return;
    try {
      const data = this.serialize();
      await new Promise((res, rej) => {
        const tx = this.db.transaction('kv', 'readwrite');
        tx.objectStore('kv').put(data, 'autosave');
        tx.oncomplete = res; tx.onerror = rej;
      });
    } catch (e) { console.warn('autosave', e); }
  },
  async loadAutosave() {
    if (!this.db) return null;
    try {
      return await new Promise(res => {
        const r = this.db.transaction('kv').objectStore('kv').get('autosave');
        r.onsuccess = () => res(r.result || null);
        r.onerror = () => res(null);
      });
    } catch (e) { return null; }
  },
  async loadData(data) {
    if (!data || !data.project) throw new Error('Archivo de proyecto inválido');
    for (const [id, a] of Object.entries(data.assets || {})) {
      if (Assets.get(id)) continue;
      try {
        if (a.kind === 'img') await Assets.addImage(a.url, { id, maxSide: 99999 });
        else if (a.kind === 'mask') await Assets.addMaskFromURL(a.url, id);
        else if (a.kind === 'font') Assets.add({ kind: 'font', url: a.url }, id);
      } catch (e) { console.warn('asset', id, e); }
    }
    const p = normalizeProject(data.project);
    for (const f of p.fonts) { const a = Assets.get(f.assetId); if (a) await Fonts.addFromURL(f.family, a.url); }
    App.project = p;
    App._dark = lumHex(p.shirt.color) < 0.45;
    App.side = 'front';
    App.sel = null;
    App.version++;
    History.reset();
    Panels.refreshAll();
    App.renderActive();
  }
};

/* al pasar de remera oscura a clara (o al revés) invierte las tintas por defecto */
function adaptInk(dark) {
  const from = dark ? '#141414' : '#f1e7d3', to = dark ? '#f1e7d3' : '#141414';
  let n = 0;
  for (const s of ['front', 'back']) for (const L of App.project.sides[s].layers) {
    if (L.type === 'image') {
      if (L.fx.ink.toLowerCase() === from) { L.fx.ink = to; L.fx.invertTone = !dark; n++; }
      if (L.fx.duoB.toLowerCase() === from) { L.fx.duoB = to; n++; }
    } else if (L.type === 'text') {
      if (L.color.toLowerCase() === from) { L.color = to; n++; }
    } else if (L.type === 'shape') {
      if (L.fill.toLowerCase() === from) { L.fill = to; n++; }
      if (L.strokeColor.toLowerCase() === from) { L.strokeColor = to; n++; }
    }
  }
  if (n) toast('Adapté la tinta a remera ' + (dark ? 'oscura' : 'clara') + ' (Ctrl+Z para volver)');
}
