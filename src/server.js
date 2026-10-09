import 'dotenv/config';
import crypto from 'node:crypto';
import path from 'node:path';
import express from 'express';
import * as store from './store.js';
import * as meta from './meta.js';
import * as tiktok from './tiktok.js';
import { syncAll, startScheduler } from './sync.js';
import { demoData } from './demo.js';
import { localDate } from './util.js';

const PORT = Number(process.env.PORT || 3000);
process.env.PUBLIC_URL = (process.env.PUBLIC_URL || `http://localhost:${PORT}`).replace(/\/$/, '');

const app = express();
app.disable('x-powered-by');
app.use(express.json());

// Contraseña opcional. Obligatoria en la práctica si exponés el panel a internet (túnel, servidor).
const PASSWORD = process.env.DASHBOARD_PASSWORD;
app.use((req, res, next) => {
  // Los callbacks de OAuth los llama el navegador al volver de Meta/TikTok; se validan con `state`.
  if (!PASSWORD || (req.path.startsWith('/auth/') && req.path.endsWith('/callback'))) return next();
  const [, encoded = ''] = (req.headers.authorization || '').split(' ');
  const pass = Buffer.from(encoded, 'base64').toString().split(':').slice(1).join(':');
  const a = crypto.createHash('sha256').update(pass).digest();
  const b = crypto.createHash('sha256').update(PASSWORD).digest();
  if (crypto.timingSafeEqual(a, b)) return next();
  res.set('WWW-Authenticate', 'Basic realm="Stockstore Analytics"').status(401).send('Necesitás la contraseña del panel.');
});

app.use(express.static(path.resolve('public')));

const PROVIDERS = { meta, tiktok };

app.get('/auth/:provider', (req, res) => {
  const provider = PROVIDERS[req.params.provider];
  if (!provider) return res.status(404).send('Proveedor desconocido');
  if (!provider.isConfigured()) {
    return res.redirect(`/?error=${encodeURIComponent(`Faltan las credenciales de ${req.params.provider} en el archivo .env`)}`);
  }
  res.redirect(provider.authUrl(store.createOAuthState(req.params.provider)));
});

app.get('/auth/:provider/callback', async (req, res) => {
  const name = req.params.provider;
  const provider = PROVIDERS[name];
  if (!provider) return res.status(404).send('Proveedor desconocido');
  const { code, state, error, error_description: desc } = req.query;
  if (error) return res.redirect(`/?error=${encodeURIComponent(desc || error)}`);
  if (!store.consumeOAuthState(String(state), name)) {
    return res.redirect(`/?error=${encodeURIComponent('La conexión venció o es inválida. Probá de nuevo.')}`);
  }
  try {
    const connected = await provider.handleCallback(String(code));
    if (!connected.length) {
      return res.redirect(`/?error=${encodeURIComponent('No se encontró ninguna Página de Facebook. Tu Instagram tiene que estar vinculado a una Página.')}`);
    }
    await syncAll();
    res.redirect(`/?connected=${encodeURIComponent(connected.join(' · '))}`);
  } catch (err) {
    res.redirect(`/?error=${encodeURIComponent(err.message)}`);
  }
});

const publicAccount = ({ id, network, name, username, avatar, lastSync, lastError }) => ({
  id, network, name, username, avatar, lastSync: lastSync || null, lastError: lastError || null,
});

app.get('/api/config', (req, res) => {
  res.json({ meta: meta.isConfigured(), tiktok: tiktok.isConfigured(), publicUrl: process.env.PUBLIC_URL });
});

// Devuelve el período pedido y el anterior (para comparar), todo en una sola respuesta.
app.get('/api/overview', (req, res) => {
  const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 365);
  const db = store.load();
  const demo = db.accounts.length === 0;
  const src = demo ? demoData() : { accounts: db.accounts, snapshots: db.snapshots, posts: Object.values(db.posts) };

  const from = new Date(Date.now() - 2 * days * 86400e3);
  const fromDate = localDate(from);
  res.json({
    demo,
    days,
    today: localDate(),
    accounts: src.accounts.map(publicAccount),
    snapshots: src.snapshots.filter((s) => s.date >= fromDate).sort((a, b) => a.date.localeCompare(b.date)),
    posts: src.posts.filter((p) => new Date(p.createdAt) >= from),
  });
});

app.post('/api/sync', async (req, res) => {
  res.json({ results: await syncAll() });
});

app.delete('/api/accounts/:id', (req, res) => {
  store.removeAccount(req.params.id);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Stockstore Analytics en ${process.env.PUBLIC_URL} (puerto ${PORT})`);
  startScheduler();
});
