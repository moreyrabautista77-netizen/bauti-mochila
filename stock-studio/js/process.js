'use strict';
/* =====================================================================
   Motor de procesamiento: ajustes, semitono, stencil, dither, duotono,
   color de acento, fundidos, contorno y desgaste vintage.
   Cada capa se renderiza a un canvas propio (cacheado por configuración).
   ===================================================================== */

const Proc = {
  cache: new Map(),
  key(L, rs) {
    const o = Object.assign({}, L);
    delete o.x; delete o.y; delete o.rot; delete o.opacity; delete o.blend; delete o.visible; delete o.locked; delete o.name; delete o.id;
    let k = JSON.stringify(o) + '|' + rs;
    if (L.maskId) k += '|m' + Assets.rev.get(L.maskId);
    if (L.type === 'text') k += '|f' + Fonts.rev;
    return k;
  },
  get(L, rs, allowStale) {
    const ck = L.id + '@' + rs;
    const c = this.cache.get(ck);
    if (c && allowStale && c.out) return c.out;
    const k = this.key(L, rs);
    if (c && c.key === k) return c.out;
    let out = null;
    try {
      out = L.type === 'image' ? renderImage(L, rs) : L.type === 'text' ? renderText(L, rs) : renderShape(L, rs);
      if (out) out = postProcess(out, L);
    } catch (e) { console.error('render capa', e); }
    this.cache.set(ck, { key: k, out });
    return out;
  },
  /* tamaño de la capa en px de diseño */
  bounds(L, rs = 0.125) {
    const R = this.get(L, rs, true);
    if (!R) return { w: 10, h: 10 };
    return { w: R.canvas.width * R.k - (R.pad || 0) * 2 * R.k, h: R.canvas.height * R.k - (R.pad || 0) * 2 * R.k };
  },
  dropRs(rs) { for (const k of [...this.cache.keys()]) if (k.endsWith('@' + rs)) this.cache.delete(k); },
  prune() {
    if (!App.project) return;
    const ids = new Set();
    for (const s of ['front', 'back']) for (const L of App.project.sides[s].layers) ids.add(L.id);
    for (const k of [...this.cache.keys()]) if (!ids.has(k.split('@')[0])) this.cache.delete(k);
  }
};

/* dibuja una capa en un contexto cuyo sistema de coordenadas es "px de diseño * rs" */
function drawLayer(ctx, L, rs, stale) {
  const R = Proc.get(L, rs, stale);
  if (!R) return;
  ctx.save();
  ctx.globalAlpha = L.opacity;
  ctx.globalCompositeOperation = L.blend || 'source-over';
  ctx.translate(L.x * rs, L.y * rs);
  ctx.rotate(L.rot * Math.PI / 180);
  const w = R.canvas.width * R.k * rs, h = R.canvas.height * R.k * rs;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(R.canvas, -w / 2, -h / 2, w, h);
  ctx.restore();
}

/* compone un lado completo (frente / espalda) */
const SideCache = new Map();
function renderSide(side, rs, opts = {}) {
  const ck = side + '|' + rs + '|' + (opts.bg || '');
  const c0 = SideCache.get(ck);
  if (c0 && c0.v === App.version && !opts.fresh) return c0.c;
  const c = mkCanvas(DESIGN_W * rs, DESIGN_H * rs), x = ctx2d(c);
  if (opts.bg) { x.fillStyle = opts.bg; x.fillRect(0, 0, c.width, c.height); }
  for (const L of App.project.sides[side].layers) if (L.visible) drawLayer(x, L, rs, false);
  if (!opts.fresh) SideCache.set(ck, { v: App.version, c });
  return c;
}
const sideHasContent = side => App.project.sides[side].layers.some(l => l.visible);

/* ---------- curva tonal ---------- */
function toneLUT(a) {
  const lut = new Uint8ClampedArray(256);
  const cf = Math.tan((clamp(a.contrast, -0.98, 0.98) + 1) * Math.PI / 4);
  const ex = Math.pow(2, a.exposure);
  for (let i = 0; i < 256; i++) {
    let v = i / 255 * ex + a.brightness;
    v = (v - a.black) / Math.max(0.01, a.white - a.black);
    v = clamp(v, 0, 1);
    v = Math.pow(v, 1 / Math.max(0.05, a.gamma));
    v = (v - 0.5) * cf + 0.5;
    if (a.invert) v = 1 - v;
    lut[i] = v * 255;
  }
  return lut;
}

