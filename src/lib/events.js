import { getSharedIfFresh, setShared } from '../utils/sharedCache';

// Clé versionnée : changer le suffixe quand la liste ci-dessous est mise à jour, pour ignorer les anciens caches.
const CONV_KEY = 'fr_conventions_2027';
const OFFICIAL = 'https://championships.pokemon.com/en-us/events?status=upcoming&region=europe';

// Saison 2026-27 des Championnats Pokémon en Europe — la table partagée Supabase peut la remplacer.
const FALLBACK_EVENTS = [
  { id: 'eu-frankfurt-2026-09', name: 'Championnat Régional de Francfort', type: 'Régional', city: 'Francfort, Allemagne', date: '2026-09-26', dateEnd: '2026-09-27', url: OFFICIAL },
  { id: 'eu-nice-2026-10', name: 'Championnat Régional de Nice', type: 'Régional', city: 'Nice, France', venue: 'Palais des Expositions', date: '2026-10-17', dateEnd: '2026-10-18', url: OFFICIAL },
  { id: 'eu-gdansk-2026-10', name: 'Championnat Régional de Gdańsk', type: 'Régional', city: 'Gdańsk, Pologne', date: '2026-10-31', dateEnd: '2026-11-01', url: OFFICIAL },
  { id: 'eu-stuttgart-2026-11', name: 'Championnat Régional de Stuttgart', type: 'Régional', city: 'Stuttgart, Allemagne', date: '2026-11-28', dateEnd: '2026-11-29', url: OFFICIAL },
  { id: 'eu-birmingham-2027-01', name: 'Championnat Régional de Birmingham', type: 'Régional', city: 'Birmingham, Royaume-Uni', date: '2027-01-30', dateEnd: '2027-01-31', url: OFFICIAL },
  { id: 'eu-euic-2027-02', name: 'Championnats Internationaux Européens', type: 'Internationaux', city: 'Londres, Royaume-Uni', date: '2027-02-19', dateEnd: '2027-02-21', url: OFFICIAL },
  { id: 'eu-lisbon-2027-04', name: 'Championnat Spécial de Lisbonne', type: 'Événement spécial', city: 'Lisbonne, Portugal', date: '2027-04-10', dateEnd: '2027-04-11', url: OFFICIAL },
  { id: 'eu-prague-2027-05', name: 'Championnat Régional de Prague', type: 'Régional', city: 'Prague, Tchéquie', date: '2027-05-08', dateEnd: '2027-05-09', url: OFFICIAL },
  { id: 'eu-utrecht-2027-05', name: "Championnat Régional d'Utrecht", type: 'Régional', city: 'Utrecht, Pays-Bas', date: '2027-05-22', dateEnd: '2027-05-23', url: OFFICIAL },
  { id: 'eu-bologna-2027-06', name: 'Championnat Spécial de Bologne', type: 'Événement spécial', city: 'Bologne, Italie', date: '2027-06-05', dateEnd: '2027-06-06', url: OFFICIAL },
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
