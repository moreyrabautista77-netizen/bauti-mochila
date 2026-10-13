'use strict';
/* =====================================================================
   Maquetas estáticas + posts (Instagram post / story, TikTok, cuadrado)
   ===================================================================== */
const FORMATS = {
  post: { w: 1080, h: 1350, name: 'Post 4:5' },
  square: { w: 1080, h: 1080, name: 'Cuadrado 1:1' },
  story: { w: 1080, h: 1920, name: 'Story / Reel / TikTok 9:16' },
  wide: { w: 1920, h: 1080, name: 'Horizontal 16:9' }
};
const LAYOUTS = [['front', 'Frente'], ['back', 'Espalda'], ['both', 'Frente + espalda'], ['overlap', 'Superpuestas'],
  ['hanger-front', 'En percha (frente)'], ['hanger-back', 'En percha (espalda)'], ['detail', 'Detalle del estampado']];

/* bandas reservadas para logo / textos */
function overlayBands(W, H, m) {
  const u = Math.min(W, H);
  let top = 0, bottom = 0;
  const logo = Assets.get(m.logoAssetId);
  if (logo && m.logoPos === 'top') top += Math.min(u * 0.2, W * m.logoSize * logo.h / logo.w) + u * 0.06;
  if (m.title) top += u * 0.085 + (top ? 0 : u * 0.05);
  if (m.subtitle) top += u * 0.045 + (top ? 0 : u * 0.05);
  if (logo && m.logoPos === 'bottom') bottom += Math.min(u * 0.16, W * m.logoSize * 0.7 * logo.h / logo.w) + u * 0.05;
  if (m.price) bottom += u * 0.1;
  if (m.handle) bottom += u * 0.065;
  if (bottom) bottom += u * 0.02;
  return { top, bottom };
}

function overlayColor(m) { return m.textColor === 'auto' ? (BG.isDark(m) ? '#f4f4f2' : '#141414') : m.textColor; }

function drawOverlays(x, W, H, m, alpha = 1) {
  const u = Math.min(W, H);
  const col = overlayColor(m);
  const font = cssFont(m.font);
  const logo = Assets.get(m.logoAssetId);
  x.save();
  x.globalAlpha = alpha;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  let y = u * 0.05;
  if (logo && m.logoPos === 'top') {
    let lw = W * m.logoSize, lh = lw * logo.h / logo.w;
    if (lh > u * 0.2) { lh = u * 0.2; lw = lh * logo.w / logo.h; }
    x.drawImage(logo.img, (W - lw) / 2, y, lw, lh);
    y += lh + u * 0.025;
  }
  if (m.title) {
    x.fillStyle = col;
    x.font = `800 ${u * 0.07}px ${font}, sans-serif`;
    x.letterSpacing = (u * 0.004) + 'px';
    x.fillText(m.title, W / 2, y + u * 0.04, W * 0.92);
    y += u * 0.085;
  }
  if (m.subtitle) {
    x.fillStyle = col;
    x.globalAlpha = alpha * 0.8;
    x.font = `400 ${u * 0.034}px ${font}, sans-serif`;
    x.letterSpacing = (u * 0.006) + 'px';
    x.fillText(m.subtitle, W / 2, y + u * 0.02, W * 0.92);
    x.globalAlpha = alpha;
  }
  // abajo
  let by = H - u * 0.045;
  if (m.handle) {
    x.fillStyle = col;
    x.globalAlpha = alpha * 0.85;
    x.font = `500 ${u * 0.032}px ${font}, sans-serif`;
    x.letterSpacing = (u * 0.004) + 'px';
    x.fillText(m.handle, W / 2, by);
    x.globalAlpha = alpha;
    by -= u * 0.065;
  }
  if (m.price) {
    x.font = `800 ${u * 0.048}px ${font}, sans-serif`;
    x.letterSpacing = '0px';
    const tw = x.measureText(m.price).width + u * 0.07, th = u * 0.075;
    x.fillStyle = m.accent;
    x.beginPath(); x.roundRect(W / 2 - tw / 2, by - th / 2 - u * 0.01, tw, th, th / 2); x.fill();
    x.fillStyle = lumHex(m.accent) > 0.55 ? '#111' : '#fff';
    x.fillText(m.price, W / 2, by - u * 0.01 + u * 0.002);
    by -= u * 0.1;
  }
  if (logo && m.logoPos === 'bottom') {
    let lw = W * m.logoSize * 0.7, lh = lw * logo.h / logo.w;
    if (lh > u * 0.16) { lh = u * 0.16; lw = lh * logo.w / logo.h; }
    x.drawImage(logo.img, (W - lw) / 2, by - lh + u * 0.02, lw, lh);
  }
  if (m.badge) {
    x.font = `800 ${u * 0.03}px ${font}, sans-serif`;
    x.letterSpacing = (u * 0.004) + 'px';
    const tw = x.measureText(m.badge).width + u * 0.05, th = u * 0.055;
    const bx = u * 0.045, byy = u * 0.045;
    x.fillStyle = m.accent;
    x.beginPath(); x.roundRect(bx, byy, tw, th, u * 0.012); x.fill();
    x.fillStyle = lumHex(m.accent) > 0.55 ? '#111' : '#fff';
    x.textAlign = 'left';
    x.fillText(m.badge, bx + u * 0.025, byy + th / 2 + u * 0.002);
  }
  if (m.logoPos === 'corner' && logo) {
    let lw = u * 0.16, lh = lw * logo.h / logo.w;
    if (lh > u * 0.1) { lh = u * 0.1; lw = lh * logo.w / logo.h; }
    x.globalAlpha = alpha * 0.9;
    x.drawImage(logo.img, W - lw - u * 0.045, u * 0.045, lw, lh);
  }
  x.restore();
}

