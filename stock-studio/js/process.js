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
    for (const k of ['x', 'y', 'rot', 'opacity', 'blend', 'visible', 'locked', 'name', 'id', 'sx', 'sy', 'warp', 'clip', 'style']) delete o[k];
    let k = JSON.stringify(o) + '|' + rs;
    const st = L.style;
    if (st && (st.overlay || st.grad)) k += JSON.stringify([st.overlay, st.ovColor, st.ovOpacity, st.grad, st.grA, st.grB, st.grAngle, st.grOpacity]);
    if (L.maskId) k += '|m' + Assets.rev.get(L.maskId);
    if (L.assetId) { const a = Assets.get(L.assetId); k += '|a' + (a ? a.live || 0 : 0); }
    if (L.type === 'text') k += '|f' + Fonts.rev;
    return k;
  },
  get(L, rs, allowStale) {
    if (L.type === 'adjust') return null;
    const ck = L.id + '@' + rs;
    const c = this.cache.get(ck);
    if (c && allowStale && c.out) return c.out;
    const k = this.key(L, rs);
    if (c && c.key === k) return c.out;
    let out = null;
    try {
      if (L.type === 'image') Assets.syncRev(L.assetId, L.pix || 0);
      out = L.type === 'image' ? renderImage(L, rs) : L.type === 'text' ? renderText(L, rs) : L.type === 'path' ? renderPath(L, rs) : renderShape(L, rs);
      if (out) out = postProcess(out, L);
    } catch (e) { console.error('render capa', e); }
    this.cache.set(ck, { key: k, out });
    return out;
  },
  /* tamaño de la capa en px de diseño (sin escala libre) */
  bounds(L, rs = 0.125) {
    if (L.type === 'adjust') return { w: DESIGN_W, h: DESIGN_H };
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

/* silueta difuminada de una capa (sombra / resplandor) */
function styleSil(R, kind, color, blurDesign) {
  const blur = Math.max(0, blurDesign / R.k);
  const key = kind + color + blur.toFixed(1);
  if (R['_' + kind] && R['_' + kind].key === key) return R['_' + kind];
  const pad = Math.ceil(blur * 2) + 2;
  const s = mkCanvas(R.canvas.width, R.canvas.height), sx = ctx2d(s);
  sx.drawImage(R.canvas, 0, 0);
  sx.globalCompositeOperation = 'source-in';
  sx.fillStyle = color;
  sx.fillRect(0, 0, s.width, s.height);
  const c = mkCanvas(s.width + pad * 2, s.height + pad * 2), x = ctx2d(c);
  if (blur > 0) x.filter = `blur(${blur}px)`;
  x.drawImage(s, pad, pad);
  return (R['_' + kind] = { key, c, pad });
}

/* dibuja una imagen deformada (arco, ola, bandera, inflar…) */
function drawWarped(ctx, img, x, y, w, h, warp) {
  if (!warp || warp.type === 'none' || !warp.amount) { ctx.drawImage(img, x, y, w, h); return; }
  const N = 64, iw = img.width, ih = img.height, a = warp.amount;
  for (let i = 0; i < N; i++) {
    const u = (i + 0.5) / N, t = 2 * u - 1;
    let dy = 0, sy = 1;
    switch (warp.type) {
      case 'arc': dy = -a * h * 0.25 * (1 - t * t); break;
      case 'wave': dy = a * h * 0.12 * Math.sin(u * Math.PI * 4); break;
      case 'flag': dy = a * h * 0.14 * Math.sin(u * Math.PI * 2) * u; break;
      case 'bulge': sy = 1 + a * 0.4 * (1 - t * t); break;
      case 'pinch': sy = 1 - a * 0.4 * (1 - t * t); break;
      case 'rise': dy = -a * h * 0.3 * (u - 0.5); break;
    }
    ctx.drawImage(img, i / N * iw, 0, iw / N, ih, x + i / N * w, y + dy + h * (1 - sy) / 2, w / N + 0.7, h * sy);
  }
}

/* dibuja una capa en un contexto cuyo sistema de coordenadas es "px de diseño * rs" */
function drawLayer(ctx, L, rs, stale, o = {}) {
  if (L.type === 'adjust') return;
  const R = Proc.get(L, rs, stale);
  if (!R) return;
  const w = R.canvas.width * R.k * rs, h = R.canvas.height * R.k * rs;
  const st = L.style;
  ctx.save();
  ctx.globalAlpha = o.noAlpha ? 1 : L.opacity;
  ctx.globalCompositeOperation = o.op || L.blend || 'source-over';
  ctx.imageSmoothingQuality = 'high';
  ctx.translate(L.x * rs, L.y * rs);
  const place = (img, pad, dx = 0, dy = 0) => {
    ctx.save();
    ctx.translate(dx, dy);
    ctx.rotate(L.rot * Math.PI / 180);
    ctx.scale(L.sx || 1, L.sy || 1);
    const k = R.k * rs;
    drawWarped(ctx, img, -w / 2 - pad * k, -h / 2 - pad * k, w + pad * 2 * k, h + pad * 2 * k, L.warp);
    ctx.restore();
  };
  if (st && !o.noStyle) {
    if (st.shadow) {
      const S = styleSil(R, 'sh', st.shColor, st.shBlur);
      const a = ctx.globalAlpha; ctx.globalAlpha = a * st.shOpacity;
      place(S.c, S.pad, st.shX * rs, st.shY * rs);
      ctx.globalAlpha = a;
    }
    if (st.glow) {
      const S = styleSil(R, 'gl', st.glColor, st.glBlur);
      const a = ctx.globalAlpha; ctx.globalAlpha = a * st.glOpacity;
      place(S.c, S.pad); place(S.c, S.pad);
      ctx.globalAlpha = a;
    }
  }
  place(R.canvas, 0);
  ctx.restore();
}

/* capa de ajuste: modifica todo lo que está debajo */
function applyAdjust(acc, A, rs) {
  const W = acc.width, H = acc.height;
  const t = mkCanvas(W, H), x = ctx2d(t, true);
  const f = [];
  if (A.brightness !== 100) f.push(`brightness(${A.brightness}%)`);
  if (A.contrast !== 100) f.push(`contrast(${A.contrast}%)`);
  if (A.saturate !== 100) f.push(`saturate(${A.saturate}%)`);
  if (A.hue) f.push(`hue-rotate(${A.hue}deg)`);
  if (A.grayscale) f.push(`grayscale(${A.grayscale}%)`);
  if (A.sepia) f.push(`sepia(${A.sepia}%)`);
  if (A.invert) f.push(`invert(${A.invert}%)`);
  if (A.blur) f.push(`blur(${A.blur * rs}px)`);
  x.filter = f.length ? f.join(' ') : 'none';
  x.drawImage(acc, 0, 0);
  x.filter = 'none';
  if (A.threshold > 0 || A.posterize > 1 || A.halftone) {
    const id = x.getImageData(0, 0, W, H), d = id.data;
    if (A.posterize > 1) { const st = 255 / (A.posterize - 1); for (let i = 0; i < d.length; i += 4) for (let k = 0; k < 3; k++) d[i + k] = Math.round(d[i + k] / st) * st; }
    if (A.threshold > 0) for (let i = 0; i < d.length; i += 4) { const l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; d[i] = d[i + 1] = d[i + 2] = l >= A.threshold * 2.55 ? 255 : 0; }
    if (A.halftone) {
      const cov = new Float32Array(W * H);
      for (let p = 0; p < W * H; p++) { const i = p * 4, l = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255; cov[p] = A.htInvert ? 1 - l : l; }
      halftoneRender(x, d, cov, W, H, { cell: A.htCell, angle: A.htAngle, shape: A.htShape, dotScale: 1, minDot: 0.04, smooth: 0.6, colorDots: A.htColor, ink: A.htInk }, rs, null);
    } else x.putImageData(id, 0, 0);
  }
  const ax = ctx2d(acc);
  ax.save();
  if (A.opacity >= 1) { ax.clearRect(0, 0, W, H); ax.drawImage(t, 0, 0); }
  else { ax.globalAlpha = A.opacity; ax.drawImage(t, 0, 0); }
  ax.restore();
}

/* compone todas las capas de un lado (con ajustes y máscaras de recorte) */
function composeLayers(side, rs, opts = {}) {
  const W = Math.round(DESIGN_W * rs), H = Math.round(DESIGN_H * rs);
  const c = mkCanvas(W, H), x = ctx2d(c);
  if (opts.bg) { x.fillStyle = opts.bg; x.fillRect(0, 0, W, H); }
  const layers = App.project.sides[side].layers;
  for (let i = 0; i < layers.length; i++) {
    const L = layers[i];
    if (!L.visible) continue;
    if (L.type === 'adjust') { applyAdjust(c, L, rs); continue; }
    if (L.clip) {
      let b = null;
      for (let j = i - 1; j >= 0; j--) { const B = layers[j]; if (B.type === 'adjust') continue; if (!B.clip) { b = B; break; } }
      if (b) {
        const t = mkCanvas(W, H), tx = ctx2d(t);
        if (b.visible) {
          drawLayer(tx, L, rs, opts.stale, { op: 'source-over' });
          drawLayer(tx, b, rs, opts.stale, { noStyle: true, noAlpha: true, op: 'destination-in' });
        }
        x.save();
        x.globalCompositeOperation = L.blend || 'source-over';
        x.drawImage(t, 0, 0);
        x.restore();
        continue;
      }
    }
    drawLayer(x, L, rs, opts.stale);
  }
  return c;
}

/* compone un lado completo (frente / espalda) */
const SideCache = new Map();
function renderSide(side, rs, opts = {}) {
  const ck = side + '|' + rs + '|' + (opts.bg || '');
  const c0 = SideCache.get(ck);
  if (c0 && c0.v === App.version && !opts.fresh) return c0.c;
  const c = composeLayers(side, rs, { bg: opts.bg });
  if (!opts.fresh) SideCache.set(ck, { v: App.version, c });
  return c;
}
const sideHasContent = side => App.project.sides[side].layers.some(l => l.visible && l.type !== 'adjust');

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
  const P = L.post || { outline: 0, distress: 0 };
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
  const st = L.style;
  if (st && (st.overlay || st.grad)) {
    const x = ctx2d(c);
    x.save();
    x.globalCompositeOperation = 'source-atop';
    if (st.grad) {
      const a = st.grAngle * Math.PI / 180, cx = c.width / 2, cy = c.height / 2, r = Math.hypot(cx, cy);
      const g = x.createLinearGradient(cx - Math.cos(a) * r, cy - Math.sin(a) * r, cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      g.addColorStop(0, st.grA); g.addColorStop(1, st.grB);
      x.globalAlpha = st.grOpacity; x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
    }
    if (st.overlay) { x.globalAlpha = st.ovOpacity; x.fillStyle = st.ovColor; x.fillRect(0, 0, c.width, c.height); }
    x.restore();
  }
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
  if (L.vertical) return renderVerticalText(L, rs, fp, sw, pad, lines);
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

function renderVerticalText(L, rs, fp, sw, pad, lines) {
  const s = L.scale * rs;
  const m = ctx2d(mkCanvas(2, 2));
  m.font = fontStr(L, fp);
  const colW = fp * L.lineHeight * 1.05, step = fp * 1.0 + L.spacing * s;
  const maxN = Math.max(...lines.map(t => [...t].length), 1);
  const W = Math.ceil(colW * lines.length + pad * 2), H = Math.ceil(step * maxN + pad * 2);
  const c = mkCanvas(W, H), x = ctx2d(c);
  x.font = fontStr(L, fp);
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.lineJoin = 'round';
  lines.forEach((t, li) => {
    const cx = pad + colW * (li + 0.5);
    [...t].forEach((ch, i) => {
      const cy = pad + step * (i + 0.5);
      if (sw > 0) { x.strokeStyle = L.strokeColor; x.lineWidth = sw * 2; x.strokeText(ch, cx, cy); }
      x.fillStyle = L.color;
      x.fillText(ch, cx, cy);
    });
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
const SHAPES = [['rect', 'Rectángulo'], ['rrect', 'Rect. redondeado'], ['ellipse', 'Elipse'], ['polygon', 'Polígono'], ['star', 'Estrella'],
  ['triangle', 'Triángulo'], ['line', 'Línea'], ['arrow', 'Flecha'], ['heart', 'Corazón'], ['bolt', 'Rayo'], ['crown', 'Corona'],
  ['bubble', 'Globo de texto'], ['check', 'Tilde'], ['ring', 'Anillo']];
function shapePath(x, kind, w, h, L) {
  x.beginPath();
  switch (kind) {
    case 'ellipse': x.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); break;
    case 'ring': x.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); x.ellipse(w / 2, h / 2, w * 0.32, h * 0.32, 0, 0, Math.PI * 2, true); break;
    case 'star': for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.42 : 1; x.lineTo(w / 2 + Math.cos(a) * w / 2 * r, h / 2 + Math.sin(a) * h / 2 * r * 1.05 + h * 0.03); } x.closePath(); break;
    case 'polygon': { const n = Math.max(3, L.sides || 6); for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / n; x.lineTo(w / 2 + Math.cos(a) * w / 2, h / 2 + Math.sin(a) * h / 2); } x.closePath(); break; }
    case 'triangle': x.moveTo(w / 2, 0); x.lineTo(w, h); x.lineTo(0, h); x.closePath(); break;
    case 'line': x.rect(0, 0, w, h); break;
    case 'arrow': x.moveTo(0, h * 0.35); x.lineTo(w * 0.62, h * 0.35); x.lineTo(w * 0.62, 0); x.lineTo(w, h / 2); x.lineTo(w * 0.62, h); x.lineTo(w * 0.62, h * 0.65); x.lineTo(0, h * 0.65); x.closePath(); break;
    case 'heart': x.moveTo(w / 2, h * 0.95); x.bezierCurveTo(-w * 0.15, h * 0.45, w * 0.15, -h * 0.15, w / 2, h * 0.25); x.bezierCurveTo(w * 0.85, -h * 0.15, w * 1.15, h * 0.45, w / 2, h * 0.95); x.closePath(); break;
    case 'bolt': [[0.58, 0], [0.12, 0.56], [0.45, 0.56], [0.36, 1], [0.88, 0.4], [0.54, 0.4], [0.7, 0]].forEach(([a, b], i) => (i ? x.lineTo(a * w, b * h) : x.moveTo(a * w, b * h))); x.closePath(); break;
    case 'crown': [[0, 0.25], [0.25, 0.6], [0.5, 0], [0.75, 0.6], [1, 0.25], [0.9, 1], [0.1, 1]].forEach(([a, b], i) => (i ? x.lineTo(a * w, b * h) : x.moveTo(a * w, b * h))); x.closePath(); break;
    case 'bubble': x.roundRect(0, 0, w, h * 0.78, Math.min(w, h) * 0.15); x.moveTo(w * 0.2, h * 0.7); x.lineTo(w * 0.12, h); x.lineTo(w * 0.42, h * 0.74); x.closePath(); break;
    case 'check': x.moveTo(0, h * 0.55); x.lineTo(w * 0.18, h * 0.38); x.lineTo(w * 0.38, h * 0.62); x.lineTo(w * 0.82, 0); x.lineTo(w, h * 0.17); x.lineTo(w * 0.38, h); x.closePath(); break;
    case 'rrect': x.roundRect(0, 0, w, h, Math.min(w, h) / 2 * Math.max(0.15, clamp(L.radius, 0, 1))); break;
    default: x.roundRect(0, 0, w, h, Math.min(w, h) / 2 * clamp(L.radius, 0, 1));
  }
}
function renderShape(L, rs) {
  const s = L.scale * rs, w = Math.max(1, L.w * s), h = Math.max(1, L.h * s), sw = (L.strokeWidth || 0) * s;
  const pad = Math.ceil(sw + 2);
  const c = mkCanvas(w + pad * 2, h + pad * 2), x = ctx2d(c);
  x.translate(pad, pad);
  shapePath(x, L.shape, w, h, L);
  if (L.fillOn) { x.fillStyle = L.fill; x.fill('evenodd'); }
  if (sw > 0) { x.strokeStyle = L.strokeColor; x.lineWidth = sw; x.lineJoin = 'round'; x.stroke(); }
  return { canvas: c, k: 1 / rs, padPx: pad };
}

/* ---------- trazados de pluma ---------- */
function pathFromPts(x, pts, closed, smooth, s, ox, oy) {
  const P = pts.map(p => ({ x: p.x * s + ox, y: p.y * s + oy }));
  if (!P.length) return;
  x.moveTo(P[0].x, P[0].y);
  if (!smooth || P.length < 3) { for (let i = 1; i < P.length; i++) x.lineTo(P[i].x, P[i].y); if (closed) x.closePath(); return; }
  const n = P.length, get = i => closed ? P[(i + n) % n] : P[clamp(i, 0, n - 1)];
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    x.bezierCurveTo(p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6, p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6, p2.x, p2.y);
  }
  if (closed) x.closePath();
}
function pathBox(pts) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of pts) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
  return { x0, y0, x1, y1 };
}
function renderPath(L, rs) {
  const s = L.scale * rs, sw = (L.strokeWidth || 0) * s;
  const b = pathBox(L.pts);
  const ext = Math.max(Math.abs(b.x0), Math.abs(b.x1)) * 1.15, eyt = Math.max(Math.abs(b.y0), Math.abs(b.y1)) * 1.15;
  const pad = Math.ceil(sw + 4);
  const c = mkCanvas(ext * 2 * s + pad * 2, eyt * 2 * s + pad * 2), x = ctx2d(c);
  x.beginPath();
  pathFromPts(x, L.pts, L.closed, L.smooth, s, c.width / 2, c.height / 2);
  if (L.fillOn && L.closed) { x.fillStyle = L.fill; x.fill(); }
  if (sw > 0) { x.strokeStyle = L.strokeColor; x.lineWidth = sw; x.lineJoin = 'round'; x.lineCap = 'round'; x.stroke(); }
  return { canvas: c, k: 1 / rs };
}
