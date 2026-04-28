'use client';

import { useMemo } from 'react';
import { X, Download, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { getSubjectStats, calcAttendanceStats } from '@/data/mockData';
import { exportStudentCSV, exportSubjectSummaryCSV } from '@/utils/exportCSV';
import SubjectWiseCards from './SubjectWiseCards';
import styles from './StudentDetailModal.module.css';

export default function StudentDetailModal({ student, attendanceRecords, subjects, settings, onClose }) {
  const semesterId = settings?.currentSemester ?? 3;
  const threshold  = settings?.threshold ?? 75;

  const studentRecords = useMemo(
    () => attendanceRecords.filter(r => r.studentId === student.id),
    [attendanceRecords, student.id]
  );

  const overall = useMemo(() => calcAttendanceStats(
    studentRecords.filter(r => r.semesterId === semesterId)
  ), [studentRecords, semesterId]);

  const subjectStats = useMemo(
    () => getSubjectStats(student.id, semesterId, attendanceRecords, subjects),
    [student.id, semesterId, attendanceRecords, subjects]
  );

  const handleExportDetailed = () => exportStudentCSV(student, studentRecords, subjects);
  const handleExportSummary  = () => exportSubjectSummaryCSV(student.name, student.rollNo, subjectStats, semesterId);

  const initials = student.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.avatar}>{initials}</div>
            <div>
              <h2 className={styles.name}>{student.name}</h2>
              <p className={styles.meta}>
                Roll: <strong>{student.rollNo}</strong>
                &nbsp;·&nbsp;
                {student.classId?.toUpperCase()}
                &nbsp;·&nbsp;
                Sem {semesterId}
              </p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        {/* Quick stats */}
        <div className={styles.statsRow}>
          <div className={styles.statBox}>
            <BookOpen size={16} className={styles.statIcon} />
            <span className={styles.statVal}>{overall.attended}/{overall.total}</span>
            <span className={styles.statLabel}>Classes Attended</span>
          </div>
          <div className={`${styles.statBox} ${styles[overall.pct >= threshold ? 'statGreen' : overall.pct >= 60 ? 'statAmber' : 'statRed']}`}>
            {overall.pct >= threshold
              ? <CheckCircle size={16} className={styles.statIcon} />
              : <AlertCircle size={16} className={styles.statIcon} />
            }
            <span className={styles.statVal}>{overall.pct}%</span>
            <span className={styles.statLabel}>Overall ({overall.pct >= threshold ? 'On Track' : overall.pct >= 60 ? 'At Risk' : 'Detained'})</span>
          </div>
        </div>

        {/* Subject-wise breakdown */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Subject-wise Attendance</h3>
          <SubjectWiseCards subjectStats={subjectStats} threshold={threshold} />
        </div>

        {/* Export buttons */}
        <div className={styles.footer}>
          <button className={styles.exportBtn} onClick={handleExportDetailed}>
            <Download size={14} /> Export Detailed (Date-wise)
          </button>
          <button className={styles.exportBtn} onClick={handleExportSummary}>
            <Download size={14} /> Export Subject Summary
          </button>
        </div>
      </div>
    </div>
  );
}
