'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Calendar } from 'lucide-react';
import { periods } from '@/data/mockData';
import styles from './AttendanceCalendar.module.css';

const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function statusColor(status) {
  if (status === 'present')  return 'var(--accent-green)';
  if (status === 'late')     return 'var(--accent-amber)';  // amber = late
  if (status === 'absent')   return 'var(--accent-red)';
  if (status === 'no-class') return 'var(--text-muted)';
  return 'var(--border-glass)';
}

function getWeekDates(baseDate) {
  const d = new Date(baseDate);
  const day = d.getDay(); // 0=Sun
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 6 }, (_, i) => {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + i);
    return dd;
  });
}

export default function AttendanceCalendar({ attendanceData = [] }) {
  const [mode, setMode] = useState('week'); // 'week' | 'month'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tooltip, setTooltip] = useState(null);

  // Build lookup: date_period -> status
  const lookup = useMemo(() => {
    const map = {};
    attendanceData.forEach(r => { map[`${r.date}_${r.period}`] = r.status; });
    return map;
  }, [attendanceData]);

  // ----- WEEK VIEW -----
  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);

  const prevWeek = () => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); };
  const nextWeek = () => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); };
  const prevMonth = () => { const d = new Date(currentDate); d.setMonth(d.getMonth() - 1); setCurrentDate(d); };
  const nextMonth = () => { const d = new Date(currentDate); d.setMonth(d.getMonth() + 1); setCurrentDate(d); };

  // ----- MONTH VIEW -----
  const monthDays = useMemo(() => {
    const y = currentDate.getFullYear(), m = currentDate.getMonth();
    const first = new Date(y, m, 1);
    const last  = new Date(y, m + 1, 0);
    const days = [];
    for (let d = 1; d <= last.getDate(); d++) days.push(new Date(y, m, d));
    return days;
  }, [currentDate]);

  function getDayStatus(date) {
    const dateStr = date.toISOString().slice(0, 10);
    const dayRecs = attendanceData.filter(r => r.date === dateStr && r.status !== 'no-class');
    if (dayRecs.length === 0) return 'none';
    // 'late' counts as attended (matches calcAttendanceStats)
    const presentCount = dayRecs.filter(r => r.status === 'present' || r.status === 'late').length;
    const pct = presentCount / dayRecs.length;
    if (pct === 1) return 'full';
    if (pct >= 0.5) return 'partial';
    return 'absent';
  }


  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.navBtns}>
          <button className={styles.navBtn} onClick={mode === 'week' ? prevWeek : prevMonth}>
            <ChevronLeft size={16} />
          </button>
          <span className={styles.dateLabel}>
            {mode === 'week'
              ? `${MONTHS[weekDates[0].getMonth()]} ${weekDates[0].getDate()} – ${weekDates[5].getDate()}, ${weekDates[0].getFullYear()}`
              : `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
            }
          </span>
          <button className={styles.navBtn} onClick={mode === 'week' ? nextWeek : nextMonth}>
            <ChevronRight size={16} />
          </button>
        </div>
        <div className={styles.modeBtns}>
          <button className={`${styles.modeBtn} ${mode === 'week' ? styles.modeActive : ''}`} onClick={() => setMode('week')}>
            <CalendarDays size={14} /> Week
          </button>
          <button className={`${styles.modeBtn} ${mode === 'month' ? styles.modeActive : ''}`} onClick={() => setMode('month')}>
            <Calendar size={14} /> Month
          </button>
        </div>
      </div>

      {mode === 'week' ? (
        <div className={styles.weekGrid}>
          {/* Header row */}
          <div className={styles.periodLabel} />
          {weekDates.map((d, i) => (
            <div key={i} className={`${styles.dayHeader} ${d.toISOString().slice(0,10) === today ? styles.todayHeader : ''}`}>
              <span className={styles.dayShort}>{DAYS_SHORT[i]}</span>
              <span className={styles.dayNum}>{d.getDate()}</span>
            </div>
          ))}
          {/* Period rows */}
          {periods.map(p => (
            <>
              <div key={`lbl-${p.period}`} className={styles.periodLabel}>
                <span className={styles.periodTime}>{p.time}</span>
                <span className={styles.periodSubject}>{p.subject.split(' ')[0]}</span>
              </div>
              {weekDates.map((d, di) => {
                const dateStr = d.toISOString().slice(0, 10);
                const status = lookup[`${dateStr}_${p.period}`];
                const isSun = d.getDay() === 0;
                return (
                  <div
                    key={`${di}-${p.period}`}
                    className={`${styles.cell} ${isSun ? styles.cellDisabled : ''}`}
                    style={{ '--cell-color': statusColor(status) }}
                    onMouseEnter={e => !isSun && status && setTooltip({
                      text: `${p.time} — ${
                        status === 'present' ? '✅ Present'
                        : status === 'late'    ? '🕐 Late'
                        : status === 'absent'  ? '❌ Absent'
                        : '—'
                      } | ${p.subject}`,
                      x: e.clientX, y: e.clientY
                    })}
                    onMouseLeave={() => setTooltip(null)}
                  >
                    {!isSun && status && status !== 'no-class' && (
                      <div className={styles.cellDot} />
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      ) : (
        <div className={styles.monthGrid}>
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
            <div key={d} className={styles.monthDayHeader}>{d}</div>
          ))}
          {/* Offset cells */}
          {Array.from({ length: (monthDays[0].getDay() + 6) % 7 }, (_, i) => (
            <div key={`off-${i}`} className={styles.monthCell} />
          ))}
          {monthDays.map((d, i) => {
            const st = getDayStatus(d);
            const isToday = d.toISOString().slice(0,10) === today;
            return (
              <div key={i} className={`${styles.monthCell} ${styles[`status_${st}`]} ${isToday ? styles.isToday : ''}`}>
                <span className={styles.monthNum}>{d.getDate()}</span>
                {st !== 'none' && <div className={styles.monthDot} />}
              </div>
            );
          })}
        </div>
      )}

      {/* Tooltip */}
      {tooltip && (
        <div className={styles.tooltip} style={{ top: tooltip.y + 12, left: tooltip.x + 12 }}>
          {tooltip.text}
        </div>
      )}

      {/* Legend */}
      <div className={styles.legend}>
        <span><span className={styles.dot} style={{ background: 'var(--accent-green)' }} /> Present</span>
        <span><span className={styles.dot} style={{ background: 'var(--accent-amber)' }} /> Late</span>
        <span><span className={styles.dot} style={{ background: 'var(--accent-red)' }}   /> Absent</span>
        <span><span className={styles.dot} style={{ background: 'var(--text-muted)' }}   /> No Class</span>
      </div>
    </div>
  );
}
