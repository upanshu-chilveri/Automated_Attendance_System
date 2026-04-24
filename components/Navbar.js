'use client';

import { useAuth } from '@/context/AuthContext';
import { LogOut, GraduationCap } from 'lucide-react';
import styles from './Navbar.module.css';

const ROLE_LABELS = {
  student: '🎓 Student',
  parent: '👨‍👩‍👧 Parent',
  teacher: '👨‍🏫 Teacher',
  hod: '🏛️ HOD',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <GraduationCap size={20} color="var(--accent-blue)" />
        <span className={styles.brandText}>UCEOU Attendance</span>
      </div>
      <div className={styles.right}>
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
