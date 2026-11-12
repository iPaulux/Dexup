import React from 'react';
import { Check, Minus, Plus, Star, Trophy } from 'lucide-react';
import { useCollection } from '../store/collection';
import { getGradingInfo } from '../utils/storage';

function useCardState(card) {
  const { owned, favCards, toggleOwned, openCard } = useCollection();
  const grading = getGradingInfo(owned[card.id]);
  return {
    isOwned: !!owned[card.id],
    isFav: !!favCards[card.id],
    grading,
    open: () => openCard(card),
    // Retirer une carte gradée efface son grade : on passe par la fiche pour confirmer.
    quickToggle: () => (grading ? openCard(card) : toggleOwned(card.id)),
  };
}

function ToggleButton({ card, isOwned, onToggle, onRemove, inline }) {
  if (onRemove) {
    return (
      <button
        className={inline ? 'icon-btn' : 'ctile-toggle is-remove'}
        style={inline ? { color: 'var(--danger)' } : undefined}
        aria-label={`Retirer ${card.name} de la liste`}
        onClick={(e) => { e.stopPropagation(); onRemove(card); }}
      >
        <Minus size={18} />
      </button>
    );
  }
  return (
    <button
      className={inline ? `icon-btn${isOwned ? ' is-violet' : ''}` : `ctile-toggle${isOwned ? ' is-on' : ''}`}
      aria-pressed={isOwned}
      aria-label={isOwned ? `Retirer ${card.name} de ma collection` : `Ajouter ${card.name} à ma collection`}
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
    >
      {isOwned ? <Check size={18} strokeWidth={3} /> : <Plus size={18} />}
    </button>
  );
}

function CardTile({ card, caption, onRemove, dim }) {
  const { isOwned, isFav, grading, open, quickToggle } = useCardState(card);
  return (
    <div className={`ctile${isOwned || !dim ? '' : ' is-missing'}`}>
      <button className="ctile-img" onClick={open} aria-label={`${card.name} — voir la fiche`}>
        <img src={card.images?.small} alt="" loading="lazy" />
        {isFav && <span className="ctile-fav"><Star size={11} fill="currentColor" /></span>}
        {grading && <span className="ctile-grade">{grading.company} {grading.grade}</span>}
      </button>
      <ToggleButton card={card} isOwned={isOwned} onToggle={quickToggle} onRemove={onRemove} />
      <div className="ctile-cap">
        {caption === 'name' ? (
          <>
            <b className="clamp1">{card.name}</b>
            <span className="clamp1">{card.set?.name}</span>
          </>
        ) : (
          <span>#{card.number}</span>
        )}
      </div>
    </div>
  );
}

function CardRow({ card, caption, onRemove, dim }) {
  const { isOwned, isFav, grading, open, quickToggle } = useCardState(card);
  const meta = caption === 'name'
    ? `#${card.number}${card.set?.name ? ` · ${card.set.name}` : ''}`
    : `#${card.number} · ${card.rarity || '—'}`;
  return (
    <div
      className="list-row tap" role="button" tabIndex={0} style={{ cursor: 'pointer' }}
      onClick={open}
      onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) open(); }}
    >
      <img
        className="card-thumb" src={card.images?.small} alt="" loading="lazy"
        style={isOwned || !dim ? undefined : { filter: 'grayscale(1)', opacity: 0.5 }}
      />
      <div className="grow">
        <b className="clamp1">{card.name}</b>
        <p className="small muted clamp1">{meta}</p>
        <div className="row" style={{ gap: 6, marginTop: 4 }}>
          {grading && <span className="tag tag-gold"><Trophy size={11} /> {grading.company} {grading.grade}</span>}
          {isFav && <span className="tag tag-gold"><Star size={11} fill="currentColor" /> Favori</span>}
        </div>
      </div>
      <ToggleButton card={card} isOwned={isOwned} onToggle={quickToggle} onRemove={onRemove} inline />
    </div>
  );
}

/**
 * Grille ou liste de cartes. `caption` : 'number' (dans un set) ou 'name' (résultats mélangés).
 * `dimMissing` grise les cartes non possédées (inutile dans des résultats de recherche).
 * `onRemove` remplace le bouton d'ajout par un bouton de retrait (édition d'une liste).
 */
export function CardsView({ cards, mode = 'grid', caption = 'name', onRemove, dimMissing = true }) {
  if (mode === 'list') {
    return (
      <div className="stack">
        {cards.map((c) => <CardRow key={c.id} card={c} caption={caption} onRemove={onRemove} dim={dimMissing} />)}
      </div>
    );
  }
  return (
    <div className="card-grid">
      {cards.map((c) => <CardTile key={c.id} card={c} caption={caption} onRemove={onRemove} dim={dimMissing} />)}
    </div>
  );
}

export function filterByOwnership(cards, owned, filter) {
  if (filter === 'owned') return cards.filter((c) => owned[c.id]);
  if (filter === 'missing') return cards.filter((c) => !owned[c.id]);
  return cards;
}

export const OWNERSHIP_FILTERS = [
  { value: 'all', label: 'Toutes' },
  { value: 'owned', label: 'Possédées' },
  { value: 'missing', label: 'Manquantes' },
];
