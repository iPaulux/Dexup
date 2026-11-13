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

// Au-delà de ~150 cartes par page l'API devient lente et instable : on pagine par 75.
const PAGE_SIZE = 75;
const cardsInMemory = new Map();
const cardsInFlight = {};

export function loadSetCards(setId) {
  if (cardsInMemory.has(setId)) return Promise.resolve(cardsInMemory.get(setId));
  if (!cardsInFlight[setId]) {
    cardsInFlight[setId] = (async () => {
      const key = `cards:${setId}`;
      const cached = await getApiCache(key, CARDS_TTL);
      // Un cache d'exactement 250 cartes peut venir d'une ancienne requête tronquée par l'API.
      const verifiedKey = `pc_cards_full:${setId}`;
      let cards;
      if (cached?.length && (cached.length !== API_MAX_PAGE || localStorage.getItem(verifiedKey))) {
        cards = sortCards(cached);
      } else {
        const all = [];
        for (let page = 1, total = Infinity; all.length < total; page++) {
          const json = await getJson(pokemonApiUrl('/cards', { q: `set.id:${setId}`, pageSize: PAGE_SIZE, page }));
          const batch = json.data || [];
          total = json.totalCount ?? batch.length;
          all.push(...batch);
          if (batch.length < PAGE_SIZE) break;
        }
        cards = sortCards(all);
        if (cards.length) {
          await setApiCache(key, cards);
          try { localStorage.setItem(verifiedKey, '1'); } catch (_) {}
        }
      }
      if (cards.length) cardsInMemory.set(setId, cards);
      return cards;
    })().finally(() => { delete cardsInFlight[setId]; });
  }
  return cardsInFlight[setId];
}

/**
 * Charge les données complètes d'une sélection de cartes, plusieurs sets en parallèle.
 * Un set lent ou en échec ne bloque pas les autres : il est listé dans `failed`.
 */
export async function loadCardsByIds(cardIds, concurrency = 5) {
  const bySet = {};
  for (const id of cardIds) (bySet[setIdOf(id)] ||= new Set()).add(id);
  const queue = Object.keys(bySet);
  const map = {};
  const failed = [];
  const worker = async () => {
    while (queue.length) {
      const sid = queue.shift();
      try {
        for (const c of await loadSetCards(sid)) if (bySet[sid].has(c.id)) map[c.id] = c;
      } catch (_) {
        failed.push(sid);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, worker));
  return { map, failed };
}

/** Valeur de la collection : somme des prix tendance Cardmarket des cartes possédées. */
export function useWallet(owned) {
  const [wallet, setWallet] = useState(null); // null = calcul en cours
  useEffect(() => {
    let alive = true;
    const ids = Object.keys(owned);
    if (!ids.length) { setWallet({ value: 0, priced: 0, total: 0 }); return undefined; }
    loadCardsByIds(ids).then(({ map }) => {
      if (!alive) return;
      let value = 0;
      let priced = 0;
      for (const id of ids) {
        const trend = map[id]?.cardmarket?.prices?.trendPrice;
        if (trend != null) { value += trend; priced++; }
      }
      setWallet({ value, priced, total: ids.length });
    });
    return () => { alive = false; };
  }, [owned]);
  return wallet;
}

export const formatEuro = (v) => `${v.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

const SEARCH_SELECT = 'id,name,number,rarity,set,images';
// Le scanner a besoin des PV et des attaques pour départager les cartes d'un même Pokémon.
export const SCAN_SELECT = `${SEARCH_SELECT},hp,attacks,abilities`;

export async function searchCards({ name, exactName, rarity, number, printedTotal, page = 1, pageSize = 60, orderBy, select = SEARCH_SELECT }) {
  const parts = [];
  if (name) parts.push(`name:"*${name}*"`);
  if (exactName) parts.push(`!name:"${exactName}"`);
  if (number) parts.push(`number:${number}`);
  if (printedTotal) parts.push(`set.printedTotal:${printedTotal}`);
  if (rarity) parts.push(`rarity:"${rarity}"`);
  const params = { q: parts.join(' '), pageSize, page, select };
  if (orderBy) params.orderBy = orderBy;
  else if (!number) params.orderBy = 'name';
  const json = await getJson(pokemonApiUrl('/cards', params));
  return { cards: json.data || [], total: json.totalCount || 0 };
}

export async function loadFullCard(cardId) {
  const json = await getJson(pokemonApiUrl(`/cards/${cardId}`));
  return json.data;
}

export const openUrl = (url) => window.open(url, '_blank', 'noopener,noreferrer');