function boxBlur(a, w, h, r) {
  if (r < 1) return;
  const t = new Float32Array(a.length), n = 2 * r + 1;
  for (let y = 0; y < h; y++) {
    const o = y * w;
    let s = 0;
    for (let x = -r; x <= r; x++) s += a[o + clamp(x, 0, w - 1)];
    for (let x = 0; x < w; x++) {
      t[o + x] = s / n;
      s += a[o + Math.min(x + r + 1, w - 1)] - a[o + Math.max(x - r, 0)];
    }
  }
  for (let x = 0; x < w; x++) {
    let s = 0;
    for (let y = -r; y <= r; y++) s += t[clamp(y, 0, h - 1) * w + x];
    for (let y = 0; y < h; y++) {
      a[y * w + x] = s / n;
      s += t[Math.min(y + r + 1, h - 1) * w + x] - t[Math.max(y - r, 0) * w + x];
    }
  }
}

/* ---------- capa de imagen ---------- */
function renderImage(L, rs) {
  const A = Assets.get(L.assetId);
  if (!A) return null;
  const W = L.w, H = L.h, cr = L.crop;
  const sx = cr.l * W, sy = cr.t * H;
  const sw = Math.max(1, W * (1 - cr.l - cr.r)), sh = Math.max(1, H * (1 - cr.t - cr.b));
  const bw = sw * L.scale, bh = sh * L.scale;
  let tw = bw * rs, th = bh * rs;
  const f = Math.min(1, 4096 / Math.max(tw, th), Math.sqrt(14e6 / Math.max(1, tw * th)));
  tw = Math.max(1, Math.round(tw * f));
  th = Math.max(1, Math.round(th * f));
  const k = bw / tw;          // px de diseño por px de canvas
  const pr = 1 / k;           // px de canvas por px de diseño
  const adj = L.adj, fx = L.fx;

  const c = mkCanvas(tw, th), ctx = ctx2d(c, true);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.save();
  if (L.flipX || L.flipY) { ctx.translate(L.flipX ? tw : 0, L.flipY ? th : 0); ctx.scale(L.flipX ? -1 : 1, L.flipY ? -1 : 1); }
  if (adj.blur > 0) ctx.filter = `blur(${(adj.blur * pr).toFixed(2)}px)`;
  ctx.drawImage(A.img, sx, sy, sw, sh, 0, 0, tw, th);
  ctx.filter = 'none';
  const M = Assets.get(L.maskId);
  if (M) {
    const ms = M.canvas.width / W;
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(M.canvas, sx * ms, sy * ms, sw * ms, sh * ms, 0, 0, tw, th);
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();

  const id = ctx.getImageData(0, 0, tw, th), d = id.data, N = tw * th;

  if (adj.sharpen > 0) {
    const b = mkCanvas(tw, th), bx = ctx2d(b, true);
    bx.filter = `blur(${Math.max(0.7, 1.1 * Math.sqrt(pr * 3))}px)`;
    bx.drawImage(c, 0, 0);
    const bd = bx.getImageData(0, 0, tw, th).data;
    const amt = adj.sharpen * 2.5;
    for (let i = 0; i < d.length; i += 4) {
      d[i] += (d[i] - bd[i]) * amt;
      d[i + 1] += (d[i + 1] - bd[i + 1]) * amt;
      d[i + 2] += (d[i + 2] - bd[i + 2]) * amt;
    }
  }

  const lut = toneLUT(adj);
  const sat = 1 + adj.saturation;
  const acc = L.accent && L.accent.on ? new Uint8Array(N) : null;
  let ah = 0;
  if (acc) ah = rgbToHsv(...hexToRgb(L.accent.color))[0];
  const arange = L.accent.range, aminS = L.accent.minSat;
  const fd = L.fade;
  const hasFade = fd.edge > 0 || fd.bottom > 0 || fd.top > 0 || fd.left > 0 || fd.right > 0 || fd.radial > 0;
  const cov = new Float32Array(N);
  const lightInk = !fx.invertTone;
  const grain = fx.grain || 0;
  const rnd = mulberry32(1234);

  for (let y = 0, p = 0; y < th; y++) {
    const ny = (y + 0.5) / th;
    for (let x = 0; x < tw; x++, p++) {
      const i = p * 4;
      let r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3];
      let isAcc = false;
      if (acc && a > 8) {
        const mx = r > g ? (r > b ? r : b) : (g > b ? g : b);
        const mn = r < g ? (r < b ? r : b) : (g < b ? g : b);
        const dl = mx - mn, s = mx ? dl / mx : 0;
        if (s >= aminS && mx > 35 && dl) {
          let h;
          if (mx === r) h = ((g - b) / dl) % 6; else if (mx === g) h = (b - r) / dl + 2; else h = (r - g) / dl + 4;
          h *= 60; if (h < 0) h += 360;
          let dh = Math.abs(h - ah); if (dh > 180) dh = 360 - dh;
          if (dh <= arange) { acc[p] = 1; isAcc = true; }
        }
      }
      if (sat !== 1 && !isAcc) {
        const l = 0.299 * r + 0.587 * g + 0.114 * b;
        r = clamp(l + (r - l) * sat, 0, 255); g = clamp(l + (g - l) * sat, 0, 255); b = clamp(l + (b - l) * sat, 0, 255);
      }
      r = lut[r | 0]; g = lut[g | 0]; b = lut[b | 0];
      d[i] = r; d[i + 1] = g; d[i + 2] = b;
      if (hasFade && a) {
        const nx = (x + 0.5) / tw;
        let ff = 1;
        if (fd.edge > 0) ff *= smoothstep(0, fd.edge * 0.5, Math.min(nx, 1 - nx, ny, 1 - ny));
        if (fd.bottom > 0) ff *= smoothstep(0, fd.bottom, 1 - ny);
        if (fd.top > 0) ff *= smoothstep(0, fd.top, ny);
        if (fd.left > 0) ff *= smoothstep(0, fd.left, nx);
        if (fd.right > 0) ff *= smoothstep(0, fd.right, 1 - nx);
        if (fd.radial > 0) {
          const dx = nx - 0.5, dy = ny - 0.5;
          ff *= 1 - smoothstep(1 - fd.radial, 1.02, Math.sqrt(dx * dx + dy * dy) * 2);
        }
        a *= ff;
        d[i + 3] = a;
      }
      let lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      if (grain) lum += (rnd() - 0.5) * grain;
      const v = lightInk ? lum : 1 - lum;
      cov[p] = v < 0 ? 0 : v > 1 ? 1 : v;
    }
  }

  // silueta para el contorno (antes de convertir a puntos)
  let sil = null;
  if (L.post && L.post.outline > 0) {
    sil = mkCanvas(tw, th);
    const sx2 = ctx2d(sil), sd = sx2.createImageData(tw, th);
    for (let p = 0; p < N; p++) if (d[p * 4 + 3] > 100) sd.data[p * 4 + 3] = 255;
    sx2.putImageData(sd, 0, 0);
  }

  const ink = hexToRgb(fx.ink);
  switch (fx.mode) {
    case 'gray':
      for (let p = 0; p < N; p++) {
        if (acc && acc[p]) continue;
        const i = p * 4, l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        d[i] = d[i + 1] = d[i + 2] = l;
      }
      ctx.putImageData(id, 0, 0);
      break;
    case 'ink':
      for (let p = 0; p < N; p++) {
        if (acc && acc[p]) continue;
        const i = p * 4;
        d[i] = ink[0]; d[i + 1] = ink[1]; d[i + 2] = ink[2];
        d[i + 3] = cov[p] * d[i + 3];
      }
      ctx.putImageData(id, 0, 0);
      break;
    case 'stencil': {
      const t = fx.threshold, s = Math.max(0.002, fx.softness);
      for (let p = 0; p < N; p++) {
        if (acc && acc[p]) continue;
        const i = p * 4;
        d[i] = ink[0]; d[i + 1] = ink[1]; d[i + 2] = ink[2];
        d[i + 3] = smoothstep(t - s, t + s, cov[p]) * d[i + 3];
      }
      ctx.putImageData(id, 0, 0);
      break;
    }
    case 'duotone': {
      const A1 = hexToRgb(fx.duoA), B1 = hexToRgb(fx.duoB);
      for (let p = 0; p < N; p++) {
        if (acc && acc[p]) continue;
        const i = p * 4, t = cov[p];
        d[i] = lerp(A1[0], B1[0], t); d[i + 1] = lerp(A1[1], B1[1], t); d[i + 2] = lerp(A1[2], B1[2], t);
        if (fx.duoTransparent) d[i + 3] *= Math.min(1, t * 1.5);
      }
      ctx.putImageData(id, 0, 0);
      break;
    }
    case 'dither':
      ditherRender(ctx, d, cov, tw, th, Math.max(1, Math.round(fx.ditherSize * pr)), fx.ink);
      if (acc) drawAccentSolid(ctx, d, acc, tw, th);
      break;
    case 'halftone':
      halftoneRender(ctx, d, cov, tw, th, fx, pr, acc && L.accent.halftone ? acc : null);
      if (acc && !L.accent.halftone) drawAccentSolid(ctx, d, acc, tw, th);
      break;
    default:
      ctx.putImageData(id, 0, 0);
  }
  return { canvas: c, k, sil };
}

