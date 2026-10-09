// Datos de ejemplo para ver el panel funcionando antes de conectar cuentas reales.
// Son inventados y la interfaz lo muestra claramente.
import { localDate } from './util.js';

function rng(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

const ACCOUNTS = [
  { id: 'demo:facebook', network: 'facebook', name: 'Stockstore', username: 'Stockstore', start: 1180, growth: 2.1, reach: 0.05 },
  { id: 'demo:instagram', network: 'instagram', name: 'stockstore.arg', username: 'stockstore.arg', start: 4620, growth: 9.5, reach: 0.06 },
  { id: 'demo:tiktok', network: 'tiktok', name: 'stockstore.ar', username: 'stockstore.ar', start: 8900, growth: 24, reach: 0.09 },
];

const TEXTS = [
  'Llegó stock nuevo 🔥 consultá talles por DM',
  'Unboxing del pedido de la semana',
  '3 formas de combinar el mismo buzo',
  'Envíos a todo el país, mirá cómo lo empaquetamos',
  'Precio mayorista vs minorista: te explico',
  'Últimas unidades, se van rápido',
  'Así elegimos a los proveedores',
  'Reseña real de un cliente',
  'Detrás de escena: armando los pedidos',
  'Promo de fin de semana',
];

const FORMATS = {
  facebook: ['imagen', 'video', 'texto'],
  instagram: ['reel', 'carrusel', 'imagen'],
  tiktok: ['video'],
};

// Horario: los posts a la noche rinden más, para que el mapa de calor muestre algo.
const HOUR_BOOST = (h) => (h >= 19 && h <= 22 ? 1.6 : h >= 12 && h <= 14 ? 1.2 : h < 9 ? 0.6 : 1);

export function demoData() {
  const r = rng(42);
  const days = 120;
  const now = new Date();
  const snapshots = [];
  const posts = [];

  for (const a of ACCOUNTS) {
    let followers = a.start;
    for (let i = days; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 86400e3);
      followers += Math.round(a.growth * (0.4 + r() * 1.4) + (r() < 0.05 ? a.growth * 6 : 0));
      snapshots.push({ accountId: a.id, date: localDate(date), followers });

      const perDay = a.network === 'tiktok' ? 0.55 : a.network === 'instagram' ? 0.45 : 0.3;
      if (r() < perDay) {
        const hour = Math.floor(r() * 15) + 8;
        date.setHours(hour, Math.floor(r() * 60), 0, 0);
        const formats = FORMATS[a.network];
        const format = formats[Math.floor(r() * formats.length)];
        const formatBoost = format === 'reel' || format === 'video' ? 1.5 : format === 'carrusel' ? 1.2 : format === 'texto' ? 0.5 : 1;
        const viral = r() < 0.06 ? 4 + r() * 6 : 1;
        const reach = Math.round(followers * a.reach * 6 * HOUR_BOOST(hour) * formatBoost * viral * (0.5 + r()));
        const views = a.network === 'facebook' ? null : Math.round(reach * (1.2 + r()));
        const likes = Math.round(reach * (0.04 + r() * 0.05));
        const comments = Math.round(likes * (0.03 + r() * 0.08));
        const shares = Math.round(likes * (0.02 + r() * 0.1));
        const saves = a.network === 'instagram' ? Math.round(likes * (0.05 + r() * 0.15)) : null;
        posts.push({
          id: `${a.id}:${i}`,
          accountId: a.id,
          network: a.network,
          createdAt: date.toISOString(),
          text: TEXTS[Math.floor(r() * TEXTS.length)],
          url: null,
          thumbnail: null,
          format,
          views,
          reach: a.network === 'instagram' ? reach : null,
          likes,
          comments,
          shares,
          saves,
          interactions: likes + comments + shares + (saves ?? 0),
        });
      }
    }
  }

  const lastSync = new Date().toISOString();
  return {
    accounts: ACCOUNTS.map(({ id, network, name, username }) => ({ id, network, name, username, avatar: null, lastSync })),
    snapshots,
    posts,
  };
}
