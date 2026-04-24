'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, Users, TrendingUp, ChevronDown, ChevronRight, Download } from 'lucide-react';
import StatCard from '@/components/StatCard';
import StudentTable from '@/components/StudentTable';
import {
  getClassesByDept,
  users,
  attendanceRecords,
  calcAttendanceStats,
} from '@/data/mockData';
import { exportCSV } from '@/utils/exportCSV';
import styles from './page.module.css';

export default function HodPage() {
  const { user } = useAuth();
  const [openClass, setOpenClass] = useState(null);

  const deptClasses = useMemo(() => getClassesByDept(user?.department), [user]);

  const classData = useMemo(() => deptClasses.map(cls => {
    const students = cls.studentIds.map(id => users.find(u => u.id === id)).filter(Boolean);
    const attendanceMap = {};
    students.forEach(s => { attendanceMap[s.id] = attendanceRecords.filter(r => r.studentId === s.id); });
    const avgPct = students.length
      ? Math.round(students.reduce((sum, s) => sum + calcAttendanceStats(attendanceMap[s.id] || []).pct, 0) / students.length)
      : 0;
    return { ...cls, students, attendanceMap, avgPct };
  }), [deptClasses]);

  const totalStudents = classData.reduce((s, c) => s + c.students.length, 0);
  const deptAvg = classData.length
    ? Math.round(classData.reduce((s, c) => s + c.avgPct, 0) / classData.length)
    : 0;

  const handleExport = (cls) => {
    const rows = cls.students.map(s => {
      const { attended, total, pct } = calcAttendanceStats(cls.attendanceMap[s.id] || []);
      return { Name: s.name, RollNo: s.rollNo, Attended: attended, Total: total, Percentage: `${pct}%` };
    });
    exportCSV(rows, `${cls.name}-attendance`);
  };

  return (
    <main className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>HOD Dashboard</h1>
        <p className={styles.pageSubtitle}>Department of {user?.department}</p>
      </div>

      <div className={styles.statRow}>
        <StatCard icon={BookOpen}   label="Total Classes"   value={deptClasses.length}  delay={0}   variant="blue"   />
        <StatCard icon={Users}      label="Total Students"  value={totalStudents}        delay={80}  variant="purple" />
        <StatCard icon={TrendingUp} label="Department Avg"  value={`${deptAvg}%`}        delay={160} variant={deptAvg >= 75 ? 'green' : deptAvg >= 60 ? 'amber' : 'red'} />
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Class-wise Breakdown</h2>
        <div className={styles.accordion}>
          {classData.map(cls => {
            const isOpen = openClass === cls.id;
            const avgVariant = cls.avgPct >= 75 ? 'green' : cls.avgPct >= 60 ? 'amber' : 'red';
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
                    <span className={`${styles.avgBadge} ${styles[`badge_${avgVariant}`]}`}>
                      Avg {cls.avgPct}%
                    </span>
                    <button
                      className={styles.exportBtn}
                      onClick={e => { e.stopPropagation(); handleExport(cls); }}
                      title="Export CSV"
                    >
                      <Download size={14} /> Export
                    </button>
                  </div>
                </button>
                {isOpen && (
                  <div className={styles.accordionBody}>
                    <StudentTable students={cls.students} attendanceMap={cls.attendanceMap} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
