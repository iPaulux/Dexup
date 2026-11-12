/**
 * Stockage persistant — double couche :
 *   1. SQLite local (sql.js + IndexedDB) → lecture rapide, offline
 *   2. Supabase (PostgreSQL cloud) → persistance serveur, survie au cache clear
 *
 * Seules les clés "utilisateur" (owned_cards, favorites, lists) sont
 * synchronisées vers Supabase. Le cache API ne quitte jamais le navigateur.
 */
import { getDb, persistDb } from './db';
import { supabase, getAuthUserId, SYNC_KEYS } from './supabase';

// ─── Lecture locale ───────────────────────────────────────────────────────────
export async function readStore(key) {
  try {
    const db = await getDb();
    const result = db.exec('SELECT value FROM kv_store WHERE key = ?', [key]);
    if (!result.length || !result[0].values.length) return null;
    return JSON.parse(result[0].values[0][0]);
  } catch (e) {
    console.warn('[persist] readStore error:', e);
    return null;
  }
}

// ─── Écriture locale + push Supabase (fire-and-forget) ───────────────────────
export async function writeStore(key, value) {
  try {
    const db = await getDb();
    const json = JSON.stringify(value);
    db.run('INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)', [key, json]);
    await persistDb();

    if (SYNC_KEYS.has(key) && supabase) {
      (async () => {
        const userId = await getAuthUserId();
        if (!userId) return;
        supabase
          .from('pokecollect_data')
          .upsert({ user_id: userId, key, value: json, updated_at: Date.now() })
          .then(({ error }) => { if (error) console.warn('[sync] push error:', error.message); });
      })();
    }
  } catch (e) {
    console.warn('[persist] writeStore error:', e);
    throw e;
  }
}

// ─── Hydratation initiale depuis Supabase → DB locale ────────────────────────
export async function hydrateFromRemote() {
  if (!supabase) return false;
  try {
    const userId = await getAuthUserId();
    if (!userId) return false;

    const { data, error } = await supabase
      .from('pokecollect_data')
      .select('key, value')
      .eq('user_id', userId);

    if (error) { console.warn('[sync] hydrate error:', error.message); return false; }
    if (!data?.length) return false;

    const db = await getDb();
    for (const row of data) {
      db.run('INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)', [row.key, row.value]);
    }
    await persistDb();
    return true;
  } catch (e) {
    console.warn('[sync] hydrate error:', e);
    return false;
  }
}

// ─── Pousse toutes les clés locales vers Supabase (sync forcée) ──────────────
export async function pushAllToRemote() {
  if (!supabase) return false;
  try {
    const userId = await getAuthUserId();
    if (!userId) return false;

    const db = await getDb();
    const keys = [...SYNC_KEYS];
    const result = db.exec(`SELECT key, value FROM kv_store WHERE key IN (${keys.map(() => '?').join(', ')})`, keys);
    if (!result.length || !result[0].values.length) return false;

    const rows = result[0].values.map(([key, value]) => ({
      user_id: userId,
      key,
      value,
      updated_at: Date.now(),
    }));

    const { error } = await supabase.from('pokecollect_data').upsert(rows);
    if (error) { console.warn('[sync] pushAll error:', error.message); return false; }
    return true;
  } catch (e) {
    console.warn('[sync] pushAll error:', e);
    return false;
  }
}

// ─── Supprime toutes les données distantes (reset complet) ───────────────────
export async function purgeRemote() {
  if (!supabase) return;
  const userId = await getAuthUserId();
  if (!userId) return;
  await supabase.from('pokecollect_data').delete().eq('user_id', userId);
}
