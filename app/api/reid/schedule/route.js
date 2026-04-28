/**
 * GET /api/reid/schedule?classId=cs-a&date=2026-04-29
 * ──────────────────────────────────────────────────────
 * Called by the Python script to determine which period is currently
 * active so it knows which subject's attendance to mark.
 *
 * Python usage example:
 *   from datetime import date
 *   sched = requests.get(
 *     f"http://localhost:3000/api/reid/schedule?classId=cs-a&date={date.today()}"
 *   ).json()
 *   current_period = sched["currentPeriod"]   # None if no class right now
 *
 * GET /api/reid/schedule/register-track (POST)
 * Maps a DeepSORT trackId → studentId when the model makes a match.
 * The Python script calls this for audit logs.
 */

import { initialClasses, initialSubjects } from '@/data/mockData';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get('classId');
  const dateStr = searchParams.get('date') || new Date().toISOString().slice(0, 10);

  if (!classId) {
    return Response.json({ error: 'Missing classId param' }, { status: 400 });
  }

  const cls = initialClasses.find(c => c.id === classId);
  if (!cls) {
    return Response.json({ error: `Class ${classId} not found` }, { status: 404 });
  }

  // Determine current period from server time (IST: UTC+5:30)
  const nowUTC = new Date();
  const istOffset = 5.5 * 60;  // minutes
  const istTime = new Date(nowUTC.getTime() + istOffset * 60 * 1000);
  const hhmm = istTime.getHours() * 100 + istTime.getMinutes();

  // Period time windows (matching initialSubjects times)
  const PERIOD_WINDOWS = [
    { period: 1, start:  900, end:  955 },
    { period: 2, start: 1000, end: 1055 },
    { period: 3, start: 1100, end: 1155 },
    { period: 4, start: 1200, end: 1255 },
    { period: 5, start: 1300, end: 1355 },
    { period: 6, start: 1400, end: 1455 },
  ];

  const activePeriod = PERIOD_WINDOWS.find(w => hhmm >= w.start && hhmm <= w.end) || null;

  // Get all periods for the day (for the Python script's full schedule awareness)
  const daySchedule = initialSubjects
    .filter(s => s.semesterId === cls.semester && s.classIds.includes(classId))
    .map(s => {
      const window = PERIOD_WINDOWS.find(w => w.period === s.periodSlot);
      return {
        period:    s.periodSlot,
        subject:   s.name,
        subjectId: s.id,
        startTime: s.time,
        window,
      };
    });

  // Current subject
  const currentSubject = activePeriod
    ? daySchedule.find(d => d.period === activePeriod.period) || null
    : null;

  return Response.json({
    classId,
    className:     cls.name,
    date:          dateStr,
    serverTimeIST: `${String(istTime.getHours()).padStart(2,'0')}:${String(istTime.getMinutes()).padStart(2,'0')}`,
    currentPeriod: activePeriod?.period || null,
    currentSubject,
    daySchedule,
  }, { status: 200 });
}

/** POST — Python logs a trackId → studentId mapping for audit purposes */
export async function POST(request) {
  try {
    const { trackId, studentId, classId, confidence, timestamp } = await request.json();
    if (!trackId || !studentId) {
      return Response.json({ error: 'Missing trackId or studentId' }, { status: 400 });
    }
    // TODO (production): store in Firestore 'reid_logs' collection for audit trail
    console.info('[reid] track registered:', { trackId, studentId, classId, confidence, timestamp });
    return Response.json({ success: true }, { status: 200 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
