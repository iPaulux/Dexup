import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, Layers, Newspaper, ShoppingBag } from 'lucide-react';
import { useCollection } from '../store/collection';
import { useLang } from '../utils/LanguageContext.jsx';
import { getLocalizedSetName } from '../utils/setNames';
import { isGraded, ownedCountBySet, useSets } from '../lib/tcg';
import { Page, Progress, pct, plural } from '../components/ui';
import { EventsSheet, NewsSheet, StatsSheet } from '../components/sheets';

function SetChip({ set, owned, lang, onClick }) {
  return (
    <button className="set-chip" onClick={onClick}>
      <div className="logo"><img src={set.images?.logo} alt="" loading="lazy" /></div>
      <b className="clamp1">{getLocalizedSetName(set.name, lang)}</b>
      <Progress value={owned} total={set.total} />
      <span className="tiny muted">{owned} / {set.total} · {pct(owned, set.total)} %</span>
    </button>
  );
}

export default function Home({ onAccount }) {
  const navigate = useNavigate();
  const { owned } = useCollection();
  const { lang } = useLang();
  const { sets } = useSets();
  const [sheet, setSheet] = useState(null);

  const counts = useMemo(() => ownedCountBySet(owned), [owned]);
  const total = Object.keys(owned).length;
  const graded = useMemo(() => Object.values(owned).filter(isGraded).length, [owned]);
  const setNames = useMemo(
    () => Object.fromEntries(sets.map((s) => [s.id, getLocalizedSetName(s.name, lang)])),
    [sets, lang]
  );
  const inProgress = useMemo(
    () => sets
      .filter((s) => counts[s.id] && counts[s.id] < s.total)
      .sort((a, b) => counts[b.id] / b.total - counts[a.id] / a.total)
      .slice(0, 12),
    [sets, counts]
  );
  const latest = sets.slice(0, 8);
  const goSet = (s) => navigate(`/sets/${s.id}`);
  const close = () => setSheet(null);

  return (
    <Page>
      <header className="topbar">
        <h1 className="brand">PokéCollect</h1>
        <button className="avatar-btn" onClick={onAccount} aria-label="Mon compte">
          <img src="/TiploufICON.png" alt="" />
        </button>
      </header>

      <button className="hero" onClick={() => setSheet('stats')} aria-label="Voir mes statistiques">
        <span className="hero-go"><ArrowUpRight size={20} /></span>
        <p style={{ fontWeight: 600, opacity: 0.9 }}>Ma collection</p>
        <p className="hero-num">{total}</p>
        <p style={{ opacity: 0.9 }}>{total > 1 ? 'cartes possédées' : 'carte possédée'}</p>
        <div className="hero-stats">
          <span className="hero-chip"><b>{Object.keys(counts).length}</b>{Object.keys(counts).length > 1 ? 'sets entamés' : 'set entamé'}</span>
          <span className="hero-chip"><b>{graded}</b>{graded > 1 ? 'gradées' : 'gradée'}</span>
        </div>
      </button>

      <div className="tiles" style={{ marginTop: 12 }}>
        <button className="tile tile-white" onClick={() => navigate('/binder/collection')}>
          <Layers size={24} />
          <div><b>Mes cartes</b><span>{plural(total, 'carte')}</span></div>
        </button>
        <button className="tile tile-sky" onClick={() => setSheet('news')}>
          <Newspaper size={24} />
          <div><b>Actualités</b><span>Le TCG en direct</span></div>
        </button>
        <button className="tile tile-peach" onClick={() => setSheet('events')}>
          <CalendarDays size={24} />
          <div><b>Événements</b><span>France & Europe</span></div>
        </button>
        <button className="tile tile-mint" onClick={() => navigate('/products')}>
          <ShoppingBag size={24} />
          <div><b>Produits</b><span>Boosters, ETB, displays</span></div>
        </button>
      </div>

      {inProgress.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2 className="h2">En cours</h2>
            <button className="link" onClick={() => navigate('/sets')}>Toutes les extensions</button>
          </div>
          <div className="hscroll">
            {inProgress.map((s) => <SetChip key={s.id} set={s} owned={counts[s.id]} lang={lang} onClick={() => goSet(s)} />)}
          </div>
        </section>
      )}

      {latest.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2 className="h2">Dernières sorties</h2>
            {inProgress.length === 0 && <button className="link" onClick={() => navigate('/sets')}>Tout voir</button>}
          </div>
          <div className="hscroll">
            {latest.map((s) => <SetChip key={s.id} set={s} owned={counts[s.id] || 0} lang={lang} onClick={() => goSet(s)} />)}
          </div>
        </section>
      )}

      {sheet === 'stats' && <StatsSheet onClose={close} setNames={setNames} />}
      {sheet === 'news' && <NewsSheet onClose={close} />}
      {sheet === 'events' && <EventsSheet onClose={close} />}
    </Page>
  );
}
