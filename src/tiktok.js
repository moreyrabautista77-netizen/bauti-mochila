// TikTok vía Login Kit + Display API (v2).
// Permite leer el perfil (seguidores, likes totales) y los videos públicos con sus métricas.
import { fetchJson, localDate } from './util.js';
import * as store from './store.js';

const API = 'https://open.tiktokapis.com/v2';

export const SCOPES = ['user.info.basic', 'user.info.profile', 'user.info.stats', 'video.list'];

export const isConfigured = () => Boolean(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET);
const redirectUri = () => `${process.env.PUBLIC_URL}/auth/tiktok/callback`;

export function authUrl(state) {
  const q = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY,
    scope: SCOPES.join(','),
    response_type: 'code',
    redirect_uri: redirectUri(),
    state,
  });
  return `https://www.tiktok.com/v2/auth/authorize/?${q}`;
}

async function tokenRequest(params) {
  const body = await fetchJson('tiktok', `${API}/oauth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY,
      client_secret: process.env.TIKTOK_CLIENT_SECRET,
      ...params,
    }),
  });
  if (!body.access_token) throw new Error(`[tiktok] ${body.error_description || 'no se obtuvo token'}`);
  return {
    token: body.access_token,
    refreshToken: body.refresh_token,
    expiresAt: Date.now() + (body.expires_in ?? 86400) * 1000,
    refreshExpiresAt: Date.now() + (body.refresh_expires_in ?? 0) * 1000,
    openId: body.open_id,
  };
}

const USER_FIELDS = 'open_id,display_name,username,avatar_url,follower_count,following_count,likes_count,video_count';

async function userInfo(token) {
  const res = await fetchJson('tiktok', `${API}/user/info/?fields=${USER_FIELDS}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.user;
}

export async function handleCallback(code) {
  const t = await tokenRequest({ code, grant_type: 'authorization_code', redirect_uri: redirectUri() });
  const user = await userInfo(t.token);
  store.upsertAccount({
    id: `tiktok:${t.openId}`,
    network: 'tiktok',
    externalId: t.openId,
    name: user.display_name,
    username: user.username || user.display_name,
    avatar: user.avatar_url || null,
    ...t,
  });
  return [`TikTok: @${user.username || user.display_name}`];
}

// El token de acceso dura 24 h; se renueva con el refresh token (válido ~1 año).
async function ensureToken(account) {
  if (Date.now() < account.expiresAt - 5 * 60e3) return account;
  const t = await tokenRequest({ grant_type: 'refresh_token', refresh_token: account.refreshToken });
  const updated = { ...account, ...t };
  store.upsertAccount(updated);
  return updated;
}

const VIDEO_FIELDS = 'id,title,video_description,create_time,cover_image_url,share_url,view_count,like_count,comment_count,share_count';

export async function syncTikTok(account) {
  account = await ensureToken(account);
  const user = await userInfo(account.token);
  store.putSnapshot({
    accountId: account.id,
    date: localDate(),
    followers: user.follower_count ?? 0,
    posts: user.video_count ?? null,
    totalLikes: user.likes_count ?? null,
  });

  // Hasta 100 videos (5 páginas de 20).
  let cursor;
  for (let page = 0; page < 5; page++) {
    const res = await fetchJson('tiktok', `${API}/video/list/?fields=${VIDEO_FIELDS}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${account.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(cursor ? { max_count: 20, cursor } : { max_count: 20 }),
    });
    for (const v of res.data?.videos || []) {
      const likes = v.like_count ?? 0;
      const comments = v.comment_count ?? 0;
      const shares = v.share_count ?? 0;
      store.putPost({
        id: `tiktok:${v.id}`,
        accountId: account.id,
        network: 'tiktok',
        createdAt: new Date(v.create_time * 1000).toISOString(),
        text: v.title || v.video_description || '',
        url: v.share_url,
        thumbnail: v.cover_image_url || null,
        format: 'video',
        views: v.view_count ?? null,
        reach: null,
        likes,
        comments,
        shares,
        saves: null,
        interactions: likes + comments + shares,
      });
    }
    if (!res.data?.has_more) break;
    cursor = res.data.cursor;
  }
  return { name: user.display_name, username: user.username || account.username, avatar: user.avatar_url };
}
