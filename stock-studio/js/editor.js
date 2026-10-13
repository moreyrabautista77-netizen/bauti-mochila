'use strict';
/* =====================================================================
   Lienzo de diseño: vista (zoom, rotar vista), transformación libre y
   todas las herramientas (selección, retoque, pintura, pluma, formas…)
   ===================================================================== */
const TOOL_INFO = {
  move: ['Mover / transformación libre', 'V'],
  marquee: ['Marco rectangular', 'M'], ellipseSel: ['Marco elíptico', 'M'],
  lasso: ['Lazo', 'L'], polyLasso: ['Lazo poligonal', 'L'], magLasso: ['Lazo magnético', 'L'],
  quickSel: ['Selección rápida', 'W'], wandSel: ['Varita mágica', 'W'],
  crop: ['Recortar', 'C'], picker: ['Cuentagotas', 'I'],
  spotHeal: ['Pincel corrector puntual', 'J'], heal: ['Pincel corrector (Alt+clic = muestra)', 'J'], patch: ['Parche', 'J'], redEye: ['Ojos rojos', 'J'],
  brush: ['Pincel', 'B'], pencil: ['Lápiz', 'B'], colorReplace: ['Reemplazo de color', 'B'],
  clone: ['Tampón de clonar (Alt+clic = muestra)', 'S'], pattern: ['Tampón de motivo', 'S'],
  erase: ['Borrador', 'E'], restore: ['Restaurar borrado', 'E'], bgErase: ['Borrador de fondos', 'E'], magicErase: ['Borrador mágico', 'E'],
  gradient: ['Degradado', 'G'], bucket: ['Bote de pintura', 'G'],
  blur: ['Desenfocar', ''], sharpen: ['Enfocar', ''], smudge: ['Dedo', ''],
  dodge: ['Sobreexponer', 'O'], burn: ['Subexponer', 'O'], sponge: ['Esponja', 'O'],
  pen: ['Pluma (clic = punto, Enter = terminar)', 'P'], freePen: ['Pluma de forma libre', 'P'],
  text: ['Texto horizontal', 'T'], vtext: ['Texto vertical', 'T'],
  direct: ['Selección directa (mover puntos)', 'A'],
  shape: ['Formas (rectángulo, elipse, polígono, línea…)', 'U'],
  hand: ['Mano', 'H'], rotView: ['Rotar vista', 'R'], zoom: ['Zoom (Alt = alejar)', 'Z']
};
const PAINT_TOOLS = ['brush', 'pencil', 'colorReplace', 'clone', 'pattern', 'blur', 'sharpen', 'smudge', 'dodge', 'burn', 'sponge', 'heal', 'spotHeal', 'redEye'];
const MASK_TOOLS = ['erase', 'restore', 'bgErase'];
const SEL_TOOLS = ['marquee', 'ellipseSel', 'lasso', 'polyLasso', 'magLasso', 'quickSel', 'wandSel'];
const usesBrush = t => PAINT_TOOLS.includes(t) || MASK_TOOLS.includes(t) || t === 'quickSel';

