/**
 * Netlify Function — proxy RSS côté serveur.
 * Disponible à /.netlify/functions/fetch-news
 * Évite tous les problèmes CORS du navigateur.
 */

const FEEDS = [
  'https://pokemonblog.com/category/tcg/feed',
  'https://www.pokebeach.com/feed',
  'https://www.pokeguardian.com/feed/',
  'https://limitlesstcg.com/feed',
];

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const handler = async (event) => {
  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  for (const feedUrl of FEEDS) {
    try {
      const res = await fetch(feedUrl, {
        headers: {
          'User-Agent': 'PokeCollect/1.0 (feed reader)',
          Accept: 'application/rss+xml, application/xml, text/xml, */*',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) continue;

      const xml = await res.text();
      if (!xml.includes('<item')) continue; // réponse vide ou invalide

      return {
        statusCode: 200,
        headers: {
          ...CORS,
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600', // CDN cache 1h
          'X-Feed-Source': feedUrl,
        },
        body: xml,
      };
    } catch (_) {
      // Passer au feed suivant
    }
  }

  return {
    statusCode: 503,
    headers: CORS,
    body: JSON.stringify({ error: 'Tous les feeds RSS sont indisponibles.' }),
  };
};
