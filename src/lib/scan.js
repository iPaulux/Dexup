// Lecture d'une carte cadrée par la caméra (nom, PV, numéro), avec Tesseract chargé à la demande.

let workerPromise = null;

function getOcrWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      const { createWorker } = await import('tesseract.js');
      return createWorker('eng', 1, { logger: () => {} });
    })().catch((e) => { workerPromise = null; throw e; });
  }
  return workerPromise;
}

/**
 * Découpe dans la vidéo une bande horizontale du cadre affiché (`from` et `height` en fraction de sa hauteur),
 * agrandie `scale` fois. La vidéo est en `object-fit: cover` : on reconvertit le rectangle écran en pixels vidéo.
 */
function cropBand(video, frameEl, from, height, scale) {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return null;

  const box = video.getBoundingClientRect();
  const frame = frameEl.getBoundingClientRect();
  const fit = Math.max(box.width / vw, box.height / vh);
  const offsetX = (box.width - vw * fit) / 2;
  const offsetY = (box.height - vh * fit) / 2;
  const sx = Math.max(0, (frame.left - box.left - offsetX) / fit);
  const sy = Math.max(0, (frame.top + frame.height * from - box.top - offsetY) / fit);
  const sw = Math.min(vw - sx, frame.width / fit);
  const sh = Math.min(vh - sy, (frame.height * height) / fit);
  if (sw < 8 || sh < 8) return null; // flux vidéo pas encore prêt

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(sw * scale);
  canvas.height = Math.round(sh * scale);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/**
 * Niveaux de gris avec contraste adaptatif : la fraction `white` de pixels les plus clairs devient blanche,
 * le texte noir. Indispensable sur une vraie photo, où l'éclairage varie d'une carte à l'autre.
 * Un fond coloré (corps de la carte) demande une fraction plus forte qu'un bandeau clair.
 */
function normalize(src, white = 0.3) {
  const dst = document.createElement('canvas');
  dst.width = src.width;
  dst.height = src.height;
  const ctx = dst.getContext('2d');
  ctx.drawImage(src, 0, 0);
  const img = ctx.getImageData(0, 0, dst.width, dst.height);
  const d = img.data;
  const count = d.length / 4;
  const gray = new Uint8Array(count);
  const histogram = new Uint32Array(256);
  for (let i = 0; i < count; i++) {
    const g = Math.round(0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]);
    gray[i] = g;
    histogram[g]++;
  }
  let lo = 0;
  let hi = 255;
  for (let acc = 0; lo < 255; lo++) { acc += histogram[lo]; if (acc > count * 0.02) break; }
  for (let acc = 0; hi > 0; hi--) { acc += histogram[hi]; if (acc > count * white) break; }
  const range = Math.max(1, hi - lo);
  for (let i = 0; i < count; i++) {
    const v = Math.max(0, Math.min(255, ((gray[i] - lo) * 255) / range));
    d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v;
  }
  ctx.putImageData(img, 0, 0);
  return dst;
}

const LOOKALIKES = { O: '0', o: '0', I: '1', l: '1', S: '5', B: '8' };
const digits = (s) => s.replace(/[OoIlSB]/g, (c) => LOOKALIKES[c]);

// On n'accepte que la forme « 025/197 » : un nombre isolé (année du copyright, PV…) donnerait de faux résultats.
export function extractCardNumber(text) {
  for (const m of text.matchAll(/([0-9OoIlSB]{1,3})\s*\/\s*([0-9OoIlSB]{1,3})/g)) {
    if (/\d/.test(m[1]) && /\d/.test(m[2])) return `${digits(m[1])}/${digits(m[2])}`;
  }
  return null;
}

// ─── Nom du Pokémon ──────────────────────────────────────────────────────────
const plain = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]+/g, ' ').trim();

function distance(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 9;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = row;
  }
  return prev[b.length];
}

