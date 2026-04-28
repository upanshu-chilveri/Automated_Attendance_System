'use client';

import { useState, useMemo } from 'react';
import { useAuth }        from '@/context/AuthContext';
import { useAttendance }  from '@/context/AttendanceContext';
import { BookOpen, CheckCircle, Calendar, Download, BarChart2, ChevronDown, Clock } from 'lucide-react';
import StatCard            from '@/components/StatCard';
import AttendanceCalendar  from '@/components/AttendanceCalendar';
import SubjectWiseCards    from '@/components/SubjectWiseCards';
import AttendanceModeBadge from '@/components/AttendanceModeBadge';
import {
  users, getAttendanceForStudent, calcAttendanceStats,
  calcMonthStats, getSubjectStats, semesters,
} from '@/data/mockData';
import { exportStudentCSV, exportSubjectSummaryCSV } from '@/utils/exportCSV';
import { STATUS_CONFIG } from '@/utils/confidenceHelpers';
import styles from './page.module.css';

const TABS = ['overview', 'subjects', 'calendar', 'history'];

export default function ParentPage() {
  const { user }                                  = useAuth();
  const { attendanceRecords, subjects, settings } = useAttendance();

  const threshold = settings?.threshold ?? 75;
  const nowYear   = new Date().getFullYear();
  const nowMonth  = new Date().getMonth();

  const children = useMemo(
    () => (user?.parentOf || []).map(id => users.find(u => u.id === id)).filter(Boolean),
    [user]
  );

  const [selectedId, setSelectedId] = useState(children[0]?.id || null);
  const [semId,      setSemId]      = useState(settings?.currentSemester ?? 3);
  const [tab,        setTab]        = useState('overview');

  const child      = children.find(c => c.id === selectedId);
  const records    = useMemo(() => getAttendanceForStudent(selectedId, attendanceRecords),          [selectedId, attendanceRecords]);
  const semRecords = useMemo(() => records.filter(r => r.semesterId === semId),                    [records, semId]);
  const overall    = useMemo(() => calcAttendanceStats(semRecords),                                 [semRecords]);
  const monthly    = useMemo(() => calcMonthStats(semRecords, nowYear, nowMonth),                   [semRecords, nowYear, nowMonth]);
  const subStats   = useMemo(() => child ? getSubjectStats(child.id, semId, attendanceRecords, subjects) : [], [child, semId, attendanceRecords, subjects]);

  // Recent absences/late records for history tab (read-only for parents)
  const recentAbsences = useMemo(() =>
    semRecords
      .filter(r => r.status === 'absent' || r.status === 'late')
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30),
    [semRecords]
  );

  const pendingDisputes  = semRecords.filter(r => r.isDisputed && !r.resolvedBy).length;
  const overallVariant   = overall.pct >= threshold ? 'green' : overall.pct >= 60 ? 'amber' : 'red';
  const monthVariant     = monthly.pct >= threshold ? 'green' : monthly.pct >= 60 ? 'amber' : 'red';

  return (
    <main className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Parent Dashboard</h1>
          <p className={styles.pageSubtitle}>Monitoring attendance for your child</p>
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
          {pendingDisputes > 0 && (
            <span className={styles.disputeAlert}>
              ⏳ {pendingDisputes} dispute{pendingDisputes > 1 ? 's' : ''} pending
            </span>
          )}
          <div className={styles.bannerActions}>
            <button className={styles.exportBtn} onClick={() => exportStudentCSV(child, records, subjects)}>
              <Download size={12} /> Export Detailed
            </button>
            <button className={styles.exportBtn} onClick={() => exportSubjectSummaryCSV(child.name, child.rollNo, subStats, semId)}>
              <Download size={12} /> Subject Summary
            </button>
          </div>
        </div>
      )}

      {/* Semester selector */}
      <div className={styles.semRow}>
        {semesters.map(s => (
          <button key={s.id}
            className={`${styles.semBtn} ${semId === s.id ? styles.semBtnActive : ''}`}
            onClick={() => setSemId(s.id)}>
            {s.label}
            {s.id === (settings?.currentSemester ?? 3) && <span className={styles.currentTag}>Current</span>}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map(t => (
          <button key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}>
            {t === 'overview' ? <><CheckCircle size={13} /> Overview</>
            : t === 'subjects' ? <><BarChart2 size={13} /> Subject-wise</>
            : t === 'calendar' ? <><Calendar size={13} /> Calendar</>
            : <><Clock size={13} /> History {pendingDisputes > 0 && <span className={styles.disputeBadge}>{pendingDisputes}</span>}</>}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className={styles.statRow}>
          <StatCard icon={BookOpen}    label="Classes Attended"  value={`${overall.attended} / ${overall.total}`} delay={0}   variant="blue"          subtitle={`Semester ${semId}`} />
          <StatCard icon={CheckCircle} label="Overall Attendance" value={`${overall.pct}%`}                       delay={80}  variant={overallVariant} subtitle="All subjects" />
          <StatCard icon={Calendar}    label="This Month"         value={`${monthly.pct}%`}                       delay={160} variant={monthVariant}   subtitle={`${monthly.attended}/${monthly.total} classes`} />
        </div>
      )}

      {tab === 'subjects' && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Subject-wise Attendance — {child?.name} · Semester {semId}</h2>
          <SubjectWiseCards subjectStats={subStats} threshold={threshold} />
        </section>
      )}

      {tab === 'calendar' && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Attendance Calendar — Semester {semId}</h2>
          <AttendanceCalendar attendanceData={semRecords} />
        </section>
      )}

      {tab === 'history' && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Absence &amp; Late History — Semester {semId}</h2>
          <p className={styles.historyHint}>
            Records marked by the camera system. Your child can dispute incorrect records from their student login.
          </p>
          <div className={styles.historyList}>
            {recentAbsences.length === 0 && (
              <div className={styles.historyEmpty}>✅ No absences or late records this semester.</div>
            )}
            {recentAbsences.map((r, i) => {
              const sub   = subjects.find(s => s.periodSlot === r.period && s.semesterId === r.semesterId);
              const stCfg = STATUS_CONFIG[r.status] || {};
              const isPending  = r.isDisputed && !r.resolvedBy;
              const isResolved = r.isDisputed && !!r.resolvedBy;
              return (
                <div key={`${r.date}-${r.period}`}
                     className={`${styles.historyRow} ${isPending ? styles.rowPending : ''} ${isResolved ? styles.rowResolved : ''}`}
                     style={{ animationDelay: `${i * 25}ms` }}>
                  <div className={styles.historyLeft}>
                    <span className={styles.historyDate}>{r.date}</span>
                    <span className={styles.historySubject}>{sub?.name ?? `Period ${r.period}`}</span>
                  </div>
                  <div className={styles.historyRight}>
                    <span className={styles.statusPill} style={{ color: stCfg.color, background: stCfg.bg }}>
                      {stCfg.label}
                    </span>
                    <AttendanceModeBadge mode={r.mode} confidence={r.confidence} compact />
                    {isPending  && <span className={styles.pendingTag}>⏳ Dispute Pending</span>}
                    {isResolved && <span className={styles.resolvedTag}>✅ Resolved</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
