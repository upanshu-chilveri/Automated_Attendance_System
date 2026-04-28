'use client';

import styles from './SubjectWiseCards.module.css';

function variant(pct, threshold = 75) {
  if (pct >= threshold) return 'green';
  if (pct >= 60)        return 'amber';
  return 'red';
}

export default function SubjectWiseCards({ subjectStats, threshold = 75 }) {
  if (!subjectStats || subjectStats.length === 0) {
    return <p className={styles.empty}>No subject data available.</p>;
  }

  return (
    <div className={styles.grid}>
      {subjectStats.map((s, i) => {
        const v = variant(s.pct, threshold);
        return (
          <div
            key={s.subjectId}
            className={`${styles.card} ${styles[`card_${v}`]}`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className={styles.top}>
              <span className={styles.subjectName}>{s.subject}</span>
              <span className={`${styles.pctBadge} ${styles[`badge_${v}`]}`}>{s.pct}%</span>
            </div>

            <div className={styles.barTrack}>
              <div
                className={`${styles.barFill} ${styles[`fill_${v}`]}`}
                style={{ width: `${s.pct}%` }}
              />
              {/* threshold marker */}
              <div
                className={styles.thresholdLine}
                style={{ left: `${threshold}%` }}
                title={`Minimum: ${threshold}%`}
              />
            </div>

            <div className={styles.bottom}>
              <span className={styles.fraction}>{s.present}/{s.total} classes</span>
              <span className={`${styles.statusText} ${styles[`status_${v}`]}`}>
                {v === 'green' ? 'On Track' : v === 'amber' ? 'At Risk' : 'Detained'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
