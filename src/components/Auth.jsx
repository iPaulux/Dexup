import React, { useEffect, useState } from 'react';
import { signIn, signUp } from '../utils/supabase';
import { Segmented } from './ui';
import Logo from './Logo';

export function Splash() {
  const [phase, setPhase] = useState('in'); // in | out | gone
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('out'), 1100);
    const t2 = setTimeout(() => setPhase('gone'), 1550);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  if (phase === 'gone') return null;
  return (
    <div className={`splash${phase === 'out' ? ' out' : ''}`} aria-hidden="true">
      <Logo size={96} />
      <b>Dexup</b>
    </div>
  );
}

export default function Auth() {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null); // { err } | { ok }

  const isLogin = tab === 'login';

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !password || busy) return;
    if (!isLogin) {
      if (password !== confirm) { setMsg({ err: 'Les mots de passe ne correspondent pas.' }); return; }
      if (password.length < 6) { setMsg({ err: 'Mot de passe trop court (6 caractères minimum).' }); return; }
    }
    setBusy(true);
    setMsg(null);
    // Connexion réussie : App bascule tout seul via onAuthStateChange.
    const { error } = isLogin ? await signIn(email, password) : await signUp(email, password);
    setBusy(false);
    if (error) { setMsg({ err: error.message }); return; }
    if (!isLogin) {
      setMsg({ ok: 'Compte créé ! Connecte-toi maintenant.' });
      setTab('login');
      setPassword('');
      setConfirm('');
    }
  };

  return (
    <div className="auth">
      <div className="auth-hero">
        <Logo size={64} />
        <h1>Toute ta collection<br />au <mark>même endroit</mark></h1>
      </div>

      <form className="auth-card" onSubmit={submit}>
        <Segmented
          value={tab} onChange={(t) => { setTab(t); setMsg(null); }}
          options={[{ value: 'login', label: 'Se connecter' }, { value: 'register', label: 'Créer un compte' }]}
        />

        <div>
          <label className="label" htmlFor="auth-email">Email</label>
          <input
            id="auth-email" className="input" type="email" placeholder="ton@email.com"
            autoCapitalize="none" autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="auth-password">Mot de passe</label>
          <input
            id="auth-password" className="input" type="password" placeholder="••••••••"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {!isLogin && (
          <div>
            <label className="label" htmlFor="auth-confirm">Confirmer le mot de passe</label>
            <input
              id="auth-confirm" className="input" type="password" placeholder="••••••••" autoComplete="new-password"
              value={confirm} onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
        )}

        {msg?.err && <p className="msg msg-err" role="alert">{msg.err}</p>}
        {msg?.ok && <p className="msg msg-ok" role="status">{msg.ok}</p>}

        <button className="btn btn-dark btn-block" type="submit" disabled={busy || !email || !password}>
          {busy ? <div className="spinner sm" /> : isLogin ? 'Se connecter' : 'Créer mon compte'}
        </button>
        <p className="tiny dim" style={{ textAlign: 'center' }}>Ta collection est synchronisée sur tous tes appareils.</p>
      </form>
    </div>
  );
}
