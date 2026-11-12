import { getSharedIfFresh, setShared } from '../utils/sharedCache';

const NEWS_KEY = 'news_articles';
const REDDIT_URL = 'https://www.reddit.com/r/PokemonTCG/hot.json?limit=50&raw_json=1';

async function fetchWithTimeout(url, ms = 10000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try { return await fetch(url, { signal: ctrl.signal }); } finally { clearTimeout(timer); }
}

// RSS via la fonction Netlify (production). En dev, la route renvoie du HTML : on rejette.
async function loadFromNetlify() {
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

function redditThumbnail(post) {
  const res = post.preview?.images?.[0]?.resolutions;
  if (res?.length) return res[res.length - 1].url.replace(/&amp;/g, '&');
  const src = post.preview?.images?.[0]?.source?.url;
  if (src) return src.replace(/&amp;/g, '&');
  return post.thumbnail?.startsWith('http') ? post.thumbnail : null;
}

async function loadFromReddit() {
  const res = await fetchWithTimeout(REDDIT_URL);
  if (!res.ok) throw new Error(`reddit_${res.status}`);
  const json = await res.json();
  const posts = (json?.data?.children || []).map((c) => c.data).filter((p) => p.score >= 5);
  if (!posts.length) throw new Error('no_posts');
  return posts.slice(0, 15).map((p) => ({
    title: p.title,
    link: p.is_self ? `https://www.reddit.com${p.permalink}` : p.url,
    date: new Date(p.created_utc * 1000).toUTCString(),
    domain: p.is_self ? 'r/PokemonTCG' : p.domain,
    thumbnail: redditThumbnail(p),
    score: p.score,
    source: 'reddit',
  }));
}

export async function loadNews() {
  const cached = await getSharedIfFresh(NEWS_KEY);
  if (cached?.length) return cached;
  let articles;
  try { articles = await loadFromNetlify(); } catch (_) { articles = await loadFromReddit(); }
  if (!articles?.length) throw new Error('no_articles');
  await setShared(NEWS_KEY, articles);
  return articles;
}

export function formatNewsDate(raw) {
  const d = new Date(raw);
  return isNaN(d) ? '' : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}
