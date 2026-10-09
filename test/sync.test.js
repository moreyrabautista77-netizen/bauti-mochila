import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'analytics-test-'));
let store, meta, util;
before(async () => {
  store = await import('../src/store.js');
  meta = await import('../src/meta.js');
  util = await import('../src/util.js');
});

const json = (body, status = 200) => new Response(JSON.stringify(body), { status });

test('Instagram: guarda la foto del día, reconstruye el historial y suma guardados a las interacciones', async () => {
  const day = (offset) => new Date(Date.now() - offset * 86400e3);
  global.fetch = async (url) => {
    const u = new URL(url);
    if (u.pathname.endsWith('/ig1')) return json({ username: 'tienda', followers_count: 1000, media_count: 1 });
    if (u.pathname.endsWith('/ig1/media')) {
      return json({ data: [{ id: 'm1', media_type: 'VIDEO', media_product_type: 'REELS', timestamp: day(1).toISOString(), like_count: 10, comments_count: 2 }] });
    }
    if (u.pathname.endsWith('/m1/insights')) return json({ data: [{ name: 'saved', values: [{ value: 3 }] }, { name: 'shares', values: [{ value: 1 }] }] });
    if (u.pathname.endsWith('/ig1/insights')) {
      // Ganó 5 ayer y 7 anteayer.
      return json({ data: [{ values: [{ end_time: day(2).toISOString(), value: 7 }, { end_time: day(1).toISOString(), value: 5 }] }] });
    }
    return json({ error: { message: `ruta inesperada ${u.pathname}` } }, 400);
  };

  const account = { id: 'instagram:ig1', network: 'instagram', externalId: 'ig1', token: 't' };
  store.upsertAccount(account);
  await meta.syncInstagram(account);

  const snaps = Object.fromEntries(store.load().snapshots.map((s) => [s.date, s.followers]));
  assert.equal(snaps[util.localDate()], 1000);
  assert.equal(snaps[util.localDate(day(1))], 1000);
  assert.equal(snaps[util.localDate(day(2))], 995);

  const post = store.load().posts['instagram:m1'];
  assert.equal(post.format, 'reel');
  assert.equal(post.interactions, 10 + 2 + 3 + 1);
});

test('OAuth: el state es de un solo uso y de la red correcta', () => {
  const s = store.createOAuthState('meta');
  assert.equal(store.consumeOAuthState(s, 'tiktok'), false);
  const s2 = store.createOAuthState('meta');
  assert.equal(store.consumeOAuthState(s2, 'meta'), true);
  assert.equal(store.consumeOAuthState(s2, 'meta'), false);
});

test('fetchJson: TikTok con error.code "ok" no es un error; Meta con error sí', async () => {
  global.fetch = async () => json({ data: { user: {} }, error: { code: 'ok', message: '' } });
  await util.fetchJson('tiktok', 'https://x');
  global.fetch = async () => json({ error: { message: 'token vencido' } }, 400);
  await assert.rejects(util.fetchJson('meta', 'https://x'), /token vencido/);
});
