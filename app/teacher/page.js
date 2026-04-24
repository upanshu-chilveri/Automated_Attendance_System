'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Users, UserCheck, UserX, TrendingUp, PlusCircle } from 'lucide-react';
import StatCard from '@/components/StatCard';
import StudentTable from '@/components/StudentTable';
import AddClassModal from '@/components/AddClassModal';
import {
  getClassesByTeacher,
  users,
  attendanceRecords,
  calcAttendanceStats,
} from '@/data/mockData';
import styles from './page.module.css';

export default function TeacherPage() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const myClasses = useMemo(() => getClassesByTeacher(user?.id), [user]);
  const myClass   = myClasses[0]; // teacher has one class in this demo

  const students = useMemo(
    () => (myClass?.studentIds || []).map(id => users.find(u => u.id === id)).filter(Boolean),
    [myClass]
  );

  const attendanceMap = useMemo(() => {
    const map = {};
    students.forEach(s => { map[s.id] = attendanceRecords.filter(r => r.studentId === s.id); });
    return map;
  }, [students]);

  // Today's stats
  const today = new Date().toISOString().slice(0, 10);
  const todayPresent = useMemo(() => {
    return students.filter(s =>
      (attendanceMap[s.id] || []).some(r => r.date === today && r.status === 'present')
    ).length;
  }, [students, attendanceMap, today]);
  const todayAbsent = students.length - todayPresent;

  const avgPct = useMemo(() => {
    if (!students.length) return 0;
    const total = students.reduce((sum, s) => {
      const { pct } = calcAttendanceStats(attendanceMap[s.id] || []);
      return sum + pct;
    }, 0);
    return Math.round(total / students.length);
  }, [students, attendanceMap]);

  return (
    <main className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Teacher Dashboard</h1>
          <p className={styles.pageSubtitle}>{myClass?.name || 'No class assigned'}</p>
        </div>
      </div>

      <div className={styles.statRow}>
        <StatCard icon={Users}      label="Total Students"  value={students.length}  delay={0}   variant="blue"  />
        <StatCard icon={UserCheck}  label="Today Present"   value={todayPresent}     delay={80}  variant="green" />
        <StatCard icon={UserX}      label="Today Absent"    value={todayAbsent}      delay={160} variant="red"   />
        <StatCard icon={TrendingUp} label="Class Avg"       value={`${avgPct}%`}     delay={240} variant={avgPct >= 75 ? 'green' : avgPct >= 60 ? 'amber' : 'red'} />
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Student Attendance</h2>
        <StudentTable students={students} attendanceMap={attendanceMap} />
      </section>

      {/* Floating Action Button */}
      <button className={styles.fab} onClick={() => setShowModal(true)} title="Record Attendance">
        <PlusCircle size={22} />
        <span>Record Attendance</span>
      </button>

      {showModal && (
        <AddClassModal
          students={students}
          onClose={() => setShowModal(false)}
          onSubmit={(records) => console.log('New records:', records)}
        />
      )}
    </main>
  );
}
