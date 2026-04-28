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
    const recs    = (attendanceMap[s.id] || []).filter(r => r.status !== 'no-class');
    const attended = recs.filter(r => r.status === 'present').length;
    const total    = recs.length;
    const pct      = total > 0 ? Math.round((attended / total) * 100) : 0;
    return { ...s, attended, total, pct };
  }), [students, attendanceMap]);

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
              <th onClick={() => toggleSort('attended')} className={styles.sortable}><span className={styles.thHeader}>Attended <SortIcon k="attended" /></span></th>
              <th>Total</th>
              <th onClick={() => toggleSort('pct')} className={styles.sortable}><span className={styles.thHeader}>% <SortIcon k="pct" /></span></th>
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
                <td>{s.attended}</td>
                <td>{s.total}</td>
                <td><StatusBadge pct={s.pct} threshold={threshold} /></td>
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
