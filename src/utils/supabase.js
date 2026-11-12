/**
 * Client Supabase + helpers d'authentification email/password.
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function initSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (e) {
    console.warn('[supabase] Init failed:', e.message);
    return null;
  }
}
export const supabase = initSupabase();

// ─── Clés synchronisées (jamais le cache API) ─────────────────────────────────
export const SYNC_KEYS = new Set(['owned_cards', 'favorite_cards', 'favorite_sets', 'custom_lists', 'favorite_products', 'owned_products']);

// ─── Auth helpers ─────────────────────────────────────────────────────────────

/** Retourne l'ID de l'utilisateur connecté, ou null. */
export async function getAuthUserId() {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** Retourne la session en cours, ou null. */
export async function getSession() {
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/** Inscription. */
export async function signUp(email, password) {
  if (!supabase) return { error: { message: 'Supabase non configuré' } };
  return supabase.auth.signUp({ email, password });
}

/** Connexion. */
export async function signIn(email, password) {
  if (!supabase) return { error: { message: 'Supabase non configuré' } };
  return supabase.auth.signInWithPassword({ email, password });
}

/** Déconnexion. */
export async function signOut() {
  if (!supabase) return;
  return supabase.auth.signOut();
}
