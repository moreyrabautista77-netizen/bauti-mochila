// Facebook (Páginas) + Instagram (cuentas profesionales vinculadas a una Página)
// a través de la Graph API de Meta.
//
// Solo se piden permisos de LECTURA de estadísticas. No se piden permisos de
// mensajes (instagram_manage_messages): ese es el permiso que rechaza Meta en
// cuentas que no cumplen los requisitos de Business Messaging.
import { fetchJson, localDate } from './util.js';
import * as store from './store.js';

const V = process.env.META_GRAPH_VERSION || 'v23.0';
const GRAPH = `https://graph.facebook.com/${V}`;

export const SCOPES = [
  'pages_show_list',
  'pages_read_engagement',
  'read_insights',
  'instagram_basic',
  'instagram_manage_insights',
  'business_management',
];

export const isConfigured = () => Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET);
const redirectUri = () => `${process.env.PUBLIC_URL}/auth/meta/callback`;

const get = (pathname, params) =>
  fetchJson('meta', `${GRAPH}/${pathname}?${new URLSearchParams(params)}`);

export function authUrl(state) {
  const q = new URLSearchParams({
    client_id: process.env.META_APP_ID,
    redirect_uri: redirectUri(),
    state,
    scope: SCOPES.join(','),
    response_type: 'code',
  });
  return `https://www.facebook.com/${V}/dialog/oauth?${q}`;
}

// Cambia el code por un token de usuario de larga duración y guarda cada Página
// (y su Instagram vinculado, si tiene) como una cuenta.
export async function handleCallback(code) {
  const short = await get('oauth/access_token', {
    client_id: process.env.META_APP_ID,
    client_secret: process.env.META_APP_SECRET,
    redirect_uri: redirectUri(),
    code,
  });
  const long = await get('oauth/access_token', {
    grant_type: 'fb_exchange_token',
    client_id: process.env.META_APP_ID,
    client_secret: process.env.META_APP_SECRET,
    fb_exchange_token: short.access_token,
  });

  // Los tokens de Página obtenidos con un token de usuario de larga duración no vencen.
  const pages = await get('me/accounts', {
    access_token: long.access_token,
    fields: 'id,name,access_token,picture{url},instagram_business_account{id,username,profile_picture_url}',
    limit: 100,
  });

  const connected = [];
  for (const page of pages.data || []) {
    store.upsertAccount({
      id: `facebook:${page.id}`,
      network: 'facebook',
      externalId: page.id,
      name: page.name,
      username: page.name,
      avatar: page.picture?.data?.url || null,
      token: page.access_token,
    });
    connected.push(`Facebook: ${page.name}`);

    const ig = page.instagram_business_account;
    if (ig) {
      store.upsertAccount({
        id: `instagram:${ig.id}`,
        network: 'instagram',
        externalId: ig.id,
        name: ig.username,
        username: ig.username,
        avatar: ig.profile_picture_url || null,
        token: page.access_token,
      });
      connected.push(`Instagram: @${ig.username}`);
    }
  }
  return connected;
}

export async function syncFacebook(account) {
  const page = await get(account.externalId, {
    access_token: account.token,
    fields: 'name,followers_count,fan_count,picture{url}',
  });
  const posts = await get(`${account.externalId}/posts`, {
    access_token: account.token,
    fields:
      'id,message,created_time,permalink_url,full_picture,status_type,shares,' +
      'reactions.summary(total_count).limit(0),comments.summary(total_count).limit(0)',
    limit: 50,
  });

  const followers = page.followers_count ?? page.fan_count ?? 0;
  store.putSnapshot({ accountId: account.id, date: localDate(), followers, posts: null });

  for (const p of posts.data || []) {
    const likes = p.reactions?.summary?.total_count ?? 0;
    const comments = p.comments?.summary?.total_count ?? 0;
    const shares = p.shares?.count ?? 0;
    store.putPost({
      id: `facebook:${p.id}`,
      accountId: account.id,
      network: 'facebook',
      createdAt: p.created_time,
      text: p.message || '',
      url: p.permalink_url,
      thumbnail: p.full_picture || null,
      format: p.status_type === 'added_video' ? 'video' : p.full_picture ? 'imagen' : 'texto',
      views: null,
      reach: null,
      likes,
      comments,
      shares,
      saves: null,
      interactions: likes + comments + shares,
    });
  }
  return { name: page.name, avatar: page.picture?.data?.url };
}

