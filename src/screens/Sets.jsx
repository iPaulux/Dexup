import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchX, WifiOff } from 'lucide-react';
import { useCollection } from '../store/collection';
import { useLang } from '../utils/LanguageContext.jsx';
import { filterSets, getLocalizedSetName, resolveSetQuery } from '../utils/setNames';
import { ownedCountBySet, useSets } from '../lib/tcg';
import {
  Empty, Loading, Page, Pills, Progress, SearchField, StarButton, Tappable, TopBar, ViewToggle,
  pct, usePersistedState,
} from '../components/ui';

export default function Sets() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const { owned, favSets, toggleFavSet } = useCollection();
  const { sets, loading, error, retry } = useSets();
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState('all');
  const [mode, setMode] = usePersistedState('pc_sets_view', 'list');

  const counts = useMemo(() => ownedCountBySet(owned), [owned]);
  const translated = useMemo(() => {
    const r = query.trim() ? resolveSetQuery(query) : null;
    return r?.wasFrench ? r.translated : null;
  }, [query]);

  const shown = useMemo(() => {
    let list = filterSets(sets, query);
    if (scope === 'started') list = list.filter((s) => counts[s.id]);
    if (scope === 'favs') list = list.filter((s) => favSets[s.id]);
    return list;
  }, [sets, query, scope, counts, favSets]);

  const open = (s) => navigate(`/sets/${s.id}`);

  return (
    <Page>
      <TopBar title="Extensions">
        <ViewToggle mode={mode} onChange={setMode} />
      </TopBar>

      <div className="stack" style={{ gap: 12, marginBottom: 16 }}>
        <SearchField value={query} onChange={setQuery} placeholder="Nom, série ou code (ex : 151, SV8)" />
        <Pills
          value={scope} onChange={setScope}
          options={[
            { value: 'all', label: 'Toutes', count: sets.length || undefined },
            { value: 'started', label: 'Entamées', count: Object.keys(counts).length },
            { value: 'favs', label: 'Favorites', count: Object.keys(favSets).length },
          ]}
        />
        {translated && <p className="tiny muted">Recherche traduite : <b style={{ color: 'var(--violet-ink)' }}>{translated}</b></p>}
      </div>

      {loading && <Loading label="Chargement des extensions…" />}
      {error && (
        <Empty icon={WifiOff} title="Impossible de charger les extensions" text="Vérifie ta connexion internet puis réessaie.">
          <button className="btn btn-dark" onClick={retry}>Réessayer</button>
        </Empty>
      )}
      {!loading && !error && shown.length === 0 && (
        <Empty
          icon={SearchX} title="Aucune extension"
          text={scope === 'favs' ? "Touche l'étoile d'une extension pour la retrouver ici." : scope === 'started' ? 'Tu n\'as encore entamé aucune extension.' : 'Essaie un autre nom ou un code de set.'}
        />
      )}

      {mode === 'list' ? (
        <div className="stack">
          {shown.map((s) => {
            const n = counts[s.id] || 0;
            return (
              <Tappable key={s.id} onClick={() => open(s)}>
                <div className="thumb-box"><img src={s.images?.logo} alt="" loading="lazy" /></div>
                <div className="grow">
                  <div className="row" style={{ gap: 6 }}>
                    <b className="clamp1">{getLocalizedSetName(s.name, lang)}</b>
                    <span className="tag tag-violet">{s.id.toUpperCase()}</span>
                  </div>
                  <p className="tiny muted clamp1">{s.series} · {s.releaseDate}</p>
                  <div className="row" style={{ marginTop: 6 }}>
                    <div className="grow"><Progress value={n} total={s.total} /></div>
                    <span className="tiny muted" style={{ fontWeight: 600 }}>{n}/{s.total}</span>
                  </div>
                </div>
                <StarButton on={!!favSets[s.id]} onClick={() => toggleFavSet(s)} />
              </Tappable>
            );
          })}
        </div>
      ) : (
        <div className="set-grid">
          {shown.map((s) => {
            const n = counts[s.id] || 0;
            return (
              <Tappable key={s.id} className="set-cell" onClick={() => open(s)}>
                <span className="star"><StarButton on={!!favSets[s.id]} onClick={() => toggleFavSet(s)} /></span>
                <div className="logo"><img src={s.images?.logo} alt="" loading="lazy" /></div>
                <b className="clamp2" style={{ fontSize: 14 }}>{getLocalizedSetName(s.name, lang)}</b>
                <Progress value={n} total={s.total} />
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="tag tag-violet">{s.id.toUpperCase()}</span>
                  <span className="tiny muted" style={{ fontWeight: 600 }}>{n}/{s.total} · {pct(n, s.total)} %</span>
                </div>
              </Tappable>
            );
          })}
        </div>
      )}
    </Page>
  );
}
