'use client';
import { useMemo } from 'react';
import { Camera, RefreshCw, CheckCircle, Clock, XCircle } from 'lucide-react';
import { users }              from '@/data/mockData';
import { ENROLLMENT_CONFIG }  from '@/utils/confidenceHelpers';
import { useAttendance }      from '@/context/AttendanceContext';
import styles from './FaceEnrollmentPanel.module.css';

export default function FaceEnrollmentPanel({ department }) {
  const { updateEnrollmentStatus } = useAttendance();

  const students = useMemo(
    () => users.filter(u => u.role === 'student' && u.department === department),
    [department]
  );

  const counts = useMemo(() => ({
    enrolled: students.filter(s => s.enrollmentStatus === 'enrolled').length,
    pending:  students.filter(s => s.enrollmentStatus === 'pending').length,
    failed:   students.filter(s => s.enrollmentStatus === 'failed').length,
  }), [students]);

  const ICON = { enrolled: CheckCircle, pending: Clock, failed: XCircle };

  return (
    <div className={styles.panel}>
      {/* Summary row */}
      <div className={styles.summaryRow}>
        {[['enrolled','green'],['pending','amber'],['failed','red']].map(([s, v]) => (
          <div key={s} className={`${styles.summaryCard} ${styles[`card_${v}`]}`}>
            <span className={styles.summaryCount}>{counts[s]}</span>
            <span className={styles.summaryLabel}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
          </div>
        ))}
      </div>

      {/* Student list */}
      <div className={styles.list}>
        {students.map((s, i) => {
          const cfg  = ENROLLMENT_CONFIG[s.enrollmentStatus] || ENROLLMENT_CONFIG.pending;
          const Icon = ICON[s.enrollmentStatus] || Clock;
          return (
            <div key={s.id} className={styles.row} style={{ animationDelay: `${i * 30}ms` }}>
              <div className={styles.left}>
                <Camera size={14} className={styles.camIcon} />
                <div>
                  <div className={styles.name}>{s.name}</div>
                  <div className={styles.meta}>{s.rollNo} · {s.enrolledAt ? `Enrolled ${s.enrolledAt}` : 'Not yet enrolled'}</div>
                </div>
              </div>
              <div className={styles.right}>
                <span className={styles.badge} style={{ color: cfg.color, background: cfg.bg }}>
                  <Icon size={11} /> {cfg.label}
                </span>
                {s.enrollmentStatus !== 'enrolled' ? (
                  <button
                    className={styles.enrollBtn}
                    onClick={() => updateEnrollmentStatus(s.id, 'pending')}
                    title="Request re-enrollment"
                  >
                    <RefreshCw size={12} /> Enroll
                  </button>
                ) : (
                  <button
                    className={styles.reEnrollBtn}
                    onClick={() => updateEnrollmentStatus(s.id, 'pending')}
                    title="Re-enroll (retrain face model)"
                  >
                    <RefreshCw size={12} /> Re-enroll
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className={styles.hint}>
        💡 Enrollment triggers face-model training on the backend. Students marked
        &quot;Pending&quot; will be enrolled at the next model update cycle.
      </p>
    </div>
  );
}