/* dibuja una remera (textura + sombra) centrada en (cx, cy) con tamaño S */
function placeShirt(x, side, cx, cy, S, m, opts = {}) {
  const size = Math.max(64, Math.round(S));
  const tex = Shirt.render(side, size, opts);
  const top = cy - S * (opts.hanger ? 0.426 : 0.506);
  if (m.shadow > 0) {
    x.save();
    x.globalAlpha = m.shadow * (opts.hanger ? 0.75 : 1);
    const off = opts.hanger ? [S * 0.035, S * 0.045] : [S * 0.01, S * 0.022];
    x.drawImage(Shirt.shadow(Math.min(size, 900)), cx - S / 2 + off[0], top + off[1], S, S);
    x.restore();
  }
  x.drawImage(tex, cx - S / 2, top, S, S);
  if (opts.hanger) Shirt.drawHanger(x, cx, top + 96 * S / 1000, S / 1000);
}

/* ---------- maqueta con foto propia ---------- */
function photoFor(side) {
  const ph = App.project.mockup.photo;
  const a = Assets.get(ph[side].assetId) || Assets.get(ph[side === 'front' ? 'back' : 'front'].assetId);
  return a ? { a, P: ph[side] } : null;
}
const usePhoto = () => App.project.mockup.photo.on && !!photoFor('front');

/* el estampado toma las luces y pliegues de la foto */
const _shadeCache = new Map();
function photoShade(tex, a, P, strength, side) {
  const key = [App.version, P.x, P.y, P.w, P.rot, strength, tex.width, a.w].join('|');
  const hit = _shadeCache.get(side);
  if (hit && hit.key === key) return hit.c;
  const f = Math.min(1, 900 / Math.max(tex.width, tex.height));
  const w = Math.max(1, Math.round(tex.width * f)), h = Math.max(1, Math.round(tex.height * f));
  const c = mkCanvas(w, h), x = ctx2d(c, true);
  x.drawImage(tex, 0, 0, w, h);
  if (strength > 0) {
    const pw = P.w * a.w, ph = pw * DESIGN_H / DESIGN_W;
    const s = mkCanvas(w, h), sx = ctx2d(s, true);
    sx.filter = 'blur(1.5px)';
    sx.translate(w / 2, h / 2);
    sx.scale(w / pw, h / ph);
    sx.rotate(-P.rot * Math.PI / 180);
    sx.drawImage(a.img, -P.x * a.w, -P.y * a.h);
    const sd = sx.getImageData(0, 0, w, h).data;
    const id = x.getImageData(0, 0, w, h), d = id.data;
    let sum = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 20) { sum += 0.299 * sd[i] + 0.587 * sd[i + 1] + 0.114 * sd[i + 2]; n++; }
    const mean = Math.max(4, n ? sum / n : 128);
    for (let i = 0; i < d.length; i += 4) {
      if (!d[i + 3]) continue;
      const l = 0.299 * sd[i] + 0.587 * sd[i + 1] + 0.114 * sd[i + 2];
      const k = Math.pow(clamp((l + 2) / mean, 0.3, 1.8), strength);
      d[i] *= k; d[i + 1] *= k; d[i + 2] *= k;
    }
    x.putImageData(id, 0, 0);
  }
  _shadeCache.set(side, { key, c });
  return c;
}

