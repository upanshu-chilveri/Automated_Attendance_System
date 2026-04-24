'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, CheckCircle, Calendar, ChevronDown } from 'lucide-react';
import StatCard from '@/components/StatCard';
import AttendanceCalendar from '@/components/AttendanceCalendar';
import {
  users,
  getAttendanceForStudent,
  calcAttendanceStats,
  calcMonthStats,
} from '@/data/mockData';
import styles from './page.module.css';

export default function ParentPage() {
  const { user } = useAuth();
  const now = new Date();

  const children = useMemo(
    () => (user?.parentOf || []).map(id => users.find(u => u.id === id)).filter(Boolean),
    [user]
  );
  const [selectedId, setSelectedId] = useState(children[0]?.id || null);
  const child = children.find(c => c.id === selectedId);

  const records = useMemo(() => getAttendanceForStudent(selectedId), [selectedId]);
  const overall  = useMemo(() => calcAttendanceStats(records), [records]);
  const monthly  = useMemo(() => calcMonthStats(records, now.getFullYear(), now.getMonth()), [records]);

  const overallVariant = overall.pct >= 75 ? 'green' : overall.pct >= 60 ? 'amber' : 'red';
  const monthVariant   = monthly.pct >= 75 ? 'green' : monthly.pct >= 60 ? 'amber' : 'red';

  return (
    <main className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Parent Dashboard</h1>
          <p className={styles.pageSubtitle}>Viewing attendance for your child</p>
        </div>
        {children.length > 1 && (
          <div className={styles.childSelector}>
            <ChevronDown size={14} className={styles.selectorIcon} />
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
              {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {child && (
        <div className={styles.childBanner}>
          <span className={styles.childLabel}>📚 Viewing:</span>
          <span className={styles.childName}>{child.name}</span>
          <span className={styles.childRoll}>Roll: {child.rollNo}</span>
        </div>
      )}

      <div className={styles.statRow}>
        <StatCard icon={BookOpen}    label="Classes Attended" value={`${overall.attended} / ${overall.total}`} delay={0}   variant="blue"         subtitle="All time" />
        <StatCard icon={CheckCircle} label="Overall Attendance" value={`${overall.pct}%`}                       delay={80}  variant={overallVariant} subtitle="All subjects" />
        <StatCard icon={Calendar}    label="This Month"        value={`${monthly.pct}%`}                        delay={160} variant={monthVariant}   subtitle={`${monthly.attended}/${monthly.total} classes`} />
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Attendance Calendar</h2>
        <AttendanceCalendar attendanceData={records} />
      </section>
    </main>
  );
}
