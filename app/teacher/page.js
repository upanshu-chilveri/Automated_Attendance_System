'use client';

import { useState, useMemo } from 'react';
import { useAuth }         from '@/context/AuthContext';
import { useAttendance }   from '@/context/AttendanceContext';
import { Users, UserCheck, UserX, TrendingUp, PlusCircle, Settings, Flag } from 'lucide-react';
import StatCard              from '@/components/StatCard';
import StudentTable          from '@/components/StudentTable';
import AddClassModal         from '@/components/AddClassModal';
import StudentDetailModal    from '@/components/StudentDetailModal';
import SettingsPanel         from '@/components/SettingsPanel';
import CameraStatusWidget    from '@/components/CameraStatusWidget';
import LiveAttendanceTicker  from '@/components/LiveAttendanceTicker';
import DisputeReviewPanel    from '@/components/DisputeReviewPanel';
import {
  getClassesByTeacher, users, calcAttendanceStats, getCameraByClassId,
} from '@/data/mockData';
import styles from './page.module.css';

const TABS = ['attendance', 'disputes', 'settings'];

export default function TeacherPage() {
  const { user } = useAuth();
  const {
    attendanceRecords, subjects, settings, updateSettings,
    cameras, liveDetections, pendingDisputeCount,
    startPolling, stopPolling, pollingClassId,
  } = useAttendance();

  const [showModal,     setShowModal]     = useState(false);
  const [detailStu,     setDetailStu]     = useState(null);
  const [tab,           setTab]           = useState('attendance');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [showTicker,    setShowTicker]    = useState(false);

  const myClasses = useMemo(() => getClassesByTeacher(user?.id), [user]);
  const myClass   = myClasses[0];

  const students = useMemo(
    () => (myClass?.studentIds || []).map(id => users.find(u => u.id === id)).filter(Boolean),
    [myClass]
  );

  const attendanceMap = useMemo(() => {
    const map = {};
    students.forEach(s => {
      let recs = attendanceRecords.filter(r => r.studentId === s.id);
      if (subjectFilter !== 'all') recs = recs.filter(r => r.period === Number(subjectFilter));
      map[s.id] = recs;
    });
    return map;
  }, [students, attendanceRecords, subjectFilter]);

  const today = new Date().toISOString().slice(0, 10);
  const todayPresent = useMemo(() =>
    students.filter(s => attendanceRecords.some(r =>
      r.studentId === s.id && r.date === today &&
      (r.status === 'present' || r.status === 'late')
    )).length, [students, attendanceRecords, today]);

  const avgPct = useMemo(() => {
    if (!students.length) return 0;
    return Math.round(students.reduce((sum, s) =>
      sum + calcAttendanceStats(attendanceMap[s.id] || []).pct, 0) / students.length);
  }, [students, attendanceMap]);

  // Camera for this class
  const camera      = useMemo(() => getCameraByClassId(myClass?.id) || cameras.find(c => c.classId === myClass?.id), [myClass, cameras]);
  const isLive      = pollingClassId === myClass?.id;
  const liveCount   = liveDetections.filter(d => d.status === 'present').length;

  const semSubjects = useMemo(
    () => subjects.filter(s => s.semesterId === (settings?.currentSemester ?? 3)),
    [subjects, settings]
  );

  const handleToggleLive = () => {
    if (isLive) stopPolling();
    else { startPolling(myClass?.id); setShowTicker(true); }
  };

  return (
    <main className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Teacher Dashboard</h1>
          <p className={styles.pageSubtitle}>{myClass?.name || 'No class assigned'} · {user?.name}</p>
        </div>
        <div className={styles.headerTabs}>
          {TABS.map(t => {
            const isPending = t === 'disputes' && pendingDisputeCount > 0;
            return (
              <button key={t}
                className={`${styles.tabBtn} ${tab === t ? styles.tabBtnActive : ''}`}
                onClick={() => setTab(t)}>
                {t === 'attendance' ? <><Users size={13} /> Attendance</>
                : t === 'disputes'  ? <><Flag size={13} /> Disputes{isPending && <span className={styles.tabBadge}>{pendingDisputeCount}</span>}</>
                :                     <><Settings size={13} /> Settings</>}
              </button>
            );
          })}
        </div>
      </div>

      {tab === 'attendance' && (
        <>
          {/* Camera widget */}
          {camera && (
            <CameraStatusWidget
              camera={camera}
              detectionCount={liveCount}
              isLive={isLive}
              onToggleLive={handleToggleLive}
            />
          )}

          <div className={styles.statRow}>
            <StatCard icon={Users}      label="Total Students" value={students.length}   delay={0}   variant="blue" />
            <StatCard icon={UserCheck}  label="Today Present"  value={todayPresent}      delay={80}  variant="green" />
            <StatCard icon={UserX}      label="Today Absent"   value={students.length - todayPresent} delay={160} variant="red" />
            <StatCard icon={TrendingUp} label="Class Avg"      value={`${avgPct}%`}      delay={240}
              variant={avgPct >= (settings?.threshold ?? 75) ? 'green' : avgPct >= 60 ? 'amber' : 'red'} />
          </div>

          {/* Live ticker */}
          {isLive && showTicker && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>🔴 Live Detections</h2>
                <button className={styles.exportBtn} onClick={() => setShowTicker(false)}>Collapse</button>
              </div>
              <div className={styles.tickerWrap}>
                <LiveAttendanceTicker detections={liveDetections} />
              </div>
            </section>
          )}

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Student Attendance</h2>
              <div className={styles.filterWrap}>
                <label className={styles.filterLabel}>Filter:</label>
                <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} className={styles.filterSelect}>
                  <option value="all">All Subjects</option>
                  {semSubjects.map(s => <option key={s.id} value={s.periodSlot}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <StudentTable
              students={students}
              attendanceMap={attendanceMap}
              subjects={subjects}
              settings={settings}
              onStudentDoubleClick={setDetailStu}
            />
          </section>

          <button className={styles.fab} onClick={() => setShowModal(true)} title="Record Attendance">
            <PlusCircle size={22} /><span>Record Attendance</span>
          </button>

          {showModal && <AddClassModal students={students} onClose={() => setShowModal(false)} />}
          {detailStu && (
            <StudentDetailModal
              student={detailStu} attendanceRecords={attendanceRecords}
              subjects={subjects} settings={settings}
              onClose={() => setDetailStu(null)}
            />
          )}
        </>
      )}

      {tab === 'disputes' && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Pending Disputes {pendingDisputeCount > 0 && <span className={styles.disputeCount}>({pendingDisputeCount})</span>}
          </h2>
          <DisputeReviewPanel classStudentIds={myClass?.studentIds || []} subjects={subjects} />
        </section>
      )}

      {tab === 'settings' && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Settings</h2>
          <SettingsPanel role="teacher" settings={settings} onUpdate={updateSettings} />
        </section>
      )}
    </main>
  );
}
