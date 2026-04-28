// ============================================================
// Mock Data — shaped after Firebase Firestore documents
// Camera-integration ready: includes mode, confidence, cameraId,
// faceId, enrollmentStatus, ReID embeddings, dispute fields
// ============================================================

// ── ReID configuration shared with Python backend ──────────────
// Keep these in sync with tracking/deepsort_tracker.py
export const REID_CONFIG = {
  confidenceThresholds: { HIGH: 0.85, MEDIUM: 0.70, LOW: 0.00 },
  deepsort: { max_age: 30, n_init: 3, max_iou_distance: 0.7 },
  embeddingDim: 2048,      // ReIDNet output dimension
  galleryRefreshSecs: 300, // How often Python re-fetches the gallery
};

// ------ CAMERAS ------
export const cameras = [
  { id: 'cam_301', roomName: 'Room 301', classId: 'cs-a', isOnline: true,  lastPing: '2026-04-29T09:07:00', resolution: '1080p', location: 'Front of class' },
  { id: 'cam_302', roomName: 'Room 302', classId: 'cs-b', isOnline: false, lastPing: '2026-04-29T08:45:00', resolution: '1080p', location: 'Front of class' },
];

// ------ USERS ------
export const users = [
  // Students — ReID ready: referenceImages (gallery photos), embedding (computed by model)
  { id: 'stu001', name: 'Aarav Sharma',  username: 'aarav',    password: '1234', role: 'student', rollNo: 'CS2101', department: 'CS', classId: 'cs-a', semester: 3, faceId: 'face_stu001', enrollmentStatus: 'enrolled',  enrolledAt: '2025-08-10', referenceImages: ['gallery/stu001_1.jpg', 'gallery/stu001_2.jpg'], embedding: null },
  { id: 'stu002', name: 'Diya Mehta',    username: 'diya',     password: '1234', role: 'student', rollNo: 'CS2102', department: 'CS', classId: 'cs-a', semester: 3, faceId: 'face_stu002', enrollmentStatus: 'enrolled',  enrolledAt: '2025-08-10', referenceImages: ['gallery/stu002_1.jpg'],                           embedding: null },
  { id: 'stu003', name: 'Rohan Verma',   username: 'rohan',    password: '1234', role: 'student', rollNo: 'CS2103', department: 'CS', classId: 'cs-a', semester: 3, faceId: 'face_stu003', enrollmentStatus: 'enrolled',  enrolledAt: '2025-08-11', referenceImages: ['gallery/stu003_1.jpg'],                           embedding: null },
  { id: 'stu004', name: 'Sneha Patel',   username: 'sneha',    password: '1234', role: 'student', rollNo: 'CS2104', department: 'CS', classId: 'cs-a', semester: 3, faceId: 'face_stu004', enrollmentStatus: 'pending',   enrolledAt: null,          referenceImages: [],                                                embedding: null },
  { id: 'stu005', name: 'Kabir Singh',   username: 'kabir',    password: '1234', role: 'student', rollNo: 'CS2105', department: 'CS', classId: 'cs-a', semester: 3, faceId: 'face_stu005', enrollmentStatus: 'failed',    enrolledAt: null,          referenceImages: [],                                                embedding: null },
  { id: 'stu006', name: 'Meera Joshi',   username: 'meera',    password: '1234', role: 'student', rollNo: 'CS2201', department: 'CS', classId: 'cs-b', semester: 3, faceId: 'face_stu006', enrollmentStatus: 'enrolled',  enrolledAt: '2025-08-12', referenceImages: ['gallery/stu006_1.jpg'],                           embedding: null },
  { id: 'stu007', name: 'Arjun Nair',    username: 'arjun',    password: '1234', role: 'student', rollNo: 'CS2202', department: 'CS', classId: 'cs-b', semester: 3, faceId: 'face_stu007', enrollmentStatus: 'enrolled',  enrolledAt: '2025-08-12', referenceImages: ['gallery/stu007_1.jpg'],                           embedding: null },
  { id: 'stu008', name: 'Priya Iyer',    username: 'priya',    password: '1234', role: 'student', rollNo: 'CS2203', department: 'CS', classId: 'cs-b', semester: 3, faceId: 'face_stu008', enrollmentStatus: 'enrolled',  enrolledAt: '2025-08-12', referenceImages: ['gallery/stu008_1.jpg'],                           embedding: null },

  // Parents
  { id: 'par001', name: 'Suresh Sharma', username: 'suresh',   password: '1234', role: 'parent', parentOf: ['stu001', 'stu003'], department: 'CS' },
  { id: 'par002', name: 'Anjali Mehta',  username: 'anjali',   password: '1234', role: 'parent', parentOf: ['stu002'],           department: 'CS' },

  // Teachers — assignedCamera links to a camera used during their classes
  { id: 'tea001', name: 'Prof. Kapoor',  username: 'kapoor',   password: '1234', role: 'teacher', department: 'CS', classIds: ['cs-a'], assignedCamera: 'cam_301' },
  { id: 'tea002', name: 'Prof. Rathi',   username: 'rathi',    password: '1234', role: 'teacher', department: 'CS', classIds: ['cs-b'], assignedCamera: 'cam_302' },

  // HOD
  { id: 'hod001', name: 'Dr. Malhotra',  username: 'malhotra', password: '1234', role: 'hod', department: 'CS' },
];

