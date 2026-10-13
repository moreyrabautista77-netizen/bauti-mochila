'use strict';
/* =====================================================================
   Lienzo de diseño: zoom, mover/escalar/rotar, pincel de borrado,
   varita mágica, cuentagotas, texto.
   ===================================================================== */
const Editor = {
  canvas: null, ctx: null,
  z: 0.15, ox: 0, oy: 0, fitted: false,
  needs: false, drag: null, mouse: null, space: false,
  showGuide: true, guides: [],

  init() {
    this.canvas = $('#stage');
    this.ctx = this.canvas.getContext('2d');
    const c = this.canvas;
    new ResizeObserver(() => { if (!this.fitted) this.fit(); else this.requestRender(); }).observe(c.parentElement);
    c.addEventListener('pointerdown', e => this.down(e));
    c.addEventListener('pointermove', e => this.move(e));
    c.addEventListener('pointerup', e => this.up(e));
    c.addEventListener('pointercancel', e => this.up(e));
    c.addEventListener('pointerleave', () => { this.mouse = null; this.requestRender(); });
    c.addEventListener('wheel', e => {
      e.preventDefault();
      const r = c.getBoundingClientRect();
      const f = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015));
      this.zoomAt(e.clientX - r.left, e.clientY - r.top, f);
    }, { passive: false });
    c.addEventListener('dblclick', e => {
      const L = this.hit(this.toDesign(e));
      if (L && L.type === 'text') { App.select(L.id); setTimeout(() => { const t = $('#propsPanel textarea'); if (t) { t.focus(); t.select(); } }, 30); }
    });
  },
  fit() {
    const r = this.canvas.parentElement.getBoundingClientRect();
    if (r.width < 10) return;
    this.z = Math.min((r.width - 60) / DESIGN_W, (r.height - 60) / DESIGN_H);
    this.ox = (r.width - DESIGN_W * this.z) / 2;
    this.oy = (r.height - DESIGN_H * this.z) / 2;
    this.fitted = true;
    this.requestRender();
  },
  zoomAt(sx, sy, f) {
    const nz = clamp(this.z * f, 0.03, 3);
    f = nz / this.z;
    this.ox = sx - (sx - this.ox) * f;
    this.oy = sy - (sy - this.oy) * f;
    this.z = nz;
    this.requestRender();
  },
  zoomBy(f) { const r = this.canvas.getBoundingClientRect(); this.zoomAt(r.width / 2, r.height / 2, f); },
  requestRender() {
    if (this.needs) return;
    this.needs = true;
    requestAnimationFrame(() => { this.needs = false; this.render(); });
  },
  toDesign(e) {
    const r = this.canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left - this.ox) / this.z, y: (e.clientY - r.top - this.oy) / this.z };
  },
  toScreen(p) { return { x: p.x * this.z + this.ox, y: p.y * this.z + this.oy }; },
  rs() {
    let q = this.z * (devicePixelRatio || 1);
    if (App.interactive || (this.drag && this.drag.type === 'brush')) q *= 0.5;
    for (const s of [0.0625, 0.125, 0.1875, 0.25, 0.375, 0.5, 0.75, 1]) if (s >= q) return s;
    return 1;
  },

  /* esquinas de una capa en coords de diseño */
  corners(L) {
    const b = Proc.bounds(L, this.rs());
    const a = L.rot * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    const hw = b.w / 2, hh = b.h / 2;
    return [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([x, y]) => ({ x: L.x + x * c - y * s, y: L.y + x * s + y * c }));
  },
  local(L, p) {
    const a = -L.rot * Math.PI / 180, dx = p.x - L.x, dy = p.y - L.y;
    return { x: dx * Math.cos(a) - dy * Math.sin(a), y: dx * Math.sin(a) + dy * Math.cos(a) };
  },
  hit(p) {
    const ls = App.layers();
    for (let i = ls.length - 1; i >= 0; i--) {
      const L = ls[i];
      if (!L.visible || L.locked) continue;
      const b = Proc.bounds(L, this.rs()), q = this.local(L, p);
      if (Math.abs(q.x) <= b.w / 2 && Math.abs(q.y) <= b.h / 2) return L;
    }
    return null;
  },
  handleAt(e) {
    const L = App.selected();
    if (!L || L.locked || !L.visible) return null;
    const r = this.canvas.getBoundingClientRect();
    const m = { x: e.clientX - r.left, y: e.clientY - r.top };
    const cs = this.corners(L).map(p => this.toScreen(p));
    for (let i = 0; i < 4; i++) if (Math.hypot(cs[i].x - m.x, cs[i].y - m.y) < 10) return { type: 'scale', i };
    const rh = this.rotHandle(cs);
    if (Math.hypot(rh.x - m.x, rh.y - m.y) < 11) return { type: 'rotate' };
    return null;
  },
  rotHandle(cs) {
    const tm = { x: (cs[0].x + cs[1].x) / 2, y: (cs[0].y + cs[1].y) / 2 };
    const ct = { x: (cs[0].x + cs[2].x) / 2, y: (cs[0].y + cs[2].y) / 2 };
    const d = Math.hypot(tm.x - ct.x, tm.y - ct.y) || 1;
    return { x: tm.x + (tm.x - ct.x) / d * 30, y: tm.y + (tm.y - ct.y) / d * 30, tm };
  },

  /* ---------- puntero ---------- */
  down(e) {
    this.canvas.setPointerCapture(e.pointerId);
    const p = this.toDesign(e);
    if (e.button === 1 || e.button === 2 || this.space || App.tool === 'hand') {
      this.drag = { type: 'pan', sx: e.clientX, sy: e.clientY, ox: this.ox, oy: this.oy };
      return;
    }
    const t = App.tool;
    if (t === 'move') {
      const h = this.handleAt(e);
      const L = App.selected();
      if (h && L) {
        if (h.type === 'scale') this.drag = { type: 'scale', L, s0: L.scale, d0: Math.hypot(p.x - L.x, p.y - L.y) || 1 };
        else this.drag = { type: 'rotate', L, r0: L.rot, a0: Math.atan2(p.y - L.y, p.x - L.x) };
        return;
      }
      const hitL = this.hit(p);
      if (hitL) {
        if (hitL.id !== App.sel) App.select(hitL.id);
        if (e.altKey) { Panels.duplicate(); }
        const S = App.selected();
        this.drag = { type: 'move', L: S, sx: p.x, sy: p.y, lx: S.x, ly: S.y, moved: false };
      } else if (App.sel) App.select(null);
      return;
    }
    const L = App.selected();
    if (t === 'erase' || t === 'restore') {
      if (!L || L.type !== 'image') { toast('Seleccioná una capa de imagen para usar el pincel'); return; }
      const mask = beginMaskEdit(L);
      this.drag = { type: 'brush', L, mask, erase: t === 'erase', last: null };
      this.brushTo(p);
      return;
    }
    if (t === 'wand') {
      if (!L || L.type !== 'image') { toast('Seleccioná una capa de imagen'); return; }
      wandErase(L, p, App.wand.global || e.shiftKey);
      return;
    }
    if (t === 'text') {
      const hitL = this.hit(p);
      if (hitL && hitL.type === 'text') { App.select(hitL.id); return; }
      Panels.addText({ x: p.x, y: p.y });
      App.setTool('move');
      setTimeout(() => { const ta = $('#propsPanel textarea'); if (ta) { ta.focus(); ta.select(); } }, 40);
      return;
    }
    if (t === 'picker') { this.pick(e, p); }
  },
  move(e) {
    const r = this.canvas.getBoundingClientRect();
    this.mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
    const d = this.drag;
    if (!d) {
      if (App.tool === 'move') {
        const h = this.handleAt(e);
        this.canvas.style.cursor = h ? (h.type === 'rotate' ? 'grab' : 'nwse-resize') : (this.space ? 'grab' : 'default');
      } else this.canvas.style.cursor = ({ hand: 'grab', text: 'text', picker: 'crosshair', wand: 'crosshair' })[App.tool] || 'none';
      if (App.tool === 'erase' || App.tool === 'restore') this.requestRender();
      return;
    }
    const p = this.toDesign(e);
    if (d.type === 'pan') {
      this.ox = d.ox + e.clientX - d.sx;
      this.oy = d.oy + e.clientY - d.sy;
      this.requestRender();
    } else if (d.type === 'move') {
      let nx = d.lx + p.x - d.sx, ny = d.ly + p.y - d.sy;
      if (e.shiftKey) { if (Math.abs(p.x - d.sx) > Math.abs(p.y - d.sy)) ny = d.ly; else nx = d.lx; }
      this.guides = [];
      const snap = 8 / this.z;
      if (Math.abs(nx - DESIGN_W / 2) < snap) { nx = DESIGN_W / 2; this.guides.push('v'); }
      if (Math.abs(ny - DESIGN_H / 2) < snap) { ny = DESIGN_H / 2; this.guides.push('h'); }
      d.L.x = nx; d.L.y = ny; d.moved = true;
      App.changed();
    } else if (d.type === 'scale') {
      d.L.scale = clamp(d.s0 * Math.hypot(p.x - d.L.x, p.y - d.L.y) / d.d0, 0.01, 50);
      App.changed();
    } else if (d.type === 'rotate') {
      let r2 = d.r0 + (Math.atan2(p.y - d.L.y, p.x - d.L.x) - d.a0) * 180 / Math.PI;
      if (e.shiftKey) r2 = Math.round(r2 / 15) * 15;
      r2 = ((r2 + 540) % 360) - 180;
      d.L.rot = Math.round(r2 * 10) / 10;
      App.changed();
    } else if (d.type === 'brush') {
      this.brushTo(p);
    }
  },
  up(e) {
    const d = this.drag;
    this.drag = null;
    this.guides = [];
    try { this.canvas.releasePointerCapture(e.pointerId); } catch (_) { }
    if (!d) return;
    if (d.type === 'move' && !d.moved) { this.requestRender(); return; }
    if (d.type !== 'pan') { App.commit(); Panels.refreshProps(); }
    this.requestRender();
  },
  brushTo(p) {
    const d = this.drag, L = d.L;
    const s = designToSource(L, p);
    const ms = d.mask.width / L.w;
    const r = Math.max(0.5, (App.brush.size / 2) / this.z / L.scale * ms);
    const pt = { x: s.x * ms, y: s.y * ms };
    if (d.last) {
      const dist = Math.hypot(pt.x - d.last.x, pt.y - d.last.y), step = Math.max(0.5, r * 0.2);
      for (let t = step; t < dist; t += step) dab(d.mask, lerp(d.last.x, pt.x, t / dist), lerp(d.last.y, pt.y, t / dist), r, App.brush.hard, d.erase);
    }
    dab(d.mask, pt.x, pt.y, r, App.brush.hard, d.erase);
    d.last = pt;
    Assets.bump(L.maskId);
    App.changed();
  },
  pick(e, p) {
    const L = App.selected();
    if (L && L.type === 'image') {
      const s = designToSource(L, p);
      const w = Math.min(L.w, 1200), f = w / L.w, h = Math.round(L.h * f);
      const data = Assets.sourceData(L.assetId, Math.round(w), h);
      const x = Math.floor(s.x * f), y = Math.floor(s.y * f);
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      const i = (y * Math.round(w) + x) * 4;
      L.accent.color = rgbToHex(data[i], data[i + 1], data[i + 2]);
      L.accent.on = true;
      toast('Color de acento: ' + L.accent.color + ' (se conserva en el diseño)');
      App.commit(); Panels.refreshProps();
      return;
    }
    const dpr = devicePixelRatio || 1, r = this.canvas.getBoundingClientRect();
    const px = this.ctx.getImageData((e.clientX - r.left) * dpr, (e.clientY - r.top) * dpr, 1, 1).data;
    const hex = rgbToHex(px[0], px[1], px[2]);
    if (L && L.type === 'text') L.color = hex;
    else if (L && L.type === 'shape') L.fill = hex;
    else { navigator.clipboard?.writeText(hex).catch(() => { }); toast('Color ' + hex + ' copiado'); return; }
    App.commit(); Panels.refreshProps();
  },

  /* ---------- dibujo ---------- */
  render() {
    const c = this.canvas, dpr = devicePixelRatio || 1;
    const W = c.clientWidth, H = c.clientHeight;
    if (!W || !H) return;
    if (c.width !== Math.round(W * dpr) || c.height !== Math.round(H * dpr)) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
    const x = this.ctx;
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.fillStyle = '#0f0f12';
    x.fillRect(0, 0, c.width, c.height);
    x.setTransform(dpr * this.z, 0, 0, dpr * this.z, dpr * this.ox, dpr * this.oy);
    const shirtCol = App.project.shirt.color;
    const k = DESIGN_W / Shirt.PRINT_W, top = Shirt.printTop(App.side);
    if (this.showGuide) {
      x.save();
      x.translate(-(500 - Shirt.PRINT_W / 2) * k, -top * k);
      x.scale(k, k);
      x.shadowColor = 'rgba(0,0,0,0.6)';
      x.shadowBlur = 40 * this.z * k;
      x.fillStyle = shirtCol;
      x.fill(Shirt.outline());
      x.shadowColor = 'transparent';
      const dark = lumHex(shirtCol) < 0.45;
      x.strokeStyle = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.18)';
      x.lineWidth = 2;
      x.beginPath();
      if (App.side === 'front') { x.moveTo(395, 92); x.quadraticCurveTo(500, 215, 605, 92); }
      else { x.moveTo(395, 92); x.quadraticCurveTo(500, 140, 605, 92); }
      x.stroke();
      x.restore();
    } else {
      x.fillStyle = shirtCol;
      x.fillRect(0, 0, DESIGN_W, DESIGN_H);
    }
    // capas
    const rs = this.rs();
    x.save();
    x.beginPath(); x.rect(0, 0, DESIGN_W, DESIGN_H); x.clip();
    x.scale(1 / rs, 1 / rs);
    const stale = !!this.drag && this.drag.type === 'scale';
    for (const L of App.layers()) if (L.visible) drawLayer(x, L, rs, stale);
    x.restore();
    // área de impresión
    x.save();
    x.lineWidth = 1 / this.z;
    x.setLineDash([6 / this.z, 6 / this.z]);
    x.strokeStyle = 'rgba(255,122,26,0.55)';
    x.strokeRect(0, 0, DESIGN_W, DESIGN_H);
    x.restore();

    // overlays en px de pantalla
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (const g of this.guides) {
      x.strokeStyle = '#ff2fb0'; x.lineWidth = 1;
      x.beginPath();
      if (g === 'v') { const s = this.toScreen({ x: DESIGN_W / 2, y: 0 }); x.moveTo(s.x, 0); x.lineTo(s.x, H); }
      else { const s = this.toScreen({ x: 0, y: DESIGN_H / 2 }); x.moveTo(0, s.y); x.lineTo(W, s.y); }
      x.stroke();
    }
    const L = App.selected();
    if (L && L.visible) {
      const cs = this.corners(L).map(p => this.toScreen(p));
      x.strokeStyle = L.locked ? '#888' : '#ff7a1a';
      x.lineWidth = 1.2;
      x.beginPath();
      cs.forEach((p, i) => (i ? x.lineTo(p.x, p.y) : x.moveTo(p.x, p.y)));
      x.closePath();
      x.stroke();
      if (!L.locked && App.tool === 'move') {
        const rh = this.rotHandle(cs);
        x.beginPath(); x.moveTo(rh.tm.x, rh.tm.y); x.lineTo(rh.x, rh.y); x.stroke();
        x.fillStyle = '#fff';
        for (const p of cs) { x.beginPath(); x.rect(p.x - 5, p.y - 5, 10, 10); x.fill(); x.stroke(); }
        x.beginPath(); x.arc(rh.x, rh.y, 6, 0, Math.PI * 2); x.fill(); x.stroke();
      }
    }
    if (this.mouse && (App.tool === 'erase' || App.tool === 'restore')) {
      x.strokeStyle = '#fff'; x.lineWidth = 1.5;
      x.beginPath(); x.arc(this.mouse.x, this.mouse.y, App.brush.size / 2, 0, Math.PI * 2); x.stroke();
      x.strokeStyle = '#000'; x.lineWidth = 0.8;
      x.beginPath(); x.arc(this.mouse.x, this.mouse.y, App.brush.size / 2 + 1.2, 0, Math.PI * 2); x.stroke();
      x.fillStyle = App.tool === 'erase' ? '#ff4d4d' : '#4dff88';
      x.beginPath(); x.arc(this.mouse.x, this.mouse.y, 2, 0, Math.PI * 2); x.fill();
    }
    const zl = $('#zoomLbl');
    if (zl) zl.textContent = Math.round(this.z * 100) + '%';
    $('#emptyHint').style.display = App.layers().length ? 'none' : 'flex';
  }
};