const Editor = {
  canvas: null, ctx: null,
  z: 0.15, ox: 0, oy: 0, vr: 0, fitted: false,
  needs: false, drag: null, mouse: null, space: false,
  showGuide: true, guides: [],
  poly: null, pen: null, cloneSrc: null, cloneOffset: null, phase: 0,
  _comp: null,

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
      this.zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)));
    }, { passive: false });
    c.addEventListener('dblclick', e => {
      if (App.tool === 'polyLasso' && this.poly) { this.finishPoly(); return; }
      if (App.tool === 'pen' && this.pen) { this.finishPen(false); return; }
      if (App.tool === 'rotView') { this.vr = 0; this.requestRender(); return; }
      const L = this.hit(this.toDesign(e));
      if (L && L.type === 'text') { App.select(L.id); setTimeout(() => { const t = $('#propsPanel textarea'); if (t) { t.focus(); t.select(); } }, 30); }
    });
    // hormigas animadas
    setInterval(() => { if (Sel.active && App.view === 'design') { this.phase = (this.phase + 1) % 2; this.requestRender(); } }, 450);
  },
  size() { const r = this.canvas.getBoundingClientRect(); return { w: r.width, h: r.height, left: r.left, top: r.top }; },
  get V() {
    const s = this.size();
    return new DOMMatrix().translate(s.w / 2, s.h / 2).rotate(this.vr).translate(-s.w / 2, -s.h / 2).translate(this.ox, this.oy).scale(this.z);
  },
  fit() {
    const r = this.canvas.parentElement.getBoundingClientRect();
    if (r.width < 10) return;
    this.z = Math.min((r.width - 60) / DESIGN_W, (r.height - 60) / DESIGN_H);
    this.ox = (r.width - DESIGN_W * this.z) / 2;
    this.oy = (r.height - DESIGN_H * this.z) / 2;
    this.vr = 0;
    this.fitted = true;
    this.requestRender();
  },
  /* punto de pantalla sin la rotación de vista */
  unrot(sx, sy) {
    const s = this.size();
    return new DOMMatrix().translate(s.w / 2, s.h / 2).rotate(-this.vr).translate(-s.w / 2, -s.h / 2).transformPoint(new DOMPoint(sx, sy));
  },
  zoomAt(sx, sy, f) {
    const q = this.unrot(sx, sy);
    const nz = clamp(this.z * f, 0.02, 4);
    f = nz / this.z;
    this.ox = q.x - (q.x - this.ox) * f;
    this.oy = q.y - (q.y - this.oy) * f;
    this.z = nz;
    this.requestRender();
  },
  zoomBy(f) { const s = this.size(); this.zoomAt(s.w / 2, s.h / 2, f); },
  zoom100() { const s = this.size(); this.zoomAt(s.w / 2, s.h / 2, 1 / this.z * 0.5); },
  requestRender() {
    if (this.needs) return;
    this.needs = true;
    requestAnimationFrame(() => { this.needs = false; this.render(); });
  },
  toDesign(e) {
    const s = this.size();
    const q = this.V.inverse().transformPoint(new DOMPoint(e.clientX - s.left, e.clientY - s.top));
    return { x: q.x, y: q.y };
  },
  toScreen(p) { const q = this.V.transformPoint(new DOMPoint(p.x, p.y)); return { x: q.x, y: q.y }; },
  rs() {
    let q = this.z * (devicePixelRatio || 1);
    if (App.interactive || (this.drag && this.drag.paint)) q *= 0.5;
    for (const s of [0.0625, 0.125, 0.1875, 0.25, 0.375, 0.5, 0.75, 1]) if (s >= q) return s;
    return 1;
  },

  /* ---------- geometría de capas ---------- */
  corners(L) {
    const b = Proc.bounds(L, this.rs());
    const a = L.rot * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    const hw = b.w * Math.abs(L.sx || 1) / 2, hh = b.h * Math.abs(L.sy || 1) / 2;
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
      if (!L.visible || L.locked || L.type === 'adjust') continue;
      const b = Proc.bounds(L, this.rs()), q = this.local(L, p);
      if (Math.abs(q.x) <= b.w * Math.abs(L.sx || 1) / 2 && Math.abs(q.y) <= b.h * Math.abs(L.sy || 1) / 2) return L;
    }
    return null;
  },
  topImageAt(p) {
    const ls = App.layers();
    for (let i = ls.length - 1; i >= 0; i--) {
      const L = ls[i];
      if (!L.visible || L.type !== 'image') continue;
      const b = Proc.bounds(L, this.rs()), q = this.local(L, p);
      if (Math.abs(q.x) <= b.w * Math.abs(L.sx || 1) / 2 && Math.abs(q.y) <= b.h * Math.abs(L.sy || 1) / 2) return L;
    }
    return null;
  },
  handleAt(e) {
    const L = App.selected();
    if (!L || L.locked || !L.visible || L.type === 'adjust') return null;
    const s = this.size();
    const m = { x: e.clientX - s.left, y: e.clientY - s.top };
    const cs = this.corners(L).map(p => this.toScreen(p));
    for (let i = 0; i < 4; i++) if (Math.hypot(cs[i].x - m.x, cs[i].y - m.y) < 10) return { type: 'scale', i };
    for (let i = 0; i < 4; i++) {
      const a = cs[i], b = cs[(i + 1) % 4];
      if (Math.hypot((a.x + b.x) / 2 - m.x, (a.y + b.y) / 2 - m.y) < 9) return { type: 'side', axis: i % 2 === 0 ? 'y' : 'x' };
    }
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

  /* capa de píxeles destino; crea una vacía si hace falta */
  rasterTarget(create) {
    const L = App.selected();
    if (L && L.type === 'image') return L;
    if (create) return Panels.addEmptyLayer(true);
    toast('Seleccioná una capa de imagen (o creá una con Capa → Nueva capa vacía)');
    return null;
  },

  /* ---------- puntero ---------- */
  down(e) {
    this.canvas.setPointerCapture(e.pointerId);
    const p = this.toDesign(e);
    const t = App.tool;
    if (e.button === 1 || e.button === 2 || this.space || t === 'hand') {
      this.drag = { type: 'pan', sx: e.clientX, sy: e.clientY, ox: this.ox, oy: this.oy };
      return;
    }
    if (t === 'rotView') { const s = this.size(); this.drag = { type: 'rotview', a0: Math.atan2(e.clientY - s.top - s.h / 2, e.clientX - s.left - s.w / 2), vr0: this.vr }; return; }
    if (t === 'zoom') { const s = this.size(); this.zoomAt(e.clientX - s.left, e.clientY - s.top, e.altKey ? 1 / 1.6 : 1.6); return; }
    if (t === 'move') return this.downMove(e, p);
    const L = App.selected();
    const mode = Sel.modeFromEvent(e);

    if (t === 'marquee' || t === 'ellipseSel' || t === 'crop' || t === 'gradient' || t === 'shape') { this.drag = { type: 'box', tool: t, p0: p, p1: p, mode, shift: e.shiftKey }; return; }
    if (t === 'lasso' || t === 'magLasso') { this.drag = { type: 'lasso', pts: [this.snapEdge(p, t)], mode, last: { x: e.clientX, y: e.clientY } }; return; }
    if (t === 'polyLasso') {
      if (!this.poly) this.poly = { pts: [p], mode };
      else {
        const f = this.toScreen(this.poly.pts[0]), s = this.size();
        if (this.poly.pts.length > 2 && Math.hypot(f.x - (e.clientX - s.left), f.y - (e.clientY - s.top)) < 10) this.finishPoly();
        else this.poly.pts.push(p);
      }
      this.requestRender();
      return;
    }
    if (t === 'wandSel') {
      const T = L && L.type === 'image' ? L : this.topImageAt(p);
      if (!T) { toast('Hacé clic sobre una imagen'); return; }
      Sel.wand(T, p, App.t.tol, !App.t.contiguous, mode);
      return;
    }
    if (t === 'quickSel') {
      const T = L && L.type === 'image' ? L : this.topImageAt(p);
      if (!T) { toast('Pintá sobre una imagen'); return; }
      const r = brushRadiusSrc(T, App.brush.size);
      Sel.quick(T, p, r, mode);
      this.drag = { type: 'quick', L: T, r, mode: mode === 'sub' ? 'sub' : 'add', last: p };
      return;
    }
    if (t === 'patch') {
      if (!Sel.active) { toast('Primero seleccioná la zona a reparar con el lazo, y después arrastrala con el Parche'); return; }
      if (!L || L.type !== 'image') { toast('Seleccioná la capa de imagen'); return; }
      this.drag = { type: 'patch', L, p0: p, p1: p };
      return;
    }
    if (t === 'pen') {
      if (!this.pen) this.pen = { pts: [], smooth: false };
      if (this.pen.pts.length > 2) {
        const f = this.toScreen(this.pen.pts[0]), s = this.size();
        if (Math.hypot(f.x - (e.clientX - s.left), f.y - (e.clientY - s.top)) < 10) { this.finishPen(true); return; }
      }
      this.pen.pts.push(p);
      this.drag = { type: 'pen', p0: p };
      this.requestRender();
      return;
    }
    if (t === 'freePen') { this.drag = { type: 'freepen', pts: [p] }; return; }
    if (t === 'text' || t === 'vtext') {
      const hitL = this.hit(p);
      if (hitL && hitL.type === 'text') { App.select(hitL.id); return; }
      Panels.addText({ x: p.x, y: p.y, vertical: t === 'vtext', color: App.colors.fg });
      App.setTool('move');
      setTimeout(() => { const ta = $('#propsPanel textarea'); if (ta) { ta.focus(); ta.select(); } }, 40);
      return;
    }
    if (t === 'direct') {
      if (!L || L.type !== 'path') { const h = this.hit(p); if (h && h.type === 'path') App.select(h.id); else toast('Seleccioná un trazado hecho con la Pluma'); return; }
      const s = this.size(), m = { x: e.clientX - s.left, y: e.clientY - s.top };
      const pts = this.pathScreenPts(L);
      const i = pts.findIndex(q => Math.hypot(q.x - m.x, q.y - m.y) < 9);
      if (i >= 0) this.drag = { type: 'point', L, i };
      return;
    }
    if (t === 'picker') { this.pick(e, p); return; }
    if (t === 'bucket') {
      const T = this.rasterTarget(true);
      if (T) Raster.bucket(T, designToSource(T, p), App.colors.fg, App.t.tol, App.t.opacity, App.t.contiguous);
      return;
    }
    if (t === 'magicErase') {
      if (!L || L.type !== 'image') { toast('Seleccioná una capa de imagen'); return; }
      wandErase(L, p, !App.t.contiguous || e.shiftKey);
      return;
    }
    if (MASK_TOOLS.includes(t)) {
      if (!L || L.type !== 'image') { toast('Seleccioná una capa de imagen para usar el borrador'); return; }
      const mask = beginMaskEdit(L);
      this.drag = { type: 'mask', L, mask, tool: t, last: null, paint: true };
      this.maskTo(p);
      return;
    }
    if (PAINT_TOOLS.includes(t)) {
      const T = this.rasterTarget(['brush', 'pencil', 'pattern'].includes(t));
      if (!T) return;
      if ((t === 'clone' || t === 'heal') && e.altKey) {
        this.cloneSrc = { id: T.id, p: designToSource(T, p) };
        this.cloneOffset = null;
        toast('Muestra tomada. Ahora pintá donde quieras copiarla.');
        return;
      }
      if ((t === 'clone' || t === 'heal') && !this.cloneSrc) { toast('Primero Alt+clic para tomar la muestra'); return; }
      const sc = Raster.begin(T);
      const r = brushRadiusSrc(T, App.brush.size);
      const sp = designToSource(T, p);
      if (t === 'clone' || t === 'heal') {
        if (!this.cloneOffset || this.cloneSrc.id !== T.id) this.cloneOffset = { x: sp.x - this.cloneSrc.p.x, y: sp.y - this.cloneSrc.p.y };
      }
      this.drag = { type: 'paint', L: T, tool: t, r, last: null, paint: true, spot: t === 'spotHeal' ? new Uint8Array(sc.W * sc.H) : null, screen: [] };
      this.paintTo(p, e);
      return;
    }
  },
  downMove(e, p) {
    const h = this.handleAt(e);
    const L = App.selected();
    if (h && L) {
      const q = this.local(L, p);
      if (h.type === 'scale') this.drag = { type: 'scale', L, s0: L.scale, sx0: L.sx || 1, sy0: L.sy || 1, q0: q, d0: Math.hypot(p.x - L.x, p.y - L.y) || 1 };
      else if (h.type === 'side') this.drag = { type: 'side', L, axis: h.axis, sx0: L.sx || 1, sy0: L.sy || 1, q0: q };
      else this.drag = { type: 'rotate', L, r0: L.rot, a0: Math.atan2(p.y - L.y, p.x - L.x) };
      return;
    }
    const hitL = this.hit(p);
    if (hitL) {
      if (hitL.id !== App.sel) App.select(hitL.id);
      if (e.altKey) Panels.duplicate();
      const S = App.selected();
      this.drag = { type: 'move', L: S, sx: p.x, sy: p.y, lx: S.x, ly: S.y, moved: false };
    } else if (App.sel) App.select(null);
  },
  move(e) {
    const s = this.size();
    this.mouse = { x: e.clientX - s.left, y: e.clientY - s.top };
    const d = this.drag;
    const p = this.toDesign(e);
    this.mouseD = p;
    if (!d) {
      this.updateCursor(e);
      if (usesBrush(App.tool) || this.poly || this.pen) this.requestRender();
      return;
    }
    switch (d.type) {
      case 'pan': {
        const a = -this.vr * Math.PI / 180, dx = e.clientX - d.sx, dy = e.clientY - d.sy;
        this.ox = d.ox + dx * Math.cos(a) - dy * Math.sin(a);
        this.oy = d.oy + dx * Math.sin(a) + dy * Math.cos(a);
        this.requestRender();
        break;
      }
      case 'rotview': {
        const a = Math.atan2(e.clientY - s.top - s.h / 2, e.clientX - s.left - s.w / 2);
        let v = d.vr0 + (a - d.a0) * 180 / Math.PI;
        if (e.shiftKey) v = Math.round(v / 15) * 15;
        this.vr = v;
        this.requestRender();
        break;
      }
      case 'move': {
        let nx = d.lx + p.x - d.sx, ny = d.ly + p.y - d.sy;
        if (e.shiftKey) { if (Math.abs(p.x - d.sx) > Math.abs(p.y - d.sy)) ny = d.ly; else nx = d.lx; }
        this.guides = [];
        const snap = 8 / this.z;
        if (Math.abs(nx - DESIGN_W / 2) < snap) { nx = DESIGN_W / 2; this.guides.push('v'); }
        if (Math.abs(ny - DESIGN_H / 2) < snap) { ny = DESIGN_H / 2; this.guides.push('h'); }
        d.L.x = nx; d.L.y = ny; d.moved = true;
        App.changed();
        break;
      }
      case 'scale': {
        if (e.shiftKey) {
          const q = this.local(d.L, p);
          d.L.sx = clamp(d.sx0 * q.x / (d.q0.x || 1), -20, 20) || d.sx0;
          d.L.sy = clamp(d.sy0 * q.y / (d.q0.y || 1), -20, 20) || d.sy0;
        } else d.L.scale = clamp(d.s0 * Math.hypot(p.x - d.L.x, p.y - d.L.y) / d.d0, 0.005, 50);
        App.changed();
        break;
      }
      case 'side': {
        const q = this.local(d.L, p);
        if (d.axis === 'x') d.L.sx = clamp(d.sx0 * q.x / (d.q0.x || 1), -20, 20) || d.sx0;
        else d.L.sy = clamp(d.sy0 * q.y / (d.q0.y || 1), -20, 20) || d.sy0;
        App.changed();
        break;
      }
      case 'rotate': {
        let r2 = d.r0 + (Math.atan2(p.y - d.L.y, p.x - d.L.x) - d.a0) * 180 / Math.PI;
        if (e.shiftKey) r2 = Math.round(r2 / 15) * 15;
        d.L.rot = Math.round((((r2 + 540) % 360) - 180) * 10) / 10;
        App.changed();
        break;
      }
      case 'box': d.p1 = p; d.shift = e.shiftKey; this.requestRender(); break;
      case 'lasso': {
        if (Math.hypot(e.clientX - d.last.x, e.clientY - d.last.y) < (App.tool === 'magLasso' ? 6 : 2)) break;
        d.last = { x: e.clientX, y: e.clientY };
        d.pts.push(this.snapEdge(p, App.tool));
        this.requestRender();
        break;
      }
      case 'quick': {
        if (Math.hypot(p.x - d.last.x, p.y - d.last.y) < d.r * d.L.scale * 0.8) break;
        d.last = p;
        Sel.quick(d.L, p, d.r, d.mode);
        break;
      }
      case 'patch': d.p1 = p; this.requestRender(); break;
      case 'pen': {
        if (Math.hypot(p.x - d.p0.x, p.y - d.p0.y) * this.z > 6) this.pen.smooth = true;
        this.requestRender();
        break;
      }
      case 'freepen': {
        const l = d.pts[d.pts.length - 1];
        if (Math.hypot(p.x - l.x, p.y - l.y) * this.z > 4) { d.pts.push(p); this.requestRender(); }
        break;
      }
      case 'point': {
        const L = d.L, a = -L.rot * Math.PI / 180, dx = p.x - L.x, dy = p.y - L.y;
        const k = L.scale;
        L.pts[d.i] = { x: (dx * Math.cos(a) - dy * Math.sin(a)) / (k * (L.sx || 1)), y: (dx * Math.sin(a) + dy * Math.cos(a)) / (k * (L.sy || 1)) };
        App.changed();
        break;
      }
      case 'mask': this.maskTo(p); break;
      case 'paint': this.paintTo(p, e); break;
    }
  },
  up(e) {
    const d = this.drag;
    this.drag = null;
    this.guides = [];
    try { this.canvas.releasePointerCapture(e.pointerId); } catch (_) { }
    if (!d) return;
    switch (d.type) {
      case 'pan': case 'rotview': break;
      case 'move': if (d.moved) { App.commit('Mover'); Panels.refreshProps(); } break;
      case 'scale': case 'side': App.commit('Escalar'); Panels.refreshProps(); break;
      case 'rotate': App.commit('Rotar'); Panels.refreshProps(); break;
      case 'box': this.finishBox(d); break;
      case 'lasso': {
        if (d.pts.length > 2) Sel.shape(x => { x.beginPath(); d.pts.forEach((q, i) => (i ? x.lineTo(q.x, q.y) : x.moveTo(q.x, q.y))); x.closePath(); x.fill(); }, d.mode);
        if (App.t.feather > 0) Sel.morph('feather', App.t.feather);
        break;
      }
      case 'patch': {
        const L = d.L, a = designToSource(L, d.p0), b = designToSource(L, d.p1);
        if (Math.hypot(b.x - a.x, b.y - a.y) > 1) Raster.patch(L, { x: b.x - a.x, y: b.y - a.y });
        break;
      }
      case 'freepen': {
        const pts = simplifyPts(d.pts, 3 / this.z);
        if (pts.length > 2) {
          const f = d.pts[0], l = d.pts[d.pts.length - 1];
          const closed = Math.hypot(f.x - l.x, f.y - l.y) * this.z < 20;
          Panels.addPath(pts, closed, true);
        }
        break;
      }
      case 'pen': this.requestRender(); break;
      case 'point': recenterPath(d.L); App.commit('Editar trazado'); break;
      case 'mask': App.commit(TOOL_INFO[d.tool][0]); Panels.refreshProps(); break;
      case 'paint': {
        if (d.tool === 'spotHeal') Raster.spotHeal(d.L, d.spot);
        Raster.end(TOOL_INFO[d.tool][0]);
        break;
      }
    }
    this.requestRender();
  },
  updateCursor(e) {
    const t = App.tool, c = this.canvas;
    if (this.space || t === 'hand') { c.style.cursor = 'grab'; return; }
    if (t === 'move') {
      const h = this.handleAt(e);
      c.style.cursor = h ? (h.type === 'rotate' ? 'grab' : h.type === 'side' ? (h.axis === 'x' ? 'ew-resize' : 'ns-resize') : 'nwse-resize') : 'default';
      return;
    }
    c.style.cursor = usesBrush(t) ? 'none' : ({ text: 'text', vtext: 'text', zoom: 'zoom-in', rotView: 'grab', patch: 'move' })[t] || 'crosshair';
  },

  /* ---------- acciones de herramientas ---------- */
  finishBox(d) {
    let { p0, p1 } = d;
    if (d.shift && d.tool !== 'gradient') { const s = Math.max(Math.abs(p1.x - p0.x), Math.abs(p1.y - p0.y)); p1 = { x: p0.x + Math.sign(p1.x - p0.x || 1) * s, y: p0.y + Math.sign(p1.y - p0.y || 1) * s }; }
    const x0 = Math.min(p0.x, p1.x), y0 = Math.min(p0.y, p1.y), w = Math.abs(p1.x - p0.x), h = Math.abs(p1.y - p0.y);
    const tiny = Math.hypot(w, h) * this.z < 4;
    switch (d.tool) {
      case 'marquee':
      case 'ellipseSel':
        if (tiny) { if (d.mode === 'new') Sel.none(); return; }
        Sel.shape(x => { x.beginPath(); if (d.tool === 'marquee') x.rect(x0, y0, w, h); else x.ellipse(x0 + w / 2, y0 + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); x.fill(); }, d.mode);
        if (App.t.feather > 0) Sel.morph('feather', App.t.feather);
        break;
      case 'crop': if (!tiny) cropLayerToRect(App.selected(), { x: x0, y: y0, w, h }); break;
      case 'gradient': {
        if (tiny) return;
        const T = this.rasterTarget(true);
        if (T) Raster.gradient(T, p0, d.p1, { type: App.t.gradType, reverse: App.t.gradReverse, toTransparent: App.t.gradTransparent, c0: App.colors.fg, c1: App.colors.bg, opacity: App.t.opacity });
        break;
      }
      case 'shape': {
        if (tiny) return;
        const kind = App.t.shape;
        if (kind === 'line') {
          const len = Math.hypot(p1.x - p0.x, p1.y - p0.y);
          Panels.addShape('line', { x: (p0.x + d.p1.x) / 2, y: (p0.y + d.p1.y) / 2, w: len, h: Math.max(6, App.t.lineWidth || 16), rot: Math.atan2(d.p1.y - p0.y, d.p1.x - p0.x) * 180 / Math.PI, fill: App.colors.fg });
        } else Panels.addShape(kind, { x: x0 + w / 2, y: y0 + h / 2, w, h, fill: App.colors.fg, strokeColor: App.colors.fg, sides: App.t.sides, radius: kind === 'rrect' ? 0.3 : 0 });
        break;
      }
    }
  },
  finishPoly() {
    const P = this.poly;
    this.poly = null;
    if (P && P.pts.length > 2) Sel.shape(x => { x.beginPath(); P.pts.forEach((q, i) => (i ? x.lineTo(q.x, q.y) : x.moveTo(q.x, q.y))); x.closePath(); x.fill(); }, P.mode);
    if (App.t.feather > 0) Sel.morph('feather', App.t.feather);
    this.requestRender();
  },
  finishPen(closed) {
    const P = this.pen;
    this.pen = null;
    if (P && P.pts.length > 1) Panels.addPath(P.pts, closed, P.smooth);
    this.requestRender();
  },
  cancelTool() {
    this.poly = null; this.pen = null;
    if (this.drag && this.drag.type === 'paint') Raster.cancel();
    this.drag = null;
    this.requestRender();
  },
  /* lazo magnético: busca el borde más fuerte cerca del puntero */
  snapEdge(p, tool) {
    if (tool !== 'magLasso') return p;
    const comp = this._comp && this._comp.c;
    if (!comp) return p;
    const rs = this._comp.rs;
    if (!this._edge || this._edge.c !== comp) this._edge = { c: comp, d: ctx2d(comp, true).getImageData(0, 0, comp.width, comp.height).data };
    const d = this._edge.d, W = comp.width, H = comp.height;
    const L = (x, y) => { x = clamp(x, 0, W - 1); y = clamp(y, 0, H - 1); const i = (y * W + x) * 4; return (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) * d[i + 3] / 255; };
    const cx = Math.round(p.x * rs), cy = Math.round(p.y * rs), R = Math.max(2, Math.round(10 / this.z * rs));
    let best = -1, bx = cx, by = cy;
    for (let y = cy - R; y <= cy + R; y++) for (let x = cx - R; x <= cx + R; x++) {
      const g = Math.abs(L(x + 1, y) - L(x - 1, y)) + Math.abs(L(x, y + 1) - L(x, y - 1));
      const sc = g - Math.hypot(x - cx, y - cy) * 2;
      if (sc > best) { best = sc; bx = x; by = y; }
    }
    return { x: bx / rs, y: by / rs };
  },
  maskTo(p) {
    const d = this.drag, L = d.L;
    const s = designToSource(L, p);
    const ms = d.mask.width / L.w;
    const r = Math.max(0.5, brushRadiusSrc(L, App.brush.size) * ms);
    const pt = { x: s.x * ms, y: s.y * ms };
    const doDab = (x, y) => {
      if (d.tool === 'bgErase') bgEraseDab(L, d.mask, x, y, r, App.t.tol);
      else dab(d.mask, x, y, r, App.brush.hard, d.tool === 'erase');
    };
    if (d.last) {
      const dist = Math.hypot(pt.x - d.last.x, pt.y - d.last.y), step = Math.max(0.5, r * 0.22);
      for (let t = step; t < dist; t += step) doDab(lerp(d.last.x, pt.x, t / dist), lerp(d.last.y, pt.y, t / dist));
    }
    doDab(pt.x, pt.y);
    d.last = pt;
    Assets.bump(L.maskId);
    App.changed();
  },
  paintTo(p, e) {
    const d = this.drag, L = d.L;
    const sp = designToSource(L, p);
    const o = { opacity: App.t.opacity, hard: App.brush.hard, strength: App.t.strength, color: App.colors.fg, offset: this.cloneOffset, pattern: App.t.pattern, spongeMode: App.t.spongeMode };
    const one = (x, y) => {
      if (d.tool === 'spotHeal') {
        const R = Math.ceil(d.r), W = Raster.cur.W, H = Raster.cur.H;
        for (let yy = -R; yy <= R; yy++) for (let xx = -R; xx <= R; xx++) {
          if (xx * xx + yy * yy > d.r * d.r) continue;
          const px = Math.round(x + xx), py = Math.round(y + yy);
          if (px >= 0 && py >= 0 && px < W && py < H) d.spot[py * W + px] = 1;
        }
        return;
      }
      if (d.tool === 'smudge') Raster.smudgeMove(x, y);
      Raster.dab(d.tool, x, y, d.r, o);
    };
    if (d.tool === 'redEye') { if (!d.last) one(sp.x, sp.y); d.last = sp; App.changed(); return; }
    if (d.last) {
      const dist = Math.hypot(sp.x - d.last.x, sp.y - d.last.y), step = Math.max(0.5, d.r * (d.tool === 'smudge' ? 0.12 : 0.25));
      if (dist < step) return;
      let t = step;
      for (; t <= dist; t += step) one(lerp(d.last.x, sp.x, t / dist), lerp(d.last.y, sp.y, t / dist));
      d.last = { x: lerp(d.last.x, sp.x, (t - step) / dist), y: lerp(d.last.y, sp.y, (t - step) / dist) };
    } else { one(sp.x, sp.y); d.last = sp; }
    if (d.tool === 'spotHeal') d.screen.push({ ...this.mouse });
    App.changed();
  },
  pick(e, p) {
    const L = App.selected();
    if (e.shiftKey && L && L.type === 'image') {
      const s = designToSource(L, p);
      const w = Math.round(Math.min(L.w, 1200)), f = w / L.w, h = Math.round(L.h * f);
      const data = Assets.sourceData(L.assetId, w, h);
      const x = Math.floor(s.x * f), y = Math.floor(s.y * f);
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      const i = (y * w + x) * 4;
      L.accent.color = rgbToHex(data[i], data[i + 1], data[i + 2]);
      L.accent.on = true;
      toast('Color de acento: ' + L.accent.color);
      App.commit('Color de acento'); Panels.refreshProps();
      return;
    }
    const dpr = devicePixelRatio || 1, s = this.size();
    const px = this.ctx.getImageData((e.clientX - s.left) * dpr, (e.clientY - s.top) * dpr, 1, 1).data;
    const hex = rgbToHex(px[0], px[1], px[2]);
    if (e.altKey) App.colors.bg = hex; else App.colors.fg = hex;
    Panels.refreshColors();
    toast((e.altKey ? 'Color secundario ' : 'Color principal ') + hex);
  },
  pathScreenPts(L) {
    const a = L.rot * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), k = L.scale;
    return L.pts.map(q => { const x = q.x * k * (L.sx || 1), y = q.y * k * (L.sy || 1); return this.toScreen({ x: L.x + x * c - y * s, y: L.y + x * s + y * c }); });
  },

  /* ---------- dibujo ---------- */
  composite(rs, stale) {
    const k = App.side + '|' + rs + '|' + App.version + '|' + (stale ? 1 : 0);
    if (this._comp && this._comp.k === k) return this._comp.c;
    const c = composeLayers(App.side, rs, { stale });
    this._comp = { k, c, rs };
    return c;
  },
  drawGuide(x) {
    const side = App.side, shirtCol = App.project.shirt.color;
    const pf = usePhoto() && photoFor(side);
    if (pf) {
      const { a, P } = pf, k = DESIGN_W / (P.w * a.w);
      x.save();
      x.translate(DESIGN_W / 2, DESIGN_H / 2);
      x.rotate(-P.rot * Math.PI / 180);
      x.drawImage(a.img, -P.x * a.w * k, -P.y * a.h * k, a.w * k, a.h * k);
      x.restore();
      return;
    }
    const k = DESIGN_W / Shirt.PRINT_W, top = Shirt.printTop(side);
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
    x.moveTo(395, 92);
    x.quadraticCurveTo(500, side === 'front' ? 215 : 140, 605, 92);
    x.stroke();
    x.restore();
  },
  render() {
    const c = this.canvas, dpr = devicePixelRatio || 1;
    const W = c.clientWidth, H = c.clientHeight;
    if (!W || !H) return;
    if (c.width !== Math.round(W * dpr) || c.height !== Math.round(H * dpr)) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
    const x = this.ctx, V = this.V;
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.fillStyle = '#0f0f12';
    x.fillRect(0, 0, c.width, c.height);
    x.setTransform(new DOMMatrix().scale(dpr).multiply(V));
    if (this.showGuide) this.drawGuide(x);
    else { x.fillStyle = App.project.shirt.color; x.fillRect(0, 0, DESIGN_W, DESIGN_H); }
    const rs = this.rs();
    const stale = !!this.drag && ['scale', 'side'].includes(this.drag.type);
    const comp = this.composite(rs, stale);
    x.imageSmoothingQuality = 'high';
    x.drawImage(comp, 0, 0, DESIGN_W, DESIGN_H);
    x.save();
    x.lineWidth = 1 / this.z;
    x.setLineDash([6 / this.z, 6 / this.z]);
    x.strokeStyle = 'rgba(255,122,26,0.55)';
    x.strokeRect(0, 0, DESIGN_W, DESIGN_H);
    x.restore();

    // selección (hormigas)
    if (Sel.active) { x.setTransform(1, 0, 0, 1, 0, 0); x.drawImage(Sel.ants(V, W, H, dpr, this.phase), 0, 0); }

    // overlays en px de pantalla
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (const g of this.guides) {
      x.strokeStyle = '#ff2fb0'; x.lineWidth = 1;
      x.beginPath();
      const a = g === 'v' ? this.toScreen({ x: DESIGN_W / 2, y: -2000 }) : this.toScreen({ x: -2000, y: DESIGN_H / 2 });
      const b = g === 'v' ? this.toScreen({ x: DESIGN_W / 2, y: DESIGN_H + 2000 }) : this.toScreen({ x: DESIGN_W + 2000, y: DESIGN_H / 2 });
      x.moveTo(a.x, a.y); x.lineTo(b.x, b.y);
      x.stroke();
    }
    const L = App.selected();
    if (L && L.visible && L.type !== 'adjust') {
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
        for (let i = 0; i < 4; i++) { const a = cs[i], b = cs[(i + 1) % 4]; x.beginPath(); x.rect((a.x + b.x) / 2 - 4, (a.y + b.y) / 2 - 4, 8, 8); x.fill(); x.stroke(); }
        x.beginPath(); x.arc(rh.x, rh.y, 6, 0, Math.PI * 2); x.fill(); x.stroke();
      }
      if (L.type === 'path' && (App.tool === 'direct' || App.tool === 'pen')) {
        x.fillStyle = '#fff'; x.strokeStyle = '#2f8cff';
        for (const q of this.pathScreenPts(L)) { x.beginPath(); x.rect(q.x - 4, q.y - 4, 8, 8); x.fill(); x.stroke(); }
      }
    }
    this.drawToolOverlay(x);
    const zl = $('#zoomLbl');
    if (zl) zl.textContent = Math.round(this.z * 100) + '%' + (this.vr ? ' · ' + Math.round(this.vr) + '°' : '');
    $('#emptyHint').style.display = App.layers().length ? 'none' : 'flex';
  },
  drawToolOverlay(x) {
    const d = this.drag;
    const sp = p => this.toScreen(p);
    x.lineWidth = 1;
    const dashed = (fn) => { x.save(); x.strokeStyle = '#000'; x.setLineDash([]); fn(); x.stroke(); x.strokeStyle = '#fff'; x.setLineDash([4, 4]); fn(); x.stroke(); x.restore(); };
    if (d && d.type === 'box') {
      let p1 = d.p1;
      if (d.shift && d.tool !== 'gradient') { const s = Math.max(Math.abs(p1.x - d.p0.x), Math.abs(p1.y - d.p0.y)); p1 = { x: d.p0.x + Math.sign(p1.x - d.p0.x || 1) * s, y: d.p0.y + Math.sign(p1.y - d.p0.y || 1) * s }; }
      const a = d.p0, b = p1;
      if (d.tool === 'gradient' || (d.tool === 'shape' && App.t.shape === 'line')) {
        const A = sp(a), B = sp(d.p1);
        dashed(() => { x.beginPath(); x.moveTo(A.x, A.y); x.lineTo(B.x, B.y); });
        x.fillStyle = App.colors.fg; x.beginPath(); x.arc(A.x, A.y, 5, 0, 7); x.fill();
        x.fillStyle = App.colors.bg; x.beginPath(); x.arc(B.x, B.y, 5, 0, 7); x.fill();
      } else {
        const pts = [a, { x: b.x, y: a.y }, b, { x: a.x, y: b.y }].map(sp);
        dashed(() => {
          x.beginPath();
          if (d.tool === 'ellipseSel' || (d.tool === 'shape' && App.t.shape === 'ellipse')) {
            const N = 48, cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2, rx = Math.abs(b.x - a.x) / 2, ry = Math.abs(b.y - a.y) / 2;
            for (let i = 0; i <= N; i++) { const q = sp({ x: cx + Math.cos(i / N * 6.2832) * rx, y: cy + Math.sin(i / N * 6.2832) * ry }); i ? x.lineTo(q.x, q.y) : x.moveTo(q.x, q.y); }
          } else { pts.forEach((q, i) => (i ? x.lineTo(q.x, q.y) : x.moveTo(q.x, q.y))); x.closePath(); }
        });
        if (d.tool === 'crop') { x.fillStyle = 'rgba(0,0,0,0.0)'; }
      }
    }
    if (d && d.type === 'lasso') dashed(() => { x.beginPath(); d.pts.forEach((q, i) => { const s = sp(q); i ? x.lineTo(s.x, s.y) : x.moveTo(s.x, s.y); }); });
    if (d && d.type === 'freepen') { x.save(); x.strokeStyle = '#2f8cff'; x.lineWidth = 2; x.beginPath(); d.pts.forEach((q, i) => { const s = sp(q); i ? x.lineTo(s.x, s.y) : x.moveTo(s.x, s.y); }); x.stroke(); x.restore(); }
    if (this.poly) {
      dashed(() => { x.beginPath(); this.poly.pts.forEach((q, i) => { const s = sp(q); i ? x.lineTo(s.x, s.y) : x.moveTo(s.x, s.y); }); if (this.mouse) x.lineTo(this.mouse.x, this.mouse.y); });
      const f = sp(this.poly.pts[0]); x.fillStyle = '#fff'; x.fillRect(f.x - 3, f.y - 3, 6, 6);
    }
    if (this.pen) {
      x.save();
      x.strokeStyle = '#2f8cff'; x.lineWidth = 2;
      x.beginPath();
      const s = 1;
      const pts = this.mouse && this.mouseD ? [...this.pen.pts, this.mouseD] : this.pen.pts;
      const scr = pts.map(sp);
      x.save(); x.beginPath(); pathFromPts(x, scr, false, this.pen.smooth, s, 0, 0); x.stroke(); x.restore();
      x.fillStyle = '#fff';
      for (const q of this.pen.pts.map(sp)) { x.beginPath(); x.rect(q.x - 4, q.y - 4, 8, 8); x.fill(); x.stroke(); }
      x.restore();
    }
    if (d && d.type === 'patch') {
      const off = { x: d.p1.x - d.p0.x, y: d.p1.y - d.p0.y }, b = Sel.bounds;
      if (b) dashed(() => { const pts = [{ x: b.x, y: b.y }, { x: b.x + b.w, y: b.y }, { x: b.x + b.w, y: b.y + b.h }, { x: b.x, y: b.y + b.h }].map(q => sp({ x: q.x + off.x, y: q.y + off.y })); x.beginPath(); pts.forEach((q, i) => (i ? x.lineTo(q.x, q.y) : x.moveTo(q.x, q.y))); x.closePath(); });
    }
    if (d && d.type === 'paint' && d.tool === 'spotHeal') {
      x.fillStyle = 'rgba(255,40,40,0.35)';
      for (const q of d.screen) { x.beginPath(); x.arc(q.x, q.y, App.brush.size / 2, 0, 7); x.fill(); }
    }
    if (this.cloneSrc && (App.tool === 'clone' || App.tool === 'heal')) {
      const L = App.layers().find(l => l.id === this.cloneSrc.id);
      if (L) {
        let src = this.cloneSrc.p;
        if (this.drag && this.drag.type === 'paint' && this.cloneOffset) { const cur = designToSource(L, this.mouseD); src = { x: cur.x - this.cloneOffset.x, y: cur.y - this.cloneOffset.y }; }
        const q = sp(sourceToDesign(L, src));
        x.strokeStyle = '#fff'; x.lineWidth = 1.5;
        x.beginPath(); x.moveTo(q.x - 8, q.y); x.lineTo(q.x + 8, q.y); x.moveTo(q.x, q.y - 8); x.lineTo(q.x, q.y + 8); x.stroke();
      }
    }
    if (this.mouse && usesBrush(App.tool)) {
      const r = App.brush.size / 2;
      x.strokeStyle = '#fff'; x.lineWidth = 1.5;
      x.beginPath(); x.arc(this.mouse.x, this.mouse.y, r, 0, Math.PI * 2); x.stroke();
      x.strokeStyle = '#000'; x.lineWidth = 0.8;
      x.beginPath(); x.arc(this.mouse.x, this.mouse.y, r + 1.2, 0, Math.PI * 2); x.stroke();
      x.fillStyle = App.tool === 'erase' || App.tool === 'bgErase' ? '#ff4d4d' : App.tool === 'restore' ? '#4dff88' : '#fff';
      x.beginPath(); x.arc(this.mouse.x, this.mouse.y, 2, 0, Math.PI * 2); x.fill();
    }
  }
};

