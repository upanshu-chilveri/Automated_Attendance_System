'use client';

import { useState } from 'react';
import { X, Plus, Minus, CheckSquare, Square } from 'lucide-react';
import { useAttendance } from '@/context/AttendanceContext';
import { periods } from '@/data/mockData';
import styles from './AddClassModal.module.css';

export default function AddClassModal({ students, onClose }) {
  const { markAttendance, settings } = useAttendance();
  const semesterId = settings?.currentSemester ?? 3;

  const today = new Date().toISOString().slice(0, 10);
  const [date,       setDate]       = useState(today);
  const [period,     setPeriod]     = useState(1);
  const [attendance, setAttendance] = useState(
    Object.fromEntries(students.map(s => [s.id, true]))
  );
  const [submitted, setSubmitted] = useState(false);

  const toggle     = (id) => setAttendance(prev => ({ ...prev, [id]: !prev[id] }));
  const markAll    = (val) => setAttendance(Object.fromEntries(students.map(s => [s.id, val])));

  const presentCount = Object.values(attendance).filter(Boolean).length;

  const handleSubmit = () => {
    const records = students.map(s => ({
      studentId: s.id,
      date,
      period: Number(period),
      status: attendance[s.id] ? 'present' : 'absent',
      semesterId,
    }));
    markAttendance(records);   // ✅ Now actually updates live state
    setSubmitted(true);
    setTimeout(onClose, 1400);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Record Attendance</h3>
          <button className={styles.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>

        {submitted ? (
          <div className={styles.success}>
            <div className={styles.successIcon}>✅</div>
            <p>Attendance recorded for {presentCount} / {students.length} students!</p>
          </div>
        ) : (
          <>
            <div className={styles.fields}>
              <label>
                <span>Date</span>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} />
              </label>
              <label>
                <span>Period / Subject</span>
                <select value={period} onChange={e => setPeriod(e.target.value)}>
                  {periods.map(p => (
                    <option key={p.period} value={p.period}>{p.time} — {p.subject}</option>
                  ))}
                </select>
              </label>
            </div>

            {/* Present / Absent tally + visual bar */}
            <div className={styles.progressWrap}>
              <div className={styles.tallyRow}>
                <span className={styles.tally}>
                  <span className={styles.tallyPresent}>{presentCount} Present</span>
                  <span className={styles.tallySep}> · </span>
                  <span className={styles.tallyAbsent}>{students.length - presentCount} Absent</span>
                </span>
                <div className={styles.bulkBtns}>
                  <button className={`${styles.bulkBtn} ${styles.bulkPresent}`} onClick={() => markAll(true)}>
                    <CheckSquare size={13} /> All Present
                  </button>
                  <button className={`${styles.bulkBtn} ${styles.bulkAbsent}`} onClick={() => markAll(false)}>
                    <Square size={13} /> All Absent
                  </button>
                </div>
              </div>
              {/* Stacked bar: green = present, red = absent */}
              <div className={styles.barTrack}>
                <div
                  className={styles.barPresent}
                  style={{ width: `${students.length ? (presentCount / students.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className={styles.studentListHeader}>
              <span>Students</span>
              <span className={styles.hint}>Click to toggle</span>
            </div>

            <div className={styles.studentList}>
              {students.map(s => (
                <div
                  key={s.id}
                  className={`${styles.studentRow} ${attendance[s.id] ? styles.present : styles.absent}`}
                  onClick={() => toggle(s.id)}
                >
                  <div className={styles.studentInfo}>
                    <span className={styles.roll}>{s.rollNo}</span>
                    <span className={styles.sName}>{s.name}</span>
                  </div>
                  <div className={styles.toggleBtn}>
                    {attendance[s.id]
                      ? <><Plus size={12} /> Present</>
                      : <><Minus size={12} /> Absent</>
                    }
                  </div>
                </div>
              ))}
            </div>

            <button className={styles.submitBtn} onClick={handleSubmit}>
              Submit Attendance
            </button>
          </>
        )}
      </div>
    </div>
  );
}
