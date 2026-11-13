// OCR du numéro de carte (Tesseract chargé à la demande) + recadrage de la zone visée.
//
// L'analyse du numéro (corrections O→0, I/l/|→1) est adaptée de pokeum
// (app/signals/ocr.py), © 2026 TBLgGamin, licence MIT : voir third_party/pokeum/LICENSE.

// Deux moteurs : le numéro et le nom se lisent en parallèle (un worker Tesseract ne traite
// qu'une image à la fois). Le moteur 0 lit le bas de la carte en mode « bloc » (psm 6) :
// une fois binarisé, c'est lui qui retrouve le mieux la ligne du numéro (18 images sur 32
// contre 11 en psm 11). Le moteur 1 lit le nom en mode « texte épars » (psm 11) : il partage
// sa ligne avec le stade et les PV.
const WORKER_PSM = ['6', '11'];
const workerPromises = [null, null];

export function getOcrWorker(slot = 0) {
  if (!workerPromises[slot]) {
    workerPromises[slot] = (async () => {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng', 1, { logger: () => {} });
      await worker.setParameters({ tessedit_pageseg_mode: WORKER_PSM[slot] });
      return worker;
    })().catch((e) => { workerPromises[slot] = null; throw e; });
  }
  return workerPromises[slot];
}

/** Charge Tesseract en arrière-plan pour que le premier scan ne paie pas le téléchargement. */
export function warmOcr() {
  getOcrWorker(0).catch(() => {});
  getOcrWorker(1).catch(() => {});
}

/**
 * Rectangle (en pixels vidéo) correspondant à ce que l'utilisateur voit dans `el`.
 * La vidéo est affichée en `object-fit: cover` : on reconvertit le rectangle écran.
 * Renvoie null tant que le flux n'est pas prêt.
 */
export function sourceRect(video, el) {
  const vw = video?.videoWidth;
  const vh = video?.videoHeight;
  if (!vw || !vh || !el) return null;

  const box = video.getBoundingClientRect();
  const zone = el.getBoundingClientRect();
  const scale = Math.max(box.width / vw, box.height / vh);
  const offsetX = (box.width - vw * scale) / 2;
  const offsetY = (box.height - vh * scale) / 2;
  const x = Math.max(0, (zone.left - box.left - offsetX) / scale);
  const y = Math.max(0, (zone.top - box.top - offsetY) / scale);
  const width = Math.min(vw - x, zone.width / scale);
  const height = Math.min(vh - y, zone.height / scale);
  if (width < 8 || height < 8) return null;
  return { x, y, width, height };
}

// Bandeau du nom, en fraction du cadre de la carte. Plus haut que la carte elle-même
// (de -6 % à 16 %) : une carte tenue à la main est rarement pile dans le cadre.
const TITLE_BAND = [0.02, -0.06, 0.8, 0.16];

/** Découpe le bandeau du nom (en haut de la carte) dans le cadre `frameEl`. */
export function cropTitle(video, frameEl) {
  return cropFraction(video, frameEl, TITLE_BAND);
}

// Bande du numéro, en fraction du cadre : tout le bas de la carte (20 %) et un peu au-delà,
// à gauche comme à droite. Le numéro est en bas à gauche depuis 2013, en bas à droite avant ;
// et une carte tenue à la main n'est jamais pile dans le cadre. Lire toute la bande évite
// d'avoir à viser une petite zone.
const NUMBER_BAND = [-0.02, 0.8, 1.02, 1.04];
// Corps de la carte (attaques, talents), d'après la version de main (2e7188d).
const BODY_BAND = [0.04, 0.46, 0.96, 0.86];

/** Découpe le corps de la carte : les noms d'attaques départagent les cartes d'un même Pokémon. */
export function cropBody(video, frameEl) {
  return cropFraction(video, frameEl, BODY_BAND);
}

// Coin haut droit (« PV 60 ») : le bandeau du nom s'arrête à 80 % de la largeur et le rate.
const HP_BAND = [0.55, -0.04, 1.02, 0.12];
export const HP_TARGET_HEIGHT = 200;