function drawAccentSolid(ctx, d, acc, tw, th) {
  const o = new ImageData(tw, th), od = o.data;
  for (let p = 0; p < acc.length; p++) if (acc[p]) {
    const i = p * 4;
    od[i] = d[i]; od[i + 1] = d[i + 1]; od[i + 2] = d[i + 2]; od[i + 3] = d[i + 3];
  }
  const t = mkCanvas(tw, th);
  ctx2d(t).putImageData(o, 0, 0);
  ctx.drawImage(t, 0, 0);
}

function ditherRender(ctx, d, cov, tw, th, px, inkHex) {
  const gw = Math.ceil(tw / px), gh = Math.ceil(th / px);
  const g = new Float32Array(gw * gh);
  for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) {
    const x = Math.min(tw - 1, gx * px + (px >> 1)), y = Math.min(th - 1, gy * px + (px >> 1));
    const p = y * tw + x;
    g[gy * gw + gx] = cov[p] * d[p * 4 + 3] / 255;
  }
  ctx.clearRect(0, 0, tw, th);
  const path = new Path2D();
  for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
    const i = y * gw + x, o = g[i], n = o >= 0.5 ? 1 : 0, e = o - n;
    if (n) path.rect(x * px, y * px, px, px);
    if (x + 1 < gw) g[i + 1] += e * 7 / 16;
    if (y + 1 < gh) {
      if (x > 0) g[i + gw - 1] += e * 3 / 16;
      g[i + gw] += e * 5 / 16;
      if (x + 1 < gw) g[i + gw + 1] += e * 1 / 16;
    }
  }
  ctx.fillStyle = inkHex;
  ctx.fill(path);
}

