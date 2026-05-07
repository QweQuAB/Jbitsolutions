import React from 'react';
import { motion } from 'framer-motion';
import styles from './PageHeader.module.css';

export default function PageHeader({ title, subtitle, badge, children }) {
  return (
    <motion.div className={styles.header}
      initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className={styles.left}>
        {badge && <div className={styles.badge}>{badge}</div>}
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {children && <div className={styles.actions}>{children}</div>}
    </motion.div>
  );
}
