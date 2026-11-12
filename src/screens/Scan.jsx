import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CameraOff, RotateCcw, ScanLine, X, ZapOff } from 'lucide-react';
import { searchCards } from '../lib/tcg';
import { cropNumberArea, extractCardNumber, getOcrWorker, isCardNumber, preprocess } from '../lib/scan';
import { CardsView } from '../components/cards';
import { Loading, Page, SearchField, TopBar, plural } from '../components/ui';

const BARCODE_OK = typeof window !== 'undefined' && 'BarcodeDetector' in window;
const CORNERS = [
  { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
  { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
  { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
  { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },
];

export default function Scan() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const lastScan = useRef({ code: null, at: 0 });

  const [cam, setCam] = useState('idle'); // idle | starting | active | denied | unsupported
  const [facing, setFacing] = useState('environment');
  const [ocr, setOcr] = useState('idle'); // idle | loading | running
  const [preview, setPreview] = useState(null);
  const [detected, setDetected] = useState(null);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState({ status: 'idle', cards: [], message: null });

  const runSearch = useCallback(async (raw) => {
    const q = raw.trim();
    if (!q) return;
    setSearch({ status: 'loading', cards: [], message: null });
    try {
      const { cards } = isCardNumber(q)
        ? await searchCards({ number: q.split('/')[0], pageSize: 30 })
        : await searchCards({ name: q, pageSize: 20 });
      setSearch(cards.length
        ? { status: 'done', cards, message: null }
        : { status: 'error', cards: [], message: `Aucune carte trouvée pour « ${q} ».` });
    } catch (_) {
      setSearch({ status: 'error', cards: [], message: 'Erreur réseau. Vérifie ta connexion.' });
    }
  }, []);

  const stopStream = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const stopCamera = useCallback(() => {
    stopStream();
    setCam('idle');
    setPreview(null);
  }, [stopStream]);

  useEffect(() => stopStream, [stopStream]);

  const startCamera = useCallback(async (mode) => {
    setCam('starting');
    stopStream();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      setCam('active');
    } catch (e) {
      setCam(e?.name === 'NotAllowedError' ? 'denied' : 'unsupported');
    }
  }, [stopStream]);

  // La <video> n'existe qu'une fois l'état « active » rendu : on branche le flux ici.
  useEffect(() => {
    if (cam !== 'active' || !videoRef.current || !streamRef.current) return undefined;
    const video = videoRef.current;
    video.srcObject = streamRef.current;
    video.play().catch(() => {});

    if (!BARCODE_OK) return undefined;
    const detector = new window.BarcodeDetector({
      formats: ['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39', 'data_matrix'],
    });
    let alive = true;
    const loop = async () => {
      if (!alive) return;
      try {
        const codes = await detector.detect(video);
        const code = codes[0]?.rawValue;
        const now = Date.now();
        if (code && (code !== lastScan.current.code || now - lastScan.current.at > 5000)) {
          lastScan.current = { code, at: now };
          setInput(code);
          runSearch(code);
        }
      } catch (_) { /* image pas encore prête */ }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { alive = false; if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [cam, runSearch]);

  const flip = () => {
    const next = facing === 'environment' ? 'user' : 'environment';
    setFacing(next);
    startCamera(next);
  };

  const snap = async () => {
    const video = videoRef.current;
    if (!video || ocr !== 'idle') return;
    const crop = cropNumberArea(video);
    if (!crop) return;

    setDetected(null);
    setPreview(crop.toDataURL());
    setOcr('loading');
    try {
      const worker = await getOcrWorker();
      setOcr('running');
      let number = extractCardNumber((await worker.recognize(preprocess(crop))).data.text);
      if (!number) {
        const inverted = cropNumberArea(video, true);
        if (inverted) number = extractCardNumber((await worker.recognize(preprocess(inverted))).data.text);
      }
      if (number) {
        setDetected(number);
        setInput(number);
        runSearch(number);
      } else {
        setSearch({ status: 'error', cards: [], message: 'Numéro non détecté — ajuste le cadrage ou saisis-le ci-dessous.' });
      }
    } catch (_) {
      setSearch({ status: 'error', cards: [], message: 'Lecture indisponible — saisis le numéro ci-dessous.' });
    } finally {
      setOcr('idle');
      setTimeout(() => setPreview(null), 1500);
    }
  };

  const busy = ocr !== 'idle';

  return (
    <Page>
      <TopBar title="Scanner" />

      <div className="cam">
        {cam === 'idle' && (
          <button className="cam-idle" onClick={() => startCamera(facing)}>
            <span className="ring"><ScanLine size={34} /></span>
            <b style={{ fontFamily: 'var(--display)', fontSize: 18 }}>Activer la caméra</b>
            <span className="small" style={{ opacity: 0.7 }}>Cadre la carte, on lit son numéro pour toi</span>
          </button>
        )}
        {cam === 'starting' && <div className="cam-idle"><div className="spinner" /><span className="small">Activation…</span></div>}
        {cam === 'denied' && (
          <div className="cam-idle">
            <CameraOff size={36} />
            <b>Accès à la caméra refusé</b>
            <span className="small" style={{ opacity: 0.7 }}>Autorise la caméra dans ton navigateur, ou utilise la recherche ci-dessous.</span>
          </div>
        )}
        {cam === 'unsupported' && (
          <div className="cam-idle">
            <ZapOff size={36} />
            <b>Caméra non disponible</b>
            <span className="small" style={{ opacity: 0.7 }}>Utilise la recherche ci-dessous.</span>
          </div>
        )}
        {cam === 'active' && (
          <>
            <video ref={videoRef} playsInline muted />
            {preview && <div className="cam-preview"><img src={preview} alt="Zone lue" /></div>}
            <div className="cam-overlay">
              <div className="cam-frame">
                {CORNERS.map((style, i) => <span key={i} className="cam-corner" style={style} />)}
                {!busy && <span className="cam-line" />}
                <span className="cam-numzone">numéro</span>
              </div>
            </div>
            <div className="cam-ctrl">
              <button onClick={flip} aria-label="Changer de caméra"><RotateCcw size={18} /></button>
              <button onClick={stopCamera} aria-label="Arrêter la caméra"><X size={18} /></button>
            </div>
            <button className="cam-snap" onClick={snap} disabled={busy} aria-label="Lire le numéro de la carte">
              {busy ? <div className="spinner sm" style={{ borderColor: 'rgba(255,255,255,.4)', borderTopColor: '#fff' }} /> : <ScanLine size={26} />}
            </button>
            <div className="cam-status">
              {ocr === 'loading' && 'Préparation de la lecture (première fois)…'}
              {ocr === 'running' && 'Lecture du numéro…'}
              {ocr === 'idle' && (BARCODE_OK ? 'Codes-barres détectés automatiquement · bouton pour lire le numéro' : 'Place le numéro dans la zone du bas, puis appuie sur le bouton')}
            </div>
          </>
        )}
      </div>

      <div className="row" style={{ marginTop: 16 }}>
        <div className="grow">
          <SearchField value={input} onChange={setInput} onSubmit={() => runSearch(input)} placeholder="Numéro (025, 163/193) ou nom" />
        </div>
        <button className="btn btn-dark" disabled={!input.trim() || search.status === 'loading'} onClick={() => runSearch(input)}>Chercher</button>
      </div>

      <div style={{ marginTop: 20 }}>
        {search.status === 'loading' && <Loading label="Recherche…" />}
        {search.status === 'error' && <p className="msg msg-err">{search.message}</p>}
        {search.status === 'done' && (
          <>
            <p className="small muted" style={{ marginBottom: 14 }}>
              {detected && <>Numéro détecté : <b style={{ color: 'var(--violet-ink)' }}>{detected}</b> · </>}
              {plural(search.cards.length, 'résultat')}
            </p>
            <CardsView cards={search.cards} caption="name" dimMissing={false} />
          </>
        )}
      </div>
    </Page>
  );
}
