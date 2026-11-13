import { getSharedIfFresh, setShared } from '../utils/sharedCache';

// Clé versionnée : changer le suffixe quand la liste ci-dessous est mise à jour, pour ignorer les anciens caches.
const CONV_KEY = 'collector_events_2027';

// Salons et conventions pour collectionneurs (pas les tournois) — la table partagée Supabase peut remplacer cette liste.
const FALLBACK_EVENTS = [
  { id: 'royaume-tcg-2026', name: 'Le Royaume du TCG', type: 'Salon', city: 'Villepinte, France', venue: 'Parc des Expositions Paris Nord', date: '2026-04-04', dateEnd: '2026-04-05' },
  { id: 'paris-card-show-2026', name: 'Paris Card Show', type: 'Salon', city: 'Paris, France', venue: 'Espace Champerret', date: '2026-05-23', dateEnd: '2026-05-24' },
  { id: 'tcgcon-versailles-2027', name: 'TCGCON Versailles — Pokémon & One Piece', type: 'Salon', city: 'Versailles, France', venue: 'Palais des Congrès', date: '2027-01-10', dateEnd: '2027-01-10', url: 'https://tcgcon.shop/' },
  { id: 'dortmund-card-show-2027', name: 'Dortmund Card Show', type: 'Salon', city: 'Dortmund, Allemagne', venue: 'Signal Iduna Park', date: '2027-01-23', dateEnd: '2027-01-23', url: 'https://dortmundcardshow.com/' },
  { id: 'tcg-expo-prague-2027', name: 'TCG Expo Prague', type: 'Salon', city: 'Prague, Tchéquie', venue: 'Parc des expositions', date: '2027-03-20', dateEnd: '2027-03-20', url: 'https://www.zardo.cards/en/tcgexpo' },
  { id: 'nordic-card-show-2027', name: 'Nordic Card Show × PokeKon', type: 'Convention', city: 'Roskilde, Danemark', venue: 'Roskilde Kongres Center', date: '2027-05-29', dateEnd: '2027-05-30', url: 'https://nordiccardshow.dk/event/nordic-card-show-x-pokekon-2027-may/' },
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

export const eventTagClass = (type = '') => (type.includes('Convention') ? 'tag-mint' : 'tag-violet');
