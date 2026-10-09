import * as store from './store.js';
import { syncFacebook, syncInstagram } from './meta.js';
import { syncTikTok } from './tiktok.js';

const SYNCERS = { facebook: syncFacebook, instagram: syncInstagram, tiktok: syncTikTok };

let running = null;

// Sincroniza todas las cuentas. Si ya hay una sincronización en curso, devuelve esa misma.
export function syncAll() {
  running ??= (async () => {
    const results = [];
    for (const account of [...store.load().accounts]) {
      try {
        const info = await SYNCERS[account.network](account);
        store.upsertAccount({ id: account.id, ...info, lastSync: new Date().toISOString(), lastError: null });
        results.push({ id: account.id, ok: true });
      } catch (err) {
        store.upsertAccount({ id: account.id, lastError: err.message, lastErrorAt: new Date().toISOString() });
        results.push({ id: account.id, ok: false, error: err.message });
      }
    }
    store.save();
    return results;
  })().finally(() => {
    running = null;
  });
  return running;
}

export function startScheduler() {
  const hours = Number(process.env.SYNC_EVERY_HOURS || 6);
  const tick = () => {
    if (store.load().accounts.length) syncAll().catch((err) => console.error('sync:', err.message));
  };
  tick();
  return setInterval(tick, hours * 3600e3);
}
