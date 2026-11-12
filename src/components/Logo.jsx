import React from 'react';

const DOTS = [
  [132.84, 10.5], [132.84, 254.21], [10.5, 132.49], [252.5, 132.49], [21.05, 81.04], [240.85, 81.04], [21.05, 184.13],
  [84.97, 134.02], [51.94, 134.02], [215.81, 134.02], [178.18, 134.02], [158.57, 95.96], [158.57, 171.7], [111.05, 94.75],
  [111.05, 175.04], [240.85, 184.13], [58.95, 34.21], [204.15, 34.21], [58.95, 231.8], [204.15, 231.8],
];

export default function Logo({ size = 32, color = 'var(--logo)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 263 264.71" fill={color} style={{ display: 'block', flexShrink: 0 }} aria-hidden="true">
      {DOTS.map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="10.5" />)}
    </svg>
  );
}