function halftoneRender(ctx, d, cov, tw, th, fx, pr, acc) {
  const N = tw * th;
  const cell = Math.max(2, fx.cell * pr);
  const ca = new Float32Array(N);
  for (let p = 0; p < N; p++) ca[p] = cov[p] * d[p * 4 + 3] / 255;
  boxBlur(ca, tw, th, Math.round(cell * fx.smooth * 0.5));
  const sample = (x, y) => {
    x -= 0.5; y -= 0.5;
    let x0 = Math.floor(x), y0 = Math.floor(y);
    const fx_ = x - x0, fy = y - y0;
    const x1 = Math.min(tw - 1, Math.max(0, x0 + 1)), y1 = Math.min(th - 1, Math.max(0, y0 + 1));
    x0 = Math.max(0, Math.min(tw - 1, x0)); y0 = Math.max(0, Math.min(th - 1, y0));
    const a = ca[y0 * tw + x0] + (ca[y0 * tw + x1] - ca[y0 * tw + x0]) * fx_;
    const b = ca[y1 * tw + x0] + (ca[y1 * tw + x1] - ca[y1 * tw + x0]) * fx_;
    return a + (b - a) * fy;
  };
  ctx.clearRect(0, 0, tw, th);
  const ang = fx.angle * Math.PI / 180, cs = Math.cos(ang), sn = Math.sin(ang);
  const R = Math.hypot(tw, th) / 2 + cell;
  const main = new Path2D();
  const colored = new Map();
  const shape = fx.shape, ds = fx.dotScale, minD = fx.minDot;
  const cx = tw / 2, cy = th / 2;
  for (let gy = -R; gy <= R; gy += cell) {
    for (let gx = -R; gx <= R; gx += cell) {
      const px = cx + gx * cs - gy * sn, py = cy + gx * sn + gy * cs;
      if (px < 0 || py < 0 || px >= tw || py >= th) continue;
      let v = sample(px, py);
      if (v < minD) continue;
      if (v > 1) v = 1;
      let path = main;
      const pi = ((py | 0) * tw + (px | 0));
      if ((acc && acc[pi]) || fx.colorDots) {
        const i = pi * 4;
        const key = 'rgb(' + (d[i] & 0xF8) + ',' + (d[i + 1] & 0xF8) + ',' + (d[i + 2] & 0xF8) + ')';
        path = colored.get(key);
        if (!path) { path = new Path2D(); colored.set(key, path); }
      }
      switch (shape) {
        case 'square': {
          const s = cell * Math.sqrt(v) * ds * 0.5;
          const ax = s * cs, ay = s * sn;
          path.moveTo(px - ax + ay, py - ay - ax);
          path.lineTo(px + ax + ay, py + ay - ax);
          path.lineTo(px + ax - ay, py + ay + ax);
          path.lineTo(px - ax - ay, py - ay + ax);
          path.closePath();
          break;
        }
        case 'diamond': {
          const s = cell * Math.sqrt(v) * ds * 0.75;
          path.moveTo(px + s * cs, py + s * sn);
          path.lineTo(px - s * sn, py + s * cs);
          path.lineTo(px - s * cs, py - s * sn);
          path.lineTo(px + s * sn, py - s * cs);
          path.closePath();
          break;
        }
        case 'line': {
          const t = cell * v * ds * 0.5, l = cell * 0.5 + 0.4;
          const ax = l * cs, ay = l * sn, bx = -t * sn, by = t * cs;
          path.moveTo(px - ax - bx, py - ay - by);
          path.lineTo(px + ax - bx, py + ay - by);
          path.lineTo(px + ax + bx, py + ay + by);
          path.lineTo(px - ax + bx, py - ay + by);
          path.closePath();
          break;
        }
        case 'cross': {
          const t = cell * Math.sqrt(v) * ds * 0.22, l = cell * Math.sqrt(v) * ds * 0.6;
          path.rect(px - l, py - t, l * 2, t * 2);
          path.rect(px - t, py - l, t * 2, l * 2);
          break;
        }
        default: {
          const r = cell * 0.5 * Math.SQRT2 * Math.sqrt(v) * ds;
          path.moveTo(px + r, py);
          path.arc(px, py, r, 0, Math.PI * 2);
        }
      }
    }
  }
  ctx.fillStyle = fx.ink;
  ctx.fill(main);
  for (const [col, p] of colored) { ctx.fillStyle = col; ctx.fill(p); }
}

