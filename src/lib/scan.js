// OCR du numéro de carte (Tesseract chargé à la demande) + recadrage de la zone visée.

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

/**
 * Découpe dans la vidéo exactement ce que l'utilisateur voit dans `zoneEl`.
 * La vidéo est affichée en `object-fit: cover` : on reconvertit le rectangle écran en pixels vidéo.
 */
export function cropZone(video, zoneEl, invert = false) {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return null;

  const box = video.getBoundingClientRect();
  const zone = zoneEl.getBoundingClientRect();
  const scale = Math.max(box.width / vw, box.height / vh);
  const offsetX = (box.width - vw * scale) / 2;
  const offsetY = (box.height - vh * scale) / 2;
  const sx = Math.max(0, (zone.left - box.left - offsetX) / scale);
  const sy = Math.max(0, (zone.top - box.top - offsetY) / scale);
  const sw = Math.min(vw - sx, zone.width / scale);
  const sh = Math.min(vh - sy, zone.height / scale);
  if (sw < 8 || sh < 8) return null; // flux vidéo pas encore prêt

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(sw);
  canvas.height = Math.round(sh);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

  if (invert) {
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < img.data.length; i += 4) {
      img.data[i] = 255 - img.data[i];
      img.data[i + 1] = 255 - img.data[i + 1];
      img.data[i + 2] = 255 - img.data[i + 2];
    }
    ctx.putImageData(img, 0, 0);
  }
  return canvas;
}

// Niveaux de gris + contraste + agrandissement ×2 : améliore nettement la lecture.
export function preprocess(src) {
  const dst = document.createElement('canvas');
  dst.width = src.width * 2;
  dst.height = src.height * 2;
  const ctx = dst.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(src, 0, 0, dst.width, dst.height);
  const img = ctx.getImageData(0, 0, dst.width, dst.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const c = Math.max(0, Math.min(255, Math.round((g - 50) * (255 / 150))));
    d[i] = d[i + 1] = d[i + 2] = c;
  }
  ctx.putImageData(img, 0, 0);
  return dst;
}

// On n'accepte que la forme « 025/197 » : un nombre isolé (année du copyright, PV…) donnerait de faux résultats.
export function extractCardNumber(text) {
  const m = text.match(/(\d{1,3})\s*\/\s*(\d{1,3})/);
  return m ? `${m[1]}/${m[2]}` : null;
}

export const isCardNumber = (q) => /^\d{1,4}(\/\d{1,4})?$/.test(q);
