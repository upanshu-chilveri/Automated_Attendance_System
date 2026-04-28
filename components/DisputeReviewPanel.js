'use client';
import { useAttendance } from '@/context/AttendanceContext';
import { useAuth }       from '@/context/AuthContext';
import { users }         from '@/data/mockData';
import { Check, X, AlertTriangle } from 'lucide-react';
import AttendanceModeBadge from './AttendanceModeBadge';
import styles from './DisputeReviewPanel.module.css';

export default function DisputeReviewPanel({ classStudentIds = [], subjects = [] }) {
  const { attendanceRecords, resolveDispute } = useAttendance();
  const { user } = useAuth();

  const disputes = attendanceRecords.filter(r =>
    classStudentIds.includes(r.studentId) && r.isDisputed && !r.resolvedBy
  );

  if (disputes.length === 0) {
    return (
      <div className={styles.empty}>
        <Check size={28} className={styles.emptyIcon} />
        <p>No pending disputes</p>
        <span>All student disputes have been resolved.</span>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {disputes.map((r, i) => {
        const student    = users.find(u => u.id === r.studentId);
        const sub        = subjects.find(s => s.periodSlot === r.period && s.semesterId === r.semesterId);
        const recordKey  = { studentId: r.studentId, date: r.date, period: r.period };
        return (
          <div key={`${r.studentId}-${r.date}-${r.period}`}
               className={styles.card}
               style={{ animationDelay: `${i * 40}ms` }}>
            <div className={styles.cardHeader}>
              <div className={styles.studentInfo}>
                <AlertTriangle size={14} className={styles.alertIcon} />
                <strong>{student?.name}</strong>
                <span className={styles.roll}>{student?.rollNo}</span>
              </div>
              <AttendanceModeBadge mode={r.mode} confidence={r.confidence} compact />
            </div>
            <div className={styles.meta}>
              <span>📅 {r.date}</span>
              <span>📚 {sub?.name ?? `Period ${r.period}`}</span>
              <span className={styles.markedAbsent}>Marked: Absent</span>
            </div>
            {r.disputeNote && (
              <p className={styles.note}>&ldquo;{r.disputeNote}&rdquo;</p>
            )}
            <div className={styles.actions}>
              <button
                className={styles.approveBtn}
                onClick={() => resolveDispute(recordKey, true, user?.id)}
              >
                <Check size={13} /> Approve (Mark Present)
              </button>
              <button
                className={styles.rejectBtn}
                onClick={() => resolveDispute(recordKey, false, user?.id)}
              >
                <X size={13} /> Reject (Keep Absent)
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
