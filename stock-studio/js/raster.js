'use strict';
/* =====================================================================
   Edición de píxeles (pinceles, tampón, corrector, filtros…) con
   historial por parches: cada trazo guarda solo el rectángulo que cambió.
   ===================================================================== */

/* matriz px de la imagen original → px de diseño */
function layerMatrix(L) {
  const cr = L.crop || { l: 0, t: 0, r: 0, b: 0 };
  const sw = L.w * (1 - cr.l - cr.r), sh = L.h * (1 - cr.t - cr.b);
  return new DOMMatrix()
    .translate(L.x, L.y)
    .rotate(L.rot)
    .scale(L.scale * (L.sx || 1) * (L.flipX ? -1 : 1), L.scale * (L.sy || 1) * (L.flipY ? -1 : 1))
    .translate(-(cr.l * L.w + sw / 2), -(cr.t * L.h + sh / 2));
}
function designToSource(L, p) { return layerMatrix(L).inverse().transformPoint(new DOMPoint(p.x, p.y)); }
function sourceToDesign(L, p) { return layerMatrix(L).transformPoint(new DOMPoint(p.x, p.y)); }
/* radio del pincel (px de pantalla) → px de la imagen */
function brushRadiusSrc(L, screenSize) {
  return Math.max(0.5, (screenSize / 2) / Editor.z / (L.scale * Math.sqrt(Math.abs((L.sx || 1) * (L.sy || 1)))));
}

/* revisiones de un recurso de imagen */
Assets.syncRev = function (id, target) {
  const a = this.get(id);
  if (!a || a.kind !== 'img') return;
  target = target || 0;
  if (!a.revs) { a.revs = []; a.cur = target; return; }
  if (a.cur === target) return;
  if (!a.revs.length) { a.cur = target; return; }
  const x = ctx2d(a.img, true);
  while (a.cur > target && a.cur > 0) { const r = a.revs[a.cur - 1]; x.putImageData(r.b, r.x, r.y); a.cur--; }
  while (a.cur < target && a.cur < a.revs.length) { const r = a.revs[a.cur]; x.putImageData(r.af, r.x, r.y); a.cur++; }
  a.live = (a.live || 0) + 1;
  a.url = null; a._src = null; a._cut = null;
};
function syncAllRevs() {
  for (const s of ['front', 'back']) for (const L of App.project.sides[s].layers) if (L.type === 'image') Assets.syncRev(L.assetId, L.pix || 0);
}
function refCount(id) {
  let n = 0;
  for (const s of ['front', 'back']) for (const L of App.project.sides[s].layers) if (L.assetId === id) n++;
  return n;
}

