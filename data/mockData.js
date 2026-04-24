// ============================================================
// Mock Data — shaped after Firebase Firestore documents
// ============================================================

// ------ USERS ------
export const users = [
  // Students
  { id: 'stu001', name: 'Aarav Sharma',   username: 'aarav',   password: '1234', role: 'student', rollNo: 'CS2101', department: 'CS', classId: 'cs-a' },
  { id: 'stu002', name: 'Diya Mehta',     username: 'diya',    password: '1234', role: 'student', rollNo: 'CS2102', department: 'CS', classId: 'cs-a' },
  { id: 'stu003', name: 'Rohan Verma',    username: 'rohan',   password: '1234', role: 'student', rollNo: 'CS2103', department: 'CS', classId: 'cs-a' },
  { id: 'stu004', name: 'Sneha Patel',    username: 'sneha',   password: '1234', role: 'student', rollNo: 'CS2104', department: 'CS', classId: 'cs-a' },
  { id: 'stu005', name: 'Kabir Singh',    username: 'kabir',   password: '1234', role: 'student', rollNo: 'CS2105', department: 'CS', classId: 'cs-a' },
  { id: 'stu006', name: 'Meera Joshi',    username: 'meera',   password: '1234', role: 'student', rollNo: 'CS2201', department: 'CS', classId: 'cs-b' },
  { id: 'stu007', name: 'Arjun Nair',     username: 'arjun',   password: '1234', role: 'student', rollNo: 'CS2202', department: 'CS', classId: 'cs-b' },
  { id: 'stu008', name: 'Priya Iyer',     username: 'priya',   password: '1234', role: 'student', rollNo: 'CS2203', department: 'CS', classId: 'cs-b' },

  // Parents
  { id: 'par001', name: 'Suresh Sharma',  username: 'suresh',  password: '1234', role: 'parent',  parentOf: ['stu001', 'stu003'], department: 'CS' },
  { id: 'par002', name: 'Anjali Mehta',   username: 'anjali',  password: '1234', role: 'parent',  parentOf: ['stu002'],           department: 'CS' },

  // Teachers
  { id: 'tea001', name: 'Prof. Kapoor',   username: 'kapoor',  password: '1234', role: 'teacher', department: 'CS', classIds: ['cs-a'] },
  { id: 'tea002', name: 'Prof. Rathi',    username: 'rathi',   password: '1234', role: 'teacher', department: 'CS', classIds: ['cs-b'] },

  // HOD
  { id: 'hod001', name: 'Dr. Malhotra',   username: 'malhotra',password: '1234', role: 'hod',     department: 'CS' },
];

// ------ CLASSES ------
export const classes = [
  { id: 'cs-a', name: 'CS-A (2nd Year)', department: 'CS', teacherId: 'tea001', studentIds: ['stu001','stu002','stu003','stu004','stu005'] },
  { id: 'cs-b', name: 'CS-B (2nd Year)', department: 'CS', teacherId: 'tea002', studentIds: ['stu006','stu007','stu008'] },
];

// ------ SUBJECTS (6 periods per day, 9AM–2PM) ------
export const periods = [
  { period: 1, time: '9:00 AM',  subject: 'Data Structures' },
  { period: 2, time: '10:00 AM', subject: 'Operating Systems' },
  { period: 3, time: '11:00 AM', subject: 'DBMS' },
  { period: 4, time: '12:00 PM', subject: 'Computer Networks' },
  { period: 5, time: '1:00 PM',  subject: 'Software Engineering' },
  { period: 6, time: '2:00 PM',  subject: 'Theory of Computation' },
];

// ------ ATTENDANCE RECORDS ------
// status: 'present' | 'absent' | 'no-class'
function makeRecords(studentId, startDateStr, numDays) {
  const records = [];
  const base = new Date(startDateStr);
  for (let d = 0; d < numDays; d++) {
    const date = new Date(base);
    date.setDate(base.getDate() + d);
    const day = date.getDay();
    if (day === 0) continue; // Skip Sundays
    const dateStr = date.toISOString().slice(0, 10);
    for (let p = 1; p <= 6; p++) {
      if (day === 6 && p > 3) continue; // Saturday: only 3 periods
      const rand = Math.random();
      const status = rand < 0.78 ? 'present' : rand < 0.95 ? 'absent' : 'no-class';
      records.push({ studentId, date: dateStr, period: p, status });
    }
  }
  return records;
}

export const attendanceRecords = [
  ...makeRecords('stu001', '2026-03-17', 38),
  ...makeRecords('stu002', '2026-03-17', 38),
  ...makeRecords('stu003', '2026-03-17', 38),
  ...makeRecords('stu004', '2026-03-17', 38),
  ...makeRecords('stu005', '2026-03-17', 38),
  ...makeRecords('stu006', '2026-03-17', 38),
  ...makeRecords('stu007', '2026-03-17', 38),
  ...makeRecords('stu008', '2026-03-17', 38),
];

// ------ HELPER FUNCTIONS ------
export function getStudentById(id) { return users.find(u => u.id === id); }
export function getClassById(id)   { return classes.find(c => c.id === id); }
export function getClassesByTeacher(teacherId) { return classes.filter(c => c.teacherId === teacherId); }
export function getClassesByDept(dept) { return classes.filter(c => c.department === dept); }

export function getAttendanceForStudent(studentId) {
  return attendanceRecords.filter(r => r.studentId === studentId);
}

export function calcAttendanceStats(records) {
  const actual = records.filter(r => r.status !== 'no-class');
  const present = actual.filter(r => r.status === 'present');
  const total = actual.length;
  const attended = present.length;
  const pct = total > 0 ? Math.round((attended / total) * 100) : 0;
  return { attended, total, pct };
}

export function calcMonthStats(records, year, month) {
  const monthRecs = records.filter(r => {
    const d = new Date(r.date);
    return d.getFullYear() === year && d.getMonth() === month && r.status !== 'no-class';
  });
  return calcAttendanceStats(monthRecs);
}
