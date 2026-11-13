import React, { useEffect, useState } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { BookMarked, Home as HomeIcon, LayoutGrid, ScanLine, Search as SearchIcon } from 'lucide-react';
import { LanguageProvider } from './utils/LanguageContext.jsx';
import { hydrateFromRemote } from './utils/persist';
import { supabase } from './utils/supabase';
import { CollectionProvider, useCollection } from './store/collection';
import Auth, { Splash } from './components/Auth';
import CardSheet from './components/CardSheet';
import Logo from './components/Logo';
import { AccountSheet } from './components/sheets';
import Home from './screens/Home';
import Sets from './screens/Sets';
import SetDetail from './screens/SetDetail';
import Search from './screens/Search';
import Scan from './screens/Scan';
import Binder from './screens/Binder';
import ListDetail from './screens/ListDetail';
import { Collection, Graded } from './screens/Collection';
import Products from './screens/Products';

const TABS = [
  { path: '/', label: 'Accueil', Icon: HomeIcon, match: (p) => p === '/' || p.startsWith('/products') },
  { path: '/sets', label: 'Extensions', Icon: LayoutGrid, match: (p) => p.startsWith('/sets') },
  { path: '/scan', label: 'Scanner', Icon: ScanLine, match: (p) => p.startsWith('/scan'), primary: true },
  { path: '/search', label: 'Recherche', Icon: SearchIcon, match: (p) => p.startsWith('/search') },
  { path: '/binder', label: 'Classeur', Icon: BookMarked, match: (p) => p.startsWith('/binder') },
];

function TabBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <nav className="tabbar" aria-label="Navigation principale">
      {TABS.map(({ path, label, Icon, match, primary }) => {
        const active = match(pathname);
        return (
          <button
            key={path}
            className={`tab${primary ? ' tab-scan' : ''}${active ? ' is-active' : ''}`}
            aria-current={active ? 'page' : undefined}
            aria-label={label}
            onClick={() => navigate(path)}
          >
            <Icon size={primary ? 26 : 21} strokeWidth={active ? 2.4 : 2} />
            {!primary && <span>{label}</span>}
          </button>
        );
      })}
    </nav>
  );
}

function Sidebar({ email, onAccount }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <aside className="sidebar">
      <div className="sidebar-brand"><Logo size={28} />Dexup</div>
      {TABS.map(({ path, label, Icon, match }) => {
        const active = match(pathname);
        return (
          <button
            key={path} className={`side-link${active ? ' is-active' : ''}`}
            aria-current={active ? 'page' : undefined} onClick={() => navigate(path)}
          >
            <Icon size={20} /> {label}
          </button>
        );
      })}
      <button className="side-link sidebar-foot" onClick={onAccount}>
        <Logo size={24} />
        <span className="clamp1 small">{email ?? 'Mon compte'}</span>
      </button>
    </aside>
  );
}

// Récupère la collection distante au premier affichage, puis rafraîchit le store.
function RemoteHydration({ userId }) {
  const { reload } = useCollection();
  useEffect(() => {
    hydrateFromRemote().then((changed) => { if (changed) reload(); });
  }, [userId, reload]);
  return null;
}

function Shell({ session }) {
  const [account, setAccount] = useState(false);
  const openAccount = () => setAccount(true);
  const { pathname } = useLocation();
  const { closeCard } = useCollection();

  // Une fiche ouverte ne doit pas rester par-dessus la page suivante.
  useEffect(() => {
    closeCard();
    setAccount(false);
  }, [pathname, closeCard]);

  return (
    <div className="app">
      <Sidebar email={session.user?.email} onAccount={openAccount} />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home onAccount={openAccount} />} />
          <Route path="/sets" element={<Sets />} />
          <Route path="/sets/:setId" element={<SetDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/binder" element={<Binder />} />
          <Route path="/binder/collection" element={<Collection />} />
          <Route path="/binder/graded" element={<Graded />} />
          <Route path="/binder/list/:listId" element={<ListDetail />} />
          <Route path="/products" element={<Products />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <TabBar />
      <CardSheet />
      {account && <AccountSheet session={session} onClose={() => setAccount(false)} />}
    </div>
  );
}

const GUEST = { user: { id: 'guest', email: 'Mode invité (local)' } };
// Sans Supabase, ou en dev avec ?guest=1 : l'app tourne en local, sans compte.
const guestMode = !supabase || (import.meta.env.DEV && new URLSearchParams(window.location.search).get('guest') === '1');

export default function App() {
  const [session, setSession] = useState(guestMode ? GUEST : undefined); // undefined = en cours de vérification

  useEffect(() => {
    if (guestMode) return undefined;
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => setSession(s ?? null));
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return null;
  if (!session) return <Auth />;

  return (
    <HashRouter>
      <LanguageProvider>
        <CollectionProvider>
          {!guestMode && <RemoteHydration userId={session.user.id} />}
          <Splash />
          <Shell session={session} />
        </CollectionProvider>
      </LanguageProvider>
    </HashRouter>
  );
}
