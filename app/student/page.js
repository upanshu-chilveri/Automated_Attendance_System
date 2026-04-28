'use client';

import { useState, useMemo } from 'react';
import { useAuth }       from '@/context/AuthContext';
import { useAttendance } from '@/context/AttendanceContext';
import { BookOpen, CheckCircle, Calendar, Download, BarChart2, Flag } from 'lucide-react';
import StatCard           from '@/components/StatCard';
import AttendanceCalendar from '@/components/AttendanceCalendar';
import SubjectWiseCards   from '@/components/SubjectWiseCards';
import DisputeModal       from '@/components/DisputeModal';
import AttendanceModeBadge from '@/components/AttendanceModeBadge';
import {
  getAttendanceForStudent, calcAttendanceStats, calcMonthStats,
  getSubjectStats, semesters,
} from '@/data/mockData';
import { exportStudentCSV, exportSubjectSummaryCSV } from '@/utils/exportCSV';
import { STATUS_CONFIG } from '@/utils/confidenceHelpers';
import styles from './page.module.css';

const TABS = ['overview', 'subjects', 'calendar', 'history'];

export default function StudentPage() {
  const { user }                                  = useAuth();
  const { attendanceRecords, subjects, settings } = useAttendance();

  const nowYear   = new Date().getFullYear();
  const nowMonth  = new Date().getMonth();
  const threshold = settings?.threshold ?? 75;

  const [tab,        setTab]        = useState('overview');
  const [semId,      setSemId]      = useState(settings?.currentSemester ?? 3);
  const [disputeRec, setDisputeRec] = useState(null); // record being disputed

  const records    = useMemo(() => getAttendanceForStudent(user?.id, attendanceRecords), [user, attendanceRecords]);
  const semRecords = useMemo(() => records.filter(r => r.semesterId === semId),          [records, semId]);
  const overall    = useMemo(() => calcAttendanceStats(semRecords),                       [semRecords]);
  const monthly    = useMemo(() => calcMonthStats(semRecords, nowYear, nowMonth),         [semRecords, nowYear, nowMonth]);
  const subStats   = useMemo(() => getSubjectStats(user?.id, semId, attendanceRecords, subjects), [user, semId, attendanceRecords, subjects]);

  const overallVariant = overall.pct >= threshold ? 'green' : overall.pct >= 60 ? 'amber' : 'red';
  const monthVariant   = monthly.pct >= threshold ? 'green' : monthly.pct >= 60 ? 'amber' : 'red';

  // History tab: recent absent / late records that can be disputed
  const disputableRecords = useMemo(() =>
    semRecords
      .filter(r => r.status === 'absent' || r.status === 'late')
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30),
    [semRecords]
  );

  return (
    <main className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>My Attendance</h1>
          <p className={styles.pageSubtitle}>Roll No: <strong>{user?.rollNo}</strong> · {user?.department}</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.exportBtn} onClick={() => exportStudentCSV(user, records, subjects)}>
            <Download size={14} /> Export Detailed
          </button>
          <button className={styles.exportBtn} onClick={() => exportSubjectSummaryCSV(user?.name, user?.rollNo, subStats, semId)}>
            <Download size={14} /> Subject Summary
          </button>
        </div>
      </div>

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
          <button key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>
            {t === 'overview' ? <><CheckCircle size={13} /> Overview</>
            : t === 'subjects' ? <><BarChart2 size={13} /> Subject-wise</>
            : t === 'calendar' ? <><Calendar size={13} /> Calendar</>
            : <><Flag size={13} /> History &amp; Disputes</>}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className={styles.statRow}>
          <StatCard icon={BookOpen}    label="Classes Attended" value={`${overall.attended} / ${overall.total}`} delay={0}   variant="blue"          subtitle={`Semester ${semId}`} />
          <StatCard icon={CheckCircle} label="Overall %"         value={`${overall.pct}%`}                       delay={80}  variant={overallVariant} subtitle="All subjects" />
          <StatCard icon={Calendar}    label="This Month"        value={`${monthly.pct}%`}                       delay={160} variant={monthVariant}   subtitle={`${monthly.attended}/${monthly.total}`} />
        </div>
      )}

      {tab === 'subjects' && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Subject-wise Attendance — Semester {semId}</h2>
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
          <h2 className={styles.sectionTitle}>Recent Absences / Late — Dispute if Incorrect</h2>
          <p className={styles.historyHint}>
            If a record was marked incorrectly by the camera, click <strong>🚩 Dispute</strong> to notify your teacher.
          </p>
          <div className={styles.historyList}>
            {disputableRecords.length === 0 && (
              <div className={styles.historyEmpty}>✅ No absences or late records this semester.</div>
            )}
            {disputableRecords.map((r, i) => {
              const sub     = subjects.find(s => s.periodSlot === r.period && s.semesterId === r.semesterId);
              const stCfg   = STATUS_CONFIG[r.status] || {};
              const isPending  = r.isDisputed && !r.resolvedBy;
              const isResolved = r.isDisputed && r.resolvedBy;
              return (
                <div key={`${r.date}-${r.period}`}
                     className={`${styles.historyRow} ${isPending ? styles.rowPending : ''} ${isResolved ? styles.rowResolved : ''}`}
                     style={{ animationDelay: `${i * 25}ms` }}>
                  <div className={styles.historyLeft}>
                    <div className={styles.historyDate}>{r.date}</div>
                    <div className={styles.historySubject}>{sub?.name ?? `Period ${r.period}`}</div>
                  </div>
                  <div className={styles.historyRight}>
                    <span className={styles.statusPill} style={{ color: stCfg.color, background: stCfg.bg }}>
                      {stCfg.label}
                    </span>
                    <AttendanceModeBadge mode={r.mode} confidence={r.confidence} compact />
                    {isPending ? (
                      <span className={styles.pendingTag}>⏳ Dispute Pending</span>
                    ) : isResolved ? (
                      <span className={styles.resolvedTag}>✅ Resolved</span>
                    ) : (
                      <button className={styles.disputeBtn} onClick={() => setDisputeRec(r)}>
                        <Flag size={11} /> Dispute
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Dispute modal */}
      {disputeRec && (
        <DisputeModal
          record={disputeRec}
          subjectName={subjects.find(s => s.periodSlot === disputeRec.period && s.semesterId === disputeRec.semesterId)?.name ?? `Period ${disputeRec.period}`}
          onClose={() => setDisputeRec(null)}
        />
      )}
    </main>
  );
}
