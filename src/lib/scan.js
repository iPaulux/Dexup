// OCR du numéro de carte (Tesseract chargé à la demande) + recadrage de la zone visée.
//
// L'analyse du numéro (corrections O→0, I/l/|→1) est adaptée de pokeum
// (app/signals/ocr.py), © 2026 TBLgGamin, licence MIT : voir third_party/pokeum/LICENSE.

let workerPromise = null;

export function getOcrWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng', 1, { logger: () => {} });
      // Le bas d'une carte tient sur plusieurs lignes (illustrateur, numéro, texte) : mode « bloc de texte ».
      // Le mode « ligne unique » ne lit rien dès qu'une deuxième ligne entre dans le cadre.
      await worker.setParameters({ tessedit_pageseg_mode: '6' });
      return worker;
    })().catch((e) => { workerPromise = null; throw e; });
  }
  return workerPromise;
}

/** Charge Tesseract en arrière-plan pour que le premier scan ne paie pas le téléchargement. */
export function warmOcr() {
  getOcrWorker().catch(() => {});
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

/** Découpe dans la vidéo exactement ce que l'utilisateur voit dans `zoneEl`. */
export function cropZone(video, zoneEl) {
  return cropRect(video, sourceRect(video, zoneEl));
}

// Bandeau du nom, en fraction du cadre de la carte. Plus haut que la carte elle-même
// (de -6 % à 16 %) : une carte tenue à la main est rarement pile dans le cadre.
const TITLE_BAND = [0.02, -0.06, 0.8, 0.16];

/** Découpe le bandeau du nom (en haut de la carte) dans le cadre `frameEl`. */
export function cropTitle(video, frameEl) {
  const f = sourceRect(video, frameEl);
  if (!f) return null;
  const [l, t, r, b] = TITLE_BAND;
  const x = Math.max(0, f.x + l * f.width);
  const y = Math.max(0, f.y + t * f.height);
  return cropRect(video, {
    x, y,
    width: Math.min(video.videoWidth - x, (r - l) * f.width),
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

// Tesseract lit le mieux des caractères d'environ 30 px : on vise une bande de cette hauteur,
// sans agrandir inutilement un flux déjà en haute définition (chaque pixel en plus coûte du temps OCR).
const OCR_TARGET_HEIGHT = 180;
const OCR_MAX_SCALE = 3;
export const TITLE_TARGET_HEIGHT = 220;

/**
 * Prépare la zone pour l'OCR : agrandissement adapté, niveaux de gris et contraste
 * automatique (étirement entre les percentiles 2 % et 98 %, robuste aux reflets et à la pénombre).
 * Le « gris » est le canal le plus clair de chaque pixel, pas la luminance : sur une carte
 * Feu, le texte gris foncé et le fond rouge ont presque la même luminance et le texte
 * disparaît, alors que le canal max rend le fond clair et laisse le texte sombre.
 * Renvoie la version normale et la version inversée (texte clair sur fond sombre),
 * toutes deux tirées de la MÊME image — l'ancienne version recapturait une deuxième image.
 */
export function preprocess(src, targetHeight = OCR_TARGET_HEIGHT) {
  const scale = Math.min(OCR_MAX_SCALE, Math.max(1, targetHeight / src.height));
  const width = Math.round(src.width * scale);
  const height = Math.round(src.height * scale);

  const normal = document.createElement('canvas');
  normal.width = width;
  normal.height = height;
  const ctx = normal.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(src, 0, 0, width, height);
  const img = ctx.getImageData(0, 0, width, height);
  const d = img.data;

  const n = width * height;
  const gray = new Uint8ClampedArray(n);
  const hist = new Uint32Array(256);
  for (let p = 0, i = 0; p < n; p += 1, i += 4) {
    gray[p] = Math.max(d[i], d[i + 1], d[i + 2]);
    hist[gray[p]] += 1;
  }
  const [lo, hi] = percentiles(hist, n, 0.02, 0.98);
  const span = Math.max(32, hi - lo); // un fond uni ne doit pas être amplifié en bruit

  const inv = new ImageData(width, height);
  const e = inv.data;
  for (let p = 0, i = 0; p < n; p += 1, i += 4) {
    const c = Math.max(0, Math.min(255, Math.round(((gray[p] - lo) * 255) / span)));
    d[i] = d[i + 1] = d[i + 2] = c;
    e[i] = e[i + 1] = e[i + 2] = 255 - c;
    e[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);

  const inverted = document.createElement('canvas');
  inverted.width = width;
  inverted.height = height;
  inverted.getContext('2d').putImageData(inv, 0, 0);
  return { normal, inverted };
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
  return null;
}
