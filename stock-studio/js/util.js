'use strict';
/* ---------- helpers genéricos ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

function el(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'style') e.style.cssText = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
    else if (k in e && typeof v !== 'string') e[k] = v;
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) {
    if (kid === null || kid === undefined || kid === false) continue;
    e.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return e;
}

function mkCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}
const ctx2d = (c, read) => c.getContext('2d', read ? { willReadFrequently: true } : undefined);

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
function smoothstep(a, b, x) {
  if (a === b) return x < a ? 0 : 1;
  let t = (x - a) / (b - a);
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return t * t * (3 - 2 * t);
}
const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-3);
const deepClone = o => JSON.parse(JSON.stringify(o));

function hexToRgb(h) {
  h = String(h || '#000').replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16) || 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const rgbToHex = (r, g, b) => '#' + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
function rgbToHsv(r, g, b) {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d) {
    if (mx === r) h = ((g - b) / d) % 6;
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60; if (h < 0) h += 360;
  }
  return [h, mx ? d / mx : 0, mx / 255];
}
function mixHex(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex(lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t));
}
const lumHex = h => { const [r, g, b] = hexToRgb(h); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let _toastT = 0;
function toast(msg, ms = 2600) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_toastT);
  _toastT = setTimeout(() => t.classList.remove('show'), ms);
}
function busy(on, msg) {
  $('#busy').classList.toggle('show', !!on);
  if (msg) $('#busyMsg').textContent = msg;
}
const nextFrame = () => new Promise(r => requestAnimationFrame(() => setTimeout(r, 0)));

function downloadBlob(blob, name) {
  const a = el('a', { href: URL.createObjectURL(blob), download: name });
  document.body.append(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
}
const canvasToBlob = (c, type = 'image/png', q) => new Promise(r => c.toBlob(r, type, q));
function readFile(file, as = 'dataURL') {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    if (as === 'text') fr.readAsText(file); else if (as === 'buffer') fr.readAsArrayBuffer(file); else fr.readAsDataURL(file);
  });
}
function loadImage(src) {
  return new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error('No se pudo leer la imagen'));
    i.src = src;
  });
}
const safeName = s => (String(s || 'diseno').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ñ/gi, 'n').trim().replace(/[^\w\- ]+/g, '').replace(/\s+/g, '-') || 'diseno');

/* ---------- ruido procedural (texturas de cemento, tela, desgaste) ---------- */
function smoothNoise(w, h, base, octaves, seed, contrast = 1) {
  const c = mkCanvas(w, h), x = ctx2d(c);
  x.fillStyle = '#808080';
  x.fillRect(0, 0, w, h);
  const r = mulberry32(seed);
  for (let o = 0; o < octaves; o++) {
    const gw = Math.max(2, Math.round(base * 2 ** o)), gh = Math.max(2, Math.round(base * 2 ** o * h / w));
    const s = mkCanvas(gw, gh), sx = ctx2d(s);
    const id = sx.createImageData(gw, gh);
    for (let i = 0; i < gw * gh; i++) {
      const v = 128 + (r() - 0.5) * 255 * contrast;
      id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v;
      id.data[i * 4 + 3] = 255;
    }
    sx.putImageData(id, 0, 0);
    x.globalAlpha = o === 0 ? 1 : 0.55 / o;
    x.imageSmoothingEnabled = true;
    x.imageSmoothingQuality = 'high';
    x.filter = `blur(${(w / gw) * 0.35}px)`;
    x.drawImage(s, -w * 0.05, -h * 0.05, w * 1.1, h * 1.1);
    x.filter = 'none';
  }
  x.globalAlpha = 1;
  return c;
}

/* ---------- fuentes ---------- */
const Fonts = {
  rev: 0,
  candidates: ['Impact', 'Arial Black', 'Bahnschrift', 'Segoe UI', 'Franklin Gothic Medium', 'Haettenschweiler',
    'Old English Text MT', 'Stencil', 'Copperplate Gothic Bold', 'Engravers MT', 'Algerian', 'Bauhaus 93',
    'Georgia', 'Times New Roman', 'Garamond', 'Bodoni MT', 'Courier New', 'Consolas', 'Lucida Console',
    'Segoe Script', 'Brush Script MT', 'Lucida Handwriting', 'Ink Free', 'Gabriola', 'Freestyle Script', 'Kunstler Script',
    'Trebuchet MS', 'Verdana', 'Tahoma', 'Arial', 'Arial Narrow', 'Century Gothic', 'Comic Sans MS',
    'Helvetica', 'Futura', 'Avenir', 'Didot', 'Snell Roundhand', 'Marker Felt', 'DejaVu Sans', 'Liberation Sans', 'Noto Sans'],
  list: [],
  custom: [],
  detect(name) {
    const c = this._c || (this._c = ctx2d(mkCanvas(10, 10)));
    const s = 'mmmmmmmmmmlli1WQ@#Ññ';
    for (const b of ['monospace', 'serif', 'sans-serif']) {
      c.font = `72px ${b}`;
      const w0 = c.measureText(s).width;
      c.font = `72px "${name}", ${b}`;
      if (c.measureText(s).width !== w0) return true;
    }
    return false;
  },
  init() {
    this.list = this.candidates.filter(f => this.detect(f));
    if (!this.list.length) this.list = ['sans-serif'];
  },
  all() { return [...this.custom, ...this.list, 'sans-serif', 'serif', 'monospace', 'cursive']; },
  pick(...prefs) { for (const p of prefs) if (this.list.includes(p) || this.custom.includes(p)) return p; return this.list[0] || 'sans-serif'; },
  async addFromURL(family, url) {
    try {
      const ff = new FontFace(family, `url(${url})`);
      await ff.load();
      document.fonts.add(ff);
      if (!this.custom.includes(family)) this.custom.unshift(family);
      this.rev++;
      return true;
    } catch (e) { console.warn(e); return false; }
  }
};
const cssFont = f => (/^(sans-serif|serif|monospace|cursive)$/.test(f) ? f : `"${f}"`);

/* ajusta el tamaño visible de un canvas de vista previa a su contenedor */
function fitPreview(cv) {
  const p = cv.parentElement;
  if (!p) return;
  const w = p.clientWidth - 48, h = p.clientHeight - 48;
  if (w <= 0 || h <= 0) return;
  const s = Math.min(w / cv.width, h / cv.height);
  cv.style.width = Math.floor(cv.width * s) + 'px';
  cv.style.height = Math.floor(cv.height * s) + 'px';
}
