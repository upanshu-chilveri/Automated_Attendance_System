/** POST /api/attendance/dispute — student flags a record */
export async function POST(request) {
  try {
    const { studentId, date, period, note } = await request.json();
    if (!studentId || !date || !period) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // TODO (production): await firestoreUpdate('attendance', { studentId, date, period }, { isDisputed: true, disputeNote: note });
    console.info('[dispute] submitted:', { studentId, date, period, note });
    return Response.json({ success: true }, { status: 200 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
