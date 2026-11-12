import { getSharedIfFresh, setShared } from '../utils/sharedCache';

const CONV_KEY = 'fr_conventions';

// Données de repli — la source de vérité est la table partagée Supabase.
const FALLBACK_EVENTS = [
  { id: 'fr-reg-paris-2025-05', name: 'Championnat Régional — Île-de-France', type: 'Régional', city: 'Paris', venue: 'Paris Event Center', date: '2025-05-17', dateEnd: '2025-05-18', url: 'https://www.pokemon.com/fr/play-pokemon/' },
  { id: 'fr-japanexpo-2025-07', name: 'Japan Expo 2025 — stand Pokémon', type: 'Convention', city: 'Paris', venue: 'Paris Le Bourget, Hall 5B', date: '2025-07-03', dateEnd: '2025-07-06', url: 'https://www.japan-expo.com' },
  { id: 'fr-reg-lyon-2025-09', name: 'Championnat Régional — Rhône-Alpes', type: 'Régional', city: 'Lyon', venue: 'Palais des Congrès de Lyon', date: '2025-09-20', dateEnd: '2025-09-21', url: 'https://www.pokemon.com/fr/play-pokemon/' },
  { id: 'fr-ludicbox-2025-10', name: 'Ludicbox — stand TCG Pokémon', type: 'Convention', city: 'Bordeaux', venue: 'Bordeaux Lac Expo', date: '2025-10-11', dateEnd: '2025-10-12', url: 'https://www.ludicbox.fr' },
  { id: 'fr-reg-marseille-2025-11', name: 'Championnat Régional — PACA', type: 'Régional', city: 'Marseille', venue: 'Parc Chanot', date: '2025-11-08', dateEnd: '2025-11-09', url: 'https://www.pokemon.com/fr/play-pokemon/' },
  { id: 'fr-euic-2026-02', name: 'Championnats Internationaux Européens', type: 'Internationaux', city: 'Londres', venue: 'ExCeL London', date: '2026-02-06', dateEnd: '2026-02-08', url: 'https://www.pokemon.com/fr/play-pokemon/' },
  { id: 'fr-reg-toulouse-2026-03', name: 'Championnat Régional — Occitanie', type: 'Régional', city: 'Toulouse', venue: 'MEETT Toulouse', date: '2026-03-14', dateEnd: '2026-03-15', url: 'https://www.pokemon.com/fr/play-pokemon/' },
];

export async function loadEvents() {
  let events;
  try {
    events = await getSharedIfFresh(CONV_KEY);
    if (!events?.length) {
      events = FALLBACK_EVENTS;
      await setShared(CONV_KEY, FALLBACK_EVENTS);
    }
  } catch (_) {
    events = FALLBACK_EVENTS;
  }
  return [...events].sort((a, b) => a.date.localeCompare(b.date));
}

export const isPast = (ev) => new Date(`${ev.dateEnd || ev.date}T23:59:59`) < new Date();

export function formatEventDate(iso) {
  const d = new Date(`${iso}T00:00:00`);
  return isNaN(d) ? iso : d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' });
}

export function eventTagClass(type = '') {
  if (type.includes('Régional')) return 'tag-sky';
  if (type.includes('Internationaux')) return 'tag-violet';
  if (type.includes('Convention')) return 'tag-mint';
  return 'tag-peach';
}
