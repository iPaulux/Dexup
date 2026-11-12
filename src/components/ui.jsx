import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, LayoutGrid, Rows3, Search, Star, X } from 'lucide-react';

export function usePersistedState(key, initial) {
  const [value, setValue] = useState(() => {
    try { return localStorage.getItem(key) ?? initial; } catch (_) { return initial; }
  });
  const set = (v) => {
    setValue(v);
    try { localStorage.setItem(key, v); } catch (_) {}
  };
  return [value, set];
}

export const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;

export function Sheet({ title, onClose, children, footer, tall, dialog, level = 0 }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div
      className={`sheet-backdrop${dialog ? ' dialog-backdrop' : ''}`}
      style={{ zIndex: 900 + level * 10 }}
      onClick={onClose}
    >
      <div
        className={`sheet${tall ? ' tall' : ''}${dialog ? ' dialog' : ''}`}
        role="dialog" aria-modal="true" aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-grip" />
        <div className="sheet-head">
          <h2 className="h2 clamp1">{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Fermer"><X size={20} /></button>
        </div>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

export function Confirm({ title, message, confirmLabel = 'Confirmer', onConfirm, onClose }) {
  return (
    <Sheet title={title} onClose={onClose} dialog level={3}>
      <p className="muted" style={{ marginBottom: 20 }}>{message}</p>
      <div className="row">
        <button className="btn btn-ghost grow" onClick={onClose}>Annuler</button>
        <button className="btn btn-danger grow" onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</button>
      </div>
    </Sheet>
  );
}

export function TopBar({ title, back, children, sub }) {
  const navigate = useNavigate();
  return (
    <header className="topbar">
      {back && (
        <button
          className="icon-btn"
          aria-label="Retour"
          onClick={() => (window.history.state?.idx > 0 ? navigate(-1) : navigate(back))}
        >
          <ChevronLeft size={22} />
        </button>
      )}
      <h1 className={`h1 clamp1${back || sub ? ' topbar-sub' : ''}`}>{title}</h1>
      {children}
    </header>
  );
}

export function SearchField({ value, onChange, placeholder, onSubmit, autoFocus, inputMode }) {
  return (
    <label className="field">
      <Search size={19} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') onSubmit?.(); }}
        placeholder={placeholder}
        autoFocus={autoFocus}
        inputMode={inputMode}
        enterKeyHint="search"
        autoComplete="off" autoCorrect="off" spellCheck={false}
      />
      {value && (
        <button type="button" className="field-clear" aria-label="Effacer" onClick={() => onChange('')}>
          <X size={18} />
        </button>
      )}
    </label>
  );
}

export function Pills({ options, value, onChange }) {
  return (
    <div className="pills">
      {options.map((o) => (
        <button
          key={String(o.value)} type="button"
          className={`pill${value === o.value ? ' is-active' : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
          {o.count != null && <span className="pill-count">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Segmented({ options, value, onChange }) {
  return (
    <div className="seg" role="tablist">
      {options.map((o) => (
        <button
          key={o.value} type="button"
          role="tab" aria-selected={value === o.value}
          className={value === o.value ? 'is-active' : ''}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Progress({ value, total, onViolet }) {
  const pct = total ? Math.min(100, (value / total) * 100) : 0;
  return <div className={`progress${onViolet ? ' on-violet' : ''}`}><i style={{ width: `${pct}%` }} /></div>;
}

export const pct = (value, total) => (total ? Math.round((value / total) * 100) : 0);

export function ViewToggle({ mode, onChange }) {
  const next = mode === 'grid' ? 'list' : 'grid';
  return (
    <button
      className="icon-btn"
      onClick={() => onChange(next)}
      aria-label={next === 'grid' ? 'Afficher en grille' : 'Afficher en liste'}
    >
      {mode === 'grid' ? <Rows3 size={20} /> : <LayoutGrid size={20} />}
    </button>
  );
}

export function StarButton({ on, onClick, label = 'Favori' }) {
  return (
    <button
      className={`star-btn${on ? ' is-on' : ''}`}
      aria-label={on ? `Retirer des favoris` : `Ajouter aux favoris`}
      aria-pressed={on}
      title={label}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      <Star size={21} fill={on ? 'currentColor' : 'none'} />
    </button>
  );
}

export function Loading({ label }) {
  return (
    <div className="center-state">
      <div className="spinner" />
      {label && <p className="muted small">{label}</p>}
    </div>
  );
}

export function Empty({ icon: Icon, title, text, children }) {
  return (
    <div className="center-state">
      {Icon && <div className="empty-icon"><Icon size={30} /></div>}
      <p className="h2">{title}</p>
      {text && <p className="muted small" style={{ maxWidth: 300 }}>{text}</p>}
      {children && <div style={{ marginTop: 12 }}>{children}</div>}
    </div>
  );
}

/** Ligne cliquable pouvant contenir d'autres boutons (un <button> imbriqué serait invalide). */
export function Tappable({ className = 'list-row', onClick, children, ...rest }) {
  return (
    <div
      className={`${className} tap`}
      role="button" tabIndex={0}
      style={{ cursor: 'pointer' }}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) onClick(); }}
      {...rest}
    >
      {children}
    </div>
  );
}

const scrollMemory = new Map();

/** Conteneur de page défilant ; retrouve sa position quand on revient en arrière. */
export function Page({ children }) {
  const ref = useRef(null);
  const { key } = useLocation();

  useLayoutEffect(() => {
    const el = ref.current;
    const target = scrollMemory.get(key) || 0;
    let last = target;
    let raf = null;
    let tries = 0;
    const stop = () => { if (raf) cancelAnimationFrame(raf); raf = null; };
    // Le contenu arrive de façon asynchrone : on réessaie tant que la page n'est pas assez haute.
    const restore = () => {
      el.scrollTop = target;
      raf = el.scrollTop < target - 2 && tries++ < 90 ? requestAnimationFrame(restore) : null;
    };
    if (target) restore();
    const onScroll = () => { last = el.scrollTop; };
    el.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('wheel', stop, { passive: true });
    el.addEventListener('touchstart', stop, { passive: true });
    return () => {
      stop();
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('wheel', stop);
      el.removeEventListener('touchstart', stop);
      scrollMemory.set(key, last);
    };
  }, [key]);

  return (
    <div className="page" ref={ref}>
      <div className="page-inner">{children}</div>
    </div>
  );
}