const Raster = {
  cur: null,
  /* asegura que la capa tenga su propio canvas editable */
  editable(L) {
    Assets.syncRev(L.assetId, L.pix || 0);
    let a = Assets.get(L.assetId);
    if (!a.revs) { a.revs = []; a.cur = L.pix || 0; }
    const shared = refCount(L.assetId) > 1 || String(L.assetId).startsWith('builtin');
    if (shared || !(a.img instanceof HTMLCanvasElement) || !a._rw) {
      const c = mkCanvas(a.w, a.h);
      ctx2d(c, true).drawImage(a.img, 0, 0);
      if (shared) {
        const id = Assets.add({ kind: 'img', img: c, w: a.w, h: a.h, url: a.url, revs: [], cur: 0, _rw: true });
        L.assetId = id; L.pix = 0;
        a = Assets.get(id);
      } else { a.img = c; a._rw = true; }
    }
    return a;
  },
  begin(L) {
    const a = this.editable(L);
    const c = a.img;
    const before = mkCanvas(c.width, c.height);
    ctx2d(before, true).drawImage(c, 0, 0);
    const sel = Sel.active ? Sel.toSource(L, c.width, c.height) : null;
    this.cur = { L, a, c, before, box: null, sel, W: c.width, H: c.height };
    return this.cur;
  },
  dirty(x0, y0, x1, y1) {
    const s = this.cur;
    x0 = Math.max(0, Math.floor(x0)); y0 = Math.max(0, Math.floor(y0));
    x1 = Math.min(s.W, Math.ceil(x1)); y1 = Math.min(s.H, Math.ceil(y1));
    if (x1 <= x0 || y1 <= y0) return;
    if (!s.box) s.box = { x0, y0, x1, y1 };
    else { s.box.x0 = Math.min(s.box.x0, x0); s.box.y0 = Math.min(s.box.y0, y0); s.box.x1 = Math.max(s.box.x1, x1); s.box.y1 = Math.max(s.box.y1, y1); }
    s.a.live = (s.a.live || 0) + 1;
    s.a._src = null;
  },
  end(label) {
    const s = this.cur;
    this.cur = null;
    if (!s || !s.box) return false;
    const { x0, y0, x1, y1 } = s.box, w = x1 - x0, h = y1 - y0;
    const b = ctx2d(s.before, true).getImageData(x0, y0, w, h);
    const af = ctx2d(s.c, true).getImageData(x0, y0, w, h);
    s.a.revs.length = s.a.cur;
    s.a.revs.push({ x: x0, y: y0, b, af });
    s.a.cur++;
    s.L.pix = s.a.cur;
    s.a.url = null; s.a._src = null; s.a._cut = null;
    App.commit(label);
    return true;
  },
  cancel() {
    const s = this.cur;
    this.cur = null;
    if (!s) return;
    ctx2d(s.c, true).drawImage(s.before, 0, 0);
    s.a.live = (s.a.live || 0) + 1;
  },

  /* region desenfocada (para desenfocar, enfocar, corrector) */
  blurBox(src, x0, y0, w, h, rad) {
    const p = Math.ceil(rad * 2) + 2;
    const t = mkCanvas(w + p * 2, h + p * 2), tx = ctx2d(t, true);
    tx.filter = `blur(${Math.max(0.5, rad)}px)`;
    tx.drawImage(src, -(x0 - p), -(y0 - p));
    return tx.getImageData(p, p, w, h).data;
  },

  /* aplica un toque del pincel (cx, cy, r en px de la imagen) */
  dab(tool, cx, cy, r, o) {
    const s = this.cur;
    if (!s) return;
    const W = s.W, H = s.H;
    const x0 = Math.max(0, Math.floor(cx - r - 1)), y0 = Math.max(0, Math.floor(cy - r - 1));
    const x1 = Math.min(W, Math.ceil(cx + r + 1)), y1 = Math.min(H, Math.ceil(cy + r + 1));
    if (x1 <= x0 || y1 <= y0) return;
    const bw = x1 - x0, bh = y1 - y0;
    const ctx = ctx2d(s.c, true);
    const id = ctx.getImageData(x0, y0, bw, bh), d = id.data;
    const hard = tool === 'pencil' ? 1 : clamp(o.hard, 0, 0.99);
    const op = o.opacity, st = o.strength;
    const col = hexToRgb(o.color || '#ffffff');
    let aux = null, aux2 = null, aux3 = null;
    if (tool === 'blur' || tool === 'sharpen') aux = this.blurBox(s.c, x0, y0, bw, bh, Math.max(1, r * 0.18));
    if (tool === 'clone' || tool === 'heal') {
      if (!o.offset) return;
      aux = ctx2d(s.before, true).getImageData(Math.round(x0 - o.offset.x), Math.round(y0 - o.offset.y), bw, bh).data;
      if (tool === 'heal') {
        aux2 = this.blurBox(s.before, Math.round(x0 - o.offset.x), Math.round(y0 - o.offset.y), bw, bh, Math.max(2, r * 0.35));
        aux3 = this.blurBox(s.c, x0, y0, bw, bh, Math.max(2, r * 0.35));
      }
    }
    let pat = null;
    if (tool === 'pattern') pat = Patterns.data(o.pattern, o.color);
    let smB = null;
    if (tool === 'smudge') smB = s.smudge;
    let fgH = 0, fgS = 0;
    if (tool === 'colorReplace') [fgH, fgS] = rgbToHsl(...col);
    const sel = s.sel;
    for (let yy = 0; yy < bh; yy++) {
      const y = y0 + yy;
      for (let xx = 0; xx < bw; xx++) {
        const x = x0 + xx;
        const dist = Math.hypot(x + 0.5 - cx, y + 0.5 - cy) / r;
        if (dist >= 1) continue;
        let f = tool === 'pencil' ? 1 : (dist <= hard ? 1 : 1 - smoothstep(hard, 1, dist));
        f *= op;
        if (sel) f *= sel[y * W + x] / 255;
        if (f <= 0.001) continue;
        const i = (yy * bw + xx) * 4;
        let R = d[i], G = d[i + 1], B = d[i + 2], A = d[i + 3];
        switch (tool) {
          case 'brush': case 'pencil': case 'pattern': {
            let sa = f, cr = col[0], cg = col[1], cb = col[2];
            if (pat) { const pi = ((y % pat.h) * pat.w + (x % pat.w)) * 4; sa *= pat.d[pi + 3] / 255; cr = pat.d[pi]; cg = pat.d[pi + 1]; cb = pat.d[pi + 2]; }
            if (sa <= 0) break;
            const oa = A / 255, na = sa + oa * (1 - sa);
            d[i] = (cr * sa + R * oa * (1 - sa)) / na;
            d[i + 1] = (cg * sa + G * oa * (1 - sa)) / na;
            d[i + 2] = (cb * sa + B * oa * (1 - sa)) / na;
            d[i + 3] = na * 255;
            break;
          }
          case 'colorReplace': {
            if (!A) break;
            const l = rgbToHsl(R, G, B)[2];
            const [nr, ng, nb] = hslToRgb(fgH, fgS, l);
            d[i] = lerp(R, nr, f); d[i + 1] = lerp(G, ng, f); d[i + 2] = lerp(B, nb, f);
            break;
          }
          case 'dodge': case 'burn': {
            const lum = (0.299 * R + 0.587 * G + 0.114 * B) / 255;
            const w = clamp(1 - Math.abs(lum - 0.5) * 1.3, 0.25, 1);
            const k = tool === 'dodge' ? 1 + st * f * 0.7 * w : 1 - st * f * 0.6 * w;
            d[i] = R * k; d[i + 1] = G * k; d[i + 2] = B * k;
            break;
          }
          case 'sponge': {
            const l = 0.299 * R + 0.587 * G + 0.114 * B;
            const k = o.spongeMode === 'sat' ? 1 + st * f * 0.8 : 1 - st * f * 0.8;
            d[i] = l + (R - l) * k; d[i + 1] = l + (G - l) * k; d[i + 2] = l + (B - l) * k;
            break;
          }
          case 'blur': {
            const k = f * st;
            d[i] = lerp(R, aux[i], k); d[i + 1] = lerp(G, aux[i + 1], k); d[i + 2] = lerp(B, aux[i + 2], k); d[i + 3] = lerp(A, aux[i + 3], k);
            break;
          }
          case 'sharpen': {
            const k = f * st * 1.5;
            d[i] = R + (R - aux[i]) * k; d[i + 1] = G + (G - aux[i + 1]) * k; d[i + 2] = B + (B - aux[i + 2]) * k;
            break;
          }
          case 'smudge': {
            if (!smB) break;
            const sx = x - smB.dx, sy = y - smB.dy;
            const bx = sx - smB.x0, by = sy - smB.y0;
            if (bx < 0 || by < 0 || bx >= smB.w || by >= smB.h) break;
            const j = (by * smB.w + bx) * 4, k = f * st;
            d[i] = lerp(R, smB.d[j], k); d[i + 1] = lerp(G, smB.d[j + 1], k); d[i + 2] = lerp(B, smB.d[j + 2], k); d[i + 3] = lerp(A, smB.d[j + 3], k);
            break;
          }
          case 'clone': {
            const sa = f * aux[i + 3] / 255;
            if (sa <= 0) break;
            const oa = A / 255, na = sa + oa * (1 - sa);
            d[i] = (aux[i] * sa + R * oa * (1 - sa)) / na;
            d[i + 1] = (aux[i + 1] * sa + G * oa * (1 - sa)) / na;
            d[i + 2] = (aux[i + 2] * sa + B * oa * (1 - sa)) / na;
            d[i + 3] = na * 255;
            break;
          }
          case 'heal': {
            d[i] = lerp(R, aux[i] + aux3[i] - aux2[i], f);
            d[i + 1] = lerp(G, aux[i + 1] + aux3[i + 1] - aux2[i + 1], f);
            d[i + 2] = lerp(B, aux[i + 2] + aux3[i + 2] - aux2[i + 2], f);
            break;
          }
          case 'redEye': {
            if (R > 50 && R > 1.35 * Math.max(G, B)) {
              const m = (G + B) / 2;
              d[i] = lerp(R, m * 0.85, f); d[i + 1] = lerp(G, G * 0.85, f); d[i + 2] = lerp(B, B * 0.85, f);
            }
            break;
          }
        }
      }
    }
    ctx.putImageData(id, x0, y0);
    if (tool === 'smudge') s.smudge = { d: new Uint8ClampedArray(d), x0, y0, w: bw, h: bh, cx, cy, dx: 0, dy: 0 };
    this.dirty(x0, y0, x1, y1);
  },
  /* el dedo arrastra el color del toque anterior */
  smudgeMove(cx, cy) { const s = this.cur; if (s && s.smudge) { s.smudge.dx = cx - s.smudge.cx; s.smudge.dy = cy - s.smudge.cy; } },

  /* relleno por similitud de color (bote de pintura) */
  bucket(L, sp, color, tol, opacity, contiguous) {
    const s = this.begin(L);
    const W = s.W, H = s.H, x = ctx2d(s.c, true);
    const sx = Math.floor(sp.x), sy = Math.floor(sp.y);
    if (sx < 0 || sy < 0 || sx >= W || sy >= H) { this.cancel(); toast('Hacé clic dentro de la capa'); return; }
    const id = x.getImageData(0, 0, W, H), d = id.data;
    const i0 = (sy * W + sx) * 4, ref = [d[i0], d[i0 + 1], d[i0 + 2], d[i0 + 3]];
    const t2 = tol * tol * 4;
    const near = p => { const i = p * 4; const a = d[i] - ref[0], b = d[i + 1] - ref[1], c = d[i + 2] - ref[2], e = d[i + 3] - ref[3]; return a * a + b * b + c * c + e * e <= t2; };
    const mark = new Uint8Array(W * H);
    if (contiguous) {
      const st = new Int32Array(W * H); let sp2 = 0;
      mark[sy * W + sx] = 1; st[sp2++] = sy * W + sx;
      while (sp2) {
        const p = st[--sp2], px = p % W;
        if (px > 0 && !mark[p - 1] && near(p - 1)) { mark[p - 1] = 1; st[sp2++] = p - 1; }
        if (px < W - 1 && !mark[p + 1] && near(p + 1)) { mark[p + 1] = 1; st[sp2++] = p + 1; }
        if (p >= W && !mark[p - W] && near(p - W)) { mark[p - W] = 1; st[sp2++] = p - W; }
        if (p < W * (H - 1) && !mark[p + W] && near(p + W)) { mark[p + W] = 1; st[sp2++] = p + W; }
      }
    } else for (let p = 0; p < W * H; p++) if (near(p)) mark[p] = 1;
    const c = hexToRgb(color);
    let bx0 = W, by0 = H, bx1 = 0, by1 = 0;
    for (let p = 0; p < W * H; p++) {
      if (!mark[p]) continue;
      let f = opacity * (s.sel ? s.sel[p] / 255 : 1);
      if (f <= 0) continue;
      const i = p * 4, oa = d[i + 3] / 255, na = f + oa * (1 - f);
      d[i] = (c[0] * f + d[i] * oa * (1 - f)) / na; d[i + 1] = (c[1] * f + d[i + 1] * oa * (1 - f)) / na; d[i + 2] = (c[2] * f + d[i + 2] * oa * (1 - f)) / na; d[i + 3] = na * 255;
      const px = p % W, py = (p / W) | 0;
      if (px < bx0) bx0 = px; if (px > bx1) bx1 = px; if (py < by0) by0 = py; if (py > by1) by1 = py;
    }
    x.putImageData(id, 0, 0);
    if (bx1 >= bx0) this.dirty(bx0, by0, bx1 + 1, by1 + 1);
    this.end('Bote de pintura');
  },

  /* degradado lineal / radial entre color principal y secundario */
  gradient(L, p0, p1, o) {
    const s = this.begin(L);
    const a = designToSource(L, p0), b = designToSource(L, p1);
    const t = mkCanvas(s.W, s.H), tx = ctx2d(t, true);
    const g = o.type === 'radial' ? tx.createRadialGradient(a.x, a.y, 0, a.x, a.y, Math.hypot(b.x - a.x, b.y - a.y)) : tx.createLinearGradient(a.x, a.y, b.x, b.y);
    const c0 = o.reverse ? o.c1 : o.c0, c1 = o.reverse ? o.c0 : o.c1;
    g.addColorStop(0, c0);
    g.addColorStop(1, o.toTransparent ? c0 + '00' : c1);
    tx.fillStyle = g;
    tx.fillRect(0, 0, s.W, s.H);
    if (s.sel) {
      const m = tx.getImageData(0, 0, s.W, s.H);
      for (let p = 0; p < s.sel.length; p++) m.data[p * 4 + 3] = m.data[p * 4 + 3] * s.sel[p] / 255;
      tx.putImageData(m, 0, 0);
    }
    const x = ctx2d(s.c, true);
    x.globalAlpha = o.opacity;
    x.drawImage(t, 0, 0);
    x.globalAlpha = 1;
    this.dirty(0, 0, s.W, s.H);
    this.end('Degradado');
  },

  /* pincel corrector puntual: rellena lo pintado con lo que lo rodea */
  spotHeal(L, mask) {
    const s = this.cur;
    if (!s) return;
    let x0 = s.W, y0 = s.H, x1 = 0, y1 = 0;
    for (let p = 0; p < mask.length; p++) if (mask[p]) { const x = p % s.W, y = (p / s.W) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 < x0) return;
    const pad = Math.max(8, Math.round(Math.max(x1 - x0, y1 - y0) * 0.6));
    x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(s.W, x1 + pad + 1); y1 = Math.min(s.H, y1 + pad + 1);
    const w = x1 - x0, h = y1 - y0;
    const ctx = ctx2d(s.c, true), id = ctx.getImageData(x0, y0, w, h);
    const hole = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) hole[y * w + x] = mask[(y + y0) * s.W + x + x0];
    const orig = new Uint8ClampedArray(id.data);
    inpaint(id.data, w, h, hole);
    // textura: suma un poco de grano del entorno
    const r = mulberry32(9);
    for (let p = 0; p < w * h; p++) if (hole[p]) { const i = p * 4, n = (r() - 0.5) * 6; id.data[i] += n; id.data[i + 1] += n; id.data[i + 2] += n; }
    // borde suave
    for (let p = 0; p < w * h; p++) {
      if (!hole[p]) { const i = p * 4; id.data[i] = orig[i]; id.data[i + 1] = orig[i + 1]; id.data[i + 2] = orig[i + 2]; id.data[i + 3] = orig[i + 3]; }
    }
    ctx.putImageData(id, x0, y0);
    this.dirty(x0, y0, x1, y1);
  },

  /* parche: rellena la selección con la textura de otra zona (desplazada) */
  patch(L, offset) {
    const s = this.begin(L);
    if (!s.sel) { this.cancel(); toast('Primero seleccioná la zona a reparar (lazo o marco)'); return; }
    let x0 = s.W, y0 = s.H, x1 = 0, y1 = 0;
    for (let p = 0; p < s.sel.length; p++) if (s.sel[p] > 8) { const x = p % s.W, y = (p / s.W) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 < x0) { this.cancel(); return; }
    x1++; y1++;
    const w = x1 - x0, h = y1 - y0, rad = Math.max(3, Math.max(w, h) / 6);
    const ox = Math.round(offset.x), oy = Math.round(offset.y);
    const bctx = ctx2d(s.before, true);
    const src = bctx.getImageData(x0 + ox, y0 + oy, w, h).data;
    const bS = this.blurBox(s.before, x0 + ox, y0 + oy, w, h, rad);
    const bT = this.blurBox(s.before, x0, y0, w, h, rad);
    const ctx = ctx2d(s.c, true), id = ctx.getImageData(x0, y0, w, h), d = id.data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const f = s.sel[(y + y0) * s.W + x + x0] / 255;
      if (f <= 0) continue;
      const i = (y * w + x) * 4;
      for (let k = 0; k < 3; k++) d[i + k] = lerp(d[i + k], src[i + k] + bT[i + k] - bS[i + k], f);
    }
    ctx.putImageData(id, x0, y0);
    this.dirty(x0, y0, x1, y1);
    this.end('Parche');
  },

  /* filtros del menú Filtro */
  filter(L, name, v) {
    const s = this.begin(L);
    const W = s.W, H = s.H;
    const t = mkCanvas(W, H), tx = ctx2d(t, true);
    const ctx = ctx2d(s.c, true);
    switch (name) {
      case 'blur': tx.filter = `blur(${v}px)`; tx.drawImage(s.c, 0, 0); break;
      case 'pixelate': {
        const k = Math.max(2, Math.round(v));
        const sm = mkCanvas(Math.ceil(W / k), Math.ceil(H / k));
        ctx2d(sm).drawImage(s.c, 0, 0, sm.width, sm.height);
        tx.imageSmoothingEnabled = false;
        tx.drawImage(sm, 0, 0, sm.width * k, sm.height * k);
        break;
      }
      case 'wave': {
        for (let y = 0; y < H; y += 2) tx.drawImage(s.c, 0, y, W, 2, Math.sin(y / H * Math.PI * 2 * 6) * v, y, W, 2);
        break;
      }
      default: {
        tx.drawImage(s.c, 0, 0);
        const id = tx.getImageData(0, 0, W, H), d = id.data;
        const src = new Uint8ClampedArray(d);
        const r = mulberry32(77);
        if (name === 'noise') for (let i = 0; i < d.length; i += 4) { const n = (r() - 0.5) * v * 2.55; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
        if (name === 'posterize') { const lv = Math.max(2, Math.round(v)), st = 255 / (lv - 1); for (let i = 0; i < d.length; i += 4) for (let k = 0; k < 3; k++) d[i + k] = Math.round(d[i + k] / st) * st; }
        if (name === 'threshold') for (let i = 0; i < d.length; i += 4) { const l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; d[i] = d[i + 1] = d[i + 2] = l >= v * 2.55 ? 255 : 0; }
        if (name === 'grayscale') for (let i = 0; i < d.length; i += 4) { const l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; d[i] = d[i + 1] = d[i + 2] = l; }
        if (name === 'invert') for (let i = 0; i < d.length; i += 4) { d[i] = 255 - d[i]; d[i + 1] = 255 - d[i + 1]; d[i + 2] = 255 - d[i + 2]; }
        if (name === 'sharpen') {
          const b = this.blurBox(s.c, 0, 0, W, H, 1.2);
          for (let i = 0; i < d.length; i += 4) for (let k = 0; k < 3; k++) d[i + k] = src[i + k] + (src[i + k] - b[i + k]) * v;
        }
        if (name === 'emboss' || name === 'edges') {
          for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
            const i = (y * W + x) * 4;
            const L0 = j => 0.299 * src[j] + 0.587 * src[j + 1] + 0.114 * src[j + 2];
            if (name === 'emboss') {
              const e = L0(i - W * 4 - 4) - L0(i + W * 4 + 4);
              d[i] = d[i + 1] = d[i + 2] = 128 + e * v;
            } else {
              const gx = L0(i + 4) - L0(i - 4), gy = L0(i + W * 4) - L0(i - W * 4);
              d[i] = d[i + 1] = d[i + 2] = clamp(Math.hypot(gx, gy) * v, 0, 255);
            }
          }
        }
        if (name === 'vignette') {
          for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
            const i = (y * W + x) * 4, dx = x / W - 0.5, dy = y / H - 0.5;
            const k = 1 - smoothstep(0.3, 0.75, Math.hypot(dx, dy) * 1.2) * v;
            d[i] *= k; d[i + 1] *= k; d[i + 2] *= k;
          }
        }
        tx.putImageData(id, 0, 0);
      }
    }
    // respeta la selección
    if (s.sel) {
      const m = tx.getImageData(0, 0, W, H), o = ctx.getImageData(0, 0, W, H);
      for (let p = 0; p < s.sel.length; p++) {
        const f = s.sel[p] / 255;
        if (f >= 1) continue;
        const i = p * 4;
        for (let k = 0; k < 4; k++) m.data[i + k] = lerp(o.data[i + k], m.data[i + k], f);
      }
      tx.putImageData(m, 0, 0);
    }
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(t, 0, 0);
    this.dirty(0, 0, W, H);
    this.end('Filtro: ' + name);
  }
};

