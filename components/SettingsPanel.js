'use client';

import { useState } from 'react';
import { Save, Settings, Sun, Moon } from 'lucide-react';
import { semesters } from '@/data/mockData';
import styles from './SettingsPanel.module.css';

export default function SettingsPanel({ role, settings, onUpdate }) {
  const [local, setLocal] = useState({ ...settings });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onUpdate(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <Settings size={16} className={styles.headerIcon} />
        <span>{role === 'hod' ? 'Department Settings' : 'Profile Settings'}</span>
      </div>

      <div className={styles.grid}>
        {/* Common: theme is display-only in this demo */}
        <div className={styles.field}>
          <label className={styles.label}>Display Theme</label>
          <div className={styles.themeRow}>
            <button className={`${styles.themeBtn} ${styles.themeBtnActive}`}>
              <Moon size={13} /> Dark
            </button>
            <button className={`${styles.themeBtn} ${styles.themeBtnDisabled}`} disabled title="Coming soon">
              <Sun size={13} /> Light
            </button>
          </div>
        </div>

        {/* HOD-only settings */}
        {role === 'hod' && (
          <>
            <div className={styles.field}>
              <label className={styles.label}>Minimum Attendance Threshold (%)</label>
              <div className={styles.rangeRow}>
                <input
                  type="range" min={60} max={90} step={5}
                  value={local.threshold}
                  onChange={e => setLocal(l => ({ ...l, threshold: Number(e.target.value) }))}
                  className={styles.range}
                />
                <span className={styles.rangeVal}>{local.threshold}%</span>
              </div>
              <p className={styles.hint}>
                Students below this percentage will be flagged as &quot;Detained&quot;. Currently: <strong>{local.threshold}%</strong>
              </p>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Department Name</label>
              <input
                className={styles.input}
                value={local.deptName}
                onChange={e => setLocal(l => ({ ...l, deptName: e.target.value }))}
                placeholder="e.g. CS"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Academic Year</label>
              <input
                className={styles.input}
                value={local.academicYear}
                onChange={e => setLocal(l => ({ ...l, academicYear: e.target.value }))}
                placeholder="e.g. 2025-26"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Current Semester</label>
              <select
                className={styles.input}
                value={local.currentSemester}
                onChange={e => setLocal(l => ({ ...l, currentSemester: Number(e.target.value) }))}
              >
                {semesters.map(s => (
                  <option key={s.id} value={s.id}>{s.label} ({s.year})</option>
                ))}
              </select>
            </div>

            {/* ReID / DeepSORT settings */}
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label className={styles.label} style={{ color: 'var(--accent-blue)' }}>
                🤖 ReID / DeepSORT Settings
              </label>
              <p className={styles.hint}>
                These values are read by the Python camera backend via <code>/api/reid/gallery</code>.
                Changes take effect on the next model refresh cycle.
              </p>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>ReID Confidence Threshold</label>
              <div className={styles.rangeRow}>
                <input
                  type="range" min={50} max={95} step={5}
                  value={Math.round((local.reIdThreshold ?? 0.70) * 100)}
                  onChange={e => setLocal(l => ({ ...l, reIdThreshold: Number(e.target.value) / 100 }))}
                  className={styles.range}
                />
                <span className={styles.rangeVal}>{Math.round((local.reIdThreshold ?? 0.70) * 100)}%</span>
              </div>
              <p className={styles.hint}>
                Detections below this confidence are flagged for manual review instead of auto-marked present.
              </p>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>DeepSORT max_age (frames)</label>
              <input
                type="number" min={10} max={120} step={5}
                className={styles.input}
                value={local.deepsortMaxAge ?? 30}
                onChange={e => setLocal(l => ({ ...l, deepsortMaxAge: Number(e.target.value) }))}
              />
              <p className={styles.hint}>Frames to keep a lost track before discarding. Higher = better occlusion handling.</p>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>DeepSORT n_init (confirmations)</label>
              <input
                type="number" min={1} max={10} step={1}
                className={styles.input}
                value={local.deepsortNInit ?? 3}
                onChange={e => setLocal(l => ({ ...l, deepsortNInit: Number(e.target.value) }))}
              />
              <p className={styles.hint}>Detection confirmations before a track becomes active. Lower = faster response.</p>
            </div>
          </>
        )}


        {/* Teacher-only settings */}
        {role === 'teacher' && (
          <div className={styles.field}>
            <label className={styles.label}>Attendance Threshold (view-only, set by HOD)</label>
            <div className={styles.readOnly}>
              <span className={styles.readOnlyVal}>{local.threshold}%</span>
            </div>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <button className={`${styles.saveBtn} ${saved ? styles.saveBtnSuccess : ''}`} onClick={handleSave}>
          {saved ? '✅ Saved!' : <><Save size={14} /> Save Settings</>}
        </button>
      </div>
    </div>
  );
}