/* recorta una capa de imagen a un rectángulo (px de diseño), manteniendo su lugar */
function cropLayerToRect(L, r) {
  if (!L || L.type !== 'image') { toast('Seleccioná la capa de imagen a recortar'); return; }
  const pts = [[r.x, r.y], [r.x + r.w, r.y], [r.x + r.w, r.y + r.h], [r.x, r.y + r.h]].map(([x, y]) => designToSource(L, { x, y }));
  const cr = L.crop;
  let l = Math.max(cr.l * L.w, Math.min(...pts.map(p => p.x))), rr = Math.min((1 - cr.r) * L.w, Math.max(...pts.map(p => p.x)));
  let t = Math.max(cr.t * L.h, Math.min(...pts.map(p => p.y))), b = Math.min((1 - cr.b) * L.h, Math.max(...pts.map(p => p.y)));
  if (rr - l < 2 || b - t < 2) { toast('El recorte quedó fuera de la imagen'); return; }
  const c = sourceToDesign(L, { x: (l + rr) / 2, y: (t + b) / 2 });
  L.crop = { l: l / L.w, t: t / L.h, r: 1 - rr / L.w, b: 1 - b / L.h };
  L.x = c.x; L.y = c.y;
  App.commit('Recortar');
  Panels.refreshProps();
}
/* simplificación Ramer–Douglas–Peucker */
function simplifyPts(pts, eps) {
  if (pts.length < 3) return pts.slice();
  const d2 = (p, a, b) => { const dx = b.x - a.x, dy = b.y - a.y, l = dx * dx + dy * dy || 1; const t = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / l, 0, 1); return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy); };
  let mx = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) { const v = d2(pts[i], pts[0], pts[pts.length - 1]); if (v > mx) { mx = v; idx = i; } }
  if (mx <= eps) return [pts[0], pts[pts.length - 1]];
  return [...simplifyPts(pts.slice(0, idx + 1), eps).slice(0, -1), ...simplifyPts(pts.slice(idx), eps)];
}
/* centra los puntos de un trazado en el origen de la capa */
function recenterPath(L) {
  const b = pathBox(L.pts), cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2;
  if (Math.abs(cx) < 0.01 && Math.abs(cy) < 0.01) return;
  L.pts = L.pts.map(p => ({ x: p.x - cx, y: p.y - cy }));
  const a = L.rot * Math.PI / 180, k = L.scale, dx = cx * k * (L.sx || 1), dy = cy * k * (L.sy || 1);
  L.x += dx * Math.cos(a) - dy * Math.sin(a);
  L.y += dx * Math.sin(a) + dy * Math.cos(a);
}
/* borrador de fondos: borra los colores parecidos al del centro del pincel */
function bgEraseDab(L, mask, mx, my, r, tol) {
  const w = mask.width, h = mask.height;
  const data = Assets.sourceData(L.assetId, w, h);
  const ci = (clamp(Math.round(my), 0, h - 1) * w + clamp(Math.round(mx), 0, w - 1)) * 4;
  const ref = [data[ci], data[ci + 1], data[ci + 2]];
  const x0 = Math.max(0, Math.floor(mx - r)), y0 = Math.max(0, Math.floor(my - r)), x1 = Math.min(w, Math.ceil(mx + r)), y1 = Math.min(h, Math.ceil(my + r));
  if (x1 <= x0 || y1 <= y0) return;
  const x = ctx2d(mask, true), id = x.getImageData(x0, y0, x1 - x0, y1 - y0), d = id.data;
  const t2 = tol * tol * 3;
  for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) {
    const dist = Math.hypot(xx - mx, yy - my) / r;
    if (dist >= 1) continue;
    const i = (yy * w + xx) * 4;
    const dr = data[i] - ref[0], dg = data[i + 1] - ref[1], db = data[i + 2] - ref[2];
    if (dr * dr + dg * dg + db * db > t2) continue;
    const j = ((yy - y0) * (x1 - x0) + (xx - x0)) * 4;
    d[j + 3] *= dist > 0.8 ? smoothstep(0.8, 1, dist) : 0;
  }
  x.putImageData(id, x0, y0);
}