/* relleno de agujeros por pirámide (push-pull) */
function inpaint(d, w, h, hole) {
  const levels = [];
  let W = w, H = h;
  let V = new Float32Array(w * h * 4), Wt = new Float32Array(w * h);
  for (let p = 0; p < w * h; p++) if (!hole[p]) { Wt[p] = 1; for (let k = 0; k < 4; k++) V[p * 4 + k] = d[p * 4 + k]; }
  levels.push({ W, H, V, Wt });
  while (W > 1 || H > 1) {
    const nW = Math.max(1, (W + 1) >> 1), nH = Math.max(1, (H + 1) >> 1);
    const nV = new Float32Array(nW * nH * 4), nWt = new Float32Array(nW * nH);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const p = y * W + x, q = (y >> 1) * nW + (x >> 1), wt = Wt[p];
      if (!wt) continue;
      nWt[q] += wt;
      for (let k = 0; k < 4; k++) nV[q * 4 + k] += V[p * 4 + k] * wt;
    }
    for (let q = 0; q < nW * nH; q++) if (nWt[q] > 0) { for (let k = 0; k < 4; k++) nV[q * 4 + k] /= nWt[q]; nWt[q] = Math.min(1, nWt[q]); }
    W = nW; H = nH; V = nV; Wt = nWt;
    levels.push({ W, H, V, Wt });
  }
  for (let l = levels.length - 2; l >= 0; l--) {
    const A = levels[l], B = levels[l + 1];
    for (let y = 0; y < A.H; y++) for (let x = 0; x < A.W; x++) {
      const p = y * A.W + x, wt = A.Wt[p];
      if (wt >= 1) continue;
      const fx = clamp((x + 0.5) / 2 - 0.5, 0, B.W - 1), fy = clamp((y + 0.5) / 2 - 0.5, 0, B.H - 1);
      const x0 = Math.floor(fx), y0 = Math.floor(fy), x1 = Math.min(B.W - 1, x0 + 1), y1 = Math.min(B.H - 1, y0 + 1);
      const ax = fx - x0, ay = fy - y0;
      for (let k = 0; k < 4; k++) {
        const v = lerp(lerp(B.V[(y0 * B.W + x0) * 4 + k], B.V[(y0 * B.W + x1) * 4 + k], ax), lerp(B.V[(y1 * B.W + x0) * 4 + k], B.V[(y1 * B.W + x1) * 4 + k], ax), ay);
        A.V[p * 4 + k] = A.V[p * 4 + k] * wt + v * (1 - wt);
      }
      A.Wt[p] = 1;
    }
  }
  const L0 = levels[0];
  for (let p = 0; p < w * h; p++) if (hole[p]) for (let k = 0; k < 4; k++) d[p * 4 + k] = L0.V[p * 4 + k];
}

