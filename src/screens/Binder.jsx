import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Ellipsis, Layers, Pencil, Plus, Star, Trash2, Trophy } from 'lucide-react';
import { useCollection } from '../store/collection';
import { PRODUCTS } from '../data/products';
import { isGraded } from '../lib/tcg';
import { CardsView } from '../components/cards';
import { PokeBall } from '../components/PokeBall';
import { ListEditorSheet } from '../components/sheets';
import { Confirm, Empty, Page, Pills, Progress, Segmented, Sheet, StarButton, Tappable, TopBar, plural, usePersistedState } from '../components/ui';
import { ProductRow, ProductSheet } from './Products';

function ListsTab() {
  const navigate = useNavigate();
  const { owned, lists, deleteList } = useCollection();
  const [editor, setEditor] = useState(null); // null | 'new' | list
  const [menu, setMenu] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const total = Object.keys(owned).length;
  const graded = useMemo(() => Object.values(owned).filter(isGraded).length, [owned]);
  const sorted = Object.values(lists).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <>
      <div className="tiles" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <button className="tile tile-white" onClick={() => navigate('/binder/collection')}>
          <Layers size={24} />
          <div><b>Ma collection</b><span>{plural(total, 'carte')}</span></div>
        </button>
        <button className="tile tile-white" onClick={() => navigate('/binder/graded')}>
          <Trophy size={24} />
          <div><b>Cartes gradées</b><span>{plural(graded, 'carte')}</span></div>
        </button>
      </div>

      <section className="section">
        <div className="section-head" style={{ alignItems: 'center' }}>
          <h2 className="h2">Mes listes</h2>
          <button className="btn btn-dark btn-sm" onClick={() => setEditor('new')}><Plus size={17} /> Nouvelle liste</button>
        </div>

        {sorted.length === 0 ? (
          <Empty title="Aucune liste pour l'instant" text="Wishlist, échanges, master set… crée une liste pour organiser tes cartes.">
            <PokeBall id="poke" size={44} />
          </Empty>
        ) : (
          <div className="stack">
            {sorted.map((list) => {
              const ids = Object.keys(list.cards || {});
              const have = ids.filter((id) => owned[id]).length;
              return (
                <Tappable key={list.id} onClick={() => navigate(`/binder/list/${list.id}`)}>
                  <PokeBall id={list.icon} size={42} />
                  <div className="grow">
                    <b className="clamp1">{list.name}</b>
                    <p className="small muted">{plural(ids.length, 'carte')}{ids.length > 0 ? ` · ${have} possédée${have > 1 ? 's' : ''}` : ''}</p>
                    {ids.length > 0 && <div style={{ marginTop: 6 }}><Progress value={have} total={ids.length} /></div>}
                  </div>
                  <button
                    className="icon-btn plain" aria-label={`Options de la liste ${list.name}`}
                    onClick={(e) => { e.stopPropagation(); setMenu(list); }}
                  >
                    <Ellipsis size={20} />
                  </button>
                  <ChevronRight size={18} color="var(--ink-3)" />
                </Tappable>
              );
            })}
          </div>
        )}
      </section>

      {menu && (
        <Sheet title={menu.name} onClose={() => setMenu(null)}>
          <button className="menu-item" onClick={() => { setEditor(menu); setMenu(null); }}><Pencil size={19} /> Renommer / changer l'icône</button>
          <button className="menu-item danger" onClick={() => { setToDelete(menu); setMenu(null); }}><Trash2 size={19} /> Supprimer la liste</button>
        </Sheet>
      )}
      {editor && <ListEditorSheet list={editor === 'new' ? null : editor} onClose={() => setEditor(null)} />}
      {toDelete && (
        <Confirm
          title="Supprimer la liste ?"
          message={`« ${toDelete.name} » sera supprimée. Tes cartes restent dans ta collection.`}
          confirmLabel="Supprimer"
          onConfirm={() => deleteList(toDelete.id)}
          onClose={() => setToDelete(null)}
        />
      )}
    </>
  );
}

function FavoritesTab() {
  const navigate = useNavigate();
  const { favCards, favSets, favProducts, toggleFavSet } = useCollection();
  const [kind, setKind] = usePersistedState('pc_fav_kind', 'cards');
  const [product, setProduct] = useState(null);

  const cards = Object.values(favCards);
  const sets = Object.values(favSets);
  const products = Object.values(favProducts).map((p) => PRODUCTS.find((x) => x.id === p.id) ?? p);

  if (cards.length + sets.length + products.length === 0) {
    return <Empty icon={Star} title="Aucun favori" text="Touche l'étoile sur une carte, une extension ou un produit pour le retrouver ici." />;
  }

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Pills
          value={kind} onChange={setKind}
          options={[
            { value: 'cards', label: 'Cartes', count: cards.length },
            { value: 'sets', label: 'Extensions', count: sets.length },
            { value: 'products', label: 'Produits', count: products.length },
          ]}
        />
      </div>

      {kind === 'cards' && (cards.length
        ? <CardsView cards={cards} caption="name" dimMissing={false} />
        : <Empty title="Aucune carte favorite" text="Ouvre une carte et touche l'étoile." />)}

      {kind === 'sets' && (sets.length ? (
        <div className="stack">
          {sets.map((s) => (
            <Tappable key={s.id} onClick={() => navigate(`/sets/${s.id}`)}>
              <div className="thumb-box"><img src={s.images?.logo} alt="" loading="lazy" /></div>
              <div className="grow">
                <b className="clamp1">{s.name}</b>
                <p className="small muted clamp1">{s.series} · {s.total} cartes</p>
              </div>
              <StarButton on onClick={() => toggleFavSet(s)} />
            </Tappable>
          ))}
        </div>
      ) : <Empty title="Aucune extension favorite" text="Touche l'étoile d'une extension pour l'épingler ici." />)}

      {kind === 'products' && (products.length ? (
        <div className="stack">
          {products.map((p) => <ProductRow key={p.id} product={p} onOpen={setProduct} />)}
        </div>
      ) : <Empty title="Aucun produit favori" text="Retrouve les produits depuis l'accueil et touche leur étoile." />)}

      {product && <ProductSheet product={product} onClose={() => setProduct(null)} />}
    </>
  );
}

export default function Binder() {
  const [tab, setTab] = usePersistedState('pc_binder_tab', 'lists');
  return (
    <Page>
      <TopBar title="Classeur" />
      <div style={{ marginBottom: 18 }}>
        <Segmented
          value={tab} onChange={setTab}
          options={[{ value: 'lists', label: 'Listes' }, { value: 'favs', label: 'Favoris' }]}
        />
      </div>
      {tab === 'lists' ? <ListsTab /> : <FavoritesTab />}
    </Page>
  );
}