/** Découpe le coin des PV. */
export function cropHp(video, frameEl) {
  return cropFraction(video, frameEl, HP_BAND);
}

/** Découpe la bande du bas de la carte (numéro de collection) dans le cadre `frameEl`. */
export function cropNumberBand(video, frameEl) {
  return cropFraction(video, frameEl, NUMBER_BAND);
}

function cropFraction(video, frameEl, [l, t, r, b]) {
  const f = sourceRect(video, frameEl);
  if (!f) return null;
  const x = Math.max(0, f.x + l * f.width);
  const y = Math.max(0, f.y + t * f.height);
  return cropRect(video, {
    x, y,
    width: Math.min(video.videoWidth - x, f.x + r * f.width - x),
    height: Math.min(video.videoHeight - y, f.y + b * f.height - y),
  });
}

function cropRect(video, r) {
  if (!r || r.width < 8 || r.height < 8) return null;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(r.width);
  canvas.height = Math.round(r.height);
  canvas.getContext('2d').drawImage(video, r.x, r.y, r.width, r.height, 0, 0, canvas.width, canvas.height);
  return canvas;
}

const OCR_MAX_SCALE = 3;
// Hauteur visée pour le bandeau du nom (~1:1 en 1080p, réduit au-delà).
export const TITLE_TARGET_HEIGHT = 280;
// Corps de carte : les noms d'attaques sont en gros caractères gras, inutile d'agrandir.
export const BODY_TARGET_HEIGHT = 420;

// Hauteur visée pour la bande du numéro : le numéro y fait alors ~25-30 px, la taille que
// Tesseract lit le mieux. Une bande plus grande (flux 4K) est RÉDUITE : chaque pixel coûte du temps OCR.
export const BAND_TARGET_HEIGHT = 400;
// Demi-côté de la fenêtre du seuil adaptatif et écart minimal au fond local (sur 255).
const ADAPT_RADIUS = 15;
// Numéro : écart modéré (petits caractères fins). Nom : écart fort, qui efface les reflets
// holo et la texture du fond. Réglés en rejouant 32 images iPhone (voir `binarize`).
export const BAND_OFFSET = 22;
export const TITLE_OFFSET = 32;

/**
 * Noir et blanc par seuil ADAPTATIF : un pixel est du texte s'il est nettement plus sombre
 * (ou plus clair, avec `light`) que la moyenne de son voisinage. Le bas d'une carte mêle
 * fonds clairs, bandeaux gris et bord jaune : un seuil global, ou le gris brut, fait sauter
 * la ligne du numéro à Tesseract. Rejoué sur 32 images iPhone de cartes : le numéro est lu
 * sur 18 (1 avant, avec la petite zone en gris), le nom sur 28 (4 avant).
 * Le « gris » est le canal le plus clair de chaque pixel, pas la luminance : sur une carte
 * Feu, le texte gris foncé et le fond rouge ont presque la même luminance, alors que le
 * canal max rend le fond clair et laisse le texte sombre. Il est étiré entre les percentiles 2-98 %.
 * Moyenne locale par image intégrale : coût linéaire quel que soit le rayon.
 */
export function binarize(src, { targetHeight = BAND_TARGET_HEIGHT, offset = BAND_OFFSET, light = false } = {}) {
  const scale = Math.min(OCR_MAX_SCALE, Math.max(0.5, targetHeight / src.height));
  const width = Math.round(src.width * scale);
  const height = Math.round(src.height * scale);
  const out = document.createElement('canvas');
  out.width = width;
  out.height = height;
  const ctx = out.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(src, 0, 0, width, height);
  const img = ctx.getImageData(0, 0, width, height);
  binarizePixels(img.data, width, height, offset, light);
  ctx.putImageData(img, 0, 0);
  return out;
}