// ------ CLASSES ------
// reIdEnabled: whether YOLOv8+DeepSORT+ReID runs for this class
export const initialClasses = [
  { id: 'cs-a', name: 'CS-A (2nd Year)', department: 'CS', teacherId: 'tea001', studentIds: ['stu001','stu002','stu003','stu004','stu005'], semester: 3, cameraId: 'cam_301', reIdEnabled: true,  yearGroup: '2nd Year' },
  { id: 'cs-b', name: 'CS-B (2nd Year)', department: 'CS', teacherId: 'tea002', studentIds: ['stu006','stu007','stu008'],                   semester: 3, cameraId: 'cam_302', reIdEnabled: false, yearGroup: '2nd Year' },
];
// Backward-compat alias
export const classes = initialClasses;

// ------ SEMESTERS ------
export const semesters = [
  { id: 2, label: 'Semester 2', year: '2024-25' },
  { id: 3, label: 'Semester 3', year: '2025-26' },
];

// ------ SUBJECTS ------
export const initialSubjects = [
  // Semester 3 (current)
  { id: 'sub1',  name: 'Data Structures',      periodSlot: 1, semesterId: 3, time: '9:00 AM',  classIds: ['cs-a','cs-b'] },
  { id: 'sub2',  name: 'Operating Systems',     periodSlot: 2, semesterId: 3, time: '10:00 AM', classIds: ['cs-a','cs-b'] },
  { id: 'sub3',  name: 'DBMS',                  periodSlot: 3, semesterId: 3, time: '11:00 AM', classIds: ['cs-a','cs-b'] },
  { id: 'sub4',  name: 'Computer Networks',     periodSlot: 4, semesterId: 3, time: '12:00 PM', classIds: ['cs-a','cs-b'] },
  { id: 'sub5',  name: 'Software Engineering',  periodSlot: 5, semesterId: 3, time: '1:00 PM',  classIds: ['cs-a','cs-b'] },
  { id: 'sub6',  name: 'Theory of Computation', periodSlot: 6, semesterId: 3, time: '2:00 PM',  classIds: ['cs-a','cs-b'] },
  // Semester 2 (previous)
  { id: 'sub7',  name: 'Mathematics II',        periodSlot: 1, semesterId: 2, time: '9:00 AM',  classIds: ['cs-a','cs-b'] },
  { id: 'sub8',  name: 'Digital Electronics',   periodSlot: 2, semesterId: 2, time: '10:00 AM', classIds: ['cs-a','cs-b'] },
  { id: 'sub9',  name: 'Programming in C',      periodSlot: 3, semesterId: 2, time: '11:00 AM', classIds: ['cs-a','cs-b'] },
  { id: 'sub10', name: 'Physics',               periodSlot: 4, semesterId: 2, time: '12:00 PM', classIds: ['cs-a','cs-b'] },
  { id: 'sub11', name: 'Communication Skills',  periodSlot: 5, semesterId: 2, time: '1:00 PM',  classIds: ['cs-a','cs-b'] },
  { id: 'sub12', name: 'Engineering Drawing',   periodSlot: 6, semesterId: 2, time: '2:00 PM',  classIds: ['cs-a','cs-b'] },
];

