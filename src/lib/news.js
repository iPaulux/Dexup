import { getSharedIfFresh, setShared } from '../utils/sharedCache';

const NEWS_KEY = 'news_articles';

async function fetchWithTimeout(url, ms = 10000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try { return await fetch(url, { signal: ctrl.signal }); } finally { clearTimeout(timer); }
}

// RSS relayé par la fonction Netlify (le navigateur ne peut pas lire ces flux directement).
async function loadFromFeed() {
  const res = await fetchWithTimeout('/.netlify/functions/fetch-news');
  if (!res.ok) throw new Error(`netlify_${res.status}`);
  const text = await res.text();
  if (!text.includes('<item')) throw new Error('not_rss');

  const doc = new DOMParser().parseFromString(text, 'application/xml');
  const items = [...doc.querySelectorAll('item')];
  if (!items.length) throw new Error('no_items');

  const source = res.headers.get('X-Feed-Source') || '';
  const domain = source ? new URL(source).hostname.replace('www.', '') : 'tcg-news';

  return items.slice(0, 15).map((el) => {
    const linkEl = el.querySelector('link');
    const link = linkEl?.textContent?.trim() || linkEl?.nextSibling?.textContent?.trim() || '#';
    const thumbnail =
      el.querySelector('content')?.getAttribute('url') ||
      el.querySelector('thumbnail')?.getAttribute('url') ||
      el.querySelector('enclosure')?.getAttribute('url') || null;
    return {
      title: el.querySelector('title')?.textContent?.trim() || '(sans titre)',
      link,
      date: el.querySelector('pubDate')?.textContent?.trim() || '',
      domain, thumbnail, score: null, source: 'rss',
    };
  });
}

export async function loadNews() {
  const cached = await getSharedIfFresh(NEWS_KEY);
  if (cached?.length) return cached;
  const articles = await loadFromFeed();
  if (!articles?.length) throw new Error('no_articles');
  await setShared(NEWS_KEY, articles);
  return articles;
}

export function formatNewsDate(raw) {
  const d = new Date(raw);
  return isNaN(d) ? '' : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}
