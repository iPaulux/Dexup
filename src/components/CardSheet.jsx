import React, { useEffect, useState } from 'react';
import { Check, ChevronDown, ExternalLink, ListPlus, Plus, Star, Trophy } from 'lucide-react';
import { useCollection } from '../store/collection';
import { getCached, setCached } from '../utils/cache';
import { getGradingInfo } from '../utils/storage';
import { loadFullCard, openUrl } from '../lib/tcg';
import { Confirm, Sheet, plural } from './ui';
import { PokeBall } from './PokeBall';

// tag : affiché sur le bouton — name : valeur stockée
const GRADING_COMPANIES = [
  { tag: 'PSA', name: 'PSA' },
  { tag: 'PCA', name: 'PCA' },
  { tag: 'CA', name: 'CA' },
  { tag: 'COL', name: 'CollectAura' },
  { tag: 'CCC', name: 'CCC' },
  { tag: 'CGC', name: 'CGC' },
  { tag: 'BEC', name: 'Beckett' },
  { tag: 'AUT', name: 'Autres' },
];

const RARITY = {
  'Common': ['C', ''], 'Uncommon': ['U', 'tag-sky'], 'Rare': ['R', 'tag-gold'], 'Rare Holo': ['H', 'tag-gold'],
  'Rare Holo EX': ['EX', 'tag-peach'], 'Rare Holo GX': ['GX', 'tag-peach'], 'Rare Holo V': ['V', 'tag-peach'],
  'Rare Holo VMAX': ['VMAX', 'tag-peach'], 'Rare Holo VSTAR': ['VSTAR', 'tag-peach'], 'Double Rare': ['RR', 'tag-peach'],
  'Illustration Rare': ['AR', 'tag-violet'], 'Special Illustration Rare': ['SAR', 'tag-violet'], 'Hyper Rare': ['HR', 'tag-gold'],
  'Ultra Rare': ['UR', 'tag-peach'], 'Rare Ultra': ['UR', 'tag-peach'], 'Rare Secret': ['SR', 'tag-peach'],
  'Rare Rainbow': ['RR', 'tag-violet'], 'Shiny Rare': ['S', 'tag-sky'], 'Shiny Ultra Rare': ['SSR', 'tag-violet'],
  'ACE SPEC Rare': ['ACE', 'tag-peach'], 'Trainer Gallery Rare Holo': ['TGH', 'tag-violet'], 'Rare Shining': ['S', 'tag-sky'],
  'Amazing Rare': ['A', 'tag-mint'], 'Promo': ['PR', 'tag-mint'],
};

const TYPE_COLORS = {
  Fire: '#c0392b', Water: '#2980b9', Grass: '#218c53', Lightning: '#b87900', Psychic: '#8e44ad', Fighting: '#b9480a',
  Darkness: '#2c3e50', Metal: '#66757a', Fairy: '#c2187a', Dragon: '#1a5276', Colorless: '#6b6b6b',
};

const money = (v, unit) => `${Number(v).toFixed(2)} ${unit}`;

function PriceBlock({ title, unit, rows }) {
  const shown = rows.filter(([, v]) => v != null);
  if (!shown.length) return null;
  return (
    <div className="card card-pad">
      <p className="tiny dim" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>{title}</p>
      {shown.map(([label, v], i) => (
        <div className="kv" key={label}>
          <span>{label}</span>
          <b style={i === 0 ? { color: 'var(--violet-ink)', fontSize: 17 } : undefined}>{money(v, unit)}</b>
        </div>
      ))}
    </div>
  );
}

