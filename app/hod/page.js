'use client';

import { useState, useMemo } from 'react';
import { useAuth }             from '@/context/AuthContext';
import { useAttendance }       from '@/context/AttendanceContext';
import {
  BookOpen, Users, TrendingUp, ChevronDown, ChevronRight,
  Download, BarChart2, Settings, BookMarked, Camera, GraduationCap,
} from 'lucide-react';
import StatCard             from '@/components/StatCard';
import StudentTable         from '@/components/StudentTable';
import StudentDetailModal   from '@/components/StudentDetailModal';
import ManageCoursesPanel   from '@/components/ManageCoursesPanel';
import ManageClassesPanel   from '@/components/ManageClassesPanel';
import SettingsPanel        from '@/components/SettingsPanel';
import FaceEnrollmentPanel  from '@/components/FaceEnrollmentPanel';
import {
  getClassesByDept, users, calcAttendanceStats, getDeptSubjectStats,
} from '@/data/mockData';
import { exportCSV } from '@/utils/exportCSV';
import styles from './page.module.css';

const TABS = ['overview', 'classes', 'courses', 'dept-subjects', 'enrollment', 'settings'];

export default function HodPage() {
  const { user }  = useAuth();
  const { attendanceRecords, subjects, classRecords, settings, cameras, updateSettings, addSubject, updateSubject, deleteSubject } = useAttendance();

  // Use classRecords from context (HOD can add/edit/delete them)
  const deptClasses  = useMemo(() => classRecords.filter(c => c.department === user?.department), [classRecords, user]);

  const cameraOnline = useMemo(() => cameras.filter(c => c.classId && c.isOnline).length, [cameras]);
  const cameraTotal  = cameras.filter(c => c.classId).length;

  const threshold = settings?.threshold ?? 75;

  const [tab,       setTab]      = useState('overview');
  const [openClass, setOpenClass] = useState(null);
  const [detailStu, setDetailStu] = useState(null);




  const classData = useMemo(() => deptClasses.map(cls => {
    const students     = cls.studentIds.map(id => users.find(u => u.id === id)).filter(Boolean);
    const attendanceMap = {};
    students.forEach(s => { attendanceMap[s.id] = attendanceRecords.filter(r => r.studentId === s.id); });
    const avgPct = students.length
      ? Math.round(students.reduce((sum, s) => sum + calcAttendanceStats(attendanceMap[s.id] || []).pct, 0) / students.length)
      : 0;
    return { ...cls, students, attendanceMap, avgPct };
  }), [deptClasses, attendanceRecords]);

  const totalStudents = classData.reduce((s, c) => s + c.students.length, 0);
  const deptAvg       = classData.length
    ? Math.round(classData.reduce((s, c) => s + c.avgPct, 0) / classData.length)
    : 0;

  // Dept subject stats
  const deptSubjectStats = useMemo(
    () => getDeptSubjectStats(user?.department, settings?.currentSemester ?? 3, attendanceRecords, subjects),
    [user, settings, attendanceRecords, subjects]
  );

  const handleExportClass = (cls) => {
    const rows = cls.students.map(s => {
      const { attended, total, pct } = calcAttendanceStats(cls.attendanceMap[s.id] || []);
      return { Name: s.name, RollNo: s.rollNo, Attended: attended, Total: total, Percentage: `${pct}%`, Status: pct >= threshold ? 'On Track' : pct >= 60 ? 'At Risk' : 'Detained' };
    });
    exportCSV(rows, `${cls.name}-attendance`);
  };

  const TAB_LABELS = {
    overview:        <><Users size={13} />          Overview</>,
    classes:         <><GraduationCap size={13} />  Manage Classes</>,
    courses:         <><BookMarked size={13} />      Manage Subjects</>,
    'dept-subjects': <><BarChart2 size={13} />       Dept Report</>,
    enrollment:      <><Camera size={13} />          Face Enrollment</>,
    settings:        <><Settings size={13} />        Settings</>,
  };

  return (
    <main className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>HOD Dashboard</h1>
          <p className={styles.pageSubtitle}>
            Department of {settings?.deptName || user?.department}
            &nbsp;·&nbsp;{settings?.academicYear || '2025-26'}
          </p>
        </div>
        <div className={styles.headerTabs}>
          {TABS.map(t => (
            <button
              key={t}
              className={`${styles.tabBtn} ${tab === t ? styles.tabBtnActive : ''}`}
              onClick={() => setTab(t)}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* ─── OVERVIEW ─── */}
      {tab === 'overview' && (
        <>
          <div className={styles.statRow}>
            <StatCard icon={BookOpen}   label="Total Classes"   value={deptClasses.length}   delay={0}   variant="blue"   />
            <StatCard icon={Users}      label="Total Students"  value={totalStudents}         delay={80}  variant="purple" />
            <StatCard icon={TrendingUp} label="Department Avg"  value={`${deptAvg}%`}         delay={160} variant={deptAvg >= threshold ? 'green' : deptAvg >= 60 ? 'amber' : 'red'} />
            <StatCard icon={Camera}     label="Cameras Online"  value={`${cameraOnline}/${cameraTotal}`} delay={240} variant={cameraOnline === cameraTotal ? 'green' : 'amber'} />
          </div>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Class-wise Breakdown</h2>
            <div className={styles.accordion}>
              {classData.map(cls => {
                const isOpen     = openClass === cls.id;
                const avgVariant = cls.avgPct >= threshold ? 'green' : cls.avgPct >= 60 ? 'amber' : 'red';
                return (
                  <div key={cls.id} className={`${styles.accordionItem} ${isOpen ? styles.accordionOpen : ''}`}>
                    <button
                      className={styles.accordionHeader}
                      onClick={() => setOpenClass(isOpen ? null : cls.id)}
                    >
                      <div className={styles.accLeft}>
                        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        <span className={styles.className}>{cls.name}</span>
                        <span className={styles.studentCount}>{cls.students.length} students</span>
                      </div>
                      <div className={styles.accRight}>
                        {/* Mini bar showing class-wide average */}
                        <div className={styles.accBarWrap}>
                          <div className={styles.accBarTrack}>
                            <div
                              className={`${styles.accBarFill} ${styles[`fill_${avgVariant}`]}`}
                              style={{ width: `${cls.avgPct}%` }}
                            />
                          </div>
                        </div>
                        <span className={`${styles.avgBadge} ${styles[`badge_${avgVariant}`]}`}>
                          Avg {cls.avgPct}%
                        </span>
                        <button
                          className={styles.exportBtn}
                          onClick={e => { e.stopPropagation(); handleExportClass(cls); }}
                          title="Export class CSV"
                        >
                          <Download size={14} /> Export Class
                        </button>
                      </div>
                    </button>
                    {isOpen && (
                      <div className={styles.accordionBody}>
                        <StudentTable
                          students={cls.students}
                          attendanceMap={cls.attendanceMap}
                          subjects={subjects}
                          settings={settings}
                          onStudentDoubleClick={setDetailStu}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {/* ─── MANAGE CLASSES ─── */}
      {tab === 'classes' && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Manage Classes</h2>
          <ManageClassesPanel />
        </section>
      )}

      {/* ─── MANAGE COURSES ─── */}
      {tab === 'courses' && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Manage Courses &amp; Subjects</h2>
          <ManageCoursesPanel
            subjects={subjects}
            onAdd={addSubject}
            onUpdate={updateSubject}
            onDelete={deleteSubject}
          />
        </section>
      )}

      {/* ─── DEPT SUBJECT REPORT ─── */}
      {tab === 'dept-subjects' && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Department Subject-wise Averages — Semester {settings?.currentSemester ?? 3}</h2>
            <button
              className={styles.exportBtn}
              onClick={() => exportCSV(deptSubjectStats.map(s => ({ Subject: s.subject, 'Avg %': `${s.avgPct}%`, Status: s.avgPct >= threshold ? 'Good' : 'Needs Attention' })), `dept-subject-report-sem${settings?.currentSemester}`)}
            >
              <Download size={14} /> Export Report
            </button>
          </div>
          <div className={styles.subjectReportTable}>
            <table className={styles.reportTable}>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Period Slot</th>
                  <th>Dept Avg Attendance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {deptSubjectStats.map((s, i) => {
                  const v = s.avgPct >= threshold ? 'green' : s.avgPct >= 60 ? 'amber' : 'red';
                  return (
                    <tr key={s.subjectId} style={{ animationDelay: `${i * 30}ms` }} className="animate-fadeUp">
                      <td className={styles.subjectName}>{s.subject}</td>
                      <td className={styles.periodSlot}>Period {s.periodSlot}</td>
                      <td>
                        <div className={styles.barCell}>
                          <div className={styles.miniBarTrack}>
                            <div className={`${styles.miniBarFill} ${styles[`fill_${v}`]}`} style={{ width: `${s.avgPct}%` }} />
                          </div>
                          <span className={`${styles.pctTag} ${styles[`tag_${v}`]}`}>{s.avgPct}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.statusText} ${styles[`status_${v}`]}`}>
                          {v === 'green' ? 'Good' : v === 'amber' ? 'Needs Attention' : 'Critical'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ─── FACE ENROLLMENT ─── */}
      {tab === 'enrollment' && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Face Enrollment Management</h2>
          <FaceEnrollmentPanel department={user?.department} />
        </section>
      )}

      {/* ─── SETTINGS ─── */}
      {tab === 'settings' && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Department Settings</h2>
          <SettingsPanel role="hod" settings={settings} onUpdate={updateSettings} />
        </section>
      )}

      {/* Student detail modal */}
      {detailStu && (
        <StudentDetailModal
          student={detailStu}
          attendanceRecords={attendanceRecords}
          subjects={subjects}
          settings={settings}
          onClose={() => setDetailStu(null)}
        />
      )}
    </main>
  );
}
