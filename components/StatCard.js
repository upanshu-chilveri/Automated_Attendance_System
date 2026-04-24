'use client';

import styles from './StatCard.module.css';

const COLOR_MAP = {
  blue: { bg: 'var(--accent-blue-dim)', color: 'var(--accent-blue)', border: 'rgba(88,166,255,0.25)' },
  green: { bg: 'var(--accent-green-dim)', color: 'var(--accent-green)', border: 'rgba(63,185,80,0.25)' },
  amber: { bg: 'var(--accent-amber-dim)', color: 'var(--accent-amber)', border: 'rgba(210,153,34,0.25)' },
  red: { bg: 'var(--accent-red-dim)', color: 'var(--accent-red)', border: 'rgba(248,81,73,0.25)' },
  purple: { bg: 'rgba(188,140,255,0.1)', color: 'var(--accent-purple)', border: 'rgba(188,140,255,0.25)' },
};

export default function StatCard({ icon: Icon, label, value, subtitle, variant = 'blue', delay = 0 }) {
  const c = COLOR_MAP[variant] || COLOR_MAP.blue;
  return (
    <div
      className={`${styles.card} animate-fadeUp`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={styles.iconWrap} style={{ background: c.bg, border: `1px solid ${c.border}` }}>
        {Icon && <Icon size={18} color={c.color} />}
      </div>
      <div className={styles.content}>
        <div className={styles.label}>{label}</div>
        <div className={styles.value} style={{ color: c.color }}>{value}</div>
        {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
      </div>
    </div>
  );
}
