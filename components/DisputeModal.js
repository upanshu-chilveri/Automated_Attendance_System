'use client';
import { useState } from 'react';
import { X, Flag, AlertCircle } from 'lucide-react';
import { useAttendance } from '@/context/AttendanceContext';
import { STATUS_CONFIG, MODE_CONFIG } from '@/utils/confidenceHelpers';
import styles from './DisputeModal.module.css';

export default function DisputeModal({ record, subjectName, onClose }) {
  const { submitDispute } = useAttendance();
  const [note, setNote]   = useState('');
  const [done, setDone]   = useState(false);

  const statusCfg = STATUS_CONFIG[record.status] || {};
  const modeCfg   = MODE_CONFIG[record.mode]     || {};

  const handleSubmit = () => {
    if (!note.trim()) return;
    submitDispute({ studentId: record.studentId, date: record.date, period: record.period }, note.trim());
    setDone(true);
    setTimeout(onClose, 1600);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Flag size={15} className={styles.flagIcon} />
            <span>Dispute Attendance Record</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><X size={15} /></button>
        </div>

        {done ? (
          <div className={styles.success}>
            <div className={styles.successIcon}>✅</div>
            <p>Dispute submitted! Your teacher will review it.</p>
          </div>
        ) : (
          <>
            <div className={styles.recordCard}>
              <div className={styles.recordRow}><span>Date</span><strong>{record.date}</strong></div>
              <div className={styles.recordRow}><span>Subject</span><strong>{subjectName}</strong></div>
              <div className={styles.recordRow}>
                <span>Marked As</span>
                <strong style={{ color: statusCfg.color }}>{statusCfg.label}</strong>
              </div>
              <div className={styles.recordRow}>
                <span>Marked By</span>
                <strong>{modeCfg.label}</strong>
                {record.confidence && (
                  <span className={styles.conf}>({Math.round(record.confidence * 100)}% confidence)</span>
                )}
              </div>
              {record.capturedAt && (
                <div className={styles.recordRow}><span>Captured At</span><strong>{record.capturedAt}</strong></div>
              )}
            </div>

            <div className={styles.noteSection}>
              <div className={styles.noteLabel}>
                <AlertCircle size={13} /> Reason for dispute
              </div>
              <textarea
                className={styles.textarea}
                placeholder="Explain why you believe this record is incorrect…"
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={3}
              />
            </div>

            <div className={styles.actions}>
              <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
              <button
                className={styles.submitBtn}
                onClick={handleSubmit}
                disabled={!note.trim()}
              >
                <Flag size={13} /> Submit Dispute
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
