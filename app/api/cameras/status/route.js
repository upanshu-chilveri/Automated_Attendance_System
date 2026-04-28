import { cameras } from '@/data/mockData';

/** GET /api/cameras/status — returns all camera statuses */
export async function GET() {
  // TODO (production): fetch from Firestore cameras collection
  return Response.json({ cameras }, { status: 200 });
}

/**
 * PATCH /api/cameras/status — camera backend updates its own online status
 * Body: { id: "cam_301", isOnline: true, lastPing: "2026-04-29T09:07:00" }
 */
export async function PATCH(request) {
  try {
    const { id, ...patch } = await request.json();
    if (!id) return Response.json({ error: 'Missing camera id' }, { status: 400 });
    // TODO (production): await firestoreUpdate('cameras', id, patch);
    console.info('[camera] status update:', { id, ...patch });
    return Response.json({ success: true }, { status: 200 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
