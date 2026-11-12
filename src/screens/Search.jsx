import React, { useEffect, useRef, useState } from 'react';
import { Search as SearchIcon, SearchX, WifiOff } from 'lucide-react';
import { getFrToEnMap, resolveSearchTerm } from '../utils/pokemonNames';
import { searchCards } from '../lib/tcg';
import { CardsView } from '../components/cards';
import { Empty, Loading, Page, Pills, SearchField, TopBar, plural } from '../components/ui';

const RARITIES = [
  { label: 'Toutes', value: null },
  { label: 'Commune', value: 'Common' },
  { label: 'Peu commune', value: 'Uncommon' },
  { label: 'Rare', value: 'Rare' },
  { label: 'Rare Holo', value: 'Rare Holo' },
  { label: 'Holo EX', value: 'Rare Holo EX' },
  { label: 'Holo GX', value: 'Rare Holo GX' },
  { label: 'Holo V', value: 'Rare Holo V' },
  { label: 'Ultra Rare', value: 'Rare Ultra' },
  { label: 'Promo', value: 'Promo' },
];

const IDLE = { status: 'idle', cards: [], total: 0, page: 1, term: '', translated: null };

export default function Search() {
  const [query, setQuery] = useState('');
  const [rarity, setRarity] = useState(null);
  const [result, setResult] = useState(IDLE);
  const [loadingMore, setLoadingMore] = useState(false);
  const requestId = useRef(0);

  useEffect(() => { getFrToEnMap(); }, []);

  useEffect(() => {
    const q = query.trim();
    const id = ++requestId.current;
    if (!q && !rarity) { setResult(IDLE); return; }

    const timer = setTimeout(async () => {
      setResult((r) => ({ ...r, status: 'loading' }));
      try {
        const term = q ? await resolveSearchTerm(q) : '';
        const { cards, total } = await searchCards({ name: term, rarity });
        if (id !== requestId.current) return;
        const translated = term && term.toLowerCase() !== q.toLowerCase() ? term : null;
        setResult({ status: 'done', cards, total, page: 1, term, translated });
      } catch (_) {
        if (id === requestId.current) setResult({ ...IDLE, status: 'error' });
      }
    }, q ? 450 : 0);
    return () => clearTimeout(timer);
  }, [query, rarity]);

  const loadMore = async () => {
    const id = requestId.current;
    setLoadingMore(true);
    try {
      const page = result.page + 1;
      const { cards } = await searchCards({ name: result.term, rarity, page });
      if (id === requestId.current) setResult((r) => ({ ...r, cards: [...r.cards, ...cards], page }));
    } catch (_) { /* on garde les résultats déjà chargés */ }
    setLoadingMore(false);
  };

  const { status, cards, total, translated } = result;
  const remaining = total - cards.length;

  return (
    <Page>
      <TopBar title="Recherche" />

      <div className="stack" style={{ gap: 12, marginBottom: 16 }}>
        <SearchField value={query} onChange={setQuery} placeholder="Nom du Pokémon (français ou anglais)" />
        <Pills options={RARITIES} value={rarity} onChange={setRarity} />
      </div>

      {status === 'idle' && (
        <Empty
          icon={SearchIcon} title="Trouve n'importe quelle carte"
          text="Tape un nom — « Salamèche » fonctionne aussi bien que « Charmander » — ou choisis une rareté."
        />
      )}
      {status === 'loading' && <Loading label="Recherche en cours…" />}
      {status === 'error' && <Empty icon={WifiOff} title="Recherche impossible" text="Vérifie ta connexion internet puis réessaie." />}
      {status === 'done' && cards.length === 0 && (
        <Empty icon={SearchX} title="Aucun résultat" text="Vérifie l'orthographe ou essaie sans filtre de rareté." />
      )}

      {status === 'done' && cards.length > 0 && (
        <>
          <p className="small muted" style={{ marginBottom: 14 }}>
            {remaining > 0 ? `${cards.length} sur ${total} cartes` : plural(cards.length, 'carte')}
            {translated && <> · recherche traduite : <b style={{ color: 'var(--violet-ink)' }}>{translated}</b></>}
          </p>
          <CardsView cards={cards} caption="name" dimMissing={false} />
          {remaining > 0 && (
            <button className="btn btn-ghost btn-block" style={{ marginTop: 20 }} onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? <div className="spinner sm" /> : `Voir plus · ${remaining} restantes`}
            </button>
          )}
        </>
      )}
    </Page>
  );
}
