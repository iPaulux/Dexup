import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CameraOff, Keyboard, Layers, ScanLine, SwitchCamera, X } from 'lucide-react';
import { useCollection } from '../store/collection';
import { SCAN_SELECT, searchCards } from '../lib/tcg';
import {
  binarize, BODY_TARGET_HEIGHT, buildNameIndex, clearWinner, cropBody, cropHp, cropNumberBand, cropTitle, extractCardNumber,
  extractHp, getOcrWorker, isCardNumber, matchPokemonName, pickCardByDigits, rankCards, TITLE_OFFSET,
  HP_TARGET_HEIGHT, TITLE_TARGET_HEIGHT, warmOcr,
} from '../lib/scan';
import { getFrToEnMap, resolveSearchTerm } from '../utils/pokemonNames';
import { useAutoCapture } from '../lib/useAutoCapture';
import { CardsView } from '../components/cards';
import { SearchField, Sheet, plural } from '../components/ui';

const BARCODE_OK = typeof window !== 'undefined' && 'BarcodeDetector' in window;
// Les codes-barres n'ont pas besoin de 60 lectures par seconde : 4 suffisent et libèrent le processeur pour l'OCR.
const BARCODE_INTERVAL_MS = 250;
// Lectures automatiques ratées d'affilée avant d'afficher un conseil et d'attendre que la carte bouge.
const AUTO_MAX_FAILURES = 8;
// Pause entre deux lectures automatiques ratées : sans carte (un visage, un bureau),
// l'OCR ne tourne pas en continu.
const AUTO_RETRY_DELAY_MS = 150;
// Nom lu mais pas encore le numéro exact : on relit encore un peu avant de montrer la liste
// de toutes les cartes de ce Pokémon (chaque lecture ajoute son texte aux indices).
const NAME_ONLY_ATTEMPTS = 3;
// Textes du bas de carte gardés d'une lecture à l'autre pour retrouver le numéro par morceaux.
const KEPT_TEXTS = 4;

// Résultats déjà obtenus pendant la session : rescanner la même carte ne refait pas d'appel réseau.
const searchCache = new Map();
async function cachedSearch(key, fetcher) {
  if (searchCache.has(key)) return searchCache.get(key);
  const cards = await fetcher();
  if (searchCache.size > 100) searchCache.delete(searchCache.keys().next().value);
  searchCache.set(key, cards);
  return cards;
}
// « 027/108 » lu correspond-il à cette carte (numéro et taille du set, sans zéros de tête) ?
function sameNumber(card, read) {
  const [num, total] = read.split('/').map((n) => parseInt(n, 10));
  return parseInt(card.number, 10) === num && Number(card.set?.printedTotal) === total;
}

const CORNERS = [
  { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 16 },
  { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 16 },
  { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 16 },
  { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 16 },
];