// Backward-compat periods array (Semester 3 subjects)
export const periods = initialSubjects
  .filter(s => s.semesterId === 3)
  .map(s => ({ period: s.periodSlot, time: s.time, subject: s.name }));

// ------ ATTENDANCE RECORDS ------
// status:     'present' | 'absent' | 'late' | 'no-class'
// mode:       'auto' (camera) | 'manual' (teacher) | 'override' (correction)
// confidence: 0–1 from ML model, null for manual records
// isDisputed: student flagged this record as incorrect
  function makeRecords(studentId, startDateStr, numDays, semesterId = 3) {
  const records = [];
  const base = new Date(startDateStr);
  let seed = studentId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };

  const camMap = { 'stu001': 'cam_301', 'stu002': 'cam_301', 'stu003': 'cam_301',
                   'stu004': 'cam_301', 'stu005': 'cam_301',
                   'stu006': 'cam_302', 'stu007': 'cam_302', 'stu008': 'cam_302' };
  const cameraId = camMap[studentId] || null;

  for (let d = 0; d < numDays; d++) {
    const date = new Date(base);
    date.setDate(base.getDate() + d);
    const day = date.getDay();
    if (day === 0) continue;
    const dateStr = date.toISOString().slice(0, 10);
    const maxPeriods = day === 6 ? 3 : 6;
    for (let p = 1; p <= maxPeriods; p++) {
      const r = rand();
      let status, mode, confidence, isDisputed, disputeNote, trackId;

      if (semesterId === 3) {
        if (r < 0.72) {
          status = 'present'; mode = 'auto'; confidence = +(0.82 + rand() * 0.17).toFixed(2);
          // trackId: DeepSORT track_id that was matched to this student
          trackId = `trk_${Math.floor(rand() * 900 + 100)}`;
        } else if (r < 0.78) {
          status = 'present'; mode = 'auto'; confidence = +(0.65 + rand() * 0.16).toFixed(2);
          trackId = `trk_${Math.floor(rand() * 900 + 100)}`;
        } else if (r < 0.80) {
          status = 'late';    mode = 'auto'; confidence = +(0.80 + rand() * 0.15).toFixed(2);
          trackId = `trk_${Math.floor(rand() * 900 + 100)}`;
        } else if (r < 0.93) {
          status = 'absent';  mode = 'auto'; confidence = null; trackId = null;
        } else {
          status = 'no-class'; mode = 'manual'; confidence = null; trackId = null;
        }
        if (rand() < 0.04 && status !== 'no-class') { mode = 'override'; confidence = null; trackId = null; }
        isDisputed  = (status === 'absent' && rand() < 0.12);
        disputeNote = isDisputed ? 'I was present, camera did not detect me.' : null;
      } else {
        const r2 = rand();
        status = r2 < 0.78 ? 'present' : r2 < 0.95 ? 'absent' : 'no-class';
        mode = 'manual'; confidence = null; trackId = null;
        isDisputed = false; disputeNote = null;
      }

      records.push({
        studentId,
        date: dateStr,
        period: p,
        status,
        semesterId,
        mode,
        confidence,
        cameraId: mode === 'auto' ? cameraId : null,
        trackId,   // DeepSORT track_id — links back to the tracking log
        capturedAt: (mode === 'auto' && status !== 'absent') ? `${['09','10','11','12','13','14'][p-1]}:${String(Math.floor(rand()*10)).padStart(2,'0')}:${String(Math.floor(rand()*59)).padStart(2,'0')}` : null,
        isDisputed,
        disputeNote,
        resolvedBy: null,
        resolvedAt: null,
      });
    }
  }
  return records;
}

