'use client';

import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, CheckCircle, Calendar } from 'lucide-react';
import StatCard from '@/components/StatCard';
import AttendanceCalendar from '@/components/AttendanceCalendar';
import {
  getAttendanceForStudent,
  calcAttendanceStats,
  calcMonthStats,
} from '@/data/mockData';
import styles from './page.module.css';

export default function StudentPage() {
  const { user } = useAuth();
  const now = new Date();

  const records = useMemo(() => getAttendanceForStudent(user?.id), [user]);
  const overall = useMemo(() => calcAttendanceStats(records), [records]);
  const monthly = useMemo(() => calcMonthStats(records, now.getFullYear(), now.getMonth()), [records]);

  const overallVariant = overall.pct >= 75 ? 'green' : overall.pct >= 60 ? 'amber' : 'red';
  const monthVariant   = monthly.pct >= 75 ? 'green' : monthly.pct >= 60 ? 'amber' : 'red';

  return (
    <main className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>My Attendance</h1>
        <p className={styles.pageSubtitle}>Roll No: <strong>{user?.rollNo}</strong></p>
      </div>

      <div className={styles.statRow}>
        <StatCard icon={BookOpen}     label="Classes Attended" value={`${overall.attended} / ${overall.total}`} delay={0}   variant="blue"         subtitle="All time" />
        <StatCard icon={CheckCircle}  label="Overall Attendance" value={`${overall.pct}%`}                       delay={80}  variant={overallVariant} subtitle="All subjects" />
        <StatCard icon={Calendar}     label="This Month"        value={`${monthly.pct}%`}                        delay={160} variant={monthVariant}   subtitle={`${monthly.attended}/${monthly.total} classes`} />
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Attendance Calendar</h2>
        <AttendanceCalendar attendanceData={records} />
      </section>
    </main>
  );
}
