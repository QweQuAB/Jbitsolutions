import React from 'react';
import { motion } from 'framer-motion';
import styles from './StatCard.module.css';

export default function StatCard({ label, value, icon, color = 'accent', trend }) {
  return (
    <motion.div className={`${styles.card} ${styles[color]}`}
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }} whileHover={{ y: -2 }}>
      <div className={styles.iconBox}>{icon}</div>
      <div className={styles.body}>
        <div className={styles.value}>{value}</div>
        <div className={styles.label}>{label}</div>
        {trend && <div className={styles.trend}>{trend}</div>}
      </div>
    </motion.div>
  );
}