const IG_FORMAT = { VIDEO: 'video', IMAGE: 'imagen', CAROUSEL_ALBUM: 'carrusel' };

// Las métricas disponibles varían según el tipo de publicación y la versión de la API;
// se prueba con el set completo y si falla se cae a uno mínimo.
async function mediaInsights(mediaId, token) {
  for (const metric of ['reach,saved,shares,views', 'reach,saved']) {
    try {
      const res = await get(`${mediaId}/insights`, { access_token: token, metric });
      return Object.fromEntries((res.data || []).map((m) => [m.name, m.values?.[0]?.value ?? 0]));
    } catch {
      // probar con el siguiente set
    }
  }
  return {};
}

export async function syncInstagram(account) {
  const profile = await get(account.externalId, {
    access_token: account.token,
    fields: 'username,followers_count,follows_count,media_count,profile_picture_url',
  });
  const media = await get(`${account.externalId}/media`, {
    access_token: account.token,
    fields: 'id,caption,media_type,media_product_type,timestamp,like_count,comments_count,permalink,thumbnail_url,media_url',
    limit: 50,
  });

  const today = localDate();
  store.putSnapshot({
    accountId: account.id,
    date: today,
    followers: profile.followers_count ?? 0,
    posts: profile.media_count ?? null,
  });
  await backfillInstagramFollowers(account, profile.followers_count ?? 0, today);

  const items = media.data || [];
  for (const [i, m] of items.entries()) {
    // Estadísticas detalladas solo para las 25 más recientes, para no gastar el límite de llamadas.
    const ins = i < 25 ? await mediaInsights(m.id, account.token) : {};
    const likes = m.like_count ?? 0;
    const comments = m.comments_count ?? 0;
    const shares = ins.shares ?? 0;
    const saves = ins.saved ?? 0;
    store.putPost({
      id: `instagram:${m.id}`,
      accountId: account.id,
      network: 'instagram',
      createdAt: m.timestamp,
      text: m.caption || '',
      url: m.permalink,
      thumbnail: m.thumbnail_url || m.media_url || null,
      format: m.media_product_type === 'REELS' ? 'reel' : IG_FORMAT[m.media_type] || 'imagen',
      views: ins.views ?? null,
      reach: ins.reach ?? null,
      likes,
      comments,
      shares,
      saves,
      interactions: likes + comments + shares + saves,
    });
  }
  return { name: profile.username, username: profile.username, avatar: profile.profile_picture_url };
}

// Instagram da los seguidores netos ganados por día en los últimos 30 días.
// La primera vez que se conecta la cuenta se usa eso para reconstruir la curva
// hacia atrás, así el gráfico no arranca vacío. Necesita 100+ seguidores.
async function backfillInstagramFollowers(account, current, today) {
  if (account.backfilled) return;
  try {
    const until = Math.floor(Date.now() / 1000);
    const since = until - 29 * 86400;
    const res = await get(`${account.externalId}/insights`, {
      access_token: account.token,
      metric: 'follower_count',
      period: 'day',
      since,
      until,
    });
    const values = (res.data?.[0]?.values || [])
      .map((v) => ({ date: localDate(new Date(v.end_time)), net: v.value ?? 0 }))
      .sort((a, b) => b.date.localeCompare(a.date));
    // Seguidores al cierre del día D = seguidores al cierre de D+1 menos lo ganado en D+1.
    let followers = current;
    for (const v of values) {
      if (v.date >= today) continue;
      if (!store.hasSnapshot(account.id, v.date)) {
        store.putSnapshot({ accountId: account.id, date: v.date, followers: Math.max(0, followers), posts: null });
      }
      followers -= v.net;
    }
  } catch {
    // Sin historial disponible: la curva se arma con las sincronizaciones diarias.
  }
  store.upsertAccount({ id: account.id, backfilled: true });
}