/* ---------- utilidades de máscara ---------- */
function designToSource(L, p) {
  const a = -L.rot * Math.PI / 180, dx = p.x - L.x, dy = p.y - L.y;
  let ux = (dx * Math.cos(a) - dy * Math.sin(a)) / L.scale;
  let uy = (dx * Math.sin(a) + dy * Math.cos(a)) / L.scale;
  if (L.flipX) ux = -ux;
  if (L.flipY) uy = -uy;
  const cr = L.crop, sw = L.w * (1 - cr.l - cr.r), sh = L.h * (1 - cr.t - cr.b);
  return { x: cr.l * L.w + sw / 2 + ux, y: cr.t * L.h + sh / 2 + uy };
}
/* copia la máscara actual (para que deshacer funcione) */
function beginMaskEdit(L) {
  const ms = Math.min(1, 2048 / Math.max(L.w, L.h));
  const mw = Math.max(1, Math.round(L.w * ms)), mh = Math.max(1, Math.round(L.h * ms));
  const c = mkCanvas(mw, mh), x = ctx2d(c, true);
  const old = Assets.get(L.maskId);
  if (old) x.drawImage(old.canvas, 0, 0, mw, mh);
  else { x.fillStyle = '#fff'; x.fillRect(0, 0, mw, mh); }
  L.maskId = Assets.add({ kind: 'mask', canvas: c });
  return c;
}
function dab(c, mx, my, r, hard, erase) {
  const x = ctx2d(c, true);
  const g = x.createRadialGradient(mx, my, r * clamp(hard, 0, 0.99), mx, my, r);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.globalCompositeOperation = erase ? 'destination-out' : 'source-over';
  x.fillStyle = g;
  x.beginPath();
  x.arc(mx, my, r, 0, Math.PI * 2);
  x.fill();
  x.globalCompositeOperation = 'source-over';
}
/* selección por color (contigua o global) */
function floodSelect(data, w, h, seeds, refs, tol, global) {
  const sel = new Uint8Array(w * h);
  const t2 = tol * tol * 3;
  const near = p => {
    const i = p * 4;
    if (data[i + 3] < 12) return true;
    for (const c of refs) {
      const dr = data[i] - c[0], dg = data[i + 1] - c[1], db = data[i + 2] - c[2];
      if (dr * dr + dg * dg + db * db <= t2) return true;
    }
    return false;
  };
  if (global) { for (let p = 0; p < w * h; p++) if (near(p)) sel[p] = 1; return sel; }
  const st = new Int32Array(w * h);
  let sp = 0;
  for (const s of seeds) if (!sel[s] && near(s)) { sel[s] = 1; st[sp++] = s; }
  while (sp) {
    const p = st[--sp], x = p % w;
    const nb = [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, p - w, p + w];
    for (const q of nb) if (q >= 0 && q < w * h && !sel[q] && near(q)) { sel[q] = 1; st[sp++] = q; }
  }
  return sel;
}
function applySelectionErase(L, mask, sel) {
  const w = mask.width, h = mask.height;
  const t = mkCanvas(w, h), tx = ctx2d(t), id = tx.createImageData(w, h);
  for (let p = 0; p < w * h; p++) if (sel[p]) id.data[p * 4 + 3] = 255;
  tx.putImageData(id, 0, 0);
  const x = ctx2d(mask, true);
  x.save();
  x.filter = 'blur(1px)';
  x.globalCompositeOperation = 'destination-out';
  x.drawImage(t, 0, 0);
  x.drawImage(t, 0, 0);
  x.restore();
  Assets.bump(L.maskId);
}
function wandErase(L, p, global) {
  const s = designToSource(L, p);
  const mask = beginMaskEdit(L);
  const w = mask.width, h = mask.height, ms = w / L.w;
  const mx = Math.floor(s.x * ms), my = Math.floor(s.y * ms);
  if (mx < 0 || my < 0 || mx >= w || my >= h) { toast('Hacé clic sobre la imagen'); return; }
  const data = Assets.sourceData(L.assetId, w, h);
  const i = (my * w + mx) * 4;
  const sel = floodSelect(data, w, h, [my * w + mx], [[data[i], data[i + 1], data[i + 2]]], App.wand.tol, global);
  applySelectionErase(L, mask, sel);
  App.commit();
}
/* quitar fondo liso automáticamente (desde los bordes) */
function autoRemoveBg(L, tol) {
  const mask = beginMaskEdit(L);
  const w = mask.width, h = mask.height;
  const data = Assets.sourceData(L.assetId, w, h);
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
  const sel = floodSelect(data, w, h, seeds, refs.length ? refs : [[255, 255, 255]], tol, false);
  applySelectionErase(L, mask, sel);
  App.commit();
}
