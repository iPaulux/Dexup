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
  const r = sourceRect(video, zoneEl);
  if (!r) return null;
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

/**
 * Prépare la zone pour l'OCR : agrandissement adapté, niveaux de gris et contraste
 * automatique (étirement entre les percentiles 2 % et 98 %, robuste aux reflets et à la pénombre).
 * Renvoie la version normale et la version inversée (texte clair sur fond sombre),
 * toutes deux tirées de la MÊME image — l'ancienne version recapturait une deuxième image.
 */
export function preprocess(src) {
  const scale = Math.min(OCR_MAX_SCALE, Math.max(1, OCR_TARGET_HEIGHT / src.height));
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
    const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    gray[p] = g;
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
