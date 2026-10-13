'use strict';
/* =====================================================================
   Selección global (en coordenadas de diseño, a media resolución)
   modos: new / add (Shift) / sub (Alt) / int (Shift+Alt)
   ===================================================================== */
const Sel = {
  S: 0.5,
  c: null,
  active: false,
  rev: 0,
  bounds: null,
  ensure() {
    if (!this.c) this.c = mkCanvas(DESIGN_W * this.S, DESIGN_H * this.S);
    return this.c;
  },
  modeFromEvent(e) {
    if (e.shiftKey && e.altKey) return 'int';
    if (e.shiftKey) return 'add';
    if (e.altKey) return 'sub';
    return 'new';
  },
  /* drawFn dibuja en blanco usando coords de diseño */
  shape(drawFn, mode) {
    const t = mkCanvas(this.ensure().width, this.c.height), x = ctx2d(t);
    x.scale(this.S, this.S);
    x.fillStyle = '#fff';
    x.strokeStyle = '#fff';
    drawFn(x);
    this.combine(t, mode);
  },
  combine(t, mode) {
    const x = ctx2d(this.ensure(), true);
    x.save();
    if (mode === 'new' || (!this.active && mode !== 'add')) { x.clearRect(0, 0, this.c.width, this.c.height); x.drawImage(t, 0, 0); }
    else {
      x.globalCompositeOperation = mode === 'sub' ? 'destination-out' : mode === 'int' ? 'destination-in' : 'source-over';
      x.drawImage(t, 0, 0);
    }
    x.restore();
    this.update();
  },
  update() {
    const c = this.ensure(), d = ctx2d(c, true).getImageData(0, 0, c.width, c.height).data;
    let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    this.active = x1 >= 0;
    this.bounds = this.active ? { x: x0 / this.S, y: y0 / this.S, w: (x1 - x0 + 1) / this.S, h: (y1 - y0 + 1) / this.S } : null;
    this.rev++;
    Editor.requestRender();
    Panels.refreshOptbar && Panels.refreshOptbar();
  },
  none() { if (this.c) ctx2d(this.c).clearRect(0, 0, this.c.width, this.c.height); this.active = false; this.bounds = null; this.rev++; Editor.requestRender(); },
  all() { this.shape(x => x.fillRect(0, 0, DESIGN_W, DESIGN_H), 'new'); },
  invert() {
    const t = mkCanvas(this.ensure().width, this.c.height), x = ctx2d(t);
    x.fillStyle = '#fff';
    x.fillRect(0, 0, t.width, t.height);
    x.globalCompositeOperation = 'destination-out';
    x.drawImage(this.c, 0, 0);
    this.combine(t, 'new');
  },
  /* expandir / contraer / desvanecer (px de diseño) */
  morph(kind, px) {
    if (!this.active) return;
    const r = Math.max(0.5, px * this.S);
    const t = mkCanvas(this.c.width, this.c.height), x = ctx2d(t, true);
    x.filter = `blur(${r}px)`;
    x.drawImage(this.c, 0, 0);
    x.filter = 'none';
    if (kind !== 'feather') {
      const id = x.getImageData(0, 0, t.width, t.height), d = id.data;
      for (let i = 3; i < d.length; i += 4) d[i] = kind === 'expand' ? (d[i] > 10 ? 255 : 0) : (d[i] > 245 ? 255 : 0);
      x.putImageData(id, 0, 0);
    }
    this.combine(t, 'new');
  },
  /* selección a partir de una máscara en px de la imagen de la capa */
  fromSource(L, srcCanvas, mode) {
    const t = mkCanvas(this.ensure().width, this.c.height), x = ctx2d(t);
    const ms = srcCanvas.width / L.w;
    x.setTransform(new DOMMatrix().scale(this.S).multiply(layerMatrix(L)).scale(1 / ms));
    x.drawImage(srcCanvas, 0, 0);
    this.combine(t, mode);
  },
  /* selección convertida a px de la imagen de una capa (Uint8 alfa) */
  toSource(L, w, h) {
    const t = mkCanvas(w, h), x = ctx2d(t, true);
    const ms = w / L.w;
    x.setTransform(new DOMMatrix().scale(ms).multiply(layerMatrix(L).inverse()).scale(1 / this.S));
    x.drawImage(this.c, 0, 0);
    const d = x.getImageData(0, 0, w, h).data, out = new Uint8Array(w * h);
    for (let p = 0; p < out.length; p++) out[p] = d[p * 4 + 3];
    return out;
  },
  toSourceCanvas(L, w, h) {
    const t = mkCanvas(w, h), x = ctx2d(t, true);
    x.setTransform(new DOMMatrix().scale(w / L.w).multiply(layerMatrix(L).inverse()).scale(1 / this.S));
    x.drawImage(this.c, 0, 0);
    return t;
  },
  maskCanvasFromSel(sel, w, h) {
    const t = mkCanvas(w, h), x = ctx2d(t), id = x.createImageData(w, h);
    for (let p = 0; p < w * h; p++) if (sel[p]) { id.data[p * 4] = id.data[p * 4 + 1] = id.data[p * 4 + 2] = 255; id.data[p * 4 + 3] = 255; }
    x.putImageData(id, 0, 0);
    return t;
  },
  /* varita mágica (selecciona) */
  wand(L, p, tol, global, mode) {
    const s = designToSource(L, p);
    const ms = Math.min(1, 1600 / Math.max(L.w, L.h));
    const w = Math.max(1, Math.round(L.w * ms)), h = Math.max(1, Math.round(L.h * ms));
    const mx = Math.floor(s.x * ms), my = Math.floor(s.y * ms);
    if (mx < 0 || my < 0 || mx >= w || my >= h) { toast('Hacé clic sobre la imagen'); return; }
    const data = Assets.sourceData(L.assetId, w, h), i = (my * w + mx) * 4;
    const sel = floodSelect(data, w, h, [my * w + mx], [[data[i], data[i + 1], data[i + 2]]], tol, global);
    this.fromSource(L, this.maskCanvasFromSel(sel, w, h), mode);
  },
  /* selección rápida: crece desde donde pintás, limitada a una zona */
  quick(L, p, r, mode) {
    const s = designToSource(L, p);
    const ms = Math.min(1, 1200 / Math.max(L.w, L.h));
    const w = Math.max(1, Math.round(L.w * ms)), h = Math.max(1, Math.round(L.h * ms));
    const cx = s.x * ms, cy = s.y * ms, rr = r * ms;
    if (cx < 0 || cy < 0 || cx >= w || cy >= h) return;
    const data = Assets.sourceData(L.assetId, w, h);
    const refs = [];
    for (let k = 0; k < 9; k++) {
      const a = k / 9 * Math.PI * 2, d = k ? rr * 0.5 : 0;
      const x = clamp(Math.round(cx + Math.cos(a) * d), 0, w - 1), y = clamp(Math.round(cy + Math.sin(a) * d), 0, h - 1), i = (y * w + x) * 4;
      refs.push([data[i], data[i + 1], data[i + 2]]);
    }
    const lim = rr * 4;
    const sel = floodSelect(data, w, h, [Math.round(cy) * w + Math.round(cx)], refs, App.t.tol, false);
    for (let p = 0; p < sel.length; p++) if (sel[p] && Math.hypot(p % w - cx, ((p / w) | 0) - cy) > lim) sel[p] = 0;
    const R = Math.ceil(rr);
    for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) {
      if (x * x + y * y > R * R) continue;
      const px = Math.round(cx + x), py = Math.round(cy + y);
      if (px >= 0 && py >= 0 && px < w && py < h) sel[py * w + px] = 1;
    }
    this.fromSource(L, this.maskCanvasFromSel(sel, w, h), mode === 'new' ? 'add' : mode);
  },
  /* seleccionar sujeto: todo lo que no es fondo liso */
  subject(L) {
    const ms = Math.min(1, 1600 / Math.max(L.w, L.h));
    const w = Math.max(1, Math.round(L.w * ms)), h = Math.max(1, Math.round(L.h * ms));
    const data = Assets.sourceData(L.assetId, w, h);
    const bg = bgSelect(data, w, h, App.t.tol + 6);
    const t = mkCanvas(w, h), x = ctx2d(t), id = x.createImageData(w, h);
    for (let p = 0; p < w * h; p++) if (!bg[p] && data[p * 4 + 3] > 10) id.data[p * 4 + 3] = 255;
    x.putImageData(id, 0, 0);
    const M = Assets.get(L.maskId);
    if (M) { x.globalCompositeOperation = 'destination-in'; x.drawImage(M.canvas, 0, 0, w, h); }
    this.fromSource(L, t, 'new');
  },
  /* desde la transparencia de la capa */
  fromLayer(L, mode = 'new') {
    const rs = this.S;
    const t = mkCanvas(this.ensure().width, this.c.height), x = ctx2d(t);
    drawLayer(x, L, rs, false, { noStyle: true });
    this.combine(t, mode);
  },
  /* hormigas: borde de la selección en px de pantalla */
  _ants: null,
  ants(V, W, H, dpr, phase) {
    const key = [this.rev, V.toString(), W, H, phase].join('|');
    if (this._ants && this._ants.key === key) return this._ants.c;
    const c = mkCanvas(W * dpr, H * dpr), x = ctx2d(c, true);
    x.setTransform(new DOMMatrix().scale(dpr).multiply(V).scale(1 / this.S));
    x.imageSmoothingEnabled = true;
    x.drawImage(this.c, 0, 0);
    const id = x.getImageData(0, 0, c.width, c.height), d = id.data, cw = c.width, ch = c.height;
    const o = new ImageData(cw, ch), od = o.data;
    const inside = i => d[i * 4 + 3] > 127;
    for (let y = 1; y < ch - 1; y++) for (let xx = 1; xx < cw - 1; xx++) {
      const p = y * cw + xx, a = inside(p);
      if (a === inside(p - 1) && a === inside(p + 1) && a === inside(p - cw) && a === inside(p + cw)) continue;
      if (!a) continue;
      const on = (((xx + y + phase * 4) >> 2) & 1) === 1;
      const i = p * 4;
      od[i] = od[i + 1] = od[i + 2] = on ? 255 : 0;
      od[i + 3] = 255;
    }
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.clearRect(0, 0, cw, ch);
    x.putImageData(o, 0, 0);
    this._ants = { key, c };
    return c;
  }
};

/* selección del fondo desde los bordes (para quitar fondo / seleccionar sujeto) */
function bgSelect(data, w, h, tol) {
  const pts = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1], [w >> 1, 0], [w >> 1, h - 1], [0, h >> 1], [w - 1, h >> 1]];
  const refs = [];
  for (const [x, y] of pts) {
    const i = (y * w + x) * 4, c = [data[i], data[i + 1], data[i + 2]];
    if (data[i + 3] < 12) continue;
    if (!refs.some(r => Math.abs(r[0] - c[0]) + Math.abs(r[1] - c[1]) + Math.abs(r[2] - c[2]) < 24)) refs.push(c);
  }
  const seeds = [];
  for (let x = 0; x < w; x++) seeds.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) seeds.push(y * w, y * w + w - 1);
  return floodSelect(data, w, h, seeds, refs.length ? refs : [[255, 255, 255]], tol, false);
}
