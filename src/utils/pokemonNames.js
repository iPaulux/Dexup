const CACHE_KEY = 'fr_en_names_v2';
const GRAPHQL_URL = 'https://graphql.pokeapi.co/v1beta2';

// Récupère FR et EN séparément, jointure sur pokemon_species_id
const QUERY = `
  query {
    fr: pokemonspeciesname(where: {language_id: {_eq: 5}}, limit: 1500) {
      name
      pokemon_species_id
    }
    en: pokemonspeciesname(where: {language_id: {_eq: 9}}, limit: 1500) {
      name
      pokemon_species_id
    }
  }
`;

let _map = null; // { "salamèche": "charmander", ... }

export async function getFrToEnMap() {
  if (_map && Object.keys(_map).length > 0) return _map;

  // Cache localStorage
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Object.keys(parsed).length > 0) {
        _map = parsed;
        return _map;
      }
    }
  } catch {}

  // Fetch depuis PokeAPI GraphQL
  try {
    const res = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: QUERY }),
    });
    const json = await res.json();

    const frList = json.data?.fr ?? [];
    const enList = json.data?.en ?? [];

    // Indexer EN par species_id
    const enById = {};
    for (const e of enList) {
      enById[e.pokemon_species_id] = e.name.toLowerCase().trim();
    }

    // Construire map FR → EN
    const map = {};
    for (const f of frList) {
      const frName = f.name.toLowerCase().trim();
      const enName = enById[f.pokemon_species_id];
      if (frName && enName) map[frName] = enName;
    }

    _map = map;
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(map)); } catch {}
    return map;
  } catch {
    return {};
  }
}

/**
 * Prend une query utilisateur (peut être en FR) et retourne
 * le terme à envoyer à l'API TCG (en anglais si traduit, sinon tel quel).
 */
// Normalise les accents : "Évoli" → "evoli", "Salamèche" → "salamèche"
function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // retire les diacritiques
}

export async function resolveSearchTerm(query) {
  const q = query.trim().toLowerCase();
  const qNorm = normalize(q);
  if (!q) return query;

  const map = await getFrToEnMap();

  // Correspondance exacte (avec et sans accents)
  if (map[q]) return map[q];
  const exactNorm = Object.entries(map).find(([fr]) => normalize(fr) === qNorm);
  if (exactNorm) return exactNorm[1];

  // Correspondance partielle (insensible aux accents)
  const matches = Object.entries(map)
    .filter(([fr]) => {
      const frNorm = normalize(fr);
      return frNorm.startsWith(qNorm) || frNorm.includes(qNorm);
    })
    .map(([, en]) => en);

  if (matches.length === 1) return matches[0];

  return query;
}
