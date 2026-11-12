import { useEffect, useState } from 'react';
import { pokemonApiUrl } from '../utils/api';
import { getApiCache, setApiCache, SETS_TTL, CARDS_TTL } from '../utils/sharedCache';

const API_MAX_PAGE = 250;

export const setIdOf = (cardId) => {
  const i = cardId.lastIndexOf('-');
  return i > 0 ? cardId.slice(0, i) : cardId;
};

export const setLogoUrl = (setId) => `https://images.pokemontcg.io/${setId}/logo.png`;

export const isGraded = (v) => !!v && typeof v === 'object' && v.graded === true;

export function ownedCountBySet(owned) {
  const counts = {};
  for (const id of Object.keys(owned)) {
    const sid = setIdOf(id);
    counts[sid] = (counts[sid] || 0) + 1;
  }
  return counts;
}

// L'API renvoie régulièrement des 5xx passagers : on réessaie avant d'abandonner.
async function getJson(url, attempts = 3) {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
      if (res.status < 500 || i >= attempts) throw Object.assign(new Error(`HTTP ${res.status}`), { final: true });
    } catch (e) {
      if (e.final || i >= attempts) throw e;
    }
    await new Promise((r) => setTimeout(r, 500 * i));
  }
}

let setsPromise = null;

export function loadSets() {
  if (!setsPromise) {
    setsPromise = (async () => {
      const cached = await getApiCache('sets:en', SETS_TTL);
      if (cached) return cached;
      const json = await getJson(pokemonApiUrl('/sets', { orderBy: '-releaseDate', pageSize: API_MAX_PAGE }));
      const sets = json.data || [];
      await setApiCache('sets:en', sets);
      return sets;
    })().catch((e) => { setsPromise = null; throw e; });
  }
  return setsPromise;
}

export function useSets() {
  const [state, setState] = useState({ sets: [], loading: true, error: null });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    loadSets()
      .then((sets) => alive && setState({ sets, loading: false, error: null }))
      .catch((e) => alive && setState({ sets: [], loading: false, error: e.message || 'Erreur réseau' }));
    return () => { alive = false; };
  }, [attempt]);
  return { ...state, retry: () => setAttempt((n) => n + 1) };
}

function parseNumber(n) {
  const m = String(n).match(/^([a-zA-Z]*)(\d+)([a-zA-Z]*)$/);
  if (!m) return { prefix: String(n), num: 0, suffix: '' };
  return { prefix: m[1].toUpperCase(), num: parseInt(m[2], 10), suffix: m[3] };
}

export function sortCards(cards) {
  return [...cards].sort((a, b) => {
    const pa = parseNumber(a.number);
    const pb = parseNumber(b.number);
    if (pa.prefix !== pb.prefix) {
      if (!pa.prefix) return -1;
      if (!pb.prefix) return 1;
      return pa.prefix.localeCompare(pb.prefix);
    }
    if (pa.num !== pb.num) return pa.num - pb.num;
    return pa.suffix.localeCompare(pb.suffix);
  });
}

const cardsInFlight = {};

export function loadSetCards(setId) {
  if (!cardsInFlight[setId]) {
    cardsInFlight[setId] = (async () => {
      const key = `cards:${setId}`;
      const cached = await getApiCache(key, CARDS_TTL);
      // Un cache d'exactement 250 cartes peut venir d'une ancienne requête tronquée par l'API.
      const verifiedKey = `pc_cards_full:${setId}`;
      if (cached && (cached.length !== API_MAX_PAGE || localStorage.getItem(verifiedKey))) return sortCards(cached);
      const all = [];
      for (let page = 1; page <= 4; page++) {
        const json = await getJson(pokemonApiUrl('/cards', { q: `set.id:${setId}`, pageSize: API_MAX_PAGE, page }));
        all.push(...(json.data || []));
        if (all.length >= (json.totalCount || 0) || !(json.data || []).length) break;
      }
      const sorted = sortCards(all);
      await setApiCache(key, sorted);
      try { localStorage.setItem(verifiedKey, '1'); } catch (_) {}
      return sorted;
    })().finally(() => { delete cardsInFlight[setId]; });
  }
  return cardsInFlight[setId];
}

/** Charge les données complètes d'une sélection de cartes, set par set. */
export async function loadCardsByIds(cardIds) {
  const bySet = {};
  for (const id of cardIds) (bySet[setIdOf(id)] ||= new Set()).add(id);
  const map = {};
  await Promise.all(Object.entries(bySet).map(async ([sid, ids]) => {
    try {
      const cards = await loadSetCards(sid);
      for (const c of cards) if (ids.has(c.id)) map[c.id] = c;
    } catch (_) { /* set indisponible : on l'ignore */ }
  }));
  return map;
}

const SEARCH_SELECT = 'id,name,number,rarity,set,images';

export async function searchCards({ name, rarity, number, page = 1, pageSize = 60 }) {
  const parts = [];
  if (name) parts.push(`name:"*${name}*"`);
  if (number) parts.push(`number:${number}`);
  if (rarity) parts.push(`rarity:"${rarity}"`);
  const params = { q: parts.join(' '), pageSize, page, select: SEARCH_SELECT };
  if (!number) params.orderBy = 'name';
  const json = await getJson(pokemonApiUrl('/cards', params));
  return { cards: json.data || [], total: json.totalCount || 0 };
}

export async function loadFullCard(cardId) {
  const json = await getJson(pokemonApiUrl(`/cards/${cardId}`));
  return json.data;
}

export const openUrl = (url) => window.open(url, '_blank', 'noopener,noreferrer');
