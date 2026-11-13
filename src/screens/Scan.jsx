import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CameraOff, Keyboard, Layers, ScanLine, SwitchCamera, X } from 'lucide-react';
import { useCollection } from '../store/collection';
import { searchCards } from '../lib/tcg';
import { cropZone, extractCardNumber, getOcrWorker, isCardNumber, preprocess } from '../lib/scan';
import { CardsView } from '../components/cards';
import { SearchField, Sheet, plural } from '../components/ui';

const BARCODE_OK = typeof window !== 'undefined' && 'BarcodeDetector' in window;
const CORNERS = [
  { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 16 },
  { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 16 },
  { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 16 },
  { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 16 },
];

export default function Scan() {
  const navigate = useNavigate();
  const { openCard } = useCollection();
  const videoRef = useRef(null);
  const zoneRef = useRef(null);
  const streamRef = useRef(null);
  const startId = useRef(0);
  const lastScan = useRef({ code: null, at: 0 });

  const [cam, setCam] = useState('starting'); // starting | active | denied | unsupported
  const [facing, setFacing] = useState('environment');
  const [ocr, setOcr] = useState('idle'); // idle | loading | running
  const [message, setMessage] = useState(null);
  const [input, setInput] = useState('');
  const [results, setResults] = useState({ query: '', cards: [] });
  const [searching, setSearching] = useState(false);
  const [sheet, setSheet] = useState(null); // null | 'results' | 'manual'

  const runSearch = useCallback(async (raw) => {
    const q = raw.trim();
    if (!q) return;
    setSearching(true);
    setMessage(`Recherche de « ${q} »…`);
    try {
      let cards;
      if (isCardNumber(q)) {
        // « 001/165 » : numéro sans zéros de tête + taille du set, ce qui isole presque toujours la bonne carte.
        const [num, total] = q.split('/').map((n) => String(parseInt(n, 10)));
        cards = total ? (await searchCards({ number: num, printedTotal: total, pageSize: 30 })).cards : [];
        if (!cards.length) cards = (await searchCards({ number: num, pageSize: 30 })).cards;
      } else {
        cards = (await searchCards({ name: q, pageSize: 20 })).cards;
      }
      if (cards.length) {
        setResults({ query: q, cards });
        setMessage(null);
        // Une seule carte possible : on ouvre directement sa fiche.
        if (cards.length === 1) openCard(cards[0]); else setSheet('results');
      } else {
        setMessage(`Aucune carte trouvée pour « ${q} ».`);
      }
    } catch (_) {
      setMessage('Erreur réseau. Vérifie ta connexion.');
    }
    setSearching(false);
  }, [openCard]);

  const stopStream = useCallback(() => {
    startId.current++;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async (mode) => {
    stopStream();
    const id = startId.current;
    setCam('starting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      // L'écran a été quitté (ou la caméra relancée) pendant la demande d'autorisation.
      if (id !== startId.current) { stream.getTracks().forEach((t) => t.stop()); return; }
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
      setCam('active');
    } catch (e) {
      if (id === startId.current) setCam(e?.name === 'NotAllowedError' ? 'denied' : 'unsupported');
    }
  }, [stopStream]);

  useEffect(() => {
    startCamera('environment');
    return stopStream;
  }, [startCamera, stopStream]);

  // Codes-barres / QR codes : détection continue quand le navigateur la propose.
  useEffect(() => {
    if (cam !== 'active' || !BARCODE_OK) return undefined;
    const detector = new window.BarcodeDetector({
      formats: ['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39', 'data_matrix'],
    });
    let raf = null;
    let alive = true;
    const loop = async () => {
      if (!alive) return;
      try {
        const code = (await detector.detect(videoRef.current))[0]?.rawValue;
        const now = Date.now();
        if (code && (code !== lastScan.current.code || now - lastScan.current.at > 5000)) {
          lastScan.current = { code, at: now };
          setInput(code);
          runSearch(code);
        }
      } catch (_) { /* image pas encore prête */ }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { alive = false; if (raf) cancelAnimationFrame(raf); };
  }, [cam, runSearch]);

  const flip = () => {
    const next = facing === 'environment' ? 'user' : 'environment';
    setFacing(next);
    startCamera(next);
  };

  const snap = async () => {
    const video = videoRef.current;
    if (cam !== 'active' || ocr !== 'idle' || searching) return;
    const crop = cropZone(video, zoneRef.current);
    if (!crop) return;

    setMessage(null);
    setOcr('loading');
    try {
      const worker = await getOcrWorker();
      setOcr('running');
      let number = extractCardNumber((await worker.recognize(preprocess(crop))).data.text);
      if (!number) {
        const inverted = cropZone(video, zoneRef.current, true);
        if (inverted) number = extractCardNumber((await worker.recognize(preprocess(inverted))).data.text);
      }
      setOcr('idle');
      if (number) {
        setInput(number);
        runSearch(number);
      } else {
        setMessage('Numéro illisible — rapproche la carte ou saisis-le à la main.');
      }
    } catch (_) {
      setOcr('idle');
      setMessage('Lecture indisponible — saisis le numéro à la main.');
    }
  };

  const submitManual = () => {
    if (!input.trim()) return;
    setSheet(null);
    runSearch(input);
  };

  const close = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/'));
  const busy = ocr !== 'idle' || searching;
  const hint = message
    ?? (ocr === 'loading' ? 'Préparation de la lecture (première fois)…'
      : ocr === 'running' ? 'Lecture du numéro…'
        : 'Place le numéro de la carte dans le cadre en pointillés');

  return (
    <div className="scan">
      <video ref={videoRef} playsInline muted style={cam === 'active' ? undefined : { visibility: 'hidden' }} />

      <div className="scan-top">
        <button className="scan-btn" onClick={close} aria-label="Fermer le scanner"><X size={22} /></button>
        <b>Scanner</b>
        <button className="scan-btn" onClick={flip} aria-label="Changer de caméra" style={cam === 'active' ? undefined : { visibility: 'hidden' }}>
          <SwitchCamera size={20} />
        </button>
      </div>

      <div className="scan-center">
        {cam === 'active' && (
          <>
            <div className="scan-frame">
              {CORNERS.map((style, i) => <span key={i} className="scan-corner" style={style} />)}
              {!busy && <span className="scan-line" />}
              <span className="scan-zone" ref={zoneRef} />
            </div>
            <p className="scan-hint" role="status">{hint}</p>
          </>
        )}
        {cam === 'starting' && <div className="scan-state"><div className="spinner" style={{ borderColor: 'rgba(255,255,255,.25)', borderTopColor: '#fff' }} /><span className="small">Activation de la caméra…</span></div>}
        {(cam === 'denied' || cam === 'unsupported') && (
          <div className="scan-state">
            <CameraOff size={34} />
            <b>{cam === 'denied' ? 'Accès à la caméra refusé' : 'Caméra indisponible'}</b>
            <span className="small" style={{ opacity: 0.75 }}>
              {cam === 'denied' ? 'Autorise la caméra dans les réglages de ton navigateur, ou saisis le numéro de la carte.' : 'Tu peux quand même chercher une carte par son numéro ou son nom.'}
            </span>
            {message && <span className="small" role="status">{message}</span>}
            <button className="btn" onClick={() => setSheet('manual')}><Keyboard size={18} /> Saisir un numéro</button>
            {cam === 'denied' && <button className="link" style={{ color: '#fff' }} onClick={() => startCamera(facing)}>Réessayer</button>}
          </div>
        )}
      </div>

      <div className="scan-bottom">
        <button className="scan-side" onClick={() => setSheet('manual')}>
          <Keyboard size={22} /> Saisir
        </button>
        <button className="scan-snap" onClick={snap} disabled={cam !== 'active' || busy} aria-label="Lire le numéro de la carte">
          {busy ? <div className="spinner" /> : <ScanLine size={30} />}
        </button>
        <button className="scan-side" onClick={() => setSheet('results')} disabled={!results.cards.length}>
          <Layers size={22} /> {results.cards.length ? plural(results.cards.length, 'résultat') : 'Résultats'}
        </button>
      </div>

      {sheet === 'manual' && (
        <Sheet title="Chercher une carte" onClose={() => setSheet(null)}>
          <div className="stack" style={{ gap: 12 }}>
            <SearchField value={input} onChange={setInput} onSubmit={submitManual} placeholder="Numéro (025, 163/193) ou nom" autoFocus />
            <button className="btn btn-dark btn-block" disabled={!input.trim()} onClick={submitManual}>Chercher</button>
          </div>
        </Sheet>
      )}
      {sheet === 'results' && (
        <Sheet title={`${plural(results.cards.length, 'résultat')} · ${results.query}`} onClose={() => setSheet(null)} tall>
          <CardsView cards={results.cards} caption="name" dimMissing={false} />
        </Sheet>
      )}
    </div>
  );
}
