/**
 * GET /api/reid/gallery?classId=cs-a
 * ────────────────────────────────────
 * Called by the Python DeepSORT script on startup (and every
 * REID_CONFIG.galleryRefreshSecs seconds) to fetch the ReID gallery
 * for a specific class.
 *
 * Python usage example:
 *   import requests
 *   gallery = requests.get("http://localhost:3000/api/reid/gallery?classId=cs-a").json()
 *   # gallery["students"] → list of { studentId, rollNo, name, referenceImages, embedding }
 *
 * The Python script uses referenceImages paths to:
 *   1. Load gallery photos and compute embeddings with ReIDNet
 *   2. Build a cosine-similarity search index (studentId → embedding)
 *   3. Match incoming DeepSORT track embeddings at inference time
 */

import { initialClasses, users, REID_CONFIG } from '@/data/mockData';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get('classId');

  if (!classId) {
    return Response.json({ error: 'Missing classId param' }, { status: 400 });
  }

  // TODO (production): fetch from Firestore
  const cls = initialClasses.find(c => c.id === classId);
  if (!cls) {
    return Response.json({ error: `Class ${classId} not found` }, { status: 404 });
  }

  const students = cls.studentIds
    .map(id => users.find(u => u.id === id))
    .filter(Boolean)
    .filter(s => s.enrollmentStatus === 'enrolled')  // only enrolled students
    .map(s => ({
      studentId:       s.id,
      rollNo:          s.rollNo,
      name:            s.name,
      enrollmentStatus: s.enrollmentStatus,
      referenceImages: s.referenceImages || [],
      embedding:       s.embedding || null,  // pre-computed if available
    }));

  return Response.json({
    classId,
    className:  cls.name,
    reIdEnabled: cls.reIdEnabled,
    reidConfig:  REID_CONFIG,
    students,
    generatedAt: new Date().toISOString(),
  }, { status: 200 });
}