/* ---------- desgaste vintage + contorno ---------- */
let _distressTex = null;
function distressTexture() {
  if (_distressTex) return _distressTex;
  const S = 768;
  const n1 = smoothNoise(S, S, 5, 5, 99, 1.4);
  const n2 = smoothNoise(S, S, 40, 2, 7, 1.6);
  const c = mkCanvas(S, S), x = ctx2d(c, true);
  x.drawImage(n1, 0, 0);
  x.globalAlpha = 0.55;
  x.drawImage(n2, 0, 0);
  x.globalAlpha = 1;
  // rayones
  const r = mulberry32(5);
  x.strokeStyle = '#000';
  for (let i = 0; i < 70; i++) {
    x.lineWidth = 0.6 + r() * 1.6;
    x.globalAlpha = 0.25 + r() * 0.4;
    x.beginPath();
    const px = r() * S, py = r() * S, a = r() * Math.PI, l = 20 + r() * 120;
    x.moveTo(px, py);
    x.quadraticCurveTo(px + Math.cos(a) * l * 0.5 + (r() - 0.5) * 20, py + Math.sin(a) * l * 0.5, px + Math.cos(a) * l, py + Math.sin(a) * l);
    x.stroke();
  }
  // motas
  for (let i = 0; i < 1600; i++) {
    x.globalAlpha = 0.3 + r() * 0.6;
    x.fillStyle = '#000';
    x.beginPath();
    x.arc(r() * S, r() * S, 0.5 + r() * r() * 3, 0, Math.PI * 2);
    x.fill();
  }
  x.globalAlpha = 1;
  // ecualizar histograma → distribución uniforme
  const id = x.getImageData(0, 0, S, S), d = id.data;
  const hist = new Uint32Array(256);
  for (let i = 0; i < d.length; i += 4) hist[d[i]]++;
  const map = new Uint8ClampedArray(256);
  let acc = 0;
  for (let i = 0; i < 256; i++) { acc += hist[i]; map[i] = acc / (S * S) * 255; }
  for (let i = 0; i < d.length; i += 4) d[i] = d[i + 1] = d[i + 2] = map[d[i]];
  x.putImageData(id, 0, 0);
  _distressTex = c;
  return c;
}

