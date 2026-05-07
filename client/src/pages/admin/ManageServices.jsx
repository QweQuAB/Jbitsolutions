import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { api } from '../../api';
import PageHeader from '../../components/PageHeader';
import Btn from '../../components/Btn';
import styles from './ManageServices.module.css';

const SECTIONS = ['software', 'care', 'network', 'media', 'deals'];
const EMPTY = { section: 'software', name: '', note: '', base_price: '', active: true };

export default function ManageServices() {
  const [services, setServices] = useState([]);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    api.getAllServices().then(d => { setServices(d); setLoading(false); }).catch(() => setLoading(false));
  }

  function startEdit(s) { setEditing(s.id); setForm({ ...s }); setCreating(false); }
  function startCreate() { setCreating(true); setEditing(null); setForm(EMPTY); }
  function cancel() { setEditing(null); setCreating(false); }
  function set(f) { return e => setForm(prev => ({ ...prev, [f]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })); }

  async function save() {
    if (!form.name || !form.base_price) return;
    setSaving(true);
    try {
      if (creating) {
        const s = await api.createService({ ...form, base_price: parseInt(form.base_price) });
        setServices(prev => [...prev, s]);
      } else {
        const s = await api.updateService(editing, { ...form, base_price: parseInt(form.base_price) });
        setServices(prev => prev.map(x => x.id === editing ? s : x));
      }
      cancel();
    } catch (e) {}
    setSaving(false);
  }

  async function del(id) {
    if (!confirm('Deactivate this service?')) return;
    await api.deleteService(id);
    setServices(prev => prev.map(s => s.id === id ? { ...s, active: false } : s));
  }

  const grouped = SECTIONS.reduce((acc, sec) => {
    const items = services.filter(s => s.section === sec);
    if (items.length) acc[sec] = items;
    return acc;
  }, {});

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader title="Manage Services" subtitle="Add, edit, or deactivate services" badge="// SERVICES">
        <Btn onClick={startCreate}><Plus size={15} />Add Service</Btn>
      </PageHeader>

      <AnimatePresence>
        {(creating || editing) && (
          <motion.div className={styles.formPanel}
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className={styles.formTitle}>{creating ? 'New Service' : 'Edit Service'}</div>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Section</label>
                <select className={styles.input} value={form.section} onChange={set('section')}>
                  {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Base Price (₵)</label>
                <input className={styles.input} type="number" placeholder="50" value={form.base_price} onChange={set('base_price')} />
              </div>
              <div className={`${styles.field} ${styles.wide}`}>
                <label className={styles.label}>Service Name</label>
                <input className={styles.input} placeholder="Service name" value={form.name} onChange={set('name')} />
              </div>
              <div className={`${styles.field} ${styles.wide}`}>
                <label className={styles.label}>Description / Note</label>
                <input className={styles.input} placeholder="Short description" value={form.note} onChange={set('note')} />
              </div>
              {editing && (
                <div className={styles.field}>
                  <label className={styles.label}>Active</label>
                  <div className={styles.checkRow}>
                    <input type="checkbox" checked={form.active} onChange={set('active')} id="activeCheck" />
                    <label htmlFor="activeCheck" style={{color:'var(--text2)', fontSize: '13px'}}>Service is active</label>
                  </div>
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
        <div className={styles.loading}>{[...Array(5)].map((_, i) => <div key={i} className={styles.skeleton} />)}</div>
      ) : (
        Object.entries(grouped).map(([sec, items]) => (
          <div key={sec} className={styles.group}>
            <div className={styles.groupLabel}>{sec}</div>
            <div className={styles.table}>
              <div className={styles.tableHead}>
                <div>Service</div>
                <div>Note</div>
                <div>Price Range</div>
                <div>Status</div>
                <div>Actions</div>
              </div>
              {items.map(s => (
                <div key={s.id} className={`${styles.tableRow} ${!s.active ? styles.inactive : ''}`}>
                  <div className={styles.cellName}>{s.name}</div>
                  <div className={styles.cellNote}>{s.note}</div>
                  <div className={styles.cellPrice}>₵{s.base_price} – ₵{Math.round(s.base_price * 1.25)}</div>
                  <div>
                    <span className={s.active ? styles.badgeActive : styles.badgeInactive}>
                      {s.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className={styles.rowActions}>
                    <button className={styles.editBtn} onClick={() => startEdit(s)}><Pencil size={13} /></button>
                    {s.active && <button className={styles.delBtn} onClick={() => del(s.id)}><Trash2 size={13} /></button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </motion.div>
  );
}
