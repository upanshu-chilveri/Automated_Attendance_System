'use client';
import { MODE_CONFIG, getConfidenceLabel, getConfidenceTier, confidenceVariant } from '@/utils/confidenceHelpers';
import styles from './AttendanceModeBadge.module.css';

export default function AttendanceModeBadge({ mode = 'manual', confidence = null, compact = false }) {
  const cfg   = MODE_CONFIG[mode] || MODE_CONFIG.manual;
  const tier  = getConfidenceTier(confidence);
  const label = getConfidenceLabel(confidence);
  const cvar  = confidenceVariant(tier);

  return (
    <span className={`${styles.badge} ${compact ? styles.compact : ''}`}
          style={{ color: cfg.color, background: cfg.bg }}>
      {cfg.label}
      {label && (
        <span className={`${styles.conf} ${styles[`conf_${cvar}`]}`}>
          {label}
        </span>
      )}
    </span>
  );
}
