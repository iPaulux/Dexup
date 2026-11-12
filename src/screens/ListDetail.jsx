import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Ellipsis, MinusCircle, Pencil, Trash2 } from 'lucide-react';
import { useCollection } from '../store/collection';
import { CardsView, OWNERSHIP_FILTERS, filterByOwnership } from '../components/cards';
import { PokeBall } from '../components/PokeBall';
import { ListEditorSheet } from '../components/sheets';
import { Confirm, Empty, Loading, Page, Progress, Segmented, Sheet, TopBar, ViewToggle, pct, usePersistedState } from '../components/ui';

export default function ListDetail() {
  const { listId } = useParams();
  const navigate = useNavigate();
  const { ready, lists, owned, removeFromList, deleteList } = useCollection();
  const [filter, setFilter] = useState('all');
  const [mode, setMode] = usePersistedState('pc_cards_view', 'grid');
  const [menu, setMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const list = lists[listId];
  const cards = useMemo(() => Object.values(list?.cards || {}), [list]);
  const ownedCount = cards.filter((c) => owned[c.id]).length;
  const shown = filterByOwnership(cards, owned, filter);

  if (!ready) return <Page><Loading /></Page>;
  if (!list) {
    return (
      <Page>
        <TopBar title="Liste" back="/binder" />
        <Empty title="Liste introuvable" text="Elle a peut-être été supprimée." />
      </Page>
    );
  }

  return (
    <Page>
      <TopBar title={list.name} back="/binder">
        <PokeBall id={list.icon} size={30} />
        <button className="icon-btn" onClick={() => setMenu(true)} aria-label="Options de la liste"><Ellipsis size={20} /></button>
      </TopBar>

      {cards.length === 0 ? (
        <Empty title="Liste vide" text="Ouvre une carte depuis une extension ou la recherche, puis touche « Ajouter à une liste »." />
      ) : (
        <>
          <div className="card card-pad" style={{ marginBottom: 14 }}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
              <span>
                <b style={{ fontFamily: 'var(--display)', fontSize: 22 }}>{ownedCount}</b>
                <span className="muted"> sur {cards.length} possédée{ownedCount > 1 ? 's' : ''}</span>
              </span>
              <b style={{ color: 'var(--violet-ink)' }}>{pct(ownedCount, cards.length)} %</b>
            </div>
            <Progress value={ownedCount} total={cards.length} />
          </div>

          {removing ? (
            <div className="row msg msg-err" style={{ marginBottom: 16 }}>
              <span className="grow">Touche le − d'une carte pour la retirer de la liste.</span>
              <button className="btn btn-dark btn-sm" onClick={() => setRemoving(false)}>Terminer</button>
            </div>
          ) : (
            <div className="row" style={{ marginBottom: 16 }}>
              <div className="grow"><Segmented options={OWNERSHIP_FILTERS} value={filter} onChange={setFilter} /></div>
              <ViewToggle mode={mode} onChange={setMode} />
            </div>
          )}

          {shown.length === 0
            ? <Empty title={filter === 'owned' ? 'Aucune carte possédée dans cette liste' : 'Tu as toutes les cartes de cette liste !'} />
            : <CardsView cards={shown} mode={mode} caption="name" onRemove={removing ? (c) => { if (cards.length === 1) setRemoving(false); removeFromList(list.id, c.id); } : undefined} />}
        </>
      )}

      {menu && (
        <Sheet title={list.name} onClose={() => setMenu(false)}>
          <button className="menu-item" onClick={() => { setEditing(true); setMenu(false); }}><Pencil size={19} /> Renommer / changer l'icône</button>
          {cards.length > 0 && (
            <button className="menu-item" onClick={() => { setRemoving(true); setFilter('all'); setMenu(false); }}><MinusCircle size={19} /> Retirer des cartes</button>
          )}
          <button className="menu-item danger" onClick={() => { setConfirmDelete(true); setMenu(false); }}><Trash2 size={19} /> Supprimer la liste</button>
        </Sheet>
      )}
      {editing && <ListEditorSheet list={list} onClose={() => setEditing(false)} />}
      {confirmDelete && (
        <Confirm
          title="Supprimer la liste ?"
          message={`« ${list.name} » sera supprimée. Tes cartes restent dans ta collection.`}
          confirmLabel="Supprimer"
          onConfirm={() => { deleteList(list.id); navigate('/binder', { replace: true }); }}
          onClose={() => setConfirmDelete(false)}
        />
      )}
    </Page>
  );
}