/** Cœur pur de `binarize` (RGBA en place) : testable sans canvas. */
export function binarizePixels(d, width, height, offset = BAND_OFFSET, light = false) {
  const n = width * height;
  const gray = new Uint8ClampedArray(n);
  const hist = new Uint32Array(256);
  for (let p = 0, i = 0; p < n; p += 1, i += 4) {
    gray[p] = Math.max(d[i], d[i + 1], d[i + 2]);
    hist[gray[p]] += 1;
  }
  const [lo, hi] = percentiles(hist, n, 0.02, 0.98);
  const span = Math.max(32, hi - lo);
  const w1 = width + 1;
  const integral = new Float64Array(w1 * (height + 1));
  for (let y = 0; y < height; y += 1) {
    let row = 0;
    for (let x = 0; x < width; x += 1) {
      const p = y * width + x;
      gray[p] = Math.max(0, Math.min(255, Math.round(((gray[p] - lo) * 255) / span)));
      row += gray[p];
      integral[(y + 1) * w1 + x + 1] = integral[y * w1 + x + 1] + row;
    }
  }
  const r = ADAPT_RADIUS;
  for (let y = 0; y < height; y += 1) {
    const y0 = Math.max(0, y - r);
    const y1 = Math.min(height, y + r + 1);
    for (let x = 0; x < width; x += 1) {
      const x0 = Math.max(0, x - r);
      const x1 = Math.min(width, x + r + 1);
      const sum = integral[y1 * w1 + x1] - integral[y0 * w1 + x1] - integral[y1 * w1 + x0] + integral[y0 * w1 + x0];
      const mean = sum / ((x1 - x0) * (y1 - y0));
      const p = y * width + x;
      const ink = light ? gray[p] > mean + offset : gray[p] < mean - offset;
      const i = p * 4;
      d[i] = d[i + 1] = d[i + 2] = ink ? 0 : 255;
      d[i + 3] = 255;
    }
  }
}

function percentiles(hist, total, low, high) {
  let acc = 0;
  let lo = 0;
  let hi = 255;
  let foundLo = false;
  for (let v = 0; v < 256; v += 1) {
    acc += hist[v];
    if (!foundLo && acc >= total * low) { lo = v; foundLo = true; }
    if (acc >= total * high) { hi = v; break; }
  }
  return [lo, hi];
}

// Sosies de chiffres fréquents en OCR : « O25 / l93 » doit se lire « 025/193 ».
const DIGIT_LOOKALIKES = { O: '0', o: '0', D: '0', Q: '0', I: '1', l: '1', '|': '1', i: '1', S: '5', B: '8', Z: '2' };
const STRICT_RE = /(\d{1,3})\s*\/\s*(\d{1,3})/g;
const LOOKALIKE_RE = /([0-9OoDQIli|SBZ]{1,3})\s*\/\s*([0-9OoDQIli|SBZ]{1,3})/g;
const fixDigits = (s) => s.replace(/[^0-9]/g, (c) => DIGIT_LOOKALIKES[c] ?? '');

function firstPlausible(text, re) {
  for (const m of text.matchAll(re)) {
    // Chaque côté doit contenir au moins un vrai chiffre : un mot (« Illus/ ») n'est pas un numéro.
    if (!/\d/.test(m[1]) || !/\d/.test(m[2])) continue;
    const num = parseInt(fixDigits(m[1]), 10);
    const total = parseInt(fixDigits(m[2]), 10);
    // Les cartes secrètes dépassent le total imprimé, mais jamais de plus d'une centaine.
    if (num > 0 && total > 0 && num <= total + 120) {
      return `${String(num).padStart(3, '0')}/${String(total).padStart(3, '0')}`;
    }
  }
  return null;
}

/**
 * On n'accepte que la forme « 025/197 » : un nombre isolé (année du copyright, PV…) donnerait de faux résultats.
 * On cherche d'abord des chiffres purs, puis seulement en corrigeant les sosies autour de la barre.
 */
export function extractCardNumber(text) {
  return firstPlausible(text, STRICT_RE) ?? firstPlausible(text, LOOKALIKE_RE);
}

export const isCardNumber = (q) => /^\d{1,4}(\/\d{1,4})?$/.test(q);

const fold = (str) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

