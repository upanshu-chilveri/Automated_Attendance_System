'use client';

import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAttendance } from '@/context/AttendanceContext';
import { LogOut, GraduationCap, AlertTriangle } from 'lucide-react';
import { users, calcAttendanceStats } from '@/data/mockData';
import styles from './Navbar.module.css';

const ROLE_LABELS = {
  student: '🎓 Student',
  parent:  '👨‍👩‍👧 Parent',
  teacher: '👨‍🏫 Teacher',
  hod:     '🏛️ HOD',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { attendanceRecords, settings } = useAttendance();
  const threshold = settings?.threshold ?? 75;

  // Count students below threshold (only for teacher / hod)
  const alertCount = useMemo(() => {
    if (!user || !['teacher', 'hod'].includes(user.role)) return 0;
    const myStudents = users.filter(u => u.role === 'student' && u.department === user.department);
    return myStudents.filter(s => {
      const recs = attendanceRecords.filter(r => r.studentId === s.id);
      const { pct } = calcAttendanceStats(recs);
      return pct < threshold;
    }).length;
  }, [user, attendanceRecords, threshold]);

  if (!user) return null;

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <GraduationCap size={20} color="var(--accent-blue)" />
        <span className={styles.brandText}>UCEOU Attendance</span>
      </div>
      <div className={styles.right}>
        {alertCount > 0 && (
          <div className={styles.alertBadge} title={`${alertCount} students below ${threshold}%`}>
            <AlertTriangle size={13} />
            <span>{alertCount} below {threshold}%</span>
          </div>
        )}
        <span className={styles.roleBadge}>{ROLE_LABELS[user.role]}</span>
        <span className={styles.userName}>{user.name}</span>
        <button className={styles.logoutBtn} onClick={logout} title="Logout">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </nav>
  );
}