/* dibuja la foto (cubriendo el rectángulo) + el estampado. zoom>1 centra en el estampado */
function drawPhotoShirt(x, side, rx, ry, rw, rh, zoom = 1) {
  const pf = photoFor(side);
  if (!pf) return null;
  const { a, P } = pf;
  const m = App.project.mockup;
  const s = Math.max(rw / a.w, rh / a.h) * zoom;
  let ox = rx + rw / 2 - a.w * s / 2, oy = ry + rh / 2 - a.h * s / 2;
  if (zoom > 1) { ox = rx + rw / 2 - P.x * a.w * s; oy = ry + rh / 2 - P.y * a.h * s; }
  x.save();
  x.beginPath(); x.rect(rx, ry, rw, rh); x.clip();
  x.drawImage(a.img, ox, oy, a.w * s, a.h * s);
  const pw = P.w * a.w * s, ph = pw * DESIGN_H / DESIGN_W;
  const cx = ox + P.x * a.w * s, cy = oy + P.y * a.h * s;
  if (sideHasContent(side)) {
    const q = [0.0625, 0.125, 0.1875, 0.25, 0.375, 0.5, 0.75, 1].find(v => v >= pw * 1.3 / DESIGN_W) || 1;
    const tex = Shirt.printTexture(renderSide(side, q));
    x.translate(cx, cy);
    x.rotate(P.rot * Math.PI / 180);
    x.globalAlpha = 0.96;
    x.drawImage(photoShade(tex, a, P, m.photo.strength, side), -pw / 2, -ph / 2, pw, ph);
  }
  x.restore();
  return { side, a, P, s, ox, oy, pw, ph, cx, cy };
}

function composeMockup(W, H, layout) {
  const m = App.project.mockup;
  layout = layout || m.layout;
  const c = mkCanvas(W, H), x = ctx2d(c);
  BG.draw(x, W, H, m);
  const bands = overlayBands(W, H, m);
  const u = Math.min(W, H);
  const pad = u * 0.04;
  const bx = pad, by = bands.top + pad * 0.5, bw = W - pad * 2, bh = H - bands.top - bands.bottom - pad;
  const cx = bx + bw / 2, cy = by + bh / 2;
  const k = m.shirtScale;
  const front = sideHasContent('front') || !sideHasContent('back');
  if (usePhoto()) {
    Mockup._xf = null;
    const one = side => { Mockup._xf = drawPhotoShirt(x, side, 0, 0, W, H); };
    switch (layout) {
      case 'both':
        if (W / H > 0.95) { drawPhotoShirt(x, 'front', 0, 0, W / 2, H); drawPhotoShirt(x, 'back', W / 2, 0, W / 2, H); }
        else { drawPhotoShirt(x, 'front', 0, 0, W, H / 2); drawPhotoShirt(x, 'back', 0, H / 2, W, H / 2); }
        x.fillStyle = 'rgba(0,0,0,0.35)';
        if (W / H > 0.95) x.fillRect(W / 2 - 1, 0, 2, H); else x.fillRect(0, H / 2 - 1, W, 2);
        break;
      case 'detail': drawPhotoShirt(x, sideHasContent('front') ? 'front' : 'back', 0, 0, W, H, 2.2); break;
      case 'back': case 'hanger-back': one('back'); break;
      case 'overlap': one(front ? 'front' : 'back'); break;
      default: one('front');
    }
    drawOverlays(x, W, H, m);
    return c;
  }
  switch (layout) {
    case 'back':
    case 'front': {
      const S = Math.min(bw / 0.9, bh / 0.83) * 0.97 * k;
      placeShirt(x, layout, cx, cy, S, m);
      break;
    }
    case 'both': {
      if (bw / bh > 0.95) {
        const S = Math.min(bw / (0.9 * 1.9), bh / 0.83) * 0.98 * k;
        placeShirt(x, 'back', cx + S * 0.44, cy, S, m);
        placeShirt(x, 'front', cx - S * 0.44, cy, S, m);
      } else {
        const S = Math.min(bw / 0.9, bh / (0.83 * 1.92)) * 0.98 * k;
        placeShirt(x, 'front', cx, cy - S * 0.41, S, m);
        placeShirt(x, 'back', cx, cy + S * 0.41, S, m);
      }
      break;
    }
    case 'overlap': {
      const S = Math.min(bw / (0.9 * 1.22), bh / (0.83 * 1.16)) * 0.98 * k;
      placeShirt(x, front ? 'back' : 'front', cx - S * 0.1, cy - S * 0.06, S * 0.94, m);
      placeShirt(x, front ? 'front' : 'back', cx + S * 0.1, cy + S * 0.06, S, m);
      break;
    }
    case 'hanger-front':
    case 'hanger-back': {
      const S = Math.min(bw / 0.9, bh / 0.99) * 0.95 * k;
      placeShirt(x, layout === 'hanger-front' ? 'front' : 'back', cx, cy, S, m, { hanger: true });
      break;
    }
    case 'detail': {
      const side = sideHasContent('front') ? 'front' : 'back';
      const pw = Shirt.PRINT_W * m.printScale, ph = pw * DESIGN_H / DESIGN_W;
      const pcy = Shirt.printTop(side) + (side === 'front' ? m.printYFront : m.printYBack) + ph / 2;
      const S = Math.min(2600, Math.max(W, H) / (ph / 1000) * 0.82);
      const tex = Shirt.render(side, Math.round(S));
      x.drawImage(tex, W / 2 - S / 2, cy - pcy * S / 1000, S, S);
      break;
    }
  }
  drawOverlays(x, W, H, m);
  return c;
}