/* colores HSL */
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  let h = 0, s = 0;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h /= 6;
  }
  return [h, s, l];
}
function hslToRgb(h, s, l) {
  if (!s) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const f = t => { if (t < 0) t += 1; if (t > 1) t -= 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 0.5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
  return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
}

/* motivos para el tampón de motivo */
const Patterns = {
  list: [['dots', 'Puntos'], ['lines', 'Líneas'], ['check', 'Cuadros'], ['diag', 'Diagonales'], ['grain', 'Grano'], ['cross', 'Cruces']],
  _c: new Map(),
  data(name, color) {
    const k = name + color;
    if (this._c.has(k)) return this._c.get(k);
    const S = 24, c = mkCanvas(S, S), x = ctx2d(c, true);
    x.fillStyle = color;
    x.strokeStyle = color;
    switch (name) {
      case 'dots': x.beginPath(); x.arc(6, 6, 4, 0, 7); x.arc(18, 18, 4, 0, 7); x.fill(); break;
      case 'lines': x.fillRect(0, 0, S, 6); x.fillRect(0, 12, S, 6); break;
      case 'check': x.fillRect(0, 0, 12, 12); x.fillRect(12, 12, 12, 12); break;
      case 'diag': x.lineWidth = 4; for (let i = -S; i < S * 2; i += 12) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + S, S); x.stroke(); } break;
      case 'cross': x.fillRect(10, 2, 4, 20); x.fillRect(2, 10, 20, 4); break;
      default: { const r = mulberry32(3); for (let i = 0; i < 90; i++) x.fillRect(r() * S | 0, r() * S | 0, 2, 2); }
    }
    const v = { w: S, h: S, d: x.getImageData(0, 0, S, S).data };
    this._c.set(k, v);
    return v;
  }
};
