// Mesures pures de qualité d'image pour le déclenchement automatique du scan.
//
// Adapté de pokeum (frontend/src/lib/quality.ts), © 2026 TBLgGamin, licence MIT :
// voir third_party/pokeum/LICENSE.
//
// Le scanner échantillonne le cadre plusieurs fois par seconde et ne lance la lecture
// que lorsque l'image en vaut la peine : assez lumineuse, immobile et nette.
// Tout est pur (des pixels en entrée, des nombres en sortie) : aucun canvas ici.
//
// Les seuils sont réglés pour l'échantillon réduit (QUALITY_SAMPLE_WIDTH de large),
// pas pour l'image pleine résolution.

/** Largeur de l'échantillon mesuré : une passe complète coûte bien moins d'1 ms. */
export const QUALITY_SAMPLE_WIDTH = 160;

/** Variance minimale du laplacien : en dessous, le texte de la carte est flou. */
export const SHARPNESS_MIN = 35;

/** Différence moyenne maximale entre deux échantillons pour considérer l'image immobile. */
export const MOTION_MAX = 10;

/** Mouvement toléré pour une carte « posée » tenue à la main (tremblement normal). */
export const MOTION_SETTLED_MAX = 22;

/** Détail minimal d'un échantillon posé pour qu'il y ait bien une carte (une table vide est plate). */
export const PATIENCE_SHARPNESS_MIN = 12;

/** Luminance moyenne trop faible pour lire le numéro. */
export const BRIGHTNESS_MIN = 50;

/** Luminance moyenne trop forte : un reflet écrase la carte. */
export const BRIGHTNESS_MAX = 210;

/** Échantillons parfaits consécutifs avant déclenchement (~0,2 s à 100 ms). */
export const STABLE_SAMPLES_REQUIRED = 2;

/** Échantillons « posés » consécutifs après lesquels on déclenche quand même (~0,6 s). */
export const PATIENCE_SAMPLES = 6;

/** Un problème doit persister ce nombre d'échantillons avant d'afficher un conseil (~0,4 s). */
export const HINT_AFTER_SAMPLES = 4;

/** Échantillons en mouvement consécutifs qui réarment le scan après un résultat. */
export const CLEARED_SAMPLES_REQUIRED = 2;

/** Luminance Rec. 601 de chaque pixel, un octet par pixel. */
export function toGray({ data, width, height }) {
  const gray = new Uint8ClampedArray(width * height);
  for (let p = 0, i = 0; p < gray.length; p += 1, i += 4) {
    gray[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  return gray;
}

/** Netteté : variance du laplacien à 4 voisins sur les pixels intérieurs. */
export function sharpness(gray, width, height) {
  if (width < 3 || height < 3) return 0;
  let sum = 0;
  let sumSquares = 0;
  let count = 0;
  for (let y = 1; y < height - 1; y += 1) {
    const row = y * width;
    for (let x = 1; x < width - 1; x += 1) {
      const i = row + x;
      const lap = 4 * gray[i] - gray[i - 1] - gray[i + 1] - gray[i - width] - gray[i + width];
      sum += lap;
      sumSquares += lap * lap;
      count += 1;
    }
  }
  const mean = sum / count;
  return sumSquares / count - mean * mean;
}

/** Différence absolue moyenne avec l'échantillon précédent ; 0 sans point de comparaison. */
export function motion(prev, gray) {
  if (!prev || prev.length !== gray.length || gray.length === 0) return 0;
  let total = 0;
  for (let i = 0; i < gray.length; i += 1) total += Math.abs(gray[i] - prev[i]);
  return total / gray.length;
}

/** Luminance moyenne. */
export function brightness(gray) {
  if (gray.length === 0) return 0;
  let total = 0;
  for (let i = 0; i < gray.length; i += 1) total += gray[i];
  return total / gray.length;
}

/**
 * Juge un échantillon : verdict ('ok' | 'blurry' | 'moving' | 'dark' | 'bright'),
 * plus le tampon gris (pour la comparaison suivante), le mouvement et la netteté.
 * L'exposition est testée d'abord (c'est ce que l'utilisateur corrige tout de suite),
 * puis le mouvement (qui fausse la netteté), puis le flou.
 */
export function assessFrame(prev, sample) {
  const gray = toGray(sample);
  const level = brightness(gray);
  if (level < BRIGHTNESS_MIN) return { verdict: 'dark', gray, motion: 0, sharpness: 0 };
  if (level > BRIGHTNESS_MAX) return { verdict: 'bright', gray, motion: 0, sharpness: 0 };
  const moved = motion(prev, gray);
  const focus = sharpness(gray, sample.width, sample.height);
  if (moved > MOTION_MAX) return { verdict: 'moving', gray, motion: moved, sharpness: focus };
  if (focus < SHARPNESS_MIN) return { verdict: 'blurry', gray, motion: moved, sharpness: focus };
  return { verdict: 'ok', gray, motion: moved, sharpness: focus };
}

/** Échantillon « posé » : bien exposé, à peu près immobile, et avec assez de détail pour être une carte. */
export function isSettled(result) {
  return result.verdict !== 'dark'
    && result.verdict !== 'bright'
    && result.motion <= MOTION_SETTLED_MAX
    && result.sharpness >= PATIENCE_SHARPNESS_MIN;
}

const HINTS = {
  ok: '',
  blurry: 'Ne bouge plus',
  moving: 'Ne bouge plus',
  dark: 'Plus de lumière',
  bright: 'Trop de reflets — incline la carte',
};

/** Conseil court à afficher pour un verdict ; chaîne vide si l'image est bonne. */
export const hintFor = (verdict) => HINTS[verdict] ?? '';