function applyDistress(c, amount, scale, pr) {
  const w = c.width, h = c.height;
  const t = mkCanvas(w, h), tx = ctx2d(t, true);
  const pat = tx.createPattern(distressTexture(), 'repeat');
  pat.setTransform(new DOMMatrix().scale(pr * 2.4 * scale));
  tx.fillStyle = pat;
  tx.fillRect(0, 0, w, h);
  const nd = tx.getImageData(0, 0, w, h).data;
  const x = ctx2d(c, true);
  const id = x.getImageData(0, 0, w, h), d = id.data;
  const thr = amount * 0.8;
  for (let i = 0; i < d.length; i += 4) {
    if (!d[i + 3]) continue;
    d[i + 3] *= smoothstep(thr - 0.05, thr + 0.05, nd[i] / 255);
  }
  x.putImageData(id, 0, 0);
}

function postProcess(out, L) {
  const P = L.post;
  if (!P) return out;
  let c = out.canvas, pad = 0;
  const pr = 1 / out.k;
  if (P.outline > 0) {
    const w = P.outline * pr;
    pad = Math.ceil(w) + 2;
    const silSrc = out.sil || c;
    const s = mkCanvas(silSrc.width, silSrc.height), sx = ctx2d(s);
    sx.drawImage(silSrc, 0, 0);
    sx.globalCompositeOperation = 'source-in';
    sx.fillStyle = P.outlineColor;
    sx.fillRect(0, 0, s.width, s.height);
    const o = mkCanvas(c.width + pad * 2, c.height + pad * 2), ox = ctx2d(o);
    const radii = w > 6 ? [w, w * 0.66, w * 0.33] : [w];
    for (const rr of radii) {
      const steps = Math.max(16, Math.ceil(rr * 1.5));
      for (let i = 0; i < steps; i++) {
        const a = i / steps * Math.PI * 2;
        ox.drawImage(s, pad + Math.cos(a) * rr, pad + Math.sin(a) * rr);
      }
    }
    ox.drawImage(s, pad, pad);
    ox.drawImage(c, pad, pad);
    c = o;
  }
  if (P.distress > 0) applyDistress(c, P.distress, P.distressScale || 1, pr);
  return { canvas: c, k: out.k, pad };
}

/* ---------- texto ---------- */
function fontStr(L, px) { return `${L.italic ? 'italic ' : ''}${L.weight || 400} ${px}px ${cssFont(L.font)}, sans-serif`; }

