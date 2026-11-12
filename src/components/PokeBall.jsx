import React from 'react';

export const POKEBALLS = [
  { id: 'poke',    label: 'Pokéball',    top: '#E63F00', accent: '#E63F00' },
  { id: 'great',   label: 'Super Ball',  top: '#1565C0', accent: '#E63F00', stripe: true },
  { id: 'ultra',   label: 'Hyper Ball',  top: '#111',    accent: '#F9A825', ultra: true },
  { id: 'master',  label: 'Master Ball', top: '#6A1B9A', accent: '#CE93D8', master: true },
  { id: 'premier', label: 'Prémium',     top: '#fff',    border: '#ccc', accent: '#E63F00', premier: true },
  { id: 'heal',    label: 'Guérison',    top: '#E91E8C', accent: '#fff' },
  { id: 'dusk',    label: 'Sombre',      top: '#1B5E20', accent: '#F9A825', dusk: true },
  { id: 'timer',   label: 'Chrono',      top: '#fff',    border: '#ccc', accent: '#E63F00', timer: true },
];

export const ballById = (id) => POKEBALLS.find((b) => b.id === id) ?? POKEBALLS[0];

export function PokeBall({ id, size = 36 }) {
  const b = ballById(id);
  const r = size / 2;
  const line = '#222';
  const btn = size * 0.18;
  const top = `pb-top-${b.id}-${size}`;
  const bot = `pb-bot-${b.id}-${size}`;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', flexShrink: 0 }} aria-hidden="true">
      <defs>
        <clipPath id={top}><rect x="0" y="0" width={size} height={r} /></clipPath>
        <clipPath id={bot}><rect x="0" y={r} width={size} height={r} /></clipPath>
      </defs>
      <circle cx={r} cy={r} r={r - 1} fill="#fff" stroke={b.border ?? line} strokeWidth="1.5" />
      <circle cx={r} cy={r} r={r - 1} fill={b.top} clipPath={`url(#${top})`} />
      {b.stripe && <rect x={r - 3} y={0} width={6} height={r} fill={b.accent} clipPath={`url(#${top})`} />}
      {b.ultra && <rect x={0} y={r * 0.55} width={size} height={r * 0.45} fill={b.accent} clipPath={`url(#${top})`} />}
      {b.master && (
        <>
          <circle cx={r * 0.55} cy={r * 0.45} r={r * 0.15} fill={b.accent} />
          <circle cx={r * 1.45} cy={r * 0.45} r={r * 0.15} fill={b.accent} />
        </>
      )}
      {b.premier && <rect x={r * 0.3} y={r * 0.55} width={r * 1.4} height={r * 0.18} fill={b.accent} clipPath={`url(#${top})`} />}
      {b.dusk && <polygon points={`${r},0 ${size * 0.7},${r} ${r * 0.3},${r}`} fill="rgba(0,0,0,0.35)" clipPath={`url(#${top})`} />}
      {b.timer && (
        <>
          <line x1={r} y1={0} x2={r * 1.6} y2={r * 0.8} stroke={b.accent} strokeWidth="3" clipPath={`url(#${top})`} />
          <line x1={r} y1={0} x2={r * 0.4} y2={r * 0.8} stroke={b.accent} strokeWidth="3" clipPath={`url(#${top})`} />
        </>
      )}
      <circle cx={r} cy={r} r={r - 1} fill="#fff" clipPath={`url(#${bot})`} />
      <line x1={1.5} y1={r} x2={size - 1.5} y2={r} stroke={line} strokeWidth="1.5" />
      <circle cx={r} cy={r} r={btn + 2} fill={line} />
      <circle cx={r} cy={r} r={btn} fill="#fff" />
    </svg>
  );
}

export function PokeBallPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      {POKEBALLS.map((ball) => {
        const selected = value === ball.id;
        return (
          <button
            key={ball.id}
            type="button"
            title={ball.label}
            aria-label={ball.label}
            aria-pressed={selected}
            onClick={() => onChange(ball.id)}
            style={{
              padding: 6, borderRadius: 16,
              background: selected ? 'var(--violet-soft)' : 'transparent',
              boxShadow: selected ? '0 0 0 2px var(--violet)' : 'none',
            }}
          >
            <PokeBall id={ball.id} size={38} />
          </button>
        );
      })}
    </div>
  );
}
