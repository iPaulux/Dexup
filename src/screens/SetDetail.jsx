import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { WifiOff } from 'lucide-react';
import { useCollection } from '../store/collection';
import { useLang } from '../utils/LanguageContext.jsx';
import { getLocalizedSetName } from '../utils/setNames';
import { loadSetCards, useSets } from '../lib/tcg';
import { CardsView, OWNERSHIP_FILTERS, filterByOwnership } from '../components/cards';
import { Empty, Loading, Page, Progress, Segmented, StarButton, TopBar, ViewToggle, pct, plural, usePersistedState } from '../components/ui';

export default function SetDetail() {
  const { setId } = useParams();
  const { lang } = useLang();
  const { owned, favSets, toggleFavSet } = useCollection();
  const { sets } = useSets();
  const [state, setState] = useState({ cards: [], loading: true, error: false });
  const [attempt, setAttempt] = useState(0);
  const [filter, setFilter] = useState('all');
  const [mode, setMode] = usePersistedState('pc_cards_view', 'grid');

  useEffect(() => {
    let alive = true;
    setState({ cards: [], loading: true, error: false });
    loadSetCards(setId)
      .then((cards) => alive && setState({ cards, loading: false, error: false }))
      .catch(() => alive && setState({ cards: [], loading: false, error: true }));
    return () => { alive = false; };
  }, [setId, attempt]);

  const set = sets.find((s) => s.id === setId);
  const { cards, loading, error } = state;
  const ownedCount = useMemo(() => cards.filter((c) => owned[c.id]).length, [cards, owned]);
  const shown = useMemo(() => filterByOwnership(cards, owned, filter), [cards, owned, filter]);
  const title = set ? getLocalizedSetName(set.name, lang) : cards[0]?.set?.name ?? setId.toUpperCase();

  return (
    <Page>
      <TopBar title={title} back="/sets">
        {set && <StarButton on={!!favSets[set.id]} onClick={() => toggleFavSet(set)} />}
      </TopBar>

      {loading && <Loading label="Chargement des cartes…" />}
      {error && (
        <Empty icon={WifiOff} title="Impossible de charger ce set" text="Vérifie ta connexion internet puis réessaie.">
          <button className="btn btn-dark" onClick={() => setAttempt((n) => n + 1)}>Réessayer</button>
        </Empty>
      )}

      {!loading && !error && (
        <>
          <div className="card card-pad" style={{ marginBottom: 14 }}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
              <span>
                <b style={{ fontFamily: 'var(--display)', fontSize: 22 }}>{ownedCount}</b>
                <span className="muted"> / {plural(cards.length, 'carte')}</span>
              </span>
              <b style={{ color: 'var(--violet-ink)' }}>{pct(ownedCount, cards.length)} %</b>
            </div>
            <Progress value={ownedCount} total={cards.length} />
            {set && <p className="tiny dim" style={{ marginTop: 10 }}>{set.series} · {set.id.toUpperCase()} · sortie le {set.releaseDate}</p>}
          </div>

          <div className="row" style={{ marginBottom: 16 }}>
            <div className="grow"><Segmented options={OWNERSHIP_FILTERS} value={filter} onChange={setFilter} /></div>
            <ViewToggle mode={mode} onChange={setMode} />
          </div>

          {shown.length === 0 ? (
            <Empty
              title={filter === 'owned' ? 'Aucune carte possédée' : 'Set complet !'}
              text={filter === 'owned' ? 'Touche le + sur une carte pour l\'ajouter à ta collection.' : 'Il ne te manque plus aucune carte de cette extension.'}
            />
          ) : (
            <CardsView cards={shown} mode={mode} caption="number" />
          )}
        </>
      )}
    </Page>
  );
}
