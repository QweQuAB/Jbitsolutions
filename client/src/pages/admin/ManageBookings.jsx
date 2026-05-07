import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, ChevronDown } from 'lucide-react';
import { api } from '../../api';
import PageHeader from '../../components/PageHeader';
import styles from './ManageBookings.module.css';

const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.getBookings().then(d => { setBookings(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  async function updateStatus(id, status) {
    const updated = await api.updateBookingStatus(id, status);
    setBookings(prev => prev.map(b => b.id === id ? updated : b));
  }

  async function del(id) {
    if (!confirm('Delete this booking?')) return;
    await api.deleteBooking(id);
    setBookings(prev => prev.filter(b => b.id !== id));
  }

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader title="Bookings" subtitle={`${bookings.length} total requests`} badge="// BOOKINGS">
        <div className={styles.filterRow}>
          {['all', ...STATUSES].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`${styles.filterBtn} ${filter === s ? styles.filterActive : ''}`}>
              {s}
            </button>
          ))}
        </div>
      </PageHeader>

      {loading ? (
        <div className={styles.loading}>{[...Array(4)].map((_, i) => <div key={i} className={styles.skeleton} />)}</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>No bookings {filter !== 'all' ? `with status "${filter}"` : 'yet'}.</div>
      ) : (
        <div className={styles.list}>
          {filtered.map((b, i) => (
            <motion.div key={b.id} className={styles.card}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <div className={styles.cardTop}>
                <div className={styles.customerInfo}>
                  <div className={styles.customerName}>{b.customer_name}</div>
                  <div className={styles.customerPhone}>{b.phone}</div>
                </div>
                <div className={styles.cardActions}>
                  <select className={styles.statusSelect} value={b.status} onChange={e => updateStatus(b.id, e.target.value)}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button className={styles.delBtn} onClick={() => del(b.id)}><Trash2 size={14} /></button>
                </div>
              </div>
              <div className={styles.serviceName}>{b.service_name}</div>
              {b.notes && <div className={styles.notes}>{b.notes}</div>}
              <div className={styles.cardDate}>{new Date(b.created_at).toLocaleString()}</div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