const Mockup = {
  needs: false, timer: 0, _xf: null, drag: null,
  initPhotoDrag() {
    const cv = $('#mockCanvas');
    const toPx = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * cv.width / r.width, y: (e.clientY - r.top) * cv.height / r.height }; };
    cv.addEventListener('pointerdown', e => {
      const xf = this._xf;
      if (!usePhoto() || !xf) return;
      const p = toPx(e);
      cv.setPointerCapture(e.pointerId);
      this.drag = { p, x0: xf.P.x, y0: xf.P.y, xf };
    });
    cv.addEventListener('pointermove', e => {
      const d = this.drag;
      cv.style.cursor = usePhoto() && this._xf ? 'move' : 'default';
      if (!d) return;
      const p = toPx(e);
      d.xf.P.x = clamp(d.x0 + (p.x - d.p.x) / (d.xf.a.w * d.xf.s), 0, 1);
      d.xf.P.y = clamp(d.y0 + (p.y - d.p.y) / (d.xf.a.h * d.xf.s), 0, 1);
      App.changed(true);
    });
    const up = () => { if (this.drag) { this.drag = null; App.commit(); this.buildPanel(); } };
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', e => {
      const xf = this._xf;
      if (!usePhoto() || !xf) return;
      e.preventDefault();
      xf.P.w = clamp(xf.P.w * Math.exp(-e.deltaY * 0.001), 0.05, 1.2);
      App.changed(true);
      clearTimeout(this._wt);
      this._wt = setTimeout(() => { App.commit(); this.buildPanel(); }, 400);
    }, { passive: false });
  },
  requestRender() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.render(), App.interactive ? 60 : 20);
  },
  render() {
    if (App.view !== 'mockup') return;
    const m = App.project.mockup, f = FORMATS[m.format];
    const cv = $('#mockCanvas');
    const s = App.interactive ? 0.5 : 1;
    const W = Math.round(f.w * s), H = Math.round(f.h * s);
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    fitPreview(cv);
    const out = composeMockup(W, H);
    ctx2d(cv).drawImage(out, 0, 0);
  },
  buildBar() {
    const bar = $('#mockBar');
    bar.innerHTML = '';
    const m = App.project.mockup;
    bar.append(UI.seg(Object.entries(FORMATS).map(([k, v]) => [k, v.name.split(' ')[0] + (k === 'story' ? ' / TikTok' : '')]), () => m.format, v => { m.format = v; App.commit(); }));
    const sel = el('select', {}, LAYOUTS.map(([v, t]) => el('option', { value: v, selected: m.layout === v }, t)));
    sel.onchange = () => { m.layout = sel.value; App.commit(); };
    bar.append(sel, el('span', { class: 'spacer' }),
      el('button', { onclick: () => this.exportOne('png') }, 'Descargar PNG'),
      el('button', { onclick: () => this.exportOne('jpg') }, 'JPG'),
      el('button', { class: 'primary', onclick: () => this.exportCarousel() }, 'Descargar carrusel'));
  },
  buildPanel() {
    this.buildBar();
    const P = $('#mockPanel');
    const st = P.scrollTop;
    P.innerHTML = '';
    const m = App.project.mockup;
    const rb = () => this.buildPanel();
    P.append(UI.sec('Composición', [
      UI.select('Formato', m, 'format', Object.entries(FORMATS).map(([k, v]) => [k, v.name]), { onChange: () => this.buildBar() }),
      UI.select('Vista', m, 'layout', LAYOUTS, { onChange: () => this.buildBar() }),
      UI.range('Tamaño remera', m, 'shirtScale', 0.5, 1.4, 0.01, { def: 1 }),
      UI.range('Tamaño estampa', m, 'printScale', 0.4, 1.6, 0.01, { def: 1 }),
      UI.range('Altura estampa frente', m, 'printYFront', -80, 300, 1, { def: 0 }),
      UI.range('Altura estampa espalda', m, 'printYBack', -60, 300, 1, { def: 0 }),
      UI.range('Arrugas', m, 'wrinkles', 0, 1.5, 0.01, { def: 0.7 }),
      UI.range('Sombra', m, 'shadow', 0, 1, 0.01, { def: 0.55 })
    ], true));
    P.append(this.photoSection(rb));
    const shirt = App.project.shirt;
    P.append(UI.sec('Remera', [UI.color('Color', shirt, 'color', { swatches: ['#141414', '#f3f2ee', '#8e8e90', '#e8dfca', '#4b3a2c', '#1b2236'] })], true));
    P.append(this.bgSection(rb));
    P.append(this.brandSection(rb));
    P.append(UI.sec('Exportar', [
      UI.select('Calidad', m, 'quality', [[1, 'Normal (1080 px)'], [2, 'Alta (2160 px)']]),
      UI.btns([['PNG', () => this.exportOne('png')], ['JPG', () => this.exportOne('jpg')]]),
      UI.btns([['Carrusel (frente, espalda, ambas, detalle)', () => this.exportCarousel()]]),
      UI.btns([['Todos los formatos de esta vista', () => this.exportAllFormats()]]),
      el('p', { class: 'hint' }, 'Para el archivo de imprenta (PNG transparente) usá “Exportar para imprimir” en la pestaña Diseño.')
    ], true));
    P.scrollTop = st;
  },
  photoSection(rb) {
    const ph = App.project.mockup.photo;
    const kids = [
      el('p', { class: 'hint' }, 'Usá tu propia foto de la remera lisa (como las de tu catálogo). El estampado se apoya encima y toma los pliegues de la foto.'),
      UI.check('Usar mi foto como maqueta', ph, 'on', { onChange: rb }),
      UI.btns([[ph.front.assetId ? 'Cambiar foto frente…' : 'Foto frente…', () => pickAsset(id => { ph.front.assetId = id; ph.on = true; App.commit(); rb(); })],
        [ph.back.assetId ? 'Cambiar foto espalda…' : 'Foto espalda (opcional)…', () => pickAsset(id => { ph.back.assetId = id; ph.on = true; App.commit(); rb(); })]])
    ];
    if (ph.back.assetId) kids.push(UI.btns([['Quitar foto espalda', () => { ph.back.assetId = null; App.commit(); rb(); }]]));
    if (ph.on && ph.front.assetId) {
      kids.push(el('p', { class: 'hint' }, 'Arrastrá el estampado sobre la vista previa para moverlo; la rueda del mouse cambia el tamaño.'));
      for (const [s, n] of [['front', 'Frente'], ['back', 'Espalda']]) {
        const P = ph[s];
        kids.push(el('b', { style: 'font-size:12px;margin-top:4px' }, n),
          UI.range('Posición X', P, 'x', 0, 1, 0.001, { dec: 3 }),
          UI.range('Posición Y', P, 'y', 0, 1, 0.001, { dec: 3 }),
          UI.range('Ancho', P, 'w', 0.05, 1.2, 0.001, { dec: 3 }),
          UI.range('Rotación', P, 'rot', -30, 30, 0.1, { def: 0 }));
      }
      kids.push(UI.range('Realismo (pliegues)', ph, 'strength', 0, 1.5, 0.01, { def: 0.8 }));
      kids.push(el('p', { class: 'hint' }, 'El video 360° sigue usando la remera dibujada (la foto no se puede girar).'));
    }
    return UI.sec('Maqueta con tu foto', kids, true, ph.on ? 'activa' : '');
  },
  bgSection(rb) {
    const m = App.project.mockup;
    const kids = [UI.select('Fondo', m, 'bg', [['concrete', 'Cemento claro'], ['concrete-dark', 'Cemento oscuro'], ['solid', 'Color liso'], ['gradient', 'Degradé'], ['studio', 'Estudio (luz central)'], ['image', 'Imagen propia']], { onChange: rb })];
    if (m.bg === 'concrete' || m.bg === 'solid' || m.bg === 'gradient' || m.bg === 'studio') kids.push(UI.color(m.bg === 'studio' ? 'Luz' : 'Color', m, 'bgColor', { swatches: ['#cdc8c0', '#e9e4dc', '#9c968d', '#111111'], onInput: () => BG.cache.clear() }));
    if (m.bg === 'gradient' || m.bg === 'studio') kids.push(UI.color(m.bg === 'studio' ? 'Bordes' : 'Color 2', m, 'bgColor2'));
    if (m.bg === 'image') kids.push(UI.btns([['Elegir imagen de fondo…', () => pickAsset(id => { m.bgAssetId = id; App.commit(); })]]));
    return UI.sec('Fondo', kids, true);
  },
  brandSection(rb) {
    const m = App.project.mockup;
    return UI.sec('Textos y marca', [
      UI.btns([[m.logoAssetId ? 'Cambiar logo…' : 'Subir logo (PNG)…', () => pickAsset(id => { m.logoAssetId = id; App.commit(); rb(); }, true)],
        ...(m.logoAssetId ? [['Quitar logo', () => { m.logoAssetId = null; App.commit(); rb(); }]] : [])]),
      UI.select('Logo', m, 'logoPos', [['top', 'Arriba'], ['bottom', 'Abajo'], ['corner', 'Esquina'], ['none', 'Oculto']]),
      UI.range('Tamaño logo', m, 'logoSize', 0.1, 0.8, 0.01, { def: 0.32 }),
      UI.text('Título', m, 'title', { ph: 'NUEVO DROP' }),
      UI.text('Subtítulo', m, 'subtitle', { ph: 'Oversize · algodón peinado' }),
      UI.text('Precio', m, 'price', { ph: '$25.000' }),
      UI.text('Usuario', m, 'handle', { ph: '@tutienda' }),
      UI.text('Etiqueta', m, 'badge', { ph: 'NEW / SALE / -20%' }),
      UI.select('Fuente', m, 'font', Fonts.all(), { fontPreview: true }),
      UI.select('Color texto', m, 'textColor', [['auto', 'Automático'], ['#141414', 'Negro'], ['#f4f4f2', 'Blanco'], ['#ff7a1a', 'Naranja']]),
      UI.color('Color acento', m, 'accent', { swatches: ['#ff7a1a', '#d0202c', '#141414', '#f4f4f2'] })
    ], true);
  },
  async exportOne(fmt, layout, suffix) {
    const m = App.project.mockup, f = FORMATS[m.format], q = m.quality || 1;
    busy(true, 'Generando imagen…');
    await nextFrame();
    try {
      const c = composeMockup(f.w * q, f.h * q, layout);
      const blob = fmt === 'jpg' ? await canvasToBlob(c, 'image/jpeg', 0.93) : await canvasToBlob(c, 'image/png');
      downloadBlob(blob, `${safeName(App.project.name)}-${m.format}-${suffix || layout || m.layout}.${fmt}`);
    } catch (e) { toast('Error: ' + e.message); console.error(e); }
    busy(false);
  },
  async exportCarousel() {
    const list = [];
    if (sideHasContent('front')) list.push('front');
    if (sideHasContent('back')) list.push('back');
    if (list.length === 2) list.push('both');
    list.push('detail');
    let i = 1;
    for (const l of list) { await this.exportOne('jpg', l, (i++) + '-' + l); await new Promise(r => setTimeout(r, 400)); }
    toast('Carrusel descargado: ' + list.length + ' imágenes');
  },
  async exportAllFormats() {
    const m = App.project.mockup, prev = m.format;
    for (const k of ['post', 'square', 'story']) { m.format = k; await this.exportOne('jpg'); await new Promise(r => setTimeout(r, 400)); }
    m.format = prev;
  }
};

/* sube una imagen como recurso (logo / fondo) */
function pickAsset(cb, png) {
  const inp = $('#fileAsset');
  inp.value = '';
  inp.onchange = async () => {
    const f = inp.files[0];
    if (!f) return;
    const url = await readFile(f);
    const id = await Assets.addImage(url, { maxSide: 2400, jpeg: !png && /jpe?g/i.test(f.type) });
    cb(id);
  };
  inp.click();
}