function renderText(L, rs) {
  const s = L.scale * rs, fp = Math.max(1, L.size * s);
  const m = ctx2d(mkCanvas(2, 2));
  m.font = fontStr(L, fp);
  m.letterSpacing = (L.spacing * s) + 'px';
  const lines = String(L.text || ' ').split('\n');
  const sw = (L.strokeWidth || 0) * s;
  const pad = Math.ceil(sw + fp * 0.3 + 2);
  if (L.arc && Math.abs(L.arc) >= 1 && lines.length === 1) return renderArcText(L, rs, fp, sw, pad);
  const widths = lines.map(t => m.measureText(t).width);
  const lh = fp * L.lineHeight;
  const W = Math.ceil(Math.max(...widths, 1) + pad * 2), H = Math.ceil(lh * (lines.length - 1) + fp * 1.3 + pad * 2);
  const c = mkCanvas(W, H), x = ctx2d(c);
  x.font = fontStr(L, fp);
  x.letterSpacing = (L.spacing * s) + 'px';
  x.textBaseline = 'middle';
  x.lineJoin = 'round';
  lines.forEach((t, i) => {
    const y = pad + fp * 0.65 + i * lh;
    const tx = L.align === 'left' ? pad : L.align === 'right' ? W - pad - widths[i] : (W - widths[i]) / 2;
    if (sw > 0) { x.strokeStyle = L.strokeColor; x.lineWidth = sw * 2; x.strokeText(t, tx, y); }
    x.fillStyle = L.color;
    x.fillText(t, tx, y);
  });
  return { canvas: c, k: 1 / rs };
}

function renderArcText(L, rs, fp, sw, pad) {
  const s = L.scale * rs;
  const m = ctx2d(mkCanvas(2, 2));
  m.font = fontStr(L, fp);
  const chars = [...String(L.text)];
  const sp = L.spacing * s;
  const cw = chars.map(ch => m.measureText(ch).width + sp);
  const total = cw.reduce((a, b) => a + b, 0) - sp;
  const arc = clamp(L.arc, -359, 359) * Math.PI / 180;
  const R = total / Math.abs(arc);
  const up = arc > 0;
  const items = [];
  let acc = -total / 2;
  for (let i = 0; i < chars.length; i++) {
    const mid = acc + (cw[i] - sp) / 2;
    const phi = mid / R;
    const x = R * Math.sin(phi);
    const y = up ? -R * Math.cos(phi) : R * Math.cos(phi);
    items.push({ ch: chars[i], x, y, rot: up ? phi : -phi });
    acc += cw[i];
  }
  const e = fp * 0.8 + sw + pad;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const it of items) { minX = Math.min(minX, it.x - e); maxX = Math.max(maxX, it.x + e); minY = Math.min(minY, it.y - e); maxY = Math.max(maxY, it.y + e); }
  const c = mkCanvas(maxX - minX, maxY - minY), x = ctx2d(c);
  x.font = fontStr(L, fp);
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.lineJoin = 'round';
  for (const it of items) {
    x.save();
    x.translate(it.x - minX, it.y - minY);
    x.rotate(it.rot);
    if (sw > 0) { x.strokeStyle = L.strokeColor; x.lineWidth = sw * 2; x.strokeText(it.ch, 0, 0); }
    x.fillStyle = L.color;
    x.fillText(it.ch, 0, 0);
    x.restore();
  }
  return { canvas: c, k: 1 / rs };
}

/* ---------- formas ---------- */
function renderShape(L, rs) {
  const s = L.scale * rs, w = Math.max(1, L.w * s), h = Math.max(1, L.h * s), sw = (L.strokeWidth || 0) * s;
  const pad = Math.ceil(sw + 2);
  const c = mkCanvas(w + pad * 2, h + pad * 2), x = ctx2d(c);
  x.translate(pad, pad);
  x.beginPath();
  if (L.shape === 'ellipse') x.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  else if (L.shape === 'star') {
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.42 : 1;
      x.lineTo(w / 2 + Math.cos(a) * w / 2 * r, h / 2 + Math.sin(a) * h / 2 * r * 1.05 + h * 0.03);
    }
    x.closePath();
  } else if (L.shape === 'triangle') { x.moveTo(w / 2, 0); x.lineTo(w, h); x.lineTo(0, h); x.closePath(); }
  else x.roundRect(0, 0, w, h, Math.min(w, h) / 2 * clamp(L.radius, 0, 1));
  if (L.fillOn) { x.fillStyle = L.fill; x.fill(); }
  if (sw > 0) { x.strokeStyle = L.strokeColor; x.lineWidth = sw; x.lineJoin = 'round'; x.stroke(); }
  return { canvas: c, k: 1 / rs, padPx: pad };
}
