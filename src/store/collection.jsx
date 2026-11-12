import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  getOwnedCards, toggleCard, setCardGrading,
  getFavoriteCards, toggleFavoriteCard,
  getFavoriteSets, toggleFavoriteSet,
  getFavoriteProducts, toggleFavoriteProduct,
} from '../utils/storage';
import { getLists, createList, deleteList, renameList, addCardToList, removeCardFromList } from '../utils/lists';

const Ctx = createContext(null);
export const useCollection = () => useContext(Ctx);

const EMPTY = { owned: {}, favCards: {}, favSets: {}, favProducts: {}, lists: {}, ready: false };

const flip = (id, value) => (map) => {
  const next = { ...map };
  if (next[id]) delete next[id]; else next[id] = value;
  return next;
};

export function CollectionProvider({ children }) {
  const [data, setData] = useState(EMPTY);
  const [activeCard, setActiveCard] = useState(null);
  const queue = useRef(Promise.resolve());

  const reload = useCallback(async () => {
    const [owned, favCards, favSets, favProducts, lists] = await Promise.all([
      getOwnedCards(), getFavoriteCards(), getFavoriteSets(), getFavoriteProducts(), getLists(),
    ]);
    setData({ owned, favCards, favSets, favProducts, lists, ready: true });
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // Les écritures lisent puis réécrivent toute la clé : on les sérialise pour ne perdre aucun tap rapide.
  const write = useCallback((key, task, optimistic) => {
    if (optimistic) setData((d) => ({ ...d, [key]: optimistic(d[key]) }));
    queue.current = queue.current
      .then(task)
      .then((result) => { if (!optimistic) setData((d) => ({ ...d, [key]: { ...result } })); return result; })
      .catch((e) => { console.warn('[collection] write failed:', e); return reload(); });
    return queue.current;
  }, [reload]);

  const actions = useMemo(() => ({
    reload,
    openCard: setActiveCard,
    closeCard: () => setActiveCard(null),
    toggleOwned: (cardId) => write('owned', () => toggleCard(cardId), flip(cardId, true)),
    setGrading: (cardId, grading) => write('owned', () => setCardGrading(cardId, grading)),
    toggleFavCard: (card) => write('favCards', () => toggleFavoriteCard(card), flip(card.id, card)),
    toggleFavSet: (set) => write('favSets', () => toggleFavoriteSet(set), flip(set.id, set)),
    toggleFavProduct: (product) => write('favProducts', () => toggleFavoriteProduct(product), flip(product.id, product)),
    createList: (name, icon) => write('lists', () => createList(name, icon)),
    updateList: (id, name, icon) => write('lists', () => renameList(id, name, icon)),
    deleteList: (id) => write('lists', () => deleteList(id)),
    addToList: (listId, card) => write('lists', () => addCardToList(listId, {
      id: card.id, name: card.name, number: card.number, images: card.images,
      set: { id: card.set?.id, name: card.set?.name },
    })),
    removeFromList: (listId, cardId) => write('lists', () => removeCardFromList(listId, cardId)),
  }), [reload, write]);

  const value = useMemo(() => ({ ...data, activeCard, ...actions }), [data, activeCard, actions]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
