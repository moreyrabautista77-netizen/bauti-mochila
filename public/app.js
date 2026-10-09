const NETWORKS = {
  facebook: { label: 'Facebook' },
  instagram: { label: 'Instagram' },
  tiktok: { label: 'TikTok' },
};
const FORMAT_LABEL = { reel: 'Reel', video: 'Video', carrusel: 'Carrusel', imagen: 'Imagen', texto: 'Solo texto' };
const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const BLOCKS = ['0–3', '3–6', '6–9', '9–12', '12–15', '15–18', '18–21', '21–24'];

const state = {
  days: Number(localGet('days')) || 30,
  hidden: new Set(JSON.parse(localGet('hiddenNetworks') || '[]')),
  sort: { key: 'createdAt', dir: -1 },
  data: null,
};

const $ = (sel) => document.querySelector(sel);
const nf = new Intl.NumberFormat('es-AR');
const nfCompact = new Intl.NumberFormat('es-AR', { notation: 'compact', maximumFractionDigits: 1 });
const pf = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
const color = (network) => `var(--${network})`;

function localGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
function localSet(k, v) { try { localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } }

function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  }
  for (const c of children) if (c != null) node.append(c);
  return node;
}

function dateAdd(isoDate, days) {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
const fmtDate = (isoDate) => new Date(`${isoDate}T12:00:00Z`).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', timeZone: 'UTC' });

// ---------- Tooltip ----------
const tip = $('#tooltip');
function showTip(x, y, title, rows) {
  tip.replaceChildren(el('div', { class: 't-title', text: title }));
  for (const r of rows) {
    const key = el('span', { class: 'key' });
    if (r.color) key.style.background = r.color;
    tip.append(el('div', { class: 't-row' }, r.color ? key : null, el('strong', { text: r.value }), el('span', { text: r.label })));
  }
  tip.hidden = false;
  const { width, height } = tip.getBoundingClientRect();
  tip.style.left = `${Math.min(x + 14, innerWidth - width - 8)}px`;
  tip.style.top = `${Math.max(8, y - height - 12)}px`;
}
const hideTip = () => { tip.hidden = true; };

// ---------- Datos derivados ----------
function derive() {
  const { data, days, hidden } = state;
  const startDate = dateAdd(data.today, -(days - 1));
  const prevStart = dateAdd(startDate, -days);
  const accounts = data.accounts.filter((a) => !hidden.has(a.network));
  const ids = new Set(accounts.map((a) => a.id));

  const series = new Map();
  for (const a of accounts) series.set(a.id, []);
  for (const s of data.snapshots) if (series.has(s.accountId)) series.get(s.accountId).push(s);

  const followersAt = (accountId, date) => {
    let v = null;
    for (const s of series.get(accountId)) if (s.date <= date) v = s.followers;
    return v;
  };
  const current = new Map(accounts.map((a) => {
    const list = series.get(a.id);
    return [a.id, list.length ? list[list.length - 1].followers : 0];
  }));

  const inRange = (p, from, to) => {
    const d = p.createdAt.slice(0, 10);
    return d >= from && d <= to;
  };
  const withEr = (p) => {
    const f = current.get(p.accountId) || 0;
    return { ...p, er: f ? (p.interactions / f) * 100 : 0 };
  };
  const posts = data.posts.filter((p) => ids.has(p.accountId) && inRange(p, startDate, data.today)).map(withEr);
  const prevPosts = data.posts.filter((p) => ids.has(p.accountId) && inRange(p, prevStart, dateAdd(startDate, -1))).map(withEr);

  return { accounts, series, startDate, prevStart, followersAt, current, posts, prevPosts };
}

const sum = (arr, f) => arr.reduce((acc, x) => acc + (f(x) || 0), 0);
const avg = (arr, f) => (arr.length ? sum(arr, f) / arr.length : 0);

// ---------- KPIs ----------
function deltaNode(now, before, { pct = true, suffix = 'vs. período anterior' } = {}) {
  if (before == null || (pct && !before)) return el('div', { class: 'delta', text: 'sin datos para comparar' });
  const diff = now - before;
  const sign = diff > 0 ? '▲' : diff < 0 ? '▼' : '•';
  const cls = diff > 0 ? 'delta up' : diff < 0 ? 'delta down' : 'delta';
  const txt = pct ? `${pf.format(Math.abs((diff / before) * 100))} %` : nf.format(Math.abs(diff));
  return el('div', { class: cls, text: `${sign} ${txt} ${suffix}` });
}

function renderKpis(d) {
  const totalNow = sum(d.accounts, (a) => d.current.get(a.id));
  const startValues = d.accounts.map((a) => d.followersAt(a.id, d.startDate) ?? d.series.get(a.id)[0]?.followers);
  const totalStart = startValues.every((v) => v != null) ? sum(startValues, (v) => v) : null;
  const inter = sum(d.posts, (p) => p.interactions);
  const prevInter = sum(d.prevPosts, (p) => p.interactions);
  const views = sum(d.posts, (p) => p.views);
  const prevViews = sum(d.prevPosts, (p) => p.views);

  const tile = (label, value, delta) => el('div', { class: 'kpi' }, el('div', { class: 'label', text: label }), el('div', { class: 'value', text: value }), delta);
  $('#kpis').replaceChildren(
    tile('Seguidores totales', nf.format(totalNow), deltaNode(totalNow, totalStart, { pct: false, suffix: `en ${state.days} días` })),
    tile('Interacciones', nfCompact.format(inter), deltaNode(inter, d.prevPosts.length ? prevInter : null)),
    tile('Vistas', nfCompact.format(views), deltaNode(views, d.prevPosts.length ? prevViews : null)),
    tile('Publicaciones', nf.format(d.posts.length), deltaNode(d.posts.length, d.prevPosts.length || null)),
    tile('Engagement promedio', `${pf.format(avg(d.posts, (p) => p.er))} %`, el('div', { class: 'delta', text: 'interacciones ÷ seguidores, por publicación' })),
  );
}

// ---------- Seguidores: un gráfico por red (escalas distintas → nunca doble eje) ----------
function lineChart(container, points, network) {
  const W = Math.max(container.clientWidth, 240);
  const H = 130;
  const m = { l: 52, r: 10, t: 10, b: 22 };
  const iw = W - m.l - m.r;
  const ih = H - m.t - m.b;
  const values = points.map((p) => p.followers);
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (min === max) { min -= 1; max += 1; }
  const pad = (max - min) * 0.12;
  min = Math.max(0, min - pad); max += pad;
  const x = (i) => m.l + (points.length === 1 ? iw / 2 : (i / (points.length - 1)) * iw);
  const y = (v) => m.t + ih - ((v - min) / (max - min)) * ih;
  const ticks = [min, (min + max) / 2, max];
  // Con rangos chicos el formato compacto repite etiquetas ("1,5 K" dos veces): ahí va el número entero.
  const tickFmt = max - min < 3000 ? (t) => nf.format(Math.round(t)) : (t) => nfCompact.format(Math.round(t));

  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.followers).toFixed(1)}`).join('');
  const labelIdx = [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])];
  container.innerHTML = `
    <svg width="${W}" height="${H}" tabindex="0" role="img" aria-label="Seguidores por día">
      ${ticks.map((t) => `<line class="grid" x1="${m.l}" x2="${W - m.r}" y1="${y(t)}" y2="${y(t)}"/>
        <text x="${m.l - 6}" y="${y(t) + 4}" text-anchor="end">${tickFmt(t)}</text>`).join('')}
      <line class="axis" x1="${m.l}" x2="${W - m.r}" y1="${m.t + ih}" y2="${m.t + ih}"/>
      ${labelIdx.map((i) => `<text x="${x(i)}" y="${H - 6}" text-anchor="${i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}">${fmtDate(points[i].date)}</text>`).join('')}
      <path d="${path}" fill="none" stroke="${color(network)}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      <line class="crosshair" y1="${m.t}" y2="${m.t + ih}" visibility="hidden"/>
      <circle r="4.5" fill="${color(network)}" stroke="var(--surface)" stroke-width="2" visibility="hidden"/>
      <rect x="${m.l}" y="0" width="${iw}" height="${H}" fill="transparent"/>
    </svg>`;
  const svg = container.querySelector('svg');
  const cross = svg.querySelector('.crosshair');
  const dot = svg.querySelector('circle');
  let idx = points.length - 1;
  const show = (i, cx, cy) => {
    idx = i;
    const p = points[i];
    cross.setAttribute('x1', x(i)); cross.setAttribute('x2', x(i));
    dot.setAttribute('cx', x(i)); dot.setAttribute('cy', y(p.followers));
    cross.setAttribute('visibility', 'visible'); dot.setAttribute('visibility', 'visible');
    const prev = points[i - 1];
    const rows = [{ color: color(network), value: nf.format(p.followers), label: 'seguidores' }];
    if (prev) rows.push({ value: `${p.followers - prev.followers >= 0 ? '+' : ''}${nf.format(p.followers - prev.followers)}`, label: 'vs. día anterior' });
    showTip(cx, cy, fmtDate(p.date), rows);
  };
  const hide = () => { cross.setAttribute('visibility', 'hidden'); dot.setAttribute('visibility', 'hidden'); hideTip(); };
  svg.addEventListener('pointermove', (e) => {
    const r = svg.getBoundingClientRect();
    const rel = (e.clientX - r.left - m.l) / iw;
    const i = Math.round(Math.min(1, Math.max(0, rel)) * (points.length - 1));
    show(i, e.clientX, e.clientY);
  });
  svg.addEventListener('pointerleave', hide);
  svg.addEventListener('blur', hide);
  svg.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    const i = Math.min(points.length - 1, Math.max(0, idx + (e.key === 'ArrowRight' ? 1 : -1)));
    const r = svg.getBoundingClientRect();
    show(i, r.left + x(i), r.top + y(points[i].followers));
  });
  svg.addEventListener('focus', () => {
    const r = svg.getBoundingClientRect();
    show(idx, r.left + x(idx), r.top + y(points[idx].followers));
  });
}

function renderFollowers(d) {
  const wrap = $('#followerCharts');
  wrap.replaceChildren();
  if (!d.accounts.length) {
    wrap.append(el('div', { class: 'card sub', text: 'No hay redes seleccionadas.' }));
    return;
  }
  const pending = [];
  for (const a of d.accounts) {
    const pts = d.series.get(a.id).filter((s) => s.date >= d.startDate);
    const before = d.followersAt(a.id, dateAdd(d.startDate, -1)) ?? pts[0]?.followers;
    const now = d.current.get(a.id);
    const chart = el('div', { class: 'chart' });
    const card = el('article', { class: 'multiple' },
      el('div', { class: 'multiple-head' },
        el('span', { class: `dot ${a.network}` }),
        el('span', { class: 'name', text: NETWORKS[a.network].label }),
        el('span', { class: 'handle', text: a.username ? `@${a.username.replace(/^@/, '')}` : '' })),
      el('div', { class: 'big', text: nf.format(now) }),
      deltaNode(now, before ?? null, { pct: false, suffix: `en ${state.days} días` }),
      a.lastError ? el('div', { class: 'err', text: `Último error: ${a.lastError}` }) : null,
      chart);
    wrap.append(card);
    pending.push([chart, pts, a.network]);
  }
  // Se dibuja después de agregar todas las tarjetas: recién ahí la grilla tiene el ancho final de cada una.
  for (const [chart, pts, network] of pending) {
    if (pts.length >= 2) lineChart(chart, pts, network);
    else chart.append(el('p', { class: 'sub', text: 'Todavía no hay historial. La curva se arma con cada sincronización diaria.' }));
  }
}

// ---------- Mejor momento: mapa de calor día × franja horaria ----------
function renderHeatmap(d) {
  const box = $('#heatmap');
  const cells = Array.from({ length: 7 }, () => Array.from({ length: 8 }, () => ({ n: 0, er: 0 })));
  for (const p of d.posts) {
    const dt = new Date(p.createdAt);
    const day = (dt.getDay() + 6) % 7;
    const c = cells[day][Math.floor(dt.getHours() / 3)];
    c.n += 1; c.er += p.er;
  }
  const flat = cells.flat().filter((c) => c.n).map((c) => c.er / c.n);
  if (!flat.length) { box.replaceChildren(el('p', { class: 'sub', text: 'Sin publicaciones en el período.' })); return; }
  const max = Math.max(...flat);
  const step = (v) => (v <= 0 ? 0 : Math.min(5, Math.ceil((v / max) * 5)));

  const W = Math.max(box.clientWidth, 300);
  const m = { l: 34, t: 4, b: 20 };
  const cw = (W - m.l) / 8;
  const ch = 26;
  const H = m.t + ch * 7 + m.b;
  let html = `<svg width="${W}" height="${H}" role="img" aria-label="Engagement promedio por día y hora">`;
  cells.forEach((row, r) => {
    html += `<text x="${m.l - 6}" y="${m.t + r * ch + ch / 2 + 4}" text-anchor="end">${DAYS[r]}</text>`;
    row.forEach((c, k) => {
      const v = c.n ? c.er / c.n : 0;
      html += `<rect class="cell" tabindex="0" data-r="${r}" data-k="${k}" x="${m.l + k * cw}" y="${m.t + r * ch}" width="${cw}" height="${ch}" rx="4" fill="var(--seq-${c.n ? Math.max(1, step(v)) : 0})"/>`;
    });
  });
  BLOCKS.forEach((b, k) => { html += `<text x="${m.l + k * cw + cw / 2}" y="${H - 5}" text-anchor="middle">${b}</text>`; });
  html += '</svg>';
  box.innerHTML = html;
  const legend = el('div', { class: 'legend' }, el('span', { text: 'menos' }));
  for (let i = 1; i <= 5; i++) { const s = el('span', { class: 'swatch' }); s.style.background = `var(--seq-${i})`; legend.append(s); }
  legend.append(el('span', { text: 'más engagement' }));
  box.append(legend);

  const onCell = (e, target) => {
    const c = cells[target.dataset.r][target.dataset.k];
    const title = `${DAYS[target.dataset.r]} · ${BLOCKS[target.dataset.k]} h`;
    const rows = c.n
      ? [{ value: `${pf.format(c.er / c.n)} %`, label: 'engagement promedio' }, { value: nf.format(c.n), label: c.n === 1 ? 'publicación' : 'publicaciones' }]
      : [{ value: '—', label: 'sin publicaciones' }];
    const r = target.getBoundingClientRect();
    showTip(e.clientX ?? r.right, e.clientY ?? r.top, title, rows);
  };
  box.querySelectorAll('.cell').forEach((cell) => {
    cell.addEventListener('pointermove', (e) => onCell(e, cell));
    cell.addEventListener('focus', () => { const r = cell.getBoundingClientRect(); onCell({ clientX: r.right, clientY: r.top }, cell); });
    cell.addEventListener('pointerleave', hideTip);
    cell.addEventListener('blur', hideTip);
  });
}

// ---------- Formatos: barras horizontales, una sola serie ----------
function renderFormats(d) {
  const box = $('#formats');
  const groups = new Map();
  for (const p of d.posts) {
    const g = groups.get(p.format) || { n: 0, inter: 0, er: 0 };
    g.n += 1; g.inter += p.interactions; g.er += p.er;
    groups.set(p.format, g);
  }
  const rows = [...groups.entries()].map(([f, g]) => ({ f, n: g.n, er: g.er / g.n, inter: g.inter / g.n })).sort((a, b) => b.er - a.er);
  if (!rows.length) { box.replaceChildren(el('p', { class: 'sub', text: 'Sin publicaciones en el período.' })); return; }
  const W = Math.max(box.clientWidth, 300);
  const m = { l: 82, r: 92 };
  const bh = 18; const gap = 14;
  const H = rows.length * (bh + gap);
  const max = Math.max(...rows.map((r) => r.er));
  let html = `<svg width="${W}" height="${H}" role="img" aria-label="Engagement promedio por formato">`;
  rows.forEach((r, i) => {
    const y = i * (bh + gap) + gap / 2;
    const w = Math.max(4, ((W - m.l - m.r) * r.er) / max);
    html += `<text x="${m.l - 8}" y="${y + bh / 2 + 4}" text-anchor="end" style="fill:var(--text-2)">${FORMAT_LABEL[r.f] || r.f}</text>
      <rect class="bar" tabindex="0" data-i="${i}" x="${m.l}" y="${y}" width="${w}" height="${bh}" rx="4" fill="var(--text-2)"/>
      <text x="${m.l + w + 8}" y="${y + bh / 2 + 4}" style="fill:var(--text)">${pf.format(r.er)} %</text>
      <text x="${m.l + w + 58}" y="${y + bh / 2 + 4}">(${r.n})</text>`;
  });
  html += '</svg>';
  box.innerHTML = html;
  box.querySelectorAll('.bar').forEach((bar) => {
    const r = rows[bar.dataset.i];
    const show = (x, y) => showTip(x, y, FORMAT_LABEL[r.f] || r.f, [
      { value: `${pf.format(r.er)} %`, label: 'engagement promedio' },
      { value: nf.format(Math.round(r.inter)), label: 'interacciones promedio' },
      { value: nf.format(r.n), label: 'publicaciones' },
    ]);
    bar.addEventListener('pointermove', (e) => show(e.clientX, e.clientY));
    bar.addEventListener('focus', () => { const b = bar.getBoundingClientRect(); show(b.right, b.top); });
    bar.addEventListener('pointerleave', hideTip);
    bar.addEventListener('blur', hideTip);
  });
}

// ---------- Tabla de publicaciones ----------
function renderTable(d) {
  const { key, dir } = state.sort;
  const val = (p) => (key === 'createdAt' ? p.createdAt : p[key] ?? -1);
  const rows = [...d.posts].sort((a, b) => (val(a) > val(b) ? dir : val(a) < val(b) ? -dir : 0));
  const num = (v) => el('td', { class: 'num', text: v == null ? '—' : nf.format(v) });
  const tbody = $('#postsTable tbody');
  tbody.replaceChildren(...rows.slice(0, 100).map((p) => {
    const text = (p.text || '(sin texto)').slice(0, 140);
    const textCell = el('td', { class: 'text-col' });
    if (p.url && /^https:\/\//.test(p.url)) textCell.append(el('a', { href: p.url, target: '_blank', rel: 'noopener noreferrer', text }));
    else textCell.append(text);
    textCell.append(el('div', { class: 'fmt', text: FORMAT_LABEL[p.format] || p.format }));
    return el('tr', {},
      el('td', { text: new Date(p.createdAt).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }),
      el('td', {}, el('span', { class: 'net' }, el('span', { class: `dot ${p.network}` }), NETWORKS[p.network].label)),
      textCell, num(p.views), num(p.likes), num(p.comments), num(p.shares), num(p.saves),
      el('td', { class: 'num', text: `${pf.format(p.er)} %` }));
  }));
  $('#postsCount').textContent = rows.length > 100 ? `mostrando 100 de ${nf.format(rows.length)}` : `${nf.format(rows.length)} en el período`;
  document.querySelectorAll('#postsTable th[data-sort]').forEach((th) => {
    th.classList.toggle('sorted', th.dataset.sort === key);
    th.setAttribute('aria-sort', th.dataset.sort === key ? (dir > 0 ? 'ascending' : 'descending') : 'none');
  });
}

// ---------- Filtros ----------
function renderFilters() {
  document.querySelectorAll('#periodSeg button').forEach((b) => b.setAttribute('aria-checked', String(Number(b.dataset.days) === state.days)));
  const present = [...new Set(state.data.accounts.map((a) => a.network))];
  $('#networkSeg').replaceChildren(...present.map((n) => {
    const b = el('button', { 'aria-pressed': String(!state.hidden.has(n)) }, el('span', { class: `dot ${n}` }), NETWORKS[n].label);
    b.addEventListener('click', () => {
      state.hidden.has(n) ? state.hidden.delete(n) : state.hidden.add(n);
      localSet('hiddenNetworks', JSON.stringify([...state.hidden]));
      render();
    });
    return b;
  }));
  $('#networkSeg').hidden = present.length < 2;
}

function render() {
  if (!state.data) return;
  $('#demoBanner').hidden = !state.data.demo;
  renderFilters();
  const d = derive();
  renderKpis(d);
  renderFollowers(d);
  renderHeatmap(d);
  renderFormats(d);
  renderTable(d);
}

async function load() {
  document.body.classList.add('loading');
  try {
    const res = await fetch(`/api/overview?days=${state.days}`);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    state.data = await res.json();
    render();
  } catch (err) {
    flash(`No se pudieron cargar los datos: ${err.message}`, 'error');
  } finally {
    document.body.classList.remove('loading');
  }
}

function flash(msg, kind) {
  const f = $('#flash');
  f.textContent = msg;
  f.className = `flash ${kind}`;
  f.hidden = false;
}

// ---------- Cuentas ----------
async function openAccounts() {
  const [config] = await Promise.all([fetch('/api/config').then((r) => r.json()), state.data ? null : load()]);
  const list = $('#accountList');
  const accounts = state.data.demo ? [] : state.data.accounts;
  list.replaceChildren(...accounts.map((a) => {
    const btn = el('button', { class: 'btn', text: 'Desconectar' });
    btn.addEventListener('click', async () => {
      if (!confirm(`¿Desconectar ${NETWORKS[a.network].label} (${a.username})? Se borra su historial guardado.`)) return;
      await fetch(`/api/accounts/${encodeURIComponent(a.id)}`, { method: 'DELETE' });
      await load();
      openAccounts();
    });
    const status = a.lastError
      ? el('div', { class: 'err', text: a.lastError })
      : el('div', { text: a.lastSync ? `Sincronizada ${new Date(a.lastSync).toLocaleString('es-AR')}` : 'Sin sincronizar' });
    return el('li', {}, el('span', { class: `dot ${a.network}` }),
      el('div', { class: 'meta' }, el('div', { text: `${NETWORKS[a.network].label} · ${a.username}` }), status), btn);
  }));
  if (!accounts.length) list.append(el('li', { class: 'sub', text: 'Ninguna cuenta conectada todavía.' }));
  $('#connectMeta').setAttribute('aria-disabled', String(!config.meta));
  $('#connectTiktok').setAttribute('aria-disabled', String(!config.tiktok));
  const missing = [!config.meta && 'Meta (META_APP_ID / META_APP_SECRET)', !config.tiktok && 'TikTok (TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET)'].filter(Boolean);
  $('#configHint').textContent = missing.length
    ? `Para habilitar los botones completá en el archivo .env: ${missing.join(' y ')}. Los pasos están en el README.`
    : `Dirección de retorno configurada: ${config.publicUrl}`;
  const dlg = $('#accountsDialog');
  if (!dlg.open) dlg.showModal();
}

// ---------- Eventos ----------
document.querySelectorAll('#periodSeg button').forEach((b) => b.addEventListener('click', () => {
  state.days = Number(b.dataset.days);
  localSet('days', state.days);
  load();
}));
document.querySelectorAll('#postsTable th[data-sort]').forEach((th) => th.addEventListener('click', () => {
  const key = th.dataset.sort;
  state.sort = { key, dir: state.sort.key === key ? -state.sort.dir : -1 };
  render();
}));
$('#connectBtn').addEventListener('click', openAccounts);
$('#closeDialog').addEventListener('click', () => $('#accountsDialog').close());
$('#syncBtn').addEventListener('click', async () => {
  const btn = $('#syncBtn');
  btn.disabled = true; btn.textContent = 'Sincronizando…';
  try {
    const { results } = await fetch('/api/sync', { method: 'POST' }).then((r) => r.json());
    const failed = results.filter((r) => !r.ok);
    if (!results.length) flash('No hay cuentas conectadas para sincronizar.', 'error');
    else if (failed.length) flash(`Fallaron ${failed.length} de ${results.length} cuentas: ${failed.map((f) => f.error).join(' | ')}`, 'error');
    else flash(`Listo: ${results.length} cuentas sincronizadas.`, 'ok');
    await load();
  } finally {
    btn.disabled = false; btn.textContent = 'Sincronizar';
  }
});
let resizeTimer;
addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(render, 150); });

const params = new URLSearchParams(location.search);
if (params.get('error')) flash(params.get('error'), 'error');
if (params.get('connected')) flash(`Conectado: ${params.get('connected')}`, 'ok');
if (params.size) history.replaceState(null, '', '/');
load();
