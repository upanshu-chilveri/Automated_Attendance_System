'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, Download } from 'lucide-react';
import { calcAttendanceStats } from '@/data/mockData';
import { exportStudentCSV } from '@/utils/exportCSV';
import styles from './StudentTable.module.css';

function StatusBadge({ pct, threshold = 75 }) {
  if (pct >= threshold) return <span className={`${styles.badge} ${styles.green}`}>{pct}%</span>;
  if (pct >= 60)        return <span className={`${styles.badge} ${styles.amber}`}>{pct}%</span>;
  return                       <span className={`${styles.badge} ${styles.red}`}>{pct}%</span>;
}

export default function StudentTable({
  students,
  attendanceMap,
  subjects = [],
  settings = {},
  onStudentDoubleClick,
}) {
  const threshold = settings?.threshold ?? 75;
  const [query,   setQuery]   = useState('');
  const [sortKey, setSortKey] = useState('rollNo');
  const [sortDir, setSortDir] = useState('asc');

  const rows = useMemo(() => students.map(s => {
    const recs     = (attendanceMap[s.id] || []).filter(r => r.status !== 'no-class');
    // 'late' counts as attended (matches calcAttendanceStats logic)
    const attended = recs.filter(r => r.status === 'present' || r.status === 'late').length;
    const total    = recs.length;
    const pct      = total > 0 ? Math.round((attended / total) * 100) : 0;
    const variant  = pct >= threshold ? 'green' : pct >= 60 ? 'amber' : 'red';
    return { ...s, attended, total, pct, variant };
  }), [students, attendanceMap, threshold]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return rows.filter(r => r.name.toLowerCase().includes(q) || r.rollNo?.toLowerCase().includes(q));
  }, [rows, query]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] ?? '', bv = b[sortKey] ?? '';
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ k }) => sortKey === k
    ? (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)
    : null;

  const handleExportRow = (e, s) => {
    e.stopPropagation();
    const recs = attendanceMap[s.id] || [];
    exportStudentCSV(s, recs, subjects);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.searchRow}>
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} />
          <input
            className={styles.search}
            placeholder="Search by name or roll no…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <span className={styles.count}>{sorted.length} student{sorted.length !== 1 ? 's' : ''}</span>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => toggleSort('rollNo')} className={styles.sortable}><span className={styles.thHeader}>Roll No <SortIcon k="rollNo" /></span></th>
              <th onClick={() => toggleSort('name')}   className={styles.sortable}><span className={styles.thHeader}>Name <SortIcon k="name" /></span></th>
              <th onClick={() => toggleSort('pct')} className={styles.sortable}><span className={styles.thHeader}>Attendance <SortIcon k="pct" /></span></th>
              <th>Status</th>
              <th>Export</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, i) => (
              <tr
                key={s.id}
                style={{ animationDelay: `${i * 30}ms` }}
                className={`animate-fadeUp ${styles.row}`}
                onDoubleClick={() => onStudentDoubleClick?.(s)}
                title="Double-click to view subject-wise details"
              >
                <td className={styles.rollNo}>{s.rollNo}</td>
                <td className={styles.name}>{s.name}</td>
                {/* Mini bar column: shows present vs absent visually */}
                <td colSpan={3}>
                  <div className={styles.barCell}>
                    <div className={styles.miniBarTrack}>
                      <div
                        className={`${styles.miniBarFill} ${styles[`fill_${s.variant}`]}`}
                        style={{ width: `${s.pct}%` }}
                      />
                    </div>
                    <span className={`${styles.badge} ${styles[s.variant]}`}>{s.pct}%</span>
                    <span className={styles.fraction}>{s.attended}/{s.total}</span>
                  </div>
                </td>
                <td>
                  {s.pct >= threshold
                    ? <span className={`${styles.statusText} ${styles.statusGreen}`}>On Track</span>
                    : s.pct >= 60
                    ? <span className={`${styles.statusText} ${styles.statusAmber}`}>At Risk</span>
                    : <span className={`${styles.statusText} ${styles.statusRed}`}>Detained</span>
                  }
                </td>
                <td>
                  <button
                    className={styles.rowExportBtn}
                    onClick={(e) => handleExportRow(e, s)}
                    title="Export this student"
                  >
                    <Download size={12} />
                  </button>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr><td colSpan={7} className={styles.empty}>No students found</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className={styles.hint}>💡 Double-click a row to view subject-wise breakdown</p>
    </div>
  );
}
