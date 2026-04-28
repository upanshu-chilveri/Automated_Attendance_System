/**
 * POST /api/attendance/mark
 * Called by the Python camera backend when a face is recognised.
 *
 * Expected body:
 * {
 *   studentId:  "stu001",
 *   date:       "2026-04-29",
 *   period:     3,
 *   semesterId: 3,
 *   status:     "present",          // "present" | "late" | "absent"
 *   confidence: 0.91,
 *   cameraId:   "cam_301",
 *   capturedAt: "09:07:32"
 * }
 *
 * In production: write to Firestore & broadcast via WebSocket/SSE.
 * In demo:       returns 200 so the frontend can call markAttendance() client-side.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { studentId, date, period, semesterId, status, confidence, cameraId, capturedAt } = body;

    // Basic validation
    if (!studentId || !date || !period || !status) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!['present', 'late', 'absent'].includes(status)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 });
    }

    const record = {
      studentId,
      date,
      period:     Number(period),
      semesterId: Number(semesterId ?? 3),
      status,
      mode:       'auto',
      confidence: confidence ?? null,
      cameraId:   cameraId ?? null,
      capturedAt: capturedAt ?? null,
      isDisputed: false,
      disputeNote:null,
      resolvedBy: null,
      resolvedAt: null,
    };

    // TODO (production): await firestoreWrite('attendance', record);
    // TODO (production): broadcastToClients({ type: 'ATTENDANCE_UPDATE', record });

    console.info('[camera] attendance marked:', record);
    return Response.json({ success: true, record }, { status: 200 });

  } catch (err) {
    return Response.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}
