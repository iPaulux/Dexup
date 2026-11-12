import React, { useEffect, useMemo, useState } from 'react';
import { CloudUpload, ChevronRight, LogOut, MapPin, Newspaper, WifiOff } from 'lucide-react';
import { useCollection } from '../store/collection';
import { useLang, LANGUAGES } from '../utils/LanguageContext.jsx';
import { supabase, signOut } from '../utils/supabase';
import { pushAllToRemote } from '../utils/persist';
import { formatEuro, isGraded, ownedCountBySet, openUrl, setLogoUrl } from '../lib/tcg';
import { loadNews, formatNewsDate } from '../lib/news';
import { loadEvents, isPast, formatEventDate, eventTagClass } from '../lib/events';
import { Empty, Loading, Segmented, Sheet, plural } from './ui';
import { PokeBallPicker } from './PokeBall';
import Logo from './Logo';

// ─── Statistiques (totaux, grading, répartition par set) ─────────────────────
export function StatsSheet({ onClose, setNames = {}, wallet }) {
  const { owned } = useCollection();
  const stats = useMemo(() => {
    const entries = Object.values(owned);
    const graded = entries.filter(isGraded);
    const byCompany = {};
    const byGrade = {};
    for (const g of graded) {
      byCompany[g.company] = (byCompany[g.company] || 0) + 1;
      const k = `${g.company} ${g.grade}`;
      byGrade[k] = (byGrade[k] || 0) + 1;
    }
    const desc = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]);
    return {
      total: entries.length, graded: graded.length,
      byCompany: desc(byCompany), byGrade: desc(byGrade), bySet: desc(ownedCountBySet(owned)),
    };
  }, [owned]);

  return (
    <Sheet title="Statistiques" onClose={onClose} tall>
      {stats.total === 0 ? (
        <Empty title="Rien à compter pour l'instant" text="Ajoute tes premières cartes : tes statistiques apparaîtront ici." />
      ) : (
        <div className="stack" style={{ gap: 16 }}>
          <div className="card card-pad">
            <div className="kv"><span>Cartes possédées</span><b style={{ color: 'var(--violet-ink)', fontSize: 18 }}>{stats.total}</b></div>
            {wallet && (
              <div className="kv">
                <span>Valeur Cardmarket{wallet.priced < wallet.total ? ` (${wallet.priced}/${wallet.total} cartes évaluées)` : ''}</span>
                <b>{formatEuro(wallet.value)}</b>
              </div>
            )}
            <div className="kv"><span>Sets entamés</span><b>{stats.bySet.length}</b></div>
            <div className="kv"><span>Cartes gradées</span><b>{stats.graded}</b></div>
            <div className="kv"><span>Cartes non gradées</span><b>{stats.total - stats.graded}</b></div>
          </div>

          {stats.graded > 0 && (
            <>
              <div>
                <p className="label">Grading par société</p>
                <div className="card card-pad">
                  {stats.byCompany.map(([k, n]) => <div className="kv" key={k}><span>{k}</span><b>{n}</b></div>)}
                </div>
              </div>
              <div>
                <p className="label">Grades les plus fréquents</p>
                <div className="card card-pad">
                  {stats.byGrade.map(([k, n]) => <div className="kv" key={k}><span>{k}</span><b>× {n}</b></div>)}
                </div>
              </div>
            </>
          )}

          <div>
            <p className="label">Répartition par set</p>
            <div className="stack">
              {stats.bySet.map(([sid, n]) => (
                <div className="list-row" key={sid}>
                  <div className="thumb-box" style={{ width: 64, height: 42 }}>
                    <img src={setLogoUrl(sid)} alt="" loading="lazy" onError={(e) => { e.target.style.visibility = 'hidden'; }} />
                  </div>
                  <div className="grow">
                    <b className="clamp1">{setNames[sid] ?? sid.toUpperCase()}</b>
                    <p className="tiny dim">{sid.toUpperCase()}</p>
                  </div>
                  <b style={{ color: 'var(--violet-ink)' }}>{n}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Sheet>
  );
}

// ─── Actualités ──────────────────────────────────────────────────────────────
export function NewsSheet({ onClose }) {
  const [state, setState] = useState({ loading: true, error: false, articles: [] });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setState({ loading: true, error: false, articles: [] });
    loadNews()
      .then((articles) => alive && setState({ loading: false, error: false, articles }))
      .catch(() => alive && setState({ loading: false, error: true, articles: [] }));
    return () => { alive = false; };
  }, [attempt]);

  const { loading, error, articles } = state;
  return (
    <Sheet title="Actualités TCG" onClose={onClose} tall>
      {loading && <Loading label="Chargement des actualités…" />}
      {error && (
        <Empty icon={WifiOff} title="Actualités indisponibles" text="Vérifie ta connexion internet puis réessaie.">
          <button className="btn btn-dark" onClick={() => setAttempt((n) => n + 1)}>Réessayer</button>
        </Empty>
      )}
      {!loading && !error && (
        <div className="stack">
          <p className="tiny dim">
            {articles[0]?.domain} · mis à jour toutes les 24 h
          </p>
          {articles.map((a, i) => (
            <button className="list-row" key={i} onClick={() => openUrl(a.link)}>
              <div className="thumb-box" style={{ padding: 0, overflow: 'hidden', color: 'var(--ink-3)' }}>
                {a.thumbnail
                  ? <img src={a.thumbnail} alt="" loading="lazy" style={{ objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                  : <Newspaper size={22} />}
              </div>
              <span className="grow">
                <b className="clamp2" style={{ fontSize: 14 }}>{a.title}</b>
                <span className="row tiny dim" style={{ gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                  {a.domain && <span className="tag tag-violet">{a.domain}</span>}
                  {a.date && <span>{formatNewsDate(a.date)}</span>}
                  {a.score > 0 && <span>▲ {a.score}</span>}
                </span>
              </span>
              <ChevronRight size={18} color="var(--ink-3)" />
            </button>
          ))}
        </div>
      )}
    </Sheet>
  );
}

// ─── Événements ──────────────────────────────────────────────────────────────
export function EventsSheet({ onClose }) {
  const [events, setEvents] = useState(null);
  const [showPast, setShowPast] = useState(false);

  useEffect(() => { loadEvents().then(setEvents); }, []);

  if (!events) return <Sheet title="Événements" onClose={onClose} tall><Loading /></Sheet>;

  const upcoming = events.filter((e) => !isPast(e));
  const past = events.filter(isPast);
  const shown = showPast ? events : upcoming;
  const next = upcoming[0];

  return (
    <Sheet title="Événements" onClose={onClose} tall>
      <div className="stack">
        <p className="tiny dim">France & Europe · {upcoming.length} à venir</p>

        {next && (
          <div className="card-pad" style={{ background: 'var(--ink)', color: '#fff', borderRadius: 'var(--r)' }}>
            <p className="tiny" style={{ opacity: 0.85, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>Prochain événement</p>
            <p className="h2" style={{ margin: '4px 0' }}>{next.name}</p>
            <p className="small" style={{ opacity: 0.9 }}>
              {formatEventDate(next.date)}{next.dateEnd && next.dateEnd !== next.date ? ` → ${formatEventDate(next.dateEnd)}` : ''} · {next.city}
            </p>
          </div>
        )}

        {shown.map((ev) => {
          const d = new Date(`${ev.date}T00:00:00`);
          const done = isPast(ev);
          return (
            <button
              key={ev.id} className="list-row" style={done ? { opacity: 0.55 } : undefined}
              onClick={() => ev.url && openUrl(ev.url)}
            >
              <span className="thumb-box" style={{ width: 52, height: 56, flexDirection: 'column', padding: 0 }}>
                <b style={{ fontFamily: 'var(--display)', fontSize: 19, lineHeight: 1, color: done ? 'var(--ink-3)' : 'var(--violet-ink)' }}>{d.getDate()}</b>
                <span className="tiny dim" style={{ textTransform: 'uppercase', fontWeight: 700 }}>
                  {d.toLocaleDateString('fr-FR', { month: 'short' })}
                </span>
              </span>
              <span className="grow">
                <span className={`tag ${eventTagClass(ev.type)}`}>{ev.type}</span>
                <b className="clamp2" style={{ fontSize: 14, marginTop: 4 }}>{ev.name}</b>
                <span className="row tiny muted" style={{ gap: 4, marginTop: 2 }}><MapPin size={12} /> {[ev.venue, ev.city].filter(Boolean).join(', ')}</span>
                {ev.dateEnd && ev.dateEnd !== ev.date && <span className="tiny dim">Jusqu'au {formatEventDate(ev.dateEnd)}</span>}
              </span>
              {ev.url && <ChevronRight size={18} color="var(--ink-3)" />}
            </button>
          );
        })}

        {upcoming.length === 0 && !showPast && <p className="small dim" style={{ textAlign: 'center', padding: 20 }}>Aucun événement à venir pour le moment.</p>}

        {past.length > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={() => setShowPast((v) => !v)}>
            {showPast ? 'Masquer les événements passés' : `Voir ${plural(past.length, 'événement')} passé${past.length > 1 ? 's' : ''}`}
          </button>
        )}
      </div>
    </Sheet>
  );
}

// ─── Compte & réglages ───────────────────────────────────────────────────────
const LANG_NOTE = {
  fr: 'Noms des extensions affichés en français. Les visuels des cartes restent en anglais (les numéros sont identiques).',
  ja: 'Les sets japonais ne sont pas disponibles : visuels en anglais, numéros identiques.',
};

export function AccountSheet({ onClose, session }) {
  const { lang, setLang } = useLang();
  const [sync, setSync] = useState(null); // null | 'busy' | 'ok' | 'err'

  const push = async () => {
    setSync('busy');
    const ok = await pushAllToRemote();
    setSync(ok ? 'ok' : 'err');
    setTimeout(() => setSync(null), 2500);
  };

  const logout = async () => {
    await signOut();
    window.location.reload();
  };

  return (
    <Sheet title="Mon compte" onClose={onClose}>
      <div className="stack" style={{ gap: 16 }}>
        <div className="list-row">
          <Logo size={40} />
          <div className="grow">
            <p className="tiny dim">Connecté en tant que</p>
            <b className="clamp1">{session?.user?.email ?? '—'}</b>
          </div>
        </div>

        <div>
          <p className="label">Langue des extensions</p>
          <Segmented options={LANGUAGES.map((l) => ({ value: l.code, label: l.label }))} value={lang} onChange={setLang} />
          {LANG_NOTE[lang] && <p className="tiny dim" style={{ marginTop: 8 }}>{LANG_NOTE[lang]}</p>}
        </div>

        {!!supabase && (
          <button className="btn btn-soft btn-block" onClick={push} disabled={sync === 'busy'}>
            <CloudUpload size={18} />
            {sync === 'busy' ? 'Envoi en cours…' : sync === 'ok' ? 'Données envoyées' : sync === 'err' ? "Échec de l'envoi" : 'Forcer la synchronisation'}
          </button>
        )}
        <button className="btn btn-danger btn-block" onClick={logout}><LogOut size={18} /> Se déconnecter</button>
      </div>
    </Sheet>
  );
}

// ─── Création / édition d'une liste ──────────────────────────────────────────
export function ListEditorSheet({ list, onClose }) {
  const { createList, updateList } = useCollection();
  const [name, setName] = useState(list?.name ?? '');
  const [icon, setIcon] = useState(list?.icon ?? 'poke');

  const save = async () => {
    const n = name.trim();
    if (!n) return;
    if (list) await updateList(list.id, n, icon); else await createList(n, icon);
    onClose();
  };

  return (
    <Sheet title={list ? 'Modifier la liste' : 'Nouvelle liste'} onClose={onClose} level={1}>
      <div className="stack" style={{ gap: 16 }}>
        <div>
          <label className="label" htmlFor="list-name">Nom</label>
          <input
            id="list-name" className="input" autoFocus placeholder="Wishlist, échanges, master set…"
            value={name} onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
          />
        </div>
        <div>
          <p className="label">Icône</p>
          <PokeBallPicker value={icon} onChange={setIcon} />
        </div>
        <button className="btn btn-violet btn-block" disabled={!name.trim()} onClick={save}>
          {list ? 'Enregistrer' : 'Créer la liste'}
        </button>
      </div>
    </Sheet>
  );
}