let nameIndex = null;
/**
 * Index « nom replié → { fr, en } » construit depuis la table FR→EN de Dexup.
 * Les noms anglais sont indexés aussi, pour les cartes en anglais.
 */
export function buildNameIndex(frToEn) {
  const index = new Map();
  for (const [fr, en] of Object.entries(frToEn)) {
    const pretty = (n) => n.replace(/(^|[\s-])\p{L}/gu, (c) => c.toUpperCase());
    const entry = { fr: pretty(fr), en };
    if (fold(fr).length >= 3) index.set(fold(fr), entry);
    if (fold(en).length >= 3 && !index.has(fold(en))) index.set(fold(en), { fr: pretty(en), en });
  }
  nameIndex = index;
  return index;
}

function withinOneEdit(a, b) {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i += 1; j += 1; continue; }
    if (++edits > 1) return false;
    if (a.length > b.length) i += 1;
    else if (b.length > a.length) j += 1;
    else { i += 1; j += 1; }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

/**
 * Cherche un nom de Pokémon dans le texte lu en haut de la carte (approche de pokeum,
 * app/signals/name.py) : chaque mot et chaque paire de mots est comparé à l'index ;
 * le plus long nom exact gagne, et une seule faute est tolérée sur les noms de 6 lettres et plus.
 * Renvoie { fr, en } ou null.
 */
export function matchPokemonName(text, index = nameIndex) {
  if (!index || !text) return null;
  const words = text.split(/\s+/).map(fold).filter(Boolean);
  const keys = [];
  for (let i = 0; i < words.length; i += 1) {
    keys.push(words[i]);
    if (i + 1 < words.length) keys.push(words[i] + words[i + 1]);
  }
  let best = null;
  for (const k of keys) {
    const hit = index.get(k);
    if (hit && (!best || k.length > best.k.length)) best = { k, hit };
  }
  if (best) return best.hit;
  for (const k of keys) {
    if (k.length < 6) continue;
    for (const [name, hit] of index) {
      if (name.length >= 6 && withinOneEdit(k, name)) return hit;
    }
  }
  // Début du nom avalé par le bandeau « BASE » / « NIVEAU 1 » : « plouf » pour « Tiplouf ».
  // On accepte le nom le plus court qui CONTIENT le mot lu (au plus 3 lettres de plus),
  // s'il n'a pas d'égal : « plouf » → Tiplouf (+2) plutôt que Prinplouf (+4).
  let sub = null;
  for (const k of new Set(words)) {
    if (k.length < 5) continue;
    for (const [name, hit] of index) {
      const extra = name.length - k.length;
      if (extra < 1 || extra > 3 || !name.includes(k)) continue;
      if (!sub || extra < sub.extra || (extra === sub.extra && k.length > sub.k.length)) sub = { k, extra, hit, tie: false };
      else if (extra === sub.extra && k.length === sub.k.length && hit.en !== sub.hit.en) sub.tie = true;
    }
  }
  return sub && !sub.tie ? sub.hit : null;
}

/**
 * Parmi les cartes d'un Pokémon, celle dont le numéro ET la taille du set apparaissent
 * dans le texte lu en bas de la carte, même mal découpé (« 27 108 », « 27/1O8 » corrigé,
 * barre oblique perdue). Les nombres sont comparés sans zéros de tête.
 * Renvoie la carte si elle est la seule à correspondre, sinon null.
 */
export function pickCardByDigits(cards, texts) {
  const nums = new Set();
  for (const text of texts) {
    if (!text) continue;
    for (const m of fixLookalikeRuns(text).matchAll(/\d{1,3}/g)) nums.add(String(parseInt(m[0], 10)));
    // « 27108 » : barre lue comme rien — toutes les coupes possibles.
    for (const m of text.matchAll(/\d{3,6}/g)) {
      for (let i = 1; i < m[0].length; i += 1) {
        nums.add(`${parseInt(m[0].slice(0, i), 10)}|${parseInt(m[0].slice(i), 10)}`);
      }
    }
  }
  const hits = cards.filter((c) => {
    const num = String(parseInt(c.number, 10));
    const total = String(c.set?.printedTotal ?? '');
    if (!/^\d+$/.test(String(c.number)) || !total) return false;
    return (nums.has(num) && nums.has(total)) || nums.has(`${num}|${total}`);
  });
  return hits.length === 1 ? hits[0] : null;
}

