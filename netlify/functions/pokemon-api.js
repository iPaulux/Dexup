/**
 * Proxy Netlify Function → api.pokemontcg.io
 *
 * Évite les erreurs CORS causées par le Service Worker en production.
 * Paramètre spécial : _path (chemin de l'API, ex : "/sets", "/cards/sv3pt5-1")
 *
 * pokemontcg.io sans clé API renvoie des 500 aléatoires et quasi-instantanés
 * (rate-limit implicite) sur des requêtes tout à fait valides — observé y
 * compris sur des sets bien indexés (sv1, me1, me2...). Les réponses OK
 * peuvent en revanche prendre jusqu'à 5-6 s (gros sets, pas de clé API).
 * On retente donc plusieurs fois tant qu'il reste du budget temps.
 */

const BASE = 'https://api.pokemontcg.io/v2';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Netlify free tier coupe la fonction à 10 s. On se garde une marge de
// sécurité pour toujours pouvoir renvoyer une réponse propre.
const TOTAL_BUDGET_MS   = 8500;
const MAX_ATTEMPT_MS    = 6000; // une réponse OK peut prendre jusqu'à ~6 s
const RETRY_BASE_DELAY  = 250;  // + jitter, entre deux tentatives sur 5xx

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function callApi(url, reqHeaders, timeoutMs) {
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: ctrl.signal, headers: reqHeaders });
  } finally {
    clearTimeout(timer);
  }
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  const params = event.queryStringParameters || {};
  const { _path = '/', ...rest } = params;

  const qs = Object.keys(rest).length
    ? '?' + new URLSearchParams(rest).toString()
    : '';

  const url = `${BASE}${_path}${qs}`;

  const reqHeaders = { 'User-Agent': 'PokéCollect/1.0' };
  if (process.env.POKEMON_TCG_API_KEY) {
    reqHeaders['X-Api-Key'] = process.env.POKEMON_TCG_API_KEY;
  }

  const start = Date.now();
  let lastRes, lastText, lastErr;

  let attempt = 0;
  while (Date.now() - start < TOTAL_BUDGET_MS) {
    attempt++;
    const remaining = TOTAL_BUDGET_MS - (Date.now() - start);
    const attemptTimeout = Math.min(MAX_ATTEMPT_MS, remaining);
    if (attemptTimeout <= 0) break;

    try {
      const res = await callApi(url, reqHeaders, attemptTimeout);
      const text = await res.text();

      if (res.ok) {
        return {
          statusCode: 200,
          headers: {
            ...CORS,
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
          },
          body: text,
        };
      }

      lastRes = res;
      lastText = text;

      // 4xx = erreur définitive (mauvaise requête), inutile de retenter
      if (res.status < 500) break;
    } catch (e) {
      lastErr = e;
    }

    // Backoff avec jitter avant la prochaine tentative, si le budget le permet
    const remainingAfter = TOTAL_BUDGET_MS - (Date.now() - start);
    if (remainingAfter <= 0) break;
    await sleep(Math.min(RETRY_BASE_DELAY + Math.random() * 250, remainingAfter));
  }

  if (lastRes) {
    // Ne jamais mettre en cache les erreurs : le CDN Netlify respecte
    // Cache-Control même sur 4xx/5xx, ce qui bloquerait les retries pendant 1h.
    return {
      statusCode: lastRes.status,
      headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
      body: lastText || JSON.stringify({ error: `Upstream HTTP ${lastRes.status} après ${attempt} tentative(s)` }),
    };
  }

  const isTimeout = lastErr?.name === 'AbortError';
  return {
    statusCode: isTimeout ? 504 : 503,
    headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    body: JSON.stringify({ error: isTimeout ? 'API timeout' : (lastErr?.message || 'Erreur inconnue') }),
  };
};
