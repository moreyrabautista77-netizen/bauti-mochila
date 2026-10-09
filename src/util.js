export const TZ = process.env.TIMEZONE || 'America/Argentina/Buenos_Aires';

// Fecha local (YYYY-MM-DD) en la zona horaria del negocio.
export function localDate(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

export class ApiError extends Error {
  constructor(network, message, status) {
    super(`[${network}] ${message}`);
    this.status = status;
  }
}

export async function fetchJson(network, url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    throw new ApiError(network, `respuesta no JSON (${res.status}): ${text.slice(0, 200)}`, res.status);
  }
  // Meta devuelve { error: { message } }; TikTok devuelve { error: { code, message } } con code "ok" si salió bien.
  const err = body.error;
  const tiktokOk = err && err.code === 'ok';
  if (!res.ok || (err && !tiktokOk)) {
    const msg = err?.message || err?.error_user_msg || body.error_description || text.slice(0, 200);
    throw new ApiError(network, msg, res.status);
  }
  return body;
}
