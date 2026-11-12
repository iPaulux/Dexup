import React, { useId } from 'react';

const INK = '#141414';
const RED = '#e5383b';
const YELLOW = '#f6c026';

// Chaque ball : couleur du dôme, couleur de la bande (noire par défaut) et motif dessiné dans le dôme.
export const POKEBALLS = [
  { id: 'poke', label: 'Poké Ball', top: RED },
  {
    id: 'great', label: 'Super Ball', top: '#2f6fd6',
    deco: (
      <>
        <ellipse cx="8" cy="11" rx="4.2" ry="7.5" transform="rotate(24 8 11)" fill={RED} />
        <ellipse cx="32" cy="11" rx="4.2" ry="7.5" transform="rotate(-24 32 11)" fill={RED} />
      </>
    ),
  },
  {
    id: 'ultra', label: 'Hyper Ball', top: '#1d1d1d',
    deco: (
      <>
        <ellipse cx="9" cy="10" rx="4" ry="9.5" transform="rotate(20 9 10)" fill={YELLOW} />
        <ellipse cx="31" cy="10" rx="4" ry="9.5" transform="rotate(-20 31 10)" fill={YELLOW} />
      </>
    ),
  },
  {
    id: 'master', label: 'Master Ball', top: '#7a3fb8',
    deco: (
      <>
        <circle cx="8.5" cy="11.5" r="3.8" fill="#f08bc4" />
        <circle cx="31.5" cy="11.5" r="3.8" fill="#f08bc4" />
        <path d="M16.2 13.2V7.4l3.8 4 3.8-4v5.8" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  { id: 'premier', label: 'Honor Ball', top: '#ffffff', band: RED },
  {
    id: 'heal', label: 'Soin Ball', top: '#f27fb2',
    deco: <path d="M2 19Q20 1 38 19" fill="none" stroke="#ffd9e8" strokeWidth="3.2" />,
  },
  {
    id: 'dusk', label: 'Sombre Ball', top: '#1d1d1d',
    deco: (
      <>
        <path d="M2 19Q20 1 38 19" fill="none" stroke="#f08a24" strokeWidth="2.6" />
        <circle cx="8" cy="15" r="2.6" fill="#44a852" />
        <circle cx="32" cy="15" r="2.6" fill="#44a852" />
      </>
    ),
  },
  {
    id: 'timer', label: 'Chrono Ball', top: '#ffffff',
    deco: <path d="M0 14.2H40M0 8.6H40" fill="none" stroke={RED} strokeWidth="2.6" />,
  },
];

export const ballById = (id) => POKEBALLS.find((b) => b.id === id) ?? POKEBALLS[0];

export function PokeBall({ id, size = 36 }) {
  const b = ballById(id);
  const clip = `pb${useId().replace(/[^a-z0-9]/gi, '')}`;
  const band = b.band ?? INK;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ display: 'block', flexShrink: 0 }} aria-hidden="true">
      <defs><clipPath id={clip}><circle cx="20" cy="20" r="17" /></clipPath></defs>
      <g clipPath={`url(#${clip})`}>
        <rect width="40" height="40" fill="#fff" />
        <rect width="40" height="20" fill={b.top} />
        {b.deco}
        <rect y="18.2" width="40" height="3.6" fill={band} />
      </g>
      <circle cx="20" cy="20" r="17" fill="none" stroke={INK} strokeWidth="2" />
      <circle cx="20" cy="20" r="5.4" fill="#fff" stroke={band} strokeWidth="2.4" />
      <circle cx="20" cy="20" r="2.1" fill="none" stroke={INK} strokeWidth="1" opacity="0.3" />
    </svg>
  );
}

export function PokeBallPicker({ value, onChange }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
      {POKEBALLS.map((ball) => {
        const selected = value === ball.id;
        return (
          <button
            key={ball.id}
            type="button"
            aria-label={ball.label}
            aria-pressed={selected}
            onClick={() => onChange(ball.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              padding: '12px 4px 8px', borderRadius: 'var(--r-sm)',
              background: 'var(--surface)',
              border: `1px solid ${selected ? 'var(--ink)' : 'var(--line)'}`,
              boxShadow: selected ? 'inset 0 0 0 1px var(--ink)' : 'none',
            }}
          >
            <PokeBall id={ball.id} size={36} />
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, textTransform: 'uppercase', color: selected ? 'var(--ink)' : 'var(--ink-3)' }}>
              {ball.label.replace(' Ball', '')}
            </span>
          </button>
        );
      })}
    </div>
  );
}
