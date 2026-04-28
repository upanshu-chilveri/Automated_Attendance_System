'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { initialAttendanceRecords, initialSubjects, initialClasses, cameras as initialCameras } from '@/data/mockData';

const DEFAULT_SETTINGS = {
  threshold:        75,
  currentSemester:  3,
  deptName:         'CS',
  academicYear:     '2025-26',
  // ReID / DeepSORT settings — keep in sync with Python backend
  reIdThreshold:    0.70,  // minimum confidence to mark present automatically
  deepsortMaxAge:   30,    // how many frames to keep a lost track
  deepsortNInit:    3,     // confirmations before track is active
};

const AttendanceContext = createContext(null);

export function AttendanceProvider({ children }) {
  const [attendanceRecords, setAttendanceRecords] = useState(initialAttendanceRecords);
  const [subjects,          setSubjects]          = useState(initialSubjects);
  const [classRecords,      setClassRecords]      = useState(initialClasses);
  const [cameras,           setCameras]           = useState(initialCameras);
  const [liveDetections,    setLiveDetections]    = useState([]);
  const [pollingClassId,    setPollingClassId]    = useState(null);

  const [settings, setSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('attendance_settings');
        if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      } catch {}
    }
    return DEFAULT_SETTINGS;
  });

  // ── Simulate live camera detections when polling is active ──
  useEffect(() => {
    if (!pollingClassId) return;
    const studentIds = { 'cs-a': ['stu001','stu002','stu003','stu004','stu005'],
                         'cs-b': ['stu006','stu007','stu008'] }[pollingClassId] || [];
    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= studentIds.length) { clearInterval(interval); return; }
      const sid    = studentIds[idx++];
      const conf   = +(0.72 + Math.random() * 0.27).toFixed(2);
      const status = conf >= 0.70 ? 'present' : 'flagged';
      const time   = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      setLiveDetections(prev => [{ sid, conf, status, time, id: Date.now() }, ...prev].slice(0, 20));
    }, 2500);
    return () => clearInterval(interval);
  }, [pollingClassId]);

  // ── Core: mark attendance records (camera OR manual) ──
  const markAttendance = useCallback((newRecords) => {
    setAttendanceRecords(prev => {
      const updated = [...prev];
      newRecords.forEach(nr => {
        const idx = updated.findIndex(
          r => r.studentId === nr.studentId && r.date === nr.date && r.period === nr.period
        );
        const record = {
          mode: 'manual', confidence: null, cameraId: null,
          capturedAt: null, isDisputed: false, disputeNote: null,
          resolvedBy: null, resolvedAt: null,
          ...nr,
        };
        if (idx >= 0) updated[idx] = { ...updated[idx], ...record };
        else updated.push(record);
      });
      return updated;
    });
  }, []);

  // ── Student: flag a record as disputed ──
  const submitDispute = useCallback((recordKey, note) => {
    setAttendanceRecords(prev => prev.map(r =>
      r.studentId === recordKey.studentId &&
      r.date      === recordKey.date      &&
      r.period    === recordKey.period
        ? { ...r, isDisputed: true, disputeNote: note }
        : r
    ));
  }, []);

  // ── Teacher: resolve a dispute (approve = mark present, reject = keep) ──
  const resolveDispute = useCallback((recordKey, approve, teacherId) => {
    setAttendanceRecords(prev => prev.map(r =>
      r.studentId === recordKey.studentId &&
      r.date      === recordKey.date      &&
      r.period    === recordKey.period
        ? {
            ...r,
            status:     approve ? 'present' : r.status,
            mode:       approve ? 'override' : r.mode,
            isDisputed: false,
            resolvedBy: teacherId,
            resolvedAt: new Date().toISOString(),
          }
        : r
    ));
  }, []);

  // ── HOD: update face enrollment status ──
  const updateEnrollmentStatus = useCallback((studentId, status) => {
    // In production this writes to Firestore; in mock we skip (users is a static export)
    console.info(`[mock] enrollment status for ${studentId} → ${status}`);
  }, []);

  // ── Camera: update live status (called by camera backend PATCH /api/cameras/status) ──
  const updateCameraStatus = useCallback((cameraId, patch) => {
    setCameras(prev => prev.map(c => c.id === cameraId ? { ...c, ...patch } : c));
  }, []);

  // ── Live polling: teacher starts/stops during class ──
  const startPolling = useCallback((classId) => setPollingClassId(classId), []);
  const stopPolling  = useCallback(() => { setPollingClassId(null); setLiveDetections([]); }, []);

  // ── Class CRUD (HOD) ──
  const addClass    = useCallback((c) => setClassRecords(prev => [...prev, { id: `cls_${Date.now()}`, ...c }]), []);
  const updateClass = useCallback((id, ch) => setClassRecords(prev => prev.map(c => c.id === id ? { ...c, ...ch } : c)), []);
  const deleteClass = useCallback((id) => setClassRecords(prev => prev.filter(c => c.id !== id)), []);

  // ── Subject CRUD (HOD) ──
  const addSubject    = useCallback((s)     => setSubjects(prev => [...prev, { id: `sub_${Date.now()}`, ...s }]), []);
  const updateSubject = useCallback((id, c) => setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...c } : s)), []);
  const deleteSubject = useCallback((id)    => setSubjects(prev => prev.filter(s => s.id !== id)), []);

  // ── Settings ──
  const updateSettings = useCallback((changes) => {
    setSettings(prev => {
      const next = { ...prev, ...changes };
      if (typeof window !== 'undefined')
        localStorage.setItem('attendance_settings', JSON.stringify(next));
      return next;
    });
  }, []);

  // ── Derived: pending disputes across all records ──
  const pendingDisputeCount = attendanceRecords.filter(r => r.isDisputed && !r.resolvedBy).length;

  return (
    <AttendanceContext.Provider value={{
      attendanceRecords, subjects, classRecords, cameras, settings,
      liveDetections, pollingClassId, pendingDisputeCount,
      markAttendance, submitDispute, resolveDispute,
      updateEnrollmentStatus, updateCameraStatus,
      startPolling, stopPolling,
      addClass, updateClass, deleteClass,
      addSubject, updateSubject, deleteSubject,
      updateSettings,
    }}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const ctx = useContext(AttendanceContext);
  if (!ctx) throw new Error('useAttendance must be used inside AttendanceProvider');
  return ctx;
}
