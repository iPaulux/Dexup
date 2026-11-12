import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ExternalLink, Plus, SearchX } from 'lucide-react';
import { useCollection } from '../store/collection';
import { PRODUCTS, PRODUCT_TYPES, PRICE_SOURCE, PRICE_UPDATED } from '../data/products';
import { openUrl, setLogoUrl } from '../lib/tcg';
import { Empty, Page, Pills, SearchField, Sheet, StarButton, Tappable, TopBar } from '../components/ui';

const typeLabel = (id) => PRODUCT_TYPES.find((t) => t.id === id)?.label ?? id;
const TYPE_OPTIONS = PRODUCT_TYPES.map((t) => ({ value: t.id, label: t.label }));

export function ProductImage({ product }) {
  return (
    <img
      src={product.image || setLogoUrl(product.setId)} alt="" loading="lazy"
      onError={(e) => { if (!e.target.dataset.fallback) { e.target.dataset.fallback = '1'; e.target.src = setLogoUrl(product.setId); } }}
    />
  );
}

export function ProductRow({ product, onOpen }) {
  const { favProducts, ownedProducts, toggleFavProduct, toggleOwnedProduct } = useCollection();
  const packs = product.contents?.packs;
  const isOwned = !!ownedProducts[product.id];
  return (
    <Tappable onClick={() => onOpen(product)}>
      <div className="thumb-box" style={{ width: 72, height: 76 }}><ProductImage product={product} /></div>
      <div className="grow">
        <b className="clamp2" style={{ fontSize: 14 }}>{product.nameFr || product.name}</b>
        <div className="row" style={{ gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
          <span className="tag">{typeLabel(product.type)}</span>
          {product.setId && <span className="tag tag-violet">{product.setId.toUpperCase()}</span>}
          {packs > 0 && <span className="tiny dim">{packs} booster{packs > 1 ? 's' : ''}</span>}
        </div>
        <b style={{ display: 'block', marginTop: 6, fontFamily: 'var(--mono)', fontSize: 13 }}>{product.price ?? 'Prix à venir'}</b>
      </div>
      <button
        className={`icon-btn${isOwned ? ' is-owned' : ''}`} aria-pressed={isOwned}
        aria-label={isOwned ? `Retirer ${product.nameFr || product.name} de mes produits` : `Marquer ${product.nameFr || product.name} comme possédé`}
        onClick={(e) => { e.stopPropagation(); toggleOwnedProduct(product.id); }}
      >
        {isOwned ? <Check size={18} strokeWidth={3} /> : <Plus size={18} />}
      </button>
      <StarButton on={!!favProducts[product.id]} onClick={() => toggleFavProduct(product)} />
    </Tappable>
  );
}

export function ProductSheet({ product, onClose }) {
  const navigate = useNavigate();
  const { favProducts, ownedProducts, toggleFavProduct, toggleOwnedProduct } = useCollection();
  const isOwned = !!ownedProducts[product.id];
  const contents = product.contents || {};
  const name = product.nameFr || product.name;
  const cardmarket = `https://www.cardmarket.com/fr/Pokemon/Products/Search?searchString=${encodeURIComponent(name)}`;

  return (
    <Sheet
      title={name} onClose={onClose} tall
      footer={
        <button className={`btn grow ${isOwned ? 'btn-owned' : 'btn-violet'}`} aria-pressed={isOwned} onClick={() => toggleOwnedProduct(product.id)}>
          {isOwned ? <><Check size={19} strokeWidth={3} /> Possédé</> : <><Plus size={19} /> Marquer comme possédé</>}
        </button>
      }
    >
      <div className="stack" style={{ gap: 14 }}>
        <div className="card card-pad" style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', top: 8, right: 8 }}>
            <StarButton on={!!favProducts[product.id]} onClick={() => toggleFavProduct(product)} />
          </span>
          <div style={{ height: 150, display: 'flex', justifyContent: 'center', margin: '10px 0 14px' }}>
            <ProductImage product={product} />
          </div>
          <div className="row" style={{ justifyContent: 'center', gap: 6 }}>
            <span className="tag">{typeLabel(product.type)}</span>
            {product.setId && <span className="tag tag-violet">{product.setId.toUpperCase()}</span>}
          </div>
        </div>

        <div className="card card-pad row" style={{ justifyContent: 'space-between' }}>
          <div>
            <p className="small muted">Prix indicatif {PRICE_SOURCE}</p>
            <p className="tiny dim">Mis à jour {PRICE_UPDATED}</p>
          </div>
          <b style={{ fontFamily: 'var(--display)', fontSize: product.price ? 28 : 18, color: 'var(--violet-ink)' }}>{product.price ?? 'À venir'}</b>
        </div>

        <div className="card card-pad">
          {product.setName && <div className="kv"><span>Extension</span><b>{product.setName}</b></div>}
          {product.series && <div className="kv"><span>Série</span><b>{product.series}</b></div>}
          {product.releaseDate && <div className="kv"><span>Sortie</span><b>{product.releaseDate}</b></div>}
          {contents.packs > 0 && (
            <div className="kv"><span>Boosters</span><b>{contents.packs}{contents.cardsPerPack ? ` × ${contents.cardsPerPack} cartes` : ''}</b></div>
          )}
          {contents.totalCards && !contents.packs && <div className="kv"><span>Cartes</span><b>{contents.totalCards}</b></div>}
          {contents.promoCards > 0 && <div className="kv"><span>Cartes promo</span><b>{contents.promoCards}</b></div>}
          {(contents.extras || []).map((extra, i) => <div className="kv" key={i}><span>Inclus</span><b>{extra}</b></div>)}
        </div>

        {product.description && <p className="small muted">{product.description}</p>}

        <button className="btn btn-dark btn-block" onClick={() => openUrl(cardmarket)}>
          Voir sur Cardmarket <ExternalLink size={16} />
        </button>
        {product.setId && (
          <button className="btn btn-ghost btn-block" onClick={() => { onClose(); navigate(`/sets/${product.setId}`); }}>
            Voir les cartes de l'extension
          </button>
        )}
      </div>
    </Sheet>
  );
}

export default function Products() {
  const { ownedProducts } = useCollection();
  const [type, setType] = useState('all');
  const [onlyOwned, setOnlyOwned] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      if (type !== 'all' && p.type !== type) return false;
      if (onlyOwned && !ownedProducts[p.id]) return false;
      if (!q) return true;
      return [p.name, p.nameFr, p.setName, p.series, p.setId].some((v) => v && v.toLowerCase().includes(q));
    });
  }, [type, query, onlyOwned, ownedProducts]);

  return (
    <Page>
      <TopBar title="Produits" back="/">
        <button className={`pill${onlyOwned ? ' is-active' : ''}`} aria-pressed={onlyOwned} onClick={() => setOnlyOwned((v) => !v)}>
          Possédés <span className="pill-count">{Object.keys(ownedProducts).length}</span>
        </button>
      </TopBar>
      <div className="stack" style={{ gap: 12, marginBottom: 16 }}>
        <SearchField value={query} onChange={setQuery} placeholder="Produit, extension, code de set…" />
        <Pills options={TYPE_OPTIONS} value={type} onChange={setType} />
      </div>

      {shown.length === 0 ? (
        <Empty icon={SearchX} title="Aucun produit trouvé" text={onlyOwned ? 'Touche le + d\'un produit pour le marquer comme possédé.' : 'Essaie un autre nom ou une autre catégorie.'} />
      ) : (
        <div className="stack">
          {shown.map((p) => <ProductRow key={p.id} product={p} onOpen={setSelected} />)}
        </div>
      )}

      {selected && <ProductSheet product={selected} onClose={() => setSelected(null)} />}
    </Page>
  );
}
