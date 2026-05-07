import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { api } from '../../api';
import PageHeader from '../../components/PageHeader';
import Btn from '../../components/Btn';
import styles from './ManageGuides.module.css';

const EMPTY = { title: '', content: '', category: 'general', active: true };

export default function ManageGuides() {
  const [guides, setGuides] = useState([]);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getGuides().then(d => { setGuides(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  function startEdit(g) { setEditing(g.id); setForm({ ...g }); setCreating(false); }
  function startCreate() { setCreating(true); setEditing(null); setForm(EMPTY); }
  function cancel() { setEditing(null); setCreating(false); }
  function set(f) { return e => setForm(prev => ({ ...prev, [f]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })); }

  async function save() {
    if (!form.title || !form.content) return;
    setSaving(true);
    try {
      if (creating) {
        const g = await api.createGuide(form);
        setGuides(prev => [g, ...prev]);
      } else {
        const g = await api.updateGuide(editing, form);
        setGuides(prev => prev.map(x => x.id === editing ? g : x));
      }
      cancel();
    } catch (e) {}
    setSaving(false);
  }

  async function del(id) {
    if (!confirm('Delete this guide?')) return;
    await api.deleteGuide(id);
    setGuides(prev => prev.filter(g => g.id !== id));
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader title="Guides" subtitle="Manage knowledge base articles" badge="// GUIDES">
        <Btn onClick={startCreate}><Plus size={15} />New Guide</Btn>
      </PageHeader>

      <AnimatePresence>
        {(creating || editing) && (
          <motion.div className={styles.formPanel}
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className={styles.formTitle}>{creating ? 'New Guide' : 'Edit Guide'}</div>
            <div className={styles.formFields}>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label className={styles.label}>Title</label>
                  <input className={styles.input} placeholder="Guide title" value={form.title} onChange={set('title')} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Category</label>
                  <input className={styles.input} placeholder="e.g. general, security" value={form.category} onChange={set('category')} />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Content (HTML supported)</label>
                <textarea className={`${styles.input} ${styles.textarea}`} rows={8}
                  placeholder="<h2>Section</h2><p>Content here...</p>"
                  value={form.content} onChange={set('content')} />
              </div>
              {editing && (
                <div className={styles.checkRow}>
                  <input type="checkbox" id="guideActive" checked={form.active} onChange={set('active')} />
                  <label htmlFor="guideActive" style={{ color: 'var(--text2)', fontSize: '13px' }}>Guide is active (visible to users)</label>
                </div>
              )}
            </div>
            <div className={styles.formActions}>
              <Btn onClick={save} disabled={saving}><Check size={14} />{saving ? 'Saving...' : 'Save'}</Btn>
              <Btn variant="ghost" onClick={cancel}><X size={14} />Cancel</Btn>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className={styles.loading}>{[...Array(2)].map((_, i) => <div key={i} className={styles.skeleton} />)}</div>
      ) : guides.length === 0 ? (
        <div className={styles.empty}>No guides yet. Create one above.</div>
      ) : (
        <div className={styles.list}>
          {guides.map((g, i) => (
            <motion.div key={g.id} className={styles.guideCard}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className={styles.guideHeader}>
                <div className={styles.guideInfo}>
                  <div className={styles.guideCat}>{g.category}</div>
                  <div className={styles.guideTitle}>{g.title}</div>
                  <div className={styles.guideMeta}>{new Date(g.created_at).toLocaleDateString()}</div>
                </div>
                <div className={styles.guideActions}>
                  <span className={g.active ? styles.badgeActive : styles.badgeInactive}>
                    {g.active ? 'Active' : 'Hidden'}
                  </span>
                  <button className={styles.editBtn} onClick={() => startEdit(g)}><Pencil size={13} /></button>
                  <button className={styles.delBtn} onClick={() => del(g.id)}><Trash2 size={13} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
