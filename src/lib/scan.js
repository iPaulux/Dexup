// OCR du numéro de carte (Tesseract chargé à la demande) + helpers de recadrage.

let workerPromise = null;

export function getOcrWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng', 1, { logger: () => {} });
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789/',
        tessedit_pageseg_mode: '7', // une seule ligne : « 025/197 »
      });
      return worker;
    })().catch((e) => { workerPromise = null; throw e; });
  }
  return workerPromise;
}

// Doit rester aligné sur le cadre affiché (.cam-frame : 65 % de large, ratio 3/4, zone numéro 18 %).
const FRAME_WIDTH = 0.65;
const NUMBER_STRIP = 0.18;

export function cropNumberArea(video, invert = false) {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return null;

  const frameW = vw * FRAME_WIDTH;
  const frameH = frameW * (4 / 3);
  const frameX = (vw - frameW) / 2;
  const frameY = (vh - frameH) / 2;
  const stripH = frameH * NUMBER_STRIP;
  const stripY = frameY + frameH - stripH;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(frameW);
  canvas.height = Math.round(stripH);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, frameX, stripY, frameW, stripH, 0, 0, canvas.width, canvas.height);

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

export function extractCardNumber(text) {
  const m = text.match(/\b(\d{1,4}(?:\/\d{1,4})?)\b/);
  return m ? m[1] : null;
}

export const isCardNumber = (q) => /^\d{1,4}(\/\d{1,4})?$/.test(q);