/** Cherche `phrase` dans une suite de mots lus, en tolérant les erreurs de lecture ; renvoie la distance ou null. */
function findPhrase(tokens, phrase) {
  const target = plain(phrase);
  if (target.length < 3) return null;
  const width = target.split(' ').length;
  const tolerance = target.length >= 8 ? 2 : target.length >= 5 ? 1 : 0; // les noms courts doivent être exacts
  let best = null;
  for (let i = 0; i + width <= tokens.length; i++) {
    const d = distance(tokens.slice(i, i + width).join(' '), target);
    if (d <= tolerance && (best === null || d < best)) best = d;
  }
  return best;
}

const tokenize = (text) => plain(text).split(' ').filter((t) => t.length >= 2);

/**
 * Retrouve dans un texte lu (bruité) un nom de Pokémon, français ou anglais, et renvoie son nom anglais.
 * `names` : dictionnaire { nom français: nom anglais }.
 */
export function matchSpecies(text, names) {
  const tokens = tokenize(text);
  let best = null;
  const consider = (label, en) => {
    const d = findPhrase(tokens, label);
    if (d === null) return;
    const score = plain(label).length - d * 1.5;
    if (!best || score > best.score) best = { score, en };
  };
  for (const [fr, en] of Object.entries(names)) { consider(fr, en); consider(en, en); }
  return best?.en ?? null;
}

/**
 * Classe des cartes candidates selon ce qui a été lu : numéro, PV, noms d'attaques retrouvés dans le texte.
 * Renvoie les cartes triées, la meilleure en premier, chacune avec son `score`.
 */
export function rankCards(cards, { hp, number, body }) {
  const tokens = tokenize(body || '');
  const num = number ? String(parseInt(number, 10)) : null;
  return cards
    .map((card) => {
      let score = 0;
      if (num && card.number === num) score += 5;
      if (hp && Number(card.hp) === hp) score += 2;
      for (const attack of card.attacks || []) if (findPhrase(tokens, attack.name) !== null) score += 3;
      for (const ability of card.abilities || []) if (findPhrase(tokens, ability.name) !== null) score += 3;
      return { card, score };
    })
    .sort((a, b) => b.score - a.score);
}

// Les PV sont le seul nombre rond de la bande du haut.
export function extractHp(text) {
  const values = [...text.matchAll(/\d{2,3}/g)].map((m) => Number(m[0])).filter((n) => n >= 30 && n <= 340 && n % 10 === 0);
  return values.length ? values[values.length - 1] : null;
}

/**
 * Lit la carte cadrée dans `frameEl`. Le nom et les PV (gros caractères, en haut) se lisent bien même sur
 * une photo moyenne ; le numéro (minuscule, en bas) est un bonus qui isole la carte exacte quand il passe.
 */
export async function readCard(video, frameEl, names, onReady) {
  const worker = await getOcrWorker();
  onReady?.();
  const read = async (canvas, psm) => {
    await worker.setParameters({ tessedit_pageseg_mode: psm });
    return (await worker.recognize(canvas)).data.text;
  };
  const result = { name: null, hp: null, number: null, body: '' };

  const top = cropBand(video, frameEl, 0, 0.14, 2);
  if (!top) return result;
  const header = normalize(top);
  for (const psm of ['11', '6']) { // « 11 » = texte épars, « 6 » = bloc de texte
    const text = await read(header, psm);
    result.name ||= matchSpecies(text, names);
    result.hp ||= extractHp(text);
    if (result.name && result.hp) break;
  }

  // Texte des attaques : sert à départager les cartes d'un même Pokémon.
  const middle = cropBand(video, frameEl, 0.46, 0.4, 2);
  if (middle) {
    for (const white of [0.6, 0.4]) result.body += `${await read(normalize(middle, white), '11')}\n`;
  }

  const bottom = cropBand(video, frameEl, 0.86, 0.14, 3);
  if (bottom) {
    for (const [white, psm] of [[0.3, '11'], [0.3, '6'], [0.6, '11']]) {
      result.number = extractCardNumber(await read(normalize(bottom, white), psm));
      if (result.number) break;
    }
  }
  return result;
}

export const isCardNumber = (q) => /^\d{1,4}(\/\d{1,4})?$/.test(q);