export default function Scan() {
  const navigate = useNavigate();
  const { openCard, activeCard } = useCollection();
  const videoRef = useRef(null);
  const frameRef = useRef(null);
  const autoFailures = useRef(0);
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

  // Toutes les cartes d'un Pokémon (nom anglais exact), les plus récentes d'abord.
  // Avec PV et attaques (SCAN_SELECT) pour départager les cartes quand le numéro est illisible.
  const cardsOfPokemon = useCallback((enName) => cachedSearch(`e:${enName}`, async () => (
    await searchCards({ exactName: enName, pageSize: 250, orderBy: '-set.releaseDate', select: SCAN_SELECT })).cards), []);

  // Une carte précise a été reconnue : on ouvre directement sa fiche.
  const openFound = useCallback((card, query) => {
    navigator.vibrate?.(30);
    setResults({ query, cards: [card] });
    setMessage(null);
    openCard(card);
  }, [openCard]);

  // `enName` : nom anglais déjà connu (lu sur la carte) ; sinon un nom saisi est traduit FR→EN.
  // `strict` (lecture automatique) : un numéro sans carte correspondante dans un set de cette
  // taille est sans doute mal lu — on n'élargit pas la recherche, on renvoie false pour relire.
  const runSearch = useCallback(async (raw, enName, strict = false) => {
    const q = raw.trim();
    if (!q) return;
    setSearching(true);
    setMessage(`Recherche de « ${q} »…`);
    try {
      let cards;
      if (isCardNumber(q)) {
        // « 001/165 » : numéro sans zéros de tête + taille du set, ce qui isole presque toujours la bonne carte.
        const [num, total] = q.split('/').map((n) => String(parseInt(n, 10)));
        cards = await cachedSearch(`n:${num}/${total ?? ''}${strict ? '!' : ''}`, async () => {
          let found = total ? (await searchCards({ number: num, printedTotal: total, pageSize: 30 })).cards : [];
          if (!found.length && !strict) found = (await searchCards({ number: num, pageSize: 30 })).cards;
          return found;
        });
        if (!cards.length && strict) { setSearching(false); return false; }
      } else {
        if (enName) {
          // Nom lu sur la carte : ce Pokémon exactement (pas ses formes d'Alola, etc.),
          // les plus récentes d'abord — c'est le plus souvent la carte qu'on vient d'ouvrir.
          cards = await cardsOfPokemon(enName);
        } else {
          const name = await resolveSearchTerm(q);
          cards = await cachedSearch(`q:${name.toLowerCase()}`, async () => (await searchCards({ name, pageSize: 20 })).cards);
        }
      }
      if (cards.length) {
        navigator.vibrate?.(30);
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
    return true;
  }, [openCard, cardsOfPokemon]);

  const busy = ocr !== 'idle' || searching;
  const paused = cam !== 'active' || busy || sheet !== null || !!activeCard;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const readRef = useRef(null);
  const { hint: autoHint, disarm, rearm } = useAutoCapture({
    videoRef,
    frameRef,
    enabled: cam === 'active' && sheet === null && !activeCard,
    busy,
    onStable: () => { setMessage(null); readRef.current?.(true); },
  });

  // Le moteur OCR se télécharge pendant que l'utilisateur cadre sa carte.
  useEffect(() => {
    if (cam !== 'active') return;
    warmOcr();
    getFrToEnMap().then(buildNameIndex).catch(() => {});
  }, [cam]);

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
        // 1440p : le petit numéro de collection gagne ~33 % de pixels par rapport au 1080p.
        // Les découpes sont ramenées à une taille fixe avant l'OCR : son coût ne change pas.
        video: { facingMode: mode, width: { ideal: 2560 }, height: { ideal: 1440 } },
        audio: false,
      });
      // L'écran a été quitté (ou la caméra relancée) pendant la demande d'autorisation.
      if (id !== startId.current) { stream.getTracks().forEach((t) => t.stop()); return; }
      streamRef.current = stream;
      // Mise au point continue quand le navigateur la propose (la carte bouge, la distance aussi).
      const track = stream.getVideoTracks()[0];
      if (track?.getCapabilities?.().focusMode?.includes('continuous')) {
        track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] }).catch(() => {});
      }
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
    let timer = null;
    let alive = true;
    const loop = async () => {
      if (!alive) return;
      try {
        // Rien à détecter tant qu'une lecture tourne, qu'une fiche couvre la caméra ou que l'onglet est caché.
        const paused = document.hidden || pausedRef.current;
        const code = paused ? null : (await detector.detect(videoRef.current))[0]?.rawValue;
        const now = Date.now();
        if (code && (code !== lastScan.current.code || now - lastScan.current.at > 5000)) {
          lastScan.current = { code, at: now };
          setInput(code);
          runSearch(code);
        }
      } catch (_) { /* image pas encore prête */ }
      if (alive) timer = window.setTimeout(loop, BARCODE_INTERVAL_MS);
    };
    timer = window.setTimeout(loop, BARCODE_INTERVAL_MS);
    return () => { alive = false; window.clearTimeout(timer); };
  }, [cam, runSearch]);

  const flip = () => {
    const next = facing === 'environment' ? 'user' : 'environment';
    setFacing(next);
    startCamera(next);
  };

  // Indices accumulés sur la carte en cours : textes du bas et du corps de carte, nom et PV déjà lus,
  // dernier classement des cartes de ce Pokémon. Remis à zéro dès qu'un résultat est affiché
  // ou qu'une autre carte apparaît.
  const emptyClues = () => ({ texts: [], bodies: [], name: null, nameReads: 0, hp: null, ranked: null });
  const clues = useRef(emptyClues());

  // Lit la carte : le bas de la carte (numéro) et le haut (nom) en parallèle, sur deux moteurs.
  // Le numéro désigne une impression précise ; le nom, bien plus gros, se lit presque toujours.
  // Les deux ensemble ouvrent directement la bonne carte : parmi les cartes de ce Pokémon,
  // celle dont le numéro et la taille du set apparaissent dans le texte du bas.
  // `auto` : déclenché par l'auto-capture, donc discret en cas d'échec et nouvel essai ensuite.
  const readCard = async (auto) => {
    const video = videoRef.current;
    if (cam !== 'active' || ocr !== 'idle' || searching) return;
    const band = cropNumberBand(video, frameRef.current);
    const title = cropTitle(video, frameRef.current);
    const body = cropBody(video, frameRef.current); // corps et PV : lus seulement si le nom ne suffit pas
    const hpCrop = cropHp(video, frameRef.current);
    if (!band) { if (auto) rearm(); return; }

    if (!auto) setMessage(null);
    setOcr('loading');
    try {
      const [numberWorker, nameWorker] = await Promise.all([getOcrWorker(0), getOcrWorker(1)]);
      setOcr('running');
      // Une lecture ratée sur trois cherche du texte clair sur fond sombre (cartes sombres, full art).
      const light = autoFailures.current % 3 === 2;
      const bandImg = binarize(band, { light });
      const titleImg = title && binarize(title, { targetHeight: TITLE_TARGET_HEIGHT, offset: TITLE_OFFSET });
      const [t1, t3] = await Promise.all([
        numberWorker.recognize(bandImg).then((r) => r.data.text),
        titleImg ? nameWorker.recognize(titleImg).then((r) => r.data.text) : null,
      ]);
      const number = extractCardNumber(t1);
      const name = t3 ? matchPokemonName(t3) : null;
      setOcr('idle');

      const c = clues.current;
      // Un autre nom : c'est une autre carte, les anciens indices ne valent plus.
      if (name && c.name && c.name.en !== name.en) clues.current = emptyClues();
      const cl = clues.current;
      cl.texts = [t1, ...cl.texts].slice(0, KEPT_TEXTS);
      if (name) {
        cl.nameReads += 1;
        cl.name = name;
        cl.hp = extractHp(t3) ?? cl.hp; // « PV60 » sur la même ligne que le nom
      }
      const known = name ?? cl.name;
      const done = () => { autoFailures.current = 0; clues.current = emptyClues(); };

      // 1. Nom connu : on cherche la carte exacte parmi celles de ce Pokémon.
      let nameChecked = false;
      if (known) {
        setInput(known.fr);
        setSearching(true); // pas de nouvelle lecture automatique pendant la requête
        try {
          const cards = await cardsOfPokemon(known.en);
          const exact = (number && cards.find((card) => sameNumber(card, number))) || pickCardByDigits(cards, cl.texts);
          if (exact) { setSearching(false); done(); openFound(exact, known.fr); return; }
          nameChecked = !!name;
          // Numéro illisible : PV, attaques et dégâts lus dans le corps de la carte départagent.
          // Une passe OCR de plus, seulement dans ce cas-là.
          if (body && cards.length > 1) {
            const bodyImg = binarize(body, { targetHeight: BODY_TARGET_HEIGHT, offset: TITLE_OFFSET });
            cl.bodies = [(await nameWorker.recognize(bodyImg)).data.text, ...cl.bodies].slice(0, KEPT_TEXTS);
            if (!cl.hp && hpCrop) {
              const hpImg = binarize(hpCrop, { targetHeight: HP_TARGET_HEIGHT, offset: TITLE_OFFSET });
              cl.hp = extractHp((await nameWorker.recognize(hpImg)).data.text);
            }
          }
          const ranked = rankCards(cards, { hp: cl.hp, body: cl.bodies.join('\n') });
          cl.ranked = ranked.map((r) => r.card);
          const winner = clearWinner(ranked);
          if (winner) { setSearching(false); done(); openFound(winner, known.fr); return; }
        } catch (_) { /* réseau : on retombe sur la recherche classique */ }
        setSearching(false);
      }
      // 2. Numéro lu : recherche par numéro + taille du set (stricte en automatique).
      // Si le nom vient d'être lu et qu'aucune de ses cartes n'a ce numéro, le numéro est mal lu :
      // il ouvrirait la carte d'un autre Pokémon.
      if (number && !(auto && nameChecked)) {
        setInput(number);
        if (await runSearch(number, undefined, auto)) { done(); return; }
      }
      // 3. Nom seul, relu plusieurs fois sans numéro : la liste des cartes de ce Pokémon.
      if (known && (!auto || cl.nameReads >= NAME_ONLY_ATTEMPTS || autoFailures.current + 1 >= AUTO_MAX_FAILURES)) {
        const ranked = cl.ranked;
        done();
        setMessage(null);
        if (ranked?.length) {
          // Les cartes de ce Pokémon, les plus probables d'après les PV et les attaques en premier.
          navigator.vibrate?.(30);
          setResults({ query: known.fr, cards: ranked });
          setSheet('results');
        } else {
          runSearch(known.fr, known.en);
        }
        return;
      }
      if (auto && ++autoFailures.current < AUTO_MAX_FAILURES) {
        window.setTimeout(rearm, AUTO_RETRY_DELAY_MS);
      } else {
        done();
        setMessage('Carte illisible — rapproche-la, ou saisis son numéro ou son nom.');
      }
    } catch (_) {
      setOcr('idle');
      setMessage('Lecture indisponible — saisis le numéro à la main.');
    }
  };

  const snap = () => {
    disarm(); // pas de lecture automatique en double juste après
    readCard(false);
  };

  readRef.current = readCard;

  const submitManual = () => {
    if (!input.trim()) return;
    setSheet(null);
    runSearch(input);
  };

  const close = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/'));
  const hint = message
    ?? (ocr === 'loading' ? 'Préparation de la lecture (première fois)…'
      : ocr === 'running' ? 'Lecture de la carte…'
        : autoHint || 'Place la carte dans le cadre — la lecture est automatique');

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
            <div className="scan-frame" ref={frameRef}>
              {CORNERS.map((style, i) => <span key={i} className="scan-corner" style={style} />)}
              {!busy && <span className="scan-line" />}
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
        <button className="scan-snap" onClick={snap} disabled={cam !== 'active' || busy} aria-label="Lire la carte">
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