function GradingEditor({ grading, onSave, onRemove }) {
  const known = GRADING_COMPANIES.find((c) => c.tag !== 'AUT' && c.name === grading?.company);
  const [open, setOpen] = useState(false);
  const [company, setCompany] = useState(grading ? (known?.tag ?? 'AUT') : 'PSA');
  const [custom, setCustom] = useState(grading && !known ? grading.company : '');
  const [grade, setGrade] = useState(grading?.grade ?? '');

  const save = () => {
    if (!grade.trim()) return;
    const name = company === 'AUT'
      ? (custom.trim() || 'Autres')
      : GRADING_COMPANIES.find((c) => c.tag === company).name;
    onSave({ graded: true, company: name, grade: grade.trim() });
    setOpen(false);
  };

  return (
    <div className="card">
      <button className="row card-pad" style={{ width: '100%' }} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <Trophy size={19} color="var(--gold)" />
        <b className="grow" style={{ textAlign: 'left' }}>
          {grading ? `Gradée ${grading.company} ${grading.grade}` : 'Ajouter un grade'}
        </b>
        <ChevronDown size={18} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </button>
      {open && (
        <div className="stack" style={{ padding: '0 16px 16px' }}>
          <div className="grade-grid">
            {GRADING_COMPANIES.map((c) => (
              <button key={c.tag} className={company === c.tag ? 'is-active' : ''} onClick={() => setCompany(c.tag)} title={c.name}>
                {c.tag}
              </button>
            ))}
          </div>
          {company === 'AUT' && (
            <input className="input" placeholder="Nom de la société" value={custom} onChange={(e) => setCustom(e.target.value)} />
          )}
          <input
            className="input" placeholder="Note (ex : 10, 9.5, 8)" inputMode="decimal"
            value={grade} onChange={(e) => setGrade(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
          />
          <div className="row">
            {grading && <button className="btn btn-danger btn-sm" onClick={() => { onRemove(); setOpen(false); }}>Supprimer</button>}
            <button className="btn btn-dark btn-sm grow" disabled={!grade.trim()} onClick={save}>Enregistrer le grade</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ListPickerSheet({ card, onClose }) {
  const { lists, addToList, removeFromList, createList } = useCollection();
  const [name, setName] = useState('');
  const sorted = Object.values(lists).sort((a, b) => b.createdAt - a.createdAt);

  const create = async () => {
    const n = name.trim();
    if (!n) return;
    setName('');
    const all = await createList(n, 'poke');
    const created = Object.values(all || {}).sort((a, b) => b.createdAt - a.createdAt)[0];
    if (created) addToList(created.id, card);
  };

  return (
    <Sheet title="Ajouter à une liste" onClose={onClose} level={1}>
      <p className="small muted clamp1" style={{ marginBottom: 12 }}>{card.name}{card.set?.name ? ` — ${card.set.name}` : ''}</p>
      <div className="stack">
        {sorted.length === 0 && <p className="small dim">Aucune liste pour l'instant — crée ta première juste en dessous.</p>}
        {sorted.map((list) => {
          const inList = !!list.cards?.[card.id];
          return (
            <button
              key={list.id} className="list-row" aria-pressed={inList}
              onClick={() => (inList ? removeFromList(list.id, card.id) : addToList(list.id, card))}
            >
              <PokeBall id={list.icon} size={34} />
              <span className="grow">
                <b className="clamp1" style={{ display: 'block' }}>{list.name}</b>
                <span className="small muted">{plural(Object.keys(list.cards || {}).length, 'carte')}</span>
              </span>
              <span className={`check${inList ? ' is-on' : ''}`}>{inList && <Check size={15} strokeWidth={3} />}</span>
            </button>
          );
        })}
        <div className="row" style={{ marginTop: 6 }}>
          <input
            className="input grow" placeholder="Nouvelle liste…" value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') create(); }}
          />
          <button className="btn btn-dark" disabled={!name.trim()} onClick={create}><Plus size={18} /> Créer</button>
        </div>
      </div>
    </Sheet>
  );
}

function CardSheetInner({ card }) {
  const { owned, favCards, lists, closeCard, toggleOwned, toggleFavCard, setGrading } = useCollection();
  const [full, setFull] = useState(null);
  const [loading, setLoading] = useState(true);
  const [picker, setPicker] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const key = `fullcard:${card.id}`;
      try {
        let data = await getCached(key);
        if (!data) {
          data = await loadFullCard(card.id);
          if (data) await setCached(key, data);
        }
        if (alive && data) setFull(data);
      } catch (_) { /* hors ligne : on affiche ce qu'on a */ }
      if (alive) setLoading(false);
    })();
    return () => { alive = false; };
  }, [card.id]);

  const c = full || card;
  const isOwned = !!owned[card.id];
  const isFav = !!favCards[card.id];
  const grading = getGradingInfo(owned[card.id]);
  const inLists = Object.values(lists).filter((l) => l.cards?.[card.id]).length;
  const rarity = RARITY[c.rarity];
  const cm = full?.cardmarket?.prices;
  const tcp = full?.tcgplayer?.prices;
  const tcpVariant = tcp?.holofoil ?? tcp?.normal ?? tcp?.['1stEditionHolofoil'] ?? tcp?.reverseHolofoil ?? null;

  const onOwnedClick = () => (grading ? setConfirmRemove(true) : toggleOwned(card.id));

  return (
    <>
      <Sheet
        title={c.name} onClose={closeCard} tall
        footer={
          <>
            <button className={`btn grow ${isOwned ? 'btn-owned' : 'btn-violet'}`} onClick={onOwnedClick} aria-pressed={isOwned}>
              {isOwned ? <><Check size={19} strokeWidth={3} /> Dans ma collection</> : <><Plus size={19} /> Ajouter à ma collection</>}
            </button>
            <button
              className={`icon-btn${isFav ? ' is-on' : ''}`} style={{ width: 48, height: 48 }}
              aria-pressed={isFav} aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              onClick={() => toggleFavCard(c)}
            >
              <Star size={21} fill={isFav ? 'currentColor' : 'none'} />
            </button>
            <button
              className={`icon-btn${inLists ? ' is-violet' : ''}`} style={{ width: 48, height: 48 }}
              aria-label="Ajouter à une liste" onClick={() => setPicker(true)}
            >
              <ListPlus size={21} />
            </button>
          </>
        }
      >
        <img className="cs-image" src={c.images?.large ?? c.images?.small} alt={c.name} />

        {c.set && (
          <p className="small muted" style={{ textAlign: 'center' }}>
            {c.set.name}{c.set.series ? ` · ${c.set.series}` : ''}
          </p>
        )}
        <div className="cs-chips">
          <span className="tag">#{c.number}{full?.set?.printedTotal ? ` / ${full.set.printedTotal}` : ''}</span>
          {c.set?.id && <span className="tag tag-violet">{c.set.id.toUpperCase()}</span>}
          {c.rarity && <span className={`tag ${rarity?.[1] ?? ''}`} title={c.rarity}>{rarity ? `${rarity[0]} · ` : ''}{c.rarity}</span>}
          {c.supertype && <span className="tag">{c.supertype}</span>}
          {c.types?.map((t) => (
            <span key={t} className="tag type-chip" style={{ background: TYPE_COLORS[t] ?? '#666' }}>{t}</span>
          ))}
        </div>
        {c.artist && <p className="tiny dim" style={{ textAlign: 'center', marginTop: 8 }}>Illustration : {c.artist}</p>}

        <div className="stack" style={{ marginTop: 18 }}>
          {isOwned && (
            <GradingEditor
              key={grading ? `${grading.company}-${grading.grade}` : 'none'}
              grading={grading}
              onSave={(g) => setGrading(card.id, g)}
              onRemove={() => setGrading(card.id, { graded: false })}
            />
          )}

          {loading ? (
            <div className="card card-pad row"><div className="spinner sm" /><span className="small muted">Chargement des prix…</span></div>
          ) : cm || tcpVariant ? (
            <>
              {cm && (
                <PriceBlock title="Cardmarket" unit="€" rows={[
                  ['Tendance', cm.trendPrice], ['Vente moyenne', cm.averageSellPrice], ['Prix bas', cm.lowPrice],
                  ['Moyenne 7 j', cm.avg7], ['Moyenne 30 j', cm.avg30],
                ]} />
              )}
              {tcpVariant && (
                <PriceBlock title="TCGPlayer" unit="$" rows={[
                  ['Marché', tcpVariant.market], ['Bas', tcpVariant.low], ['Haut', tcpVariant.high], ['Médian', tcpVariant.mid],
                ]} />
              )}
            </>
          ) : (
            <p className="small dim" style={{ textAlign: 'center' }}>Prix non disponible pour cette carte.</p>
          )}

          {full?.cardmarket?.url && (
            <button className="btn btn-ghost btn-block" onClick={() => openUrl(full.cardmarket.url)}>
              Voir sur Cardmarket <ExternalLink size={16} />
            </button>
          )}
        </div>
      </Sheet>

      {picker && <ListPickerSheet card={c} onClose={() => setPicker(false)} />}
      {confirmRemove && (
        <Confirm
          title="Retirer de la collection ?"
          message={`${c.name} est gradée ${grading?.company} ${grading?.grade}. La retirer supprimera aussi son grade.`}
          confirmLabel="Retirer"
          onConfirm={() => toggleOwned(card.id)}
          onClose={() => setConfirmRemove(false)}
        />
      )}
    </>
  );
}

export default function CardSheet() {
  const { activeCard } = useCollection();
  if (!activeCard) return null;
  return <CardSheetInner key={activeCard.id} card={activeCard} />;
}
