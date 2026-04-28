'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Save, BookOpen } from 'lucide-react';
import { semesters } from '@/data/mockData';
import styles from './ManageCoursesPanel.module.css';

const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
];

const PERIOD_SLOTS = [1, 2, 3, 4, 5, 6, 7];

export default function ManageCoursesPanel({ subjects, onAdd, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filterSem, setFilterSem] = useState(3);
  const [form, setForm] = useState({
    name: '', periodSlot: 1, time: '9:00 AM', semesterId: 3,
  });

  const filtered = subjects.filter(s => s.semesterId === filterSem);

  const resetForm = () => {
    setForm({ name: '', periodSlot: 1, time: '9:00 AM', semesterId: filterSem });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (sub) => {
    setForm({ name: sub.name, periodSlot: sub.periodSlot, time: sub.time, semesterId: sub.semesterId });
    setEditingId(sub.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      onUpdate(editingId, { ...form });
    } else {
      onAdd({ ...form, classIds: ['cs-a', 'cs-b'] });
    }
    resetForm();
  };

  return (
    <div className={styles.panel}>
      {/* Semester tabs */}
      <div className={styles.semTabs}>
        {semesters.map(s => (
          <button
            key={s.id}
            className={`${styles.semTab} ${filterSem === s.id ? styles.semTabActive : ''}`}
            onClick={() => setFilterSem(s.id)}
          >{s.label}</button>
        ))}
        <button className={styles.addBtn} onClick={() => { setShowForm(true); setEditingId(null); }}>
          <Plus size={14} /> Add Subject
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className={styles.form}>
          <div className={styles.formTitle}>
            {editingId ? 'Edit Subject' : 'Add New Subject'} — Semester {form.semesterId}
          </div>
          <div className={styles.formGrid}>
            <label className={styles.formLabel}>
              Subject Name
              <input
                className={styles.formInput}
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Advanced Algorithms"
              />
            </label>
            <label className={styles.formLabel}>
              Period Slot
              <select
                className={styles.formInput}
                value={form.periodSlot}
                onChange={e => setForm(f => ({ ...f, periodSlot: Number(e.target.value) }))}
              >
                {PERIOD_SLOTS.map(p => <option key={p} value={p}>Period {p}</option>)}
              </select>
            </label>
            <label className={styles.formLabel}>
              Time
              <select
                className={styles.formInput}
                value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
              >
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label className={styles.formLabel}>
              Semester
              <select
                className={styles.formInput}
                value={form.semesterId}
                onChange={e => setForm(f => ({ ...f, semesterId: Number(e.target.value) }))}
              >
                {semesters.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </label>
          </div>
          <div className={styles.formActions}>
            <button className={styles.saveBtn} onClick={handleSave}><Save size={14} /> Save</button>
            <button className={styles.cancelBtn} onClick={resetForm}><X size={14} /> Cancel</button>
          </div>
        </div>
      )}

      {/* Subject list */}
      <div className={styles.list}>
        {filtered.length === 0 && (
          <div className={styles.empty}>No subjects for this semester. Click &quot;Add Subject&quot; to get started.</div>
        )}
        {filtered.map((sub, i) => (
          <div key={sub.id} className={styles.item} style={{ animationDelay: `${i * 30}ms` }}>
            <div className={styles.itemLeft}>
              <BookOpen size={15} className={styles.itemIcon} />
              <div>
                <div className={styles.itemName}>{sub.name}</div>
                <div className={styles.itemMeta}>Period {sub.periodSlot} · {sub.time}</div>
              </div>
            </div>
            <div className={styles.itemActions}>
              <button className={styles.iconBtn} onClick={() => handleEdit(sub)} title="Edit">
                <Edit2 size={13} />
              </button>
              <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => onDelete(sub.id)} title="Delete">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
