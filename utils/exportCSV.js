/**
 * exportCSV — converts an array of flat objects to a CSV and triggers download
 */
export function exportCSV(data, filename = 'export') {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(h => {
      const val = row[h] ?? '';
      const str = String(val);
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(',')
  );
  const csvContent = [headers.join(','), ...rows].join('\n');
  downloadCSV(csvContent, filename);
}

/**
 * exportStudentCSV — detailed per-student export with camera metadata
 */
export function exportStudentCSV(student, records, subjects) {
  if (!records || records.length === 0) return;

  const rows = records
    .filter(r => r.status !== 'no-class')
    .sort((a, b) => a.date.localeCompare(b.date) || a.period - b.period)
    .map(r => {
      const sub = subjects.find(s => s.periodSlot === r.period && s.semesterId === r.semesterId);
      const status = r.status.charAt(0).toUpperCase() + r.status.slice(1);
      const mode   = r.mode ? r.mode.charAt(0).toUpperCase() + r.mode.slice(1) : 'Manual';
      const conf   = r.confidence != null ? `${Math.round(r.confidence * 100)}%` : '-';
      return {
        Date:        r.date,
        Period:      r.period,
        Subject:     sub ? sub.name : `Period ${r.period}`,
        Semester:    r.semesterId ?? '-',
        Status:      status,
        Mode:        mode,
        Confidence:  conf,
        CapturedAt:  r.capturedAt ?? '-',
        Disputed:    r.isDisputed ? 'Yes' : 'No',
        ResolvedBy:  r.resolvedBy ?? '-',
      };
    });

  exportCSV(rows, `${student.rollNo}-${student.name.replace(/\s+/g, '_')}-attendance`);
}

/**
 * exportSubjectSummaryCSV — subject-wise summary for one student
 */
export function exportSubjectSummaryCSV(studentName, rollNo, subjectStats, semesterId) {
  const rows = subjectStats.map(s => ({
    Subject:    s.subject,
    Semester:   semesterId,
    Attended:   s.present,
    Total:      s.total,
    Percentage: `${s.pct}%`,
    Disputed:   s.disputed ?? 0,
    Status:     s.pct >= 75 ? 'On Track' : s.pct >= 60 ? 'At Risk' : 'Detained',
  }));
  exportCSV(rows, `${rollNo}-subject-summary-sem${semesterId}`);
}

// ---- Internal helper ----
function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
