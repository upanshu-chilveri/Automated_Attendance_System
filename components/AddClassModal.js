'use client';

import { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { periods } from '@/data/mockData';
import styles from './AddClassModal.module.css';

export default function AddClassModal({ students, onClose, onSubmit }) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [period, setPeriod] = useState(1);
  const [attendance, setAttendance] = useState(
    Object.fromEntries(students.map(s => [s.id, true]))
  );
  const [submitted, setSubmitted] = useState(false);

  const toggle = (id) => setAttendance(prev => ({ ...prev, [id]: !prev[id] }));

  const handleSubmit = () => {
    const records = students.map(s => ({
      studentId: s.id,
      date,
      period: Number(period),
      status: attendance[s.id] ? 'present' : 'absent',
    }));
    onSubmit?.(records);
    setSubmitted(true);
    setTimeout(onClose, 1200);
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;

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
            <p>Attendance recorded successfully!</p>
          </div>
        ) : (
          <>
            <div className={styles.fields}>
              <label>
                <span>Date</span>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} />
              </label>
              <label>
                <span>Period</span>
                <select value={period} onChange={e => setPeriod(e.target.value)}>
                  {periods.map(p => (
                    <option key={p.period} value={p.period}>{p.time} — {p.subject}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className={styles.studentListHeader}>
              <span>Students</span>
              <span className={styles.tally}>{presentCount}/{students.length} Present</span>
            </div>

            <div className={styles.studentList}>
              {students.map(s => (
                <div key={s.id} className={`${styles.studentRow} ${attendance[s.id] ? styles.present : styles.absent}`} onClick={() => toggle(s.id)}>
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