/* ---------- utilidades de máscara ---------- */
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
  const sel = floodSelect(data, w, h, [my * w + mx], [[data[i], data[i + 1], data[i + 2]]], App.t.tol, global);
  applySelectionErase(L, mask, sel);
  App.commit();
}
/* quitar fondo liso automáticamente (desde los bordes) */
function autoRemoveBg(L, tol) {
  const mask = beginMaskEdit(L);
  const w = mask.width, h = mask.height;
  const data = Assets.sourceData(L.assetId, w, h);
  applySelectionErase(L, mask, bgSelect(data, w, h, tol));
  App.commit('Quitar fondo');
}
/* borra de la máscara lo que está seleccionado */
function eraseSelectionFromMask(L) {
  const mask = beginMaskEdit(L);
  const t = Sel.toSourceCanvas(L, mask.width, mask.height);
  const x = ctx2d(mask, true);
  x.globalCompositeOperation = 'destination-out';
  x.drawImage(t, 0, 0);
  x.globalCompositeOperation = 'source-over';
  Assets.bump(L.maskId);
}
function maskFromSelection(L) {
  const mask = beginMaskEdit(L);
  const t = Sel.toSourceCanvas(L, mask.width, mask.height);
  const x = ctx2d(mask, true);
  x.globalCompositeOperation = 'destination-in';
  x.drawImage(t, 0, 0);
  x.globalCompositeOperation = 'source-over';
  Assets.bump(L.maskId);
}
