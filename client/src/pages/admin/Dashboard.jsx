import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Calendar, MessageSquare, Activity, Clock, TrendingUp } from 'lucide-react';
import { api } from '../../api';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import styles from './Dashboard.module.css';

const STATUS_COLORS = { pending: 'warning', confirmed: 'accent', completed: 'success', cancelled: 'danger' };

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStats().then(data => { setStats(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader title="Dashboard" subtitle="Live overview of your business metrics" badge="// ADMIN PANEL" />

      {loading ? (
        <div className={styles.skeletonGrid}>
          {[...Array(4)].map((_, i) => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : stats ? (
        <>
          <div className={styles.statsGrid}>
            <StatCard label="Active Services" value={stats.totals.services} icon={<Wrench size={20} />} color="accent" />
            <StatCard label="Total Bookings" value={stats.totals.bookings} icon={<Calendar size={20} />} color="purple" />
            <StatCard label="Feedback Items" value={stats.totals.feedback} icon={<MessageSquare size={20} />} color="green" />
            <StatCard label="Requests (24h)" value={stats.totals.traffic_24h} icon={<Activity size={20} />} color="orange" />
          </div>

          <div className={styles.grid2}>
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <Clock size={15} />
                <span>Recent Bookings</span>
              </div>
              <div className={styles.bookingList}>
                {stats.recentBookings.length === 0 ? (
                  <div className={styles.empty}>No bookings yet</div>
                ) : stats.recentBookings.map(b => (
                  <div key={b.id} className={styles.bookingRow}>
                    <div className={styles.bookingInfo}>
                      <div className={styles.bookingName}>{b.customer_name}</div>
                      <div className={styles.bookingService}>{b.service_name}</div>
                    </div>
                    <div className={`${styles.statusBadge} ${styles[`status_${b.status}`]}`}>{b.status}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <TrendingUp size={15} />
                <span>Top Endpoints</span>
              </div>
              <div className={styles.pathList}>
                {stats.topPaths.length === 0 ? (
                  <div className={styles.empty}>No traffic yet</div>
                ) : stats.topPaths.map((p, i) => (
                  <div key={i} className={styles.pathRow}>
                    <div className={styles.pathName}>{p.path}</div>
                    <div className={styles.pathHits}>{p.hits} hits</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.panel} style={{ marginTop: 20 }}>
            <div className={styles.panelHeader}>
              <Activity size={15} />
              <span>Bookings by Status</span>
            </div>
            <div className={styles.statusGrid}>
              {stats.bookingsByStatus.map(s => (
                <div key={s.status} className={styles.statusItem}>
                  <div className={`${styles.statusCount} ${styles[`status_${s.status}`]}`}>{s.count}</div>
                  <div className={styles.statusLabel}>{s.status}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className={styles.empty}>Failed to load stats</div>
      )}
    </motion.div>
  );
}
