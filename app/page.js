'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { GraduationCap, Users, BookOpen, Building2, Eye, EyeOff } from 'lucide-react';
import styles from './page.module.css';

const ROLES = [
  { key: 'student',  label: 'Student',  icon: GraduationCap, desc: 'View your attendance', color: 'blue',   path: '/student' },
  { key: 'parent',   label: 'Parent',   icon: Users,         desc: 'Monitor your child',  color: 'green',  path: '/parent' },
  { key: 'teacher',  label: 'Teacher',  icon: BookOpen,      desc: 'Manage class records', color: 'amber',  path: '/teacher' },
  { key: 'hod',      label: 'HOD',      icon: Building2,     desc: 'Department overview',  color: 'purple', path: '/hod' },
];

const HINT_MAP = {
  student: 'Try: aarav / 1234',
  parent:  'Try: suresh / 1234',
  teacher: 'Try: kapoor / 1234',
  hod:     'Try: malhotra / 1234',
};

export default function HomePage() {
  const { login } = useAuth();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role) => {
    setSelectedRole(role === selectedRole ? null : role);
    setUsername(''); setPassword(''); setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const result = login(username, password);
    if (!result.success) { setError(result.error); setLoading(false); return; }
    const role = ROLES.find(r => r.key === result.user.role);
    router.push(role?.path || '/');
  };

  return (
    <main className={styles.main}>
      {/* Animated background blobs */}
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.blob3} />

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.logoRing}>
            <GraduationCap size={32} color="var(--accent-blue)" />
          </div>
          <h1 className={styles.title}>UCEOU Attendance System</h1>
          <p className={styles.subtitle}>Select your role to continue</p>
        </div>

        <div className={styles.roleGrid}>
          {ROLES.map((role, i) => {
            const Icon = role.icon;
            const active = selectedRole === role.key;
            return (
              <button
                key={role.key}
                className={`${styles.roleBtn} ${active ? styles.roleBtnActive : ''} ${styles[`role_${role.color}`]}`}
                onClick={() => handleRoleSelect(role.key)}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <Icon size={22} />
                <span className={styles.roleName}>{role.label}</span>
                <span className={styles.roleDesc}>{role.desc}</span>
              </button>
            );
          })}
        </div>

        {/* Login Form */}
        {selectedRole && (
          <form className={styles.loginForm} onSubmit={handleLogin}>
            <p className={styles.hint}>{HINT_MAP[selectedRole]}</p>
            <div className={styles.inputRow}>
              <input
                type="text" placeholder="Username"
                value={username} onChange={e => setUsername(e.target.value)}
                required autoComplete="username"
              />
            </div>
            <div className={styles.inputRow}>
              <div className={styles.passWrap}>
                <input
                  type={showPass ? 'text' : 'password'} placeholder="Password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  required autoComplete="current-password"
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(v => !v)}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.loginBtn} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : `Sign in as ${ROLES.find(r=>r.key===selectedRole)?.label}`}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