// Corrige les sosies de chiffres uniquement collés à un vrai chiffre (« 1O8 » → « 108 »),
// pour ne pas transformer chaque « o » du texte en zéro.
const fixLookalikeRuns = (text) => text.replace(/[0-9OoDQIli|SBZ]*\d[0-9OoDQIli|SBZ]*/g, fixDigits);

// ─── PV et attaques ───────────────────────────────────────────────────────────
// Repris du scanner de main (2e7188d, iPaulux) : quand le numéro est illisible, les PV
// et les noms d'attaques lus sur la carte départagent les cartes d'un même Pokémon.

const plainWords = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]+/g, ' ').trim();
const tokenize = (text) => plainWords(text).split(' ').filter((t) => t.length >= 2);

function editDistance(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 9;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i += 1) {
    const row = [i];
    for (let j = 1; j <= b.length; j += 1) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = row;
  }
  return prev[b.length];
}

/** Cherche `phrase` dans une suite de mots lus, en tolérant les erreurs de lecture ; renvoie la distance ou null. */
function findPhrase(tokens, phrase) {
  const target = plainWords(phrase);
  if (target.length < 3) return null;
  const width = target.split(' ').length;
  const tolerance = target.length >= 8 ? 2 : target.length >= 5 ? 1 : 0; // les noms courts doivent être exacts
  let best = null;
  for (let i = 0; i + width <= tokens.length; i += 1) {
    const d = editDistance(tokens.slice(i, i + width).join(' '), target);
    if (d <= tolerance && (best === null || d < best)) best = d;
  }
  return best;
}

/** Les PV sont le seul nombre rond (30 à 340) du bandeau du nom. */
export function extractHp(text) {
  const values = [...(text || '').matchAll(/\d{2,3}/g)].map((m) => Number(m[0])).filter((n) => n >= 30 && n <= 340 && n % 10 === 0);
  return values.length ? values[values.length - 1] : null;
}

/**
 * Classe les cartes d'un Pokémon selon ce qui a été lu : PV (+2), nom d'attaque ou de talent
 * retrouvé dans le texte du corps (+3 chacun), dégâts de toutes ses attaques retrouvés (+2). Tri stable : à score égal, l'ordre d'origine
 * (les plus récentes d'abord) est gardé. Renvoie [{ card, score }], le meilleur en premier.
 */
export function rankCards(cards, { hp, body }) {
  const tokens = tokenize(body || '');
  const numbers = new Set([...(body || '').matchAll(/\d{1,3}/g)].map((m) => Number(m[0])));
  return cards
    .map((card) => {
      let score = 0;
      if (hp && Number(card.hp) === hp) score += 2;
      for (const attack of card.attacks || []) if (findPhrase(tokens, attack.name) !== null) score += 3;
      for (const ability of card.abilities || []) if (findPhrase(tokens, ability.name) !== null) score += 3;
      // Dégâts des attaques (« 30 », « 10× ») : indépendants de la langue, contrairement aux noms
      // d'attaques de l'API (en anglais) — une carte française se départage aussi.
      const damages = (card.attacks || []).map((at) => parseInt(at.damage, 10)).filter((n) => n > 0);
      if (damages.length && damages.every((n) => numbers.has(n))) score += 2;
      return { card, score };
    })
    .sort((a, b) => b.score - a.score);
}

/**
 * Une carte se détache nettement : au moins deux indices concordants (PV + dégâts, ou une
 * attaque reconnue) et strictement devant toutes les autres.
 */
export function clearWinner(ranked) {
  if (!ranked.length) return null;
  const [first, second] = ranked;
  return first.score >= 3 && (!second || first.score > second.score) ? first.card : null;
}
