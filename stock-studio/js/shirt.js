'use strict';
/* =====================================================================
   Remera oversize procedural (frente / espalda), percha y fondos.
   Geometría en un cuadrado de 1000 x 1000 unidades.
   ===================================================================== */
const Shirt = {
  PRINT_W: 440,
  printTop(side) { return side === 'front' ? 190 : 150; },
  _outline: null,
  outline() {
    if (this._outline) return this._outline;
    const p = new Path2D();
    p.moveTo(395, 92);
    p.quadraticCurveTo(500, 140, 605, 92);
    p.bezierCurveTo(670, 102, 735, 112, 792, 128);
    p.bezierCurveTo(850, 190, 905, 262, 950, 322);
    p.bezierCurveTo(915, 348, 875, 374, 840, 400);
    p.bezierCurveTo(815, 378, 792, 356, 772, 340);
    p.bezierCurveTo(772, 520, 775, 760, 778, 914);
    p.bezierCurveTo(600, 922, 400, 922, 222, 914);
    p.bezierCurveTo(225, 760, 228, 520, 228, 340);
    p.bezierCurveTo(208, 356, 185, 378, 160, 400);
    p.bezierCurveTo(125, 374, 85, 348, 50, 322);
    p.bezierCurveTo(95, 262, 150, 190, 208, 128);
    p.bezierCurveTo(265, 112, 330, 102, 395, 92);
    p.closePath();
    return (this._outline = p);
  },
  neckInterior() {
    const p = new Path2D();
    p.moveTo(395, 92);
    p.quadraticCurveTo(500, 140, 605, 92);
    p.quadraticCurveTo(500, 215, 395, 92);
    p.closePath();
    return p;
  },

  /* pliegues: [puntos (inicio, control, fin), ancho, intensidad] */
  folds: {
    dark: [
      [[232, 350, 290, 334, 350, 352], 34, 0.5], [[768, 350, 710, 334, 650, 352], 34, 0.5],
      [[70, 318, 130, 345, 170, 388], 18, 0.35], [[930, 318, 870, 345, 830, 388], 18, 0.35],
      [[262, 140, 300, 230, 292, 330], 22, 0.3], [[738, 140, 700, 230, 708, 330], 22, 0.3],
      [[300, 560, 380, 610, 440, 700], 28, 0.35], [[690, 470, 630, 560, 600, 650], 26, 0.3],
      [[260, 800, 380, 835, 520, 830], 24, 0.3], [[560, 860, 650, 840, 740, 860], 20, 0.25],
      [[238, 380, 242, 650, 238, 900], 40, 0.35], [[762, 380, 758, 650, 762, 900], 40, 0.35],
      [[240, 906, 500, 913, 760, 906], 22, 0.4], [[420, 420, 470, 470, 455, 540], 22, 0.18]
    ],
    light: [
      [[240, 372, 300, 356, 360, 374], 22, 0.5], [[760, 372, 700, 356, 640, 374], 22, 0.5],
      [[322, 548, 400, 596, 462, 690], 20, 0.42], [[712, 486, 652, 572, 624, 660], 18, 0.36],
      [[280, 780, 390, 812, 520, 806], 18, 0.36], [[330, 150, 420, 138, 470, 150], 16, 0.3],
      [[100, 298, 130, 312, 150, 330], 12, 0.3], [[900, 298, 870, 312, 850, 330], 12, 0.3],
      [[440, 410, 492, 460, 478, 540], 16, 0.22], [[560, 840, 640, 822, 720, 842], 14, 0.25]
    ]
  },
  _foldCache: new Map(),
  foldLayer(size, kind) {
    const k = size + kind;
    if (this._foldCache.has(k)) return this._foldCache.get(k);
    const c = mkCanvas(size, size), x = ctx2d(c), u = size / 1000;
    x.filter = `blur(${(kind === 'dark' ? 17 : 13) * u}px)`;
    x.scale(u, u);
    x.lineCap = 'round';
    for (const [p, w, a] of this.folds[kind]) {
      x.strokeStyle = kind === 'dark' ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a})`;
      x.lineWidth = w;
      x.beginPath();
      x.moveTo(p[0], p[1]);
      x.quadraticCurveTo(p[2], p[3], p[4], p[5]);
      x.stroke();
    }
    this._foldCache.set(k, c);
    return c;
  },
  _fabric: null,
  fabricTile() {
    if (this._fabric) return this._fabric;
    const S = 160, c = mkCanvas(S, S), x = ctx2d(c), id = x.createImageData(S, S), r = mulberry32(3);
    for (let y = 0; y < S; y++) for (let xx = 0; xx < S; xx++) {
      const i = (y * S + xx) * 4;
      const weave = ((xx + (y % 2)) % 2) * 18 + ((y % 3) === 0 ? 10 : 0);
      const v = 110 + r() * 60 + weave;
      id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
      id.data[i + 3] = 22 + r() * 18;
    }
    x.putImageData(id, 0, 0);
    return (this._fabric = c);
  },

  /* textura del estampado: suma trama de tela al diseño */
  printTexture(design) {
    const c = mkCanvas(design.width, design.height), x = ctx2d(c);
    x.drawImage(design, 0, 0);
    x.globalCompositeOperation = 'destination-out';
    x.globalAlpha = 0.5;
    const pat = x.createPattern(this.fabricTile(), 'repeat');
    pat.setTransform(new DOMMatrix().scale(Math.max(0.6, design.width / 900)));
    x.fillStyle = pat;
    x.fillRect(0, 0, c.width, c.height);
    return c;
  },

  /* render de una cara de la remera en un canvas size x size */
  _cache: new Map(),
  render(side, size, o = {}) {
    const color = o.color || App.project.shirt.color;
    const mk = App.project.mockup;
    const printScale = o.printScale ?? mk.printScale;
    const printY = o.printY ?? (side === 'front' ? mk.printYFront : mk.printYBack);
    const wrinkles = o.wrinkles ?? mk.wrinkles;
    const key = [side, size, color, printScale, printY, wrinkles, App.version, o.noDesign ? 1 : 0].join('|');
    const hit = this._cache.get(side + size);
    if (hit && hit.key === key) return hit.c;

    const c = mkCanvas(size, size), x = ctx2d(c), u = size / 1000;
    const P = this.outline();
    const lum = lumHex(color);
    const dark = lum < 0.45;
    x.scale(u, u);
    x.fillStyle = color;
    x.fill(P);
    x.save();
    x.clip(P);

    // estampado
    if (!o.noDesign && sideHasContent(side)) {
      const pw = this.PRINT_W * printScale, ph = pw * DESIGN_H / DESIGN_W;
      const rs = Math.min(1, (pw * u * 1.35) / DESIGN_W);
      const q = [0.0625, 0.125, 0.1875, 0.25, 0.375, 0.5, 0.75, 1].find(s => s >= rs) || 1;
      const design = renderSide(side, q);
      x.globalAlpha = 0.97;
      x.imageSmoothingQuality = 'high';
      x.drawImage(this.printTexture(design), 500 - pw / 2, this.printTop(side) + printY, pw, ph);
      x.globalAlpha = 1;
    }

    // luz general
    const g = x.createLinearGradient(150, 100, 850, 930);
    g.addColorStop(0, dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.10)');
    g.addColorStop(0.5, 'rgba(255,255,255,0)');
    g.addColorStop(1, dark ? 'rgba(0,0,0,0.30)' : 'rgba(0,0,0,0.12)');
    x.fillStyle = g;
    x.fillRect(0, 0, 1000, 1000);

    // pliegues
    x.save();
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.globalAlpha = clamp(wrinkles * (dark ? 0.55 : 0.26), 0, 1);
    x.drawImage(this.foldLayer(size, 'dark'), 0, 0);
    x.globalAlpha = clamp(wrinkles * (dark ? 0.22 : 0.35), 0, 1);
    x.globalCompositeOperation = 'screen';
    x.drawImage(this.foldLayer(size, 'light'), 0, 0);
    x.restore();

    // trama de la tela
    const pat = x.createPattern(this.fabricTile(), 'repeat');
    pat.setTransform(new DOMMatrix().scale(1 / u * Math.max(0.6, u)));
    x.fillStyle = pat;
    x.globalAlpha = dark ? 0.55 : 0.4;
    x.fillRect(0, 0, 1000, 1000);
    x.globalAlpha = 1;

    // cuello
    const rib = dark ? mixHex(color, '#ffffff', 0.06) : mixHex(color, '#000000', 0.05);
    const stitch = dark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.2)';
    x.lineCap = 'round';
    if (side === 'front') {
      x.strokeStyle = rib;
      x.lineWidth = 26;
      x.beginPath(); x.moveTo(395, 92); x.quadraticCurveTo(500, 215, 605, 92); x.stroke();
      const inner = this.neckInterior();
      x.fillStyle = mixHex(color, '#000000', dark ? 0.55 : 0.28);
      x.fill(inner);
      x.save();
      x.clip(inner);
      x.strokeStyle = mixHex(color, '#000000', dark ? 0.2 : 0.12);
      x.lineWidth = 24;
      x.beginPath(); x.moveTo(395, 92); x.quadraticCurveTo(500, 140, 605, 92); x.stroke();
      x.fillStyle = dark ? '#3a3a3a' : '#d8d8d8';
      x.fillRect(486, 124, 28, 13);
      x.fillStyle = dark ? '#9a9a9a' : '#666';
      x.fillRect(491, 129, 18, 2);
      x.restore();
      // sombra debajo del cuello
      x.strokeStyle = 'rgba(0,0,0,0.28)';
      x.lineWidth = 3;
      x.beginPath(); x.moveTo(384, 106); x.quadraticCurveTo(500, 262, 616, 106); x.stroke();
      x.setLineDash([4, 4]);
      x.strokeStyle = stitch;
      x.lineWidth = 1.6;
      x.beginPath(); x.moveTo(388, 100); x.quadraticCurveTo(500, 242, 612, 100); x.stroke();
    } else {
      x.strokeStyle = rib;
      x.lineWidth = 26;
      x.beginPath(); x.moveTo(395, 92); x.quadraticCurveTo(500, 140, 605, 92); x.stroke();
      x.strokeStyle = 'rgba(0,0,0,0.25)';
      x.lineWidth = 3;
      x.beginPath(); x.moveTo(386, 104); x.quadraticCurveTo(500, 168, 614, 104); x.stroke();
      x.setLineDash([4, 4]);
      x.strokeStyle = stitch;
      x.lineWidth = 1.6;
      x.beginPath(); x.moveTo(390, 99); x.quadraticCurveTo(500, 158, 610, 99); x.stroke();
    }
    // costuras
    x.setLineDash([5, 4]);
    x.strokeStyle = stitch;
    x.lineWidth = 1.6;
    x.beginPath(); x.moveTo(58, 311); x.lineTo(168, 389); x.stroke();
    x.beginPath(); x.moveTo(942, 311); x.lineTo(832, 389); x.stroke();
    x.beginPath(); x.moveTo(226, 897); x.bezierCurveTo(400, 905, 600, 905, 774, 897); x.stroke();
    x.setLineDash([]);
    x.strokeStyle = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
    x.lineWidth = 2;
    x.beginPath(); x.moveTo(242, 132); x.quadraticCurveTo(222, 230, 230, 336); x.stroke();
    x.beginPath(); x.moveTo(758, 132); x.quadraticCurveTo(778, 230, 770, 336); x.stroke();
    x.restore();
    // borde
    x.strokeStyle = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.18)';
    x.lineWidth = 1.5;
    x.stroke(P);

    this._cache.set(side + size, { key, c });
    return c;
  },

  /* silueta difuminada para sombras */
  _shadow: new Map(),
  shadow(size) {
    if (this._shadow.has(size)) return this._shadow.get(size);
    const c = mkCanvas(size, size), x = ctx2d(c), u = size / 1000;
    x.filter = `blur(${16 * u}px)`;
    x.scale(u, u);
    x.fillStyle = '#000';
    x.fill(this.outline());
    this._shadow.set(size, c);
    return c;
  },
  _dark: new Map(),
  /* silueta negra (para sombrear la animación 3D) */
  silhouette(size) {
    if (this._dark.has(size)) return this._dark.get(size);
    const c = mkCanvas(size, size), x = ctx2d(c), u = size / 1000;
    x.scale(u, u);
    x.fillStyle = '#000';
    x.fill(this.outline());
    this._dark.set(size, c);
    return c;
  },

  /* percha: gancho metálico + cabezal. (cx, cy) = punto del cuello, u = px por unidad */
  drawHanger(x, cx, cy, u, style = 'metal') {
    x.save();
    x.translate(cx, cy);
    x.scale(u, u);
    x.lineCap = 'round';
    x.lineJoin = 'round';
    const hook = () => {
      x.beginPath();
      x.moveTo(0, 6);
      x.lineTo(0, -48);
      x.bezierCurveTo(0, -78, 40, -84, 44, -112);
      x.bezierCurveTo(48, -146, 6, -156, -10, -134);
    };
    x.strokeStyle = 'rgba(0,0,0,0.30)';
    x.lineWidth = 9;
    x.save(); x.translate(5, 6); hook(); x.stroke(); x.restore();
    const g = x.createLinearGradient(-30, -150, 50, 0);
    g.addColorStop(0, '#8d8d8d'); g.addColorStop(0.35, '#f4f4f4'); g.addColorStop(0.6, '#9b9b9b'); g.addColorStop(1, '#5d5d5d');
    x.strokeStyle = g;
    x.lineWidth = 7;
    hook(); x.stroke();
    x.strokeStyle = 'rgba(255,255,255,0.55)';
    x.lineWidth = 1.6;
    hook(); x.stroke();
    // cabezal
    x.fillStyle = style === 'wood' ? '#8a5a32' : '#1b1b1b';
    x.beginPath(); x.roundRect(-16, -8, 32, 18, 6); x.fill();
    x.fillStyle = 'rgba(255,255,255,0.18)';
    x.beginPath(); x.roundRect(-13, -6, 26, 4, 2); x.fill();
    x.restore();
  }
};

/* =====================================================================
   Fondos: cemento claro / oscuro, liso, degradé, estudio, imagen propia
   ===================================================================== */
const BG = {
  cache: new Map(),
  concrete(W, H, base) {
    const k = 'c' + W + 'x' + H + base;
    if (this.cache.has(k)) return this.cache.get(k);
    const c = mkCanvas(W, H), x = ctx2d(c, true);
    x.fillStyle = base;
    x.fillRect(0, 0, W, H);
    const big = smoothNoise(W, H, 3, 6, 11, 1);
    x.globalCompositeOperation = 'overlay';
    x.globalAlpha = 0.75;
    x.drawImage(big, 0, 0);
    const blot = smoothNoise(W, H, 9, 3, 23, 1.6);
    x.globalCompositeOperation = 'soft-light';
    x.globalAlpha = 0.9;
    x.drawImage(blot, 0, 0);
    x.globalCompositeOperation = 'source-over';
    x.globalAlpha = 1;
    // poros
    const r = mulberry32(42), n = (W * H) / 900;
    for (let i = 0; i < n; i++) {
      x.fillStyle = r() < 0.7 ? `rgba(0,0,0,${0.08 + r() * 0.22})` : `rgba(255,255,255,${0.05 + r() * 0.12})`;
      x.beginPath();
      x.arc(r() * W, r() * H, 0.4 + r() * r() * 2.6, 0, Math.PI * 2);
      x.fill();
    }
    // grano
    const id = x.getImageData(0, 0, W, H), d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = (r() - 0.5) * 22;
      d[i] += v; d[i + 1] += v; d[i + 2] += v;
    }
    x.putImageData(id, 0, 0);
    // viñeta
    const g = x.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.25, W / 2, H / 2, Math.hypot(W, H) * 0.62);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.28)');
    x.fillStyle = g;
    x.fillRect(0, 0, W, H);
    this.cache.set(k, c);
    return c;
  },
  draw(x, W, H, m) {
    switch (m.bg) {
      case 'concrete': x.drawImage(this.concrete(W, H, m.bgColor), 0, 0); break;
      case 'concrete-dark': x.drawImage(this.concrete(W, H, '#3a3937'), 0, 0); break;
      case 'solid': x.fillStyle = m.bgColor; x.fillRect(0, 0, W, H); break;
      case 'gradient': {
        const g = x.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, m.bgColor); g.addColorStop(1, m.bgColor2);
        x.fillStyle = g; x.fillRect(0, 0, W, H); break;
      }
      case 'studio': {
        x.fillStyle = m.bgColor2; x.fillRect(0, 0, W, H);
        const g = x.createRadialGradient(W / 2, H * 0.42, 0, W / 2, H * 0.42, Math.max(W, H) * 0.7);
        g.addColorStop(0, m.bgColor); g.addColorStop(1, m.bgColor2);
        x.fillStyle = g; x.fillRect(0, 0, W, H); break;
      }
      case 'image': {
        const a = Assets.get(m.bgAssetId);
        if (a) {
          const s = Math.max(W / a.w, H / a.h);
          x.drawImage(a.img, (W - a.w * s) / 2, (H - a.h * s) / 2, a.w * s, a.h * s);
        } else { x.fillStyle = '#888'; x.fillRect(0, 0, W, H); }
        break;
      }
      default: x.fillStyle = '#ccc'; x.fillRect(0, 0, W, H);
    }
  },
  isDark(m) {
    if (m.bg === 'concrete-dark') return true;
    if (m.bg === 'image') return false;
    if (m.bg === 'studio' || m.bg === 'gradient') return (lumHex(m.bgColor) + lumHex(m.bgColor2)) / 2 < 0.5;
    return lumHex(m.bgColor) < 0.5;
  }
};
