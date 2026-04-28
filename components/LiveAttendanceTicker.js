'use client';
import { Activity } from 'lucide-react';
import { users } from '@/data/mockData';
import { getConfidenceLabel, getConfidenceTier, confidenceVariant } from '@/utils/confidenceHelpers';
import styles from './LiveAttendanceTicker.module.css';

export default function LiveAttendanceTicker({ detections = [] }) {
  if (detections.length === 0) {
    return (
      <div className={styles.empty}>
        <Activity size={16} className={styles.emptyIcon} />
        <span>Waiting for camera detections…</span>
      </div>
    );
  }

  return (
    <div className={styles.ticker}>
      {detections.map((d) => {
        const student = users.find(u => u.id === d.sid);
        const tier    = getConfidenceTier(d.conf);
        const variant = confidenceVariant(tier);
        const isOk    = d.status === 'present';
        return (
          <div key={d.id} className={`${styles.row} ${styles[`row_${isOk ? 'present' : 'flagged'}`]}`}>
            <span className={styles.time}>{d.time}</span>
            <span className={styles.name}>{student?.name ?? d.sid}</span>
            <span className={`${styles.conf} ${styles[`conf_${variant}`]}`}>
              {getConfidenceLabel(d.conf)}
            </span>
            <span className={`${styles.status} ${isOk ? styles.statusOk : styles.statusFlag}`}>
              {isOk ? '✓ Marked Present' : '⚠ Low Confidence'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
