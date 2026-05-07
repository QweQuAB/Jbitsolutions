import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, MessageSquare } from 'lucide-react';
import { api } from '../../api';
import PageHeader from '../../components/PageHeader';
import styles from './ManageFeedback.module.css';

export default function ManageFeedback() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getFeedback().then(d => { setItems(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  async function del(id) {
    if (!confirm('Delete this feedback?')) return;
    await api.deleteFeedback(id);
    setItems(prev => prev.filter(f => f.id !== id));
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader title="Feedback" subtitle={`${items.length} submissions received`} badge="// FEEDBACK" />

      {loading ? (
        <div className={styles.loading}>{[...Array(3)].map((_, i) => <div key={i} className={styles.skeleton} />)}</div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>
          <MessageSquare size={32} className={styles.emptyIcon} />
          <div>No feedback yet.</div>
        </div>
      ) : (
        <div className={styles.grid}>
          {items.map((f, i) => (
            <motion.div key={f.id} className={styles.card}
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>{(f.customer_name || 'A')[0].toUpperCase()}</div>
                <div>
                  <div className={styles.name}>{f.customer_name || 'Anonymous'}</div>
                  <div className={styles.date}>{new Date(f.created_at).toLocaleString()}</div>
                </div>
                <button className={styles.delBtn} onClick={() => del(f.id)}><Trash2 size={13} /></button>
              </div>
              <div className={styles.message}>{f.message}</div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
