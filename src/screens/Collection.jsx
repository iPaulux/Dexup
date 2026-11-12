import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Layers, Trophy } from 'lucide-react';
import { useCollection } from '../store/collection';
import { useLang } from '../utils/LanguageContext.jsx';
import { getLocalizedSetName } from '../utils/setNames';
import { isGraded, loadCardsByIds, setIdOf, setLogoUrl, sortCards, useSets } from '../lib/tcg';
import { CardsView } from '../components/cards';
import { Empty, Loading, Page, Tappable, TopBar, ViewToggle, plural, usePersistedState } from '../components/ui';

// Charge une fois les données des cartes visées ; les cartes retirées ensuite restent affichées (grisées).
function useCardData(ids, ready) {
  const [state, setState] = useState({ map: {}, failed: [], loading: true });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!ready) return undefined;
    let alive = true;
    setState((s) => ({ ...s, loading: true }));
    loadCardsByIds(ids).then(({ map, failed }) => alive && setState({ map, failed, loading: false }));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, attempt]);
  return { ...state, retry: () => setAttempt((n) => n + 1) };
}

function FailedSets({ failed, retry }) {
  if (!failed.length) return null;
  return (
    <div className="row msg msg-err" style={{ marginBottom: 14 }}>
      <span className="grow">
        {failed.length > 1 ? `${failed.length} extensions n'ont pas pu être chargées` : "1 extension n'a pas pu être chargée"} — des cartes manquent ci-dessous.
      </span>
      <button className="btn btn-dark btn-sm" onClick={retry}>Réessayer</button>
    </div>
  );
}

export function Collection() {
  const navigate = useNavigate();
  const { ready, owned } = useCollection();
  const { lang } = useLang();
  const { sets } = useSets();
  const [mode, setMode] = usePersistedState('pc_cards_view', 'grid');
  const { map, failed, loading, retry } = useCardData(Object.keys(owned), ready);

  const groups = useMemo(() => {
    const meta = Object.fromEntries(sets.map((s) => [s.id, s]));
    const bySet = {};
    for (const card of Object.values(map)) (bySet[setIdOf(card.id)] ||= []).push(card);
    return Object.entries(bySet)
      .map(([sid, cards]) => ({
        sid,
        cards: sortCards(cards),
        name: meta[sid] ? getLocalizedSetName(meta[sid].name, lang) : cards[0].set?.name ?? sid.toUpperCase(),
        date: meta[sid]?.releaseDate ?? cards[0].set?.releaseDate ?? sid,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [map, sets, lang]);

  const total = Object.keys(owned).length;

  return (
    <Page>
      <TopBar title="Ma collection" back="/binder">
        {total > 0 && <ViewToggle mode={mode} onChange={setMode} />}
      </TopBar>

      {(!ready || loading) && <Loading label="Chargement de ta collection…" />}
      {ready && !loading && <FailedSets failed={failed} retry={retry} />}
      {ready && !loading && groups.length === 0 && !failed.length && (
        <Empty icon={Layers} title="Aucune carte pour l'instant" text="Ouvre une extension et touche le + des cartes que tu possèdes.">
          <button className="btn btn-violet" onClick={() => navigate('/sets')}>Parcourir les extensions</button>
        </Empty>
      )}

      {ready && !loading && groups.length > 0 && (
        <>
          <p className="small muted">{plural(total, 'carte')} · {plural(groups.length, 'extension')} · triées par date de sortie</p>
          {groups.map((g) => (
            <section key={g.sid}>
              <button className="group-head" onClick={() => navigate(`/sets/${g.sid}`)}>
                <img src={setLogoUrl(g.sid)} alt="" loading="lazy" onError={(e) => { e.target.style.display = 'none'; }} />
                <span className="h2 clamp1">{g.name}</span>
                <span className="tag">{g.cards.length}</span>
              </button>
              <CardsView cards={g.cards} mode={mode} caption="number" />
            </section>
          ))}
        </>
      )}
    </Page>
  );
}

export function Graded() {
  const { ready, owned, openCard } = useCollection();
  const [closed, setClosed] = useState({});
  const gradedIds = useMemo(() => Object.keys(owned).filter((id) => isGraded(owned[id])), [owned]);
  const { map, failed, loading, retry } = useCardData(gradedIds, ready);

  const sections = useMemo(() => {
    const byCompany = {};
    for (const id of gradedIds) {
      const card = map[id];
      if (!card) continue;
      (byCompany[owned[id].company || 'Autres'] ||= []).push({ card, grade: owned[id].grade });
    }
    return Object.entries(byCompany)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([company, items]) => ({
        company,
        items: items.sort((x, y) => parseFloat(y.grade) - parseFloat(x.grade) || x.card.name.localeCompare(y.card.name)),
      }));
  }, [gradedIds, map, owned]);

  return (
    <Page>
      <TopBar title="Cartes gradées" back="/binder" />

      {(!ready || loading) && <Loading label="Chargement des grades…" />}
      {ready && !loading && <FailedSets failed={failed} retry={retry} />}
      {ready && !loading && sections.length === 0 && !failed.length && (
        <Empty icon={Trophy} title="Aucune carte gradée" text="Ouvre la fiche d'une carte que tu possèdes, puis « Ajouter un grade »." />
      )}

      {ready && !loading && sections.length > 0 && (
        <div className="stack" style={{ gap: 18 }}>
          <p className="small muted">{plural(gradedIds.length, 'carte')} · {plural(sections.length, 'société')}</p>
          {sections.map(({ company, items }) => {
            const open = !closed[company];
            return (
              <section key={company}>
                <button
                  className="row" style={{ width: '100%', marginBottom: 10 }} aria-expanded={open}
                  onClick={() => setClosed((c) => ({ ...c, [company]: open }))}
                >
                  <Trophy size={19} color="var(--gold)" />
                  <span className="h2 grow" style={{ textAlign: 'left' }}>{company}</span>
                  <span className="tag">{items.length}</span>
                  <ChevronDown size={18} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                </button>
                {open && (
                  <div className="stack">
                    {items.map(({ card, grade }) => (
                      <Tappable key={card.id} onClick={() => openCard(card)}>
                        <img className="card-thumb" src={card.images?.small} alt="" loading="lazy" />
                        <div className="grow">
                          <b className="clamp1">{card.name}</b>
                          <p className="small muted clamp1">#{card.number} · {card.set?.name}</p>
                        </div>
                        <span className="tag tag-gold" style={{ height: 34, padding: '0 12px', fontSize: 15, fontFamily: 'var(--display)' }}>{grade}</span>
                      </Tappable>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </Page>
  );
}
