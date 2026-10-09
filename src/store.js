// Almacenamiento local en un archivo JSON (data/db.json).
// Es una app de un solo usuario: no hace falta una base de datos.
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = process.env.DATA_DIR || path.resolve('data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const EMPTY = () => ({ accounts: [], snapshots: [], posts: {}, oauthStates: {} });

let db = null;

export function load() {
  if (db) return db;
  try {
    db = { ...EMPTY(), ...JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) };
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    db = EMPTY();
  }
  return db;
}

export function save() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, DB_FILE);
}

export function upsertAccount(account) {
  const d = load();
  const i = d.accounts.findIndex((a) => a.id === account.id);
  if (i >= 0) d.accounts[i] = { ...d.accounts[i], ...account };
  else d.accounts.push({ connectedAt: new Date().toISOString(), ...account });
  save();
}

export function removeAccount(id) {
  const d = load();
  d.accounts = d.accounts.filter((a) => a.id !== id);
  d.snapshots = d.snapshots.filter((s) => s.accountId !== id);
  for (const [pid, p] of Object.entries(d.posts)) if (p.accountId === id) delete d.posts[pid];
  save();
}

// Una foto por cuenta y por día: si ya existe la del día, se pisa.
export function putSnapshot(snap) {
  const d = load();
  const i = d.snapshots.findIndex((s) => s.accountId === snap.accountId && s.date === snap.date);
  if (i >= 0) d.snapshots[i] = { ...d.snapshots[i], ...snap };
  else d.snapshots.push(snap);
}

export function hasSnapshot(accountId, date) {
  return load().snapshots.some((s) => s.accountId === accountId && s.date === date);
}

export function putPost(post) {
  load().posts[post.id] = post;
}

// Estados OAuth de un solo uso (protección CSRF), válidos 15 minutos.
export function createOAuthState(network) {
  const d = load();
  const now = Date.now();
  for (const [k, v] of Object.entries(d.oauthStates)) if (now - v.at > 15 * 60e3) delete d.oauthStates[k];
  const state = crypto.randomUUID();
  d.oauthStates[state] = { network, at: now };
  save();
  return state;
}

export function consumeOAuthState(state, network) {
  const d = load();
  const entry = d.oauthStates[state];
  delete d.oauthStates[state];
  save();
  return Boolean(entry && entry.network === network && Date.now() - entry.at <= 15 * 60e3);
}
