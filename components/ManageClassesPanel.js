'use client';

import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Save, X, Camera, Bot, Users } from 'lucide-react';
import { useAttendance } from '@/context/AttendanceContext';
import { users, cameras } from '@/data/mockData';
import styles from './ManageClassesPanel.module.css';

const EMPTY_FORM = {
  name: '', department: 'CS', teacherId: '', semester: 3,
  cameraId: '', reIdEnabled: false, yearGroup: '', studentIds: [],
};

export default function ManageClassesPanel() {
  const { classRecords, addClass, updateClass, deleteClass } = useAttendance();

  const [editing, setEditing] = useState(null); // classId being edited
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [adding,  setAdding]  = useState(false);
  const [confirm, setConfirm] = useState(null);  // classId pending deletion

  const teachers = useMemo(() => users.filter(u => u.role === 'teacher'), []);

  const openAdd = () => { setForm(EMPTY_FORM); setEditing(null); setAdding(true); };
  const openEdit = (cls) => {
    setForm({ ...EMPTY_FORM, ...cls });
    setEditing(cls.id);
    setAdding(false);
  };
  const cancel = () => { setAdding(false); setEditing(null); setForm(EMPTY_FORM); };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const payload = {
      name:       form.name.trim(),
      department: form.department,
      teacherId:  form.teacherId || null,
      semester:   Number(form.semester),
      cameraId:   form.cameraId || null,
      reIdEnabled: Boolean(form.reIdEnabled),
      yearGroup:  form.yearGroup,
      studentIds: form.studentIds || [],
    };
    if (editing) updateClass(editing, payload);
    else         addClass(payload);
    cancel();
  };

  const handleDelete = (id) => {
    deleteClass(id);
    setConfirm(null);
  };

  const field = (k) => ({
    value: form[k] ?? '',
    onChange: (e) => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })),
  });

  return (
    <div className={styles.panel}>
      <div className={styles.toolbar}>
        <p className={styles.hint}>
          Classes are the groups (e.g. CS-A, CS-B) that the camera system tracks.
          Enable <strong>ReID</strong> to let the YOLOv8+DeepSORT pipeline mark attendance automatically.
        </p>
        {!adding && editing === null && (
          <button className={styles.addBtn} onClick={openAdd}>
            <Plus size={14} /> Add New Class
          </button>
        )}
      </div>

      {/* Add / Edit form */}
      {(adding || editing !== null) && (
        <div className={styles.formCard}>
          <h3 className={styles.formTitle}>{adding ? 'New Class' : 'Edit Class'}</h3>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Class Name *</label>
              <input {...field('name')} placeholder="e.g. CS-A (2nd Year)" />
            </div>
            <div className={styles.field}>
              <label>Year Group</label>
              <input {...field('yearGroup')} placeholder="e.g. 2nd Year" />
            </div>
            <div className={styles.field}>
              <label>Department</label>
              <input {...field('department')} placeholder="CS" />
            </div>
            <div className={styles.field}>
              <label>Semester</label>
              <select {...field('semester')}>
                {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>Semester {n}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>Assign Teacher</label>
              <select {...field('teacherId')}>
                <option value="">— No teacher —</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>Assign Camera</label>
              <select {...field('cameraId')}>
                <option value="">— No camera —</option>
                {cameras.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.roomName} ({c.isOnline ? 'Online' : 'Offline'})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <label className={styles.checkLabel}>
            <input type="checkbox" checked={form.reIdEnabled || false}
              onChange={e => setForm(f => ({ ...f, reIdEnabled: e.target.checked }))} />
            <span>
              <Bot size={13} /> Enable YOLOv8 + DeepSORT + ReID auto-attendance
            </span>
          </label>
          <div className={styles.formActions}>
            <button className={styles.cancelBtn} onClick={cancel}><X size={13} /> Cancel</button>
            <button className={styles.saveBtn} onClick={handleSave} disabled={!form.name.trim()}>
              <Save size={13} /> {adding ? 'Create Class' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Class list */}
      <div className={styles.list}>
        {classRecords.length === 0 && (
          <div className={styles.empty}>No classes yet. Add one above.</div>
        )}
        {classRecords.map((cls, i) => {
          const teacher = teachers.find(t => t.id === cls.teacherId);
          const cam     = cameras.find(c => c.id === cls.cameraId);
          return (
            <div key={cls.id} className={styles.row} style={{ animationDelay: `${i * 40}ms` }}>
              <div className={styles.rowLeft}>
                <div className={styles.rowTitle}>
                  <Users size={14} className={styles.rowIcon} />
                  {cls.name}
                  {cls.reIdEnabled && (
                    <span className={styles.reIdBadge}><Bot size={10} /> ReID On</span>
                  )}
                </div>
                <div className={styles.rowMeta}>
                  <span>Sem {cls.semester}</span>
                  {teacher && <span>👤 {teacher.name}</span>}
                  {cam && (
                    <span className={cam.isOnline ? styles.camOn : styles.camOff}>
                      <Camera size={11} /> {cam.roomName} {cam.isOnline ? '●' : '○'}
                    </span>
                  )}
                  <span>{cls.studentIds?.length ?? 0} students</span>
                </div>
              </div>
              <div className={styles.rowRight}>
                {confirm === cls.id ? (
                  <>
                    <span className={styles.confirmText}>Delete?</span>
                    <button className={styles.confirmYes} onClick={() => handleDelete(cls.id)}>Yes</button>
                    <button className={styles.confirmNo}  onClick={() => setConfirm(null)}>No</button>
                  </>
                ) : (
                  <>
                    <button className={styles.editBtn}   onClick={() => openEdit(cls)}><Pencil size={13} /></button>
                    <button className={styles.deleteBtn} onClick={() => setConfirm(cls.id)}><Trash2 size={13} /></button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
