/**
 * services/cameraService.js
 * ──────────────────────────
 * Abstraction for all camera-related operations.
 *
 * In demo mode: returns mock camera data and simulates polling.
 * In live mode : calls /api/cameras/* which talks to the camera hardware.
 *
 * CAMERA BACKEND INTEGRATION (Python side):
 *   - Camera hardware sends PATCH /api/cameras/status with { id, isOnline, lastPing }
 *   - Recognition events send POST /api/attendance/mark with face detection payload
 *   - Frontend polls getCameraStatus() every 30s to update the UI indicator
 */

import { cameras as mockCameras } from '@/data/mockData';

const USE_LIVE_API = process.env.NEXT_PUBLIC_USE_LIVE_API === 'true';
const API_BASE     = '/api';

// ── Get current status of all cameras ──
export async function getCameraStatus() {
  if (USE_LIVE_API) {
    const res = await fetch(`${API_BASE}/cameras/status`, { cache: 'no-store' });
    const { cameras } = await res.json();
    return cameras;
  }
  // DEMO: return mock cameras
  return mockCameras;
}

// ── Camera hardware calls this to update its online status ──
export async function updateCameraOnlineStatus(cameraId, isOnline) {
  if (USE_LIVE_API) {
    await fetch(`${API_BASE}/cameras/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: cameraId, isOnline, lastPing: new Date().toISOString() }),
    });
  }
  // DEMO: handled by context updateCameraStatus()
}

/**
 * startLivePolling — polls for new detections every `intervalMs`.
 * Returns a cleanup function to stop polling.
 *
 * In production: replace with WebSocket / SSE connection:
 *   const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL);
 *   ws.onmessage = (e) => onDetection(JSON.parse(e.data));
 *   return () => ws.close();
 */
export function startLivePolling(classId, onDetection, intervalMs = 5000) {
  if (USE_LIVE_API) {
    // LIVE: Connect to WebSocket for real-time detection events
    // const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/live/${classId}`);
    // ws.onmessage = e => onDetection(JSON.parse(e.data));
    // return () => ws.close();
    const id = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/cameras/detections?classId=${classId}`);
        const { detections } = await res.json();
        detections?.forEach(onDetection);
      } catch (e) { console.warn('[camera] poll error', e); }
    }, intervalMs);
    return () => clearInterval(id);
  }
  // DEMO: polling simulation is handled inside AttendanceContext (liveDetections state)
  return () => {};
}

/**
 * CONFIDENCE THRESHOLDS — shared with Python backend.
 * Keep these in sync with the ML model's classification settings.
 */
export const CONFIDENCE_THRESHOLDS = {
  HIGH:   0.85,  // Mark present automatically
  MEDIUM: 0.70,  // Mark present but flag for review
  LOW:    0.00,  // Do not mark — trigger manual review
};
