'use strict';
/* =====================================================================
   Animación 3D: remera girando 360° en una percha + exportar video
   (MP4 si el navegador lo soporta, si no WebM). Todo local.
   ===================================================================== */
const MOTIONS = [['spinPause', '360° con pausas (frente/espalda)'], ['spin', '360° continuo'], ['flip', 'Giro rápido frente ↔ espalda'], ['sway', 'Balanceo suave']];

const Anim = {
  t0: performance.now(), playing: true, recording: false, tex: null, texKey: '', raf: 0,
  invalidate() { this.texKey = ''; },
  start() {
    cancelAnimationFrame(this.raf);
    const loop = () => {
      this.raf = requestAnimationFrame(loop);
      if (App.view !== 'video' || this.recording) return;
      const cv = $('#vidCanvas');
      const v = App.project.video, f = FORMATS[v.format];
      const s = 0.5;
      const W = Math.round(f.w * s), H = Math.round(f.h * s);
      if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; fitPreview(cv); }
      if (!this.playing) { if (!this._drawn) { this.frame(ctx2d(cv), W, H, this.pauseT || 0); this._drawn = true; } return; }
      this._drawn = false;
      const t = (performance.now() - this.t0) / 1000;
      this.pauseT = t;
      this.frame(ctx2d(cv), W, H, t % this.duration());
      const pl = $('#vidTime');
      if (pl) pl.textContent = (t % this.duration()).toFixed(1) + ' / ' + this.duration().toFixed(1) + ' s';
    };
    loop();
  },
  duration() { const v = App.project.video; return v.period * v.loops; },

  textures(T) {
    const key = App.version + '|' + T;
    if (this.texKey === key && this.tex) return this.tex;
    const front = Shirt.render('front', T);
    const fc = mkCanvas(T, T); ctx2d(fc).drawImage(front, 0, 0);
    const back = Shirt.render('back', T);
    const bc = mkCanvas(T, T); ctx2d(bc).drawImage(back, 0, 0);
    this.tex = { front: fc, back: bc, dark: Shirt.silhouette(T), shadow: Shirt.shadow(Math.min(T, 800)), T };
    this.texKey = key;
    return this.tex;
  },

  /* ángulo de giro y balanceo según el movimiento elegido */
  pose(t) {
    const v = App.project.video, P = v.period;
    const ph = (t % P) / P;
    let th = 0;
    switch (v.motion) {
      case 'spin': th = ph * Math.PI * 2; break;
      case 'spinPause': {
        if (ph < 0.2) th = 0;
        else if (ph < 0.5) th = easeInOut((ph - 0.2) / 0.3) * Math.PI;
        else if (ph < 0.7) th = Math.PI;
        else th = Math.PI + easeInOut((ph - 0.7) / 0.3) * Math.PI;
        break;
      }
      case 'flip': {
        if (ph < 0.38) th = 0;
        else if (ph < 0.5) th = easeInOut((ph - 0.38) / 0.12) * Math.PI;
        else if (ph < 0.88) th = Math.PI;
        else th = Math.PI + easeInOut((ph - 0.88) / 0.12) * Math.PI;
        break;
      }
      case 'sway': th = Math.sin(ph * Math.PI * 2) * 0.45; break;
    }
    const sway = v.sway * (0.045 * Math.sin(t * 2 * Math.PI / (P * 0.5)) + 0.02 * Math.sin(t * 5.1));
    return { th, sway };
  },

  frame(x, W, H, t) {
    const v = App.project.video, m = App.project.mockup;
    x.setTransform(1, 0, 0, 1, 0, 0);
    BG.draw(x, W, H, m);
    const bands = v.showTexts ? overlayBands(W, H, m) : { top: 0, bottom: 0 };
    const u = Math.min(W, H);
    const pad = u * 0.05;
    const bw = W - pad * 2, bh = H - bands.top - bands.bottom - pad * 1.2;
    const hookExtra = v.hanger ? 0.17 : 0.02;
    const S = Math.min(bw / 0.95, bh / (0.83 + hookExtra)) * 0.94 * v.zoom;
    const sc = S / 1000;
    const cx = W / 2;
    const top = bands.top + pad * 0.6 + (bh - S * (0.83 + hookExtra)) / 2 + S * hookExtra;
    const cy = top + (500 - 92) * sc;          // centro (unidad 500) en pantalla
    const pivotY = top;                          // cuello = punto de giro del balanceo
    const T = clamp(Math.round(S * (devicePixelRatio > 1 ? 1.25 : 1.1)), 300, 1600);
    const tex = this.textures(T);
    const { th, sway } = this.pose(t);

    // intro: aparece con zoom suave
    let introK = 1;
    if (v.intro && this.recordingT !== undefined && t < 0.6) introK = easeInOut(t / 0.6);

    x.save();
    x.translate(cx, pivotY);
    x.rotate(sway);
    const zk = 0.94 + 0.06 * introK;
    x.scale(zk, zk);
    x.translate(-cx, -pivotY);
    x.globalAlpha = introK;

    const cos = Math.cos(th), sin = Math.sin(th);
    const F = 2600, B = 38, thick = 10;
    const N = 110, u0 = 40, u1 = 960, du = (u1 - u0) / N;
    const zf = uu => thick + B * (1 - Math.pow((uu - 500) / 470, 2));
    const proj = (X, Z) => {
      const rx = X * cos + Z * sin, rz = -X * sin + Z * cos;
      const p = F / (F - rz);
      return { sx: cx + rx * p * sc, p, rx, rz };
    };
    // sombra en la pared
    if (m.shadow > 0) {
      let mn = Infinity, mx = -Infinity;
      for (let i = 0; i <= N; i += 10) {
        const uu = u0 + i * du;
        for (const sgn of [1, -1]) { const q = proj((uu - 500) * sgn, sgn * zf(uu)); mn = Math.min(mn, q.sx); mx = Math.max(mx, q.sx); }
      }
      x.save();
      x.globalAlpha *= m.shadow * 0.55;
      const sw = (mx - mn) * 1.02;
      x.drawImage(tex.shadow, (mn + mx) / 2 - sw * 0.5 / 0.92 + S * 0.035, cy - 500 * sc + S * 0.05, sw / 0.92, S);
      x.restore();
    }
    const faces = [
      { tex: tex.front, sgn: 1 },
      { tex: tex.back, sgn: -1 }
    ];
    if (cos < 0) faces.reverse();
    // la cara más lejana primero
    faces.reverse();
    const Lx = -0.45, Lz = 0.89, light = v.light;
    for (const f of faces) {
      for (let i = 0; i < N; i++) {
        const ua = u0 + i * du, ub = ua + du;
        const a = proj((ua - 500) * f.sgn, f.sgn * zf(ua));
        const b = proj((ub - 500) * f.sgn, f.sgn * zf(ub));
        if (b.sx <= a.sx) continue;     // cara de atrás
        const pm = (a.p + b.p) / 2;
        const dstY = cy - 500 * pm * sc, dstH = 1000 * pm * sc;
        const srcX = ua * T / 1000, srcW = du * T / 1000;
        const w = b.sx - a.sx + 0.8;
        x.drawImage(f.tex, srcX, 0, srcW, T, a.sx, dstY, w, dstH);
        // sombreado (normal de la tira)
        let tx = b.rx - a.rx, tz = b.rz - a.rz;
        const len = Math.hypot(tx, tz) || 1;
        tx /= len; tz /= len;
        const nx = -tz, nz = tx;
        const diff = Math.max(0, nx * Lx + nz * Lz);
        const dark = (1 - (0.3 + 0.7 * diff)) * light;
        if (dark > 0.01) {
          x.save();
          x.globalAlpha *= Math.min(0.85, dark);
          x.drawImage(tex.dark, srcX, 0, srcW, T, a.sx, dstY, w, dstH);
          x.restore();
        }
      }
    }
    if (v.hanger) Shirt.drawHanger(x, cx, pivotY + 4 * sc, sc);
    x.restore();
    if (v.showTexts) drawOverlays(x, W, H, m, v.intro && this.recordingT !== undefined ? clamp((t - 0.3) / 0.6, 0, 1) : 1);
  },

  buildPanel() {
    const v = App.project.video;
    const bar = $('#vidBar');
    bar.innerHTML = '';
    bar.append(
      el('button', { onclick: e => { this.playing = !this.playing; if (this.playing) this.t0 = performance.now() - (this.pauseT || 0) * 1000; e.currentTarget.textContent = this.playing ? '❚❚ Pausa' : '▶ Reproducir'; } }, this.playing ? '❚❚ Pausa' : '▶ Reproducir'),
      el('button', { onclick: () => { this.t0 = performance.now(); } }, '⟲ Reiniciar'),
      el('span', { id: 'vidTime', class: 'hint' }, ''),
      UI.seg(Object.entries(FORMATS).map(([k, f]) => [k, f.name.split(' ')[0]]), () => v.format, val => { v.format = val; App.commit(); }),
      el('span', { class: 'spacer' }),
      el('div', { class: 'progress', id: 'recProg', style: 'max-width:160px;display:none' }, el('div')),
      el('button', { class: 'primary', id: 'btnRec', onclick: () => this.record() }, '● Exportar video'));
    const P = $('#vidPanel');
    const st = P.scrollTop;
    P.innerHTML = '';
    P.append(UI.sec('Movimiento', [
      UI.select('Animación', v, 'motion', MOTIONS),
      UI.range('Segundos por vuelta', v, 'period', 1.5, 12, 0.1, { def: 4 }),
      UI.range('Vueltas en el video', v, 'loops', 1, 6, 1, { def: 2 }),
      UI.range('Balanceo', v, 'sway', 0, 2, 0.01, { def: 0.5 }),
      UI.range('Zoom', v, 'zoom', 0.5, 1.4, 0.01, { def: 1 }),
      UI.range('Sombreado 3D', v, 'light', 0, 1.2, 0.01, { def: 0.6 }),
      UI.check('Mostrar percha', v, 'hanger'),
      UI.check('Mostrar textos y logo', v, 'showTexts'),
      UI.check('Entrada animada (fade in)', v, 'intro'),
      UI.select('Cuadros por segundo', v, 'fps', [[24, '24 fps'], [30, '30 fps'], [60, '60 fps']])
    ], true));
    P.append(UI.sec('Formato', [
      UI.select('Tamaño', v, 'format', Object.entries(FORMATS).map(([k, f]) => [k, f.name]), { onChange: () => this.buildPanel() }),
      el('p', { class: 'hint' }, 'Story / Reel / TikTok = 1080×1920. El video se graba en tiempo real: dejá esta pestaña visible mientras se exporta.')
    ], true));
    const m = App.project.mockup;
    P.append(UI.sec('Remera', [
      UI.color('Color', App.project.shirt, 'color', { swatches: ['#141414', '#f3f2ee', '#8e8e90', '#e8dfca', '#1b2236'] }),
      UI.range('Tamaño estampa', m, 'printScale', 0.4, 1.6, 0.01, { def: 1 }),
      UI.range('Arrugas', m, 'wrinkles', 0, 1.5, 0.01, { def: 0.7 }),
      UI.range('Sombra', m, 'shadow', 0, 1, 0.01, { def: 0.55 })
    ], false));
    P.append(Mockup.bgSection(() => this.buildPanel()));
    P.append(Mockup.brandSection(() => this.buildPanel()));
    P.scrollTop = st;
  },

  pickMime() {
    const opts = ['video/mp4;codecs=avc1.640028', 'video/mp4;codecs=avc1.42E01E', 'video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
    for (const o of opts) if (window.MediaRecorder && MediaRecorder.isTypeSupported(o)) return o;
    return null;
  },
  async record() {
    if (this.recording) return;
    const mime = this.pickMime();
    if (!mime) { toast('Este navegador no puede grabar video. Usá Chrome o Edge actualizado.'); return; }
    const v = App.project.video, f = FORMATS[v.format];
    const cv = $('#vidCanvas');
    cv.width = f.w; cv.height = f.h;
    fitPreview(cv);
    const x = ctx2d(cv);
    this.recording = true;
    this.recordingT = 0;
    const btn = $('#btnRec'), prog = $('#recProg');
    btn.disabled = true; btn.textContent = 'Grabando…';
    prog.style.display = 'block';
    // pre-render de texturas para que no se trabe el primer cuadro
    this.frame(x, f.w, f.h, 0);
    await nextFrame();
    const stream = cv.captureStream(v.fps);
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: f.w * f.h > 1.5e6 ? 14e6 : 9e6 });
    const chunks = [];
    rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    const done = new Promise(r => (rec.onstop = r));
    const dur = this.duration();
    rec.start(250);
    const t0 = performance.now();
    await new Promise(res => {
      const step = () => {
        const t = (performance.now() - t0) / 1000;
        this.recordingT = t;
        this.frame(x, f.w, f.h, Math.min(t, dur));
        prog.firstChild.style.width = Math.min(100, t / dur * 100) + '%';
        if (t < dur + 0.15) requestAnimationFrame(step); else res();
      };
      step();
    });
    rec.stop();
    await done;
    stream.getTracks().forEach(tr => tr.stop());
    const ext = mime.includes('mp4') ? 'mp4' : 'webm';
    downloadBlob(new Blob(chunks, { type: mime.split(';')[0] }), `${safeName(App.project.name)}-360-${v.format}.${ext}`);
    this.recording = false;
    this.recordingT = undefined;
    btn.disabled = false; btn.textContent = '● Exportar video';
    prog.style.display = 'none';
    toast(ext === 'mp4' ? 'Video MP4 listo para Instagram / TikTok' : 'Video WebM listo (si Instagram no lo acepta, actualizá Chrome para exportar MP4)', 5000);
  }
};