export const initialAttendanceRecords = [
  // Semester 3 (current)
  ...makeRecords('stu001', '2026-03-17', 38, 3),
  ...makeRecords('stu002', '2026-03-17', 38, 3),
  ...makeRecords('stu003', '2026-03-17', 38, 3),
  ...makeRecords('stu004', '2026-03-17', 38, 3),
  ...makeRecords('stu005', '2026-03-17', 38, 3),
  ...makeRecords('stu006', '2026-03-17', 38, 3),
  ...makeRecords('stu007', '2026-03-17', 38, 3),
  ...makeRecords('stu008', '2026-03-17', 38, 3),
  // Semester 2 (previous)
  ...makeRecords('stu001', '2025-08-01', 80, 2),
  ...makeRecords('stu002', '2025-08-01', 80, 2),
  ...makeRecords('stu003', '2025-08-01', 80, 2),
  ...makeRecords('stu004', '2025-08-01', 80, 2),
  ...makeRecords('stu005', '2025-08-01', 80, 2),
  ...makeRecords('stu006', '2025-08-01', 80, 2),
  ...makeRecords('stu007', '2025-08-01', 80, 2),
  ...makeRecords('stu008', '2025-08-01', 80, 2),
];

// Backward-compat alias
export const attendanceRecords = initialAttendanceRecords;

// ------ HELPER FUNCTIONS ------
export function getStudentById(id)          { return users.find(u => u.id === id); }
export function getClassById(id)            { return classes.find(c => c.id === id); }
export function getClassesByTeacher(tid)    { return classes.filter(c => c.teacherId === tid); }
export function getClassesByDept(dept)      { return classes.filter(c => c.department === dept); }
export function getCameraByClassId(classId) { return cameras.find(c => c.classId === classId) || null; }

export function getAttendanceForStudent(studentId, records = initialAttendanceRecords) {
  return records.filter(r => r.studentId === studentId);
}

export function calcAttendanceStats(records) {
  const actual   = records.filter(r => r.status !== 'no-class');
  // 'late' counts as present for overall %
  const attended = actual.filter(r => r.status === 'present' || r.status === 'late').length;
  const total    = actual.length;
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

/** Returns per-subject attendance stats for a given student + semester */
export function getSubjectStats(studentId, semesterId, allRecords = initialAttendanceRecords, allSubjects = initialSubjects) {
  const semSubjects = allSubjects.filter(s => s.semesterId === semesterId);
  return semSubjects.map(sub => {
    const recs = allRecords.filter(r =>
      r.studentId  === studentId &&
      r.semesterId === semesterId &&
      r.period     === sub.periodSlot &&
      r.status     !== 'no-class'
    );
    const present  = recs.filter(r => r.status === 'present' || r.status === 'late').length;
    const total    = recs.length;
    const pct      = total > 0 ? Math.round((present / total) * 100) : 0;
    const disputed = recs.filter(r => r.isDisputed).length;
    return { subject: sub.name, subjectId: sub.id, periodSlot: sub.periodSlot, present, total, pct, disputed };
  });
}

/** Returns department-level subject averages across all students for a semester */
export function getDeptSubjectStats(dept, semesterId, allRecords = initialAttendanceRecords, allSubjects = initialSubjects) {
  const deptStudents = users.filter(u => u.role === 'student' && u.department === dept);
  const semSubjects  = allSubjects.filter(s => s.semesterId === semesterId);
  return semSubjects.map(sub => {
    let totalPct = 0;
    deptStudents.forEach(stu => {
      const recs = allRecords.filter(r =>
        r.studentId  === stu.id &&
        r.semesterId === semesterId &&
        r.period     === sub.periodSlot &&
        r.status     !== 'no-class'
      );
      const present = recs.filter(r => r.status === 'present' || r.status === 'late').length;
      const total   = recs.length;
      totalPct += total > 0 ? Math.round((present / total) * 100) : 0;
    });
    const avgPct = deptStudents.length ? Math.round(totalPct / deptStudents.length) : 0;
    return { subject: sub.name, subjectId: sub.id, periodSlot: sub.periodSlot, avgPct };
  });
}

/** Returns all disputes (isDisputed=true) for students in a given class */
export function getDisputesForClass(classId, allRecords = initialAttendanceRecords) {
  const cls = classes.find(c => c.id === classId);
  if (!cls) return [];
  return allRecords.filter(r =>
    cls.studentIds.includes(r.studentId) && r.isDisputed && !r.resolvedBy
  );
}
