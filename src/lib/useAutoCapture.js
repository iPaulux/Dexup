// Scan mains libres : déclenche la lecture dès que le cadre contient une bonne image.
//
// Adapté de pokeum (frontend/src/composables/useAutoCapture.ts), © 2026 TBLgGamin,
// licence MIT : voir third_party/pokeum/LICENSE.
//
// On échantillonne uniquement le cadre de la carte (jamais toute la vidéo), réduit à
// 160 px de large : une mesure coûte moins d'une milliseconde, 10 fois par seconde.
// Après un scan, le déclencheur est désarmé jusqu'à ce que la carte bouge : une carte
// laissée dans le cadre n'est jamais relue en boucle, mais changer de carte relance le scan.

import { useCallback, useEffect, useRef, useState } from 'react';
import { sourceRect } from './scan';
import {
  assessFrame, CLEARED_SAMPLES_REQUIRED, HINT_AFTER_SAMPLES, hintFor, isSettled,
  PATIENCE_SAMPLES, QUALITY_SAMPLE_WIDTH, STABLE_SAMPLES_REQUIRED,
} from './quality';

const SAMPLE_INTERVAL_MS = 100;

// Un seul canvas pour toute l'app ; willReadFrequently garde la surface côté CPU,
// ce que des getImageData répétés réclament.
let sampleCanvas = null;
let sampleContext = null;
function getSampler() {
  if (!sampleCanvas) {
    sampleCanvas = document.createElement('canvas');
    sampleContext = sampleCanvas.getContext('2d', { willReadFrequently: true });
  }
  return sampleContext;
}

/**
 * @param {object} o
 * @param {React.RefObject<HTMLVideoElement>} o.videoRef  aperçu caméra
 * @param {React.RefObject<HTMLElement>} o.frameRef       cadre de la carte à mesurer
 * @param {boolean} o.enabled  échantillonne seulement si vrai (caméra active, rien par-dessus)
 * @param {boolean} o.busy     lecture en cours : les échantillons attendent
 * @param {() => void} o.onStable  appelé une fois par série stable armée
 */
export function useAutoCapture({ videoRef, frameRef, enabled, busy, onStable }) {
  const [hint, setHint] = useState('');
  const live = useRef({ enabled, busy, onStable });
  live.current = { enabled, busy, onStable };

  const state = useRef({ prev: null, armed: true, stable: 0, settled: 0, cleared: 0, problem: 'ok', problemCount: 0 });

  const resetStreaks = useCallback(() => {
    const s = state.current;
    s.stable = 0;
    s.settled = 0;
    s.problem = 'ok';
    s.problemCount = 0;
    setHint('');
  }, []);

  /** Bloque le déclenchement jusqu'à ce que l'image change (la carte a été traitée). */
  const disarm = useCallback(() => {
    state.current.armed = false;
    state.current.cleared = 0;
    resetStreaks();
  }, [resetStreaks]);

  /** Réarme tout de suite (lecture ratée : on retente sur les images suivantes). */
  const rearm = useCallback(() => {
    state.current.armed = true;
    resetStreaks();
  }, [resetStreaks]);

  useEffect(() => {
    const tick = () => {
      const s = state.current;
      const { enabled: on, busy: working } = live.current;
      if (!on || document.hidden) {
        // L'historique ne dit rien de la prochaine image présentée.
        s.prev = null;
        if (s.stable || s.settled || s.problemCount) resetStreaks();
        return;
      }
      const video = videoRef.current;
      const ctx = getSampler();
      if (working || !video || !ctx) return;
      const r = sourceRect(video, frameRef.current);
      if (!r) return;

      const width = QUALITY_SAMPLE_WIDTH;
      const height = Math.max(1, Math.round((r.height / r.width) * width));
      if (sampleCanvas.width !== width || sampleCanvas.height !== height) {
        sampleCanvas.width = width;
        sampleCanvas.height = height;
        s.prev = null; // géométrie différente : tampon précédent incomparable
      }
      ctx.drawImage(video, r.x, r.y, r.width, r.height, 0, 0, width, height);
      const sample = assessFrame(s.prev, ctx.getImageData(0, 0, width, height));
      s.prev = sample.gray;
      const { verdict } = sample;

      if (!s.armed) {
        // Seul un vrai mouvement réarme : une carte laissée dans le cadre n'est pas relue.
        if (verdict === 'moving' || verdict === 'blurry') {
          s.cleared += 1;
          if (s.cleared >= CLEARED_SAMPLES_REQUIRED) {
            s.armed = true;
            s.cleared = 0;
            resetStreaks();
          }
        } else {
          s.cleared = 0;
        }
        return;
      }

      s.stable = verdict === 'ok' ? s.stable + 1 : 0;
      s.settled = isSettled(sample) ? s.settled + 1 : 0;
      if (s.stable >= STABLE_SAMPLES_REQUIRED || s.settled >= PATIENCE_SAMPLES) {
        disarm();
        live.current.onStable();
        return;
      }

      // On ne conseille que sur un problème qui dure : un simple tremblement ne doit rien afficher.
      if (verdict === 'ok') {
        if (s.problemCount) setHint('');
        s.problem = 'ok';
        s.problemCount = 0;
      } else {
        s.problemCount = verdict === s.problem ? s.problemCount + 1 : 1;
        s.problem = verdict;
        if (s.problemCount === HINT_AFTER_SAMPLES) setHint(hintFor(verdict));
      }
    };
    const timer = window.setInterval(tick, SAMPLE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [videoRef, frameRef, disarm, resetStreaks]);

  return { hint, disarm, rearm };
}
