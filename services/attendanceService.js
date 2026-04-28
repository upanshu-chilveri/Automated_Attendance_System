/**
 * services/attendanceService.js
 * ─────────────────────────────
 * Abstraction layer between UI components and the data source.
 *
 * HOW TO SWITCH FROM MOCK → FIRESTORE:
 *   1. Set USE_LIVE_API = true (or use env: NEXT_PUBLIC_USE_LIVE_API=true)
 *   2. Implement the Firestore versions in the "LIVE" blocks below
 *   3. No component code needs to change — they all call these functions
 *
 * HOW THE CAMERA BACKEND FITS IN:
 *   - Camera backend (Python) calls POST /api/attendance/mark
 *   - That route calls markAttendanceRecord() here
 *   - In live mode: writes directly to Firestore
 *   - In demo mode: returns the record for the context to merge
 */

const USE_LIVE_API = process.env.NEXT_PUBLIC_USE_LIVE_API === 'true';
const API_BASE     = '/api';

// ── Mark attendance (called by camera backend route or teacher manually) ──
export async function markAttendanceRecord(record) {
  if (USE_LIVE_API) {
    // LIVE: const docRef = await addDoc(collection(db, 'attendance'), record);
    // LIVE: return { success: true, id: docRef.id };
    const res = await fetch(`${API_BASE}/attendance/mark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    return res.json();
  }
  // DEMO: UI context handles this via markAttendance()
  return { success: true, record };
}

// ── Student submits a dispute ──
export async function submitDisputeRecord({ studentId, date, period, note }) {
  if (USE_LIVE_API) {
    const res = await fetch(`${API_BASE}/attendance/dispute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, date, period, note }),
    });
    return res.json();
  }
  // DEMO: handled by context submitDispute()
  return { success: true };
}

// ── Teacher resolves a dispute ──
export async function resolveDisputeRecord({ studentId, date, period, approve, teacherId }) {
  if (USE_LIVE_API) {
    const res = await fetch(`${API_BASE}/attendance/${studentId}/resolve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, period, approve, teacherId }),
    });
    return res.json();
  }
  return { success: true };
}

// ── Fetch attendance for a student (used for SSR or initial load) ──
export async function fetchStudentAttendance(studentId) {
  if (USE_LIVE_API) {
    // LIVE: const q = query(collection(db, 'attendance'), where('studentId', '==', studentId));
    // LIVE: const snap = await getDocs(q);
    // LIVE: return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const res = await fetch(`${API_BASE}/attendance?studentId=${studentId}`);
    return res.json();
  }
  // DEMO: data comes from AttendanceContext (already in memory)
  return [];
}
