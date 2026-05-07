import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock } from 'lucide-react';
import { api } from '../../api';
import styles from './GuidesPage.module.css';

export default function GuidesPage() {
  const [guides, setGuides] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getGuides().then(data => {
      setGuides(data);
      if (data.length) setActive(data[0]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.root}>
      <div className={styles.heroTag}>// KNOWLEDGE BASE</div>
      <h1 className={styles.title}>Guides & <span className={styles.accent}>Info</span></h1>
      <p className={styles.sub}>Technical guides, pricing references, and digital independence resources.</p>

      {loading ? (
        <div className={styles.skeleton} />
      ) : guides.length === 0 ? (
        <div className={styles.empty}>No guides available yet.</div>
      ) : (
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            {guides.map((g, i) => (
              <button key={g.id} onClick={() => setActive(g)}
                className={`${styles.guideBtn} ${active?.id === g.id ? styles.guideBtnActive : ''}`}>
                <BookOpen size={14} />
                <span>{g.title}</span>
              </button>
            ))}
          </aside>

          {active && (
            <motion.div key={active.id} className={styles.article}
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
              <div className={styles.articleHeader}>
                <div className={styles.articleCategory}>{active.category}</div>
                <h2 className={styles.articleTitle}>{active.title}</h2>
                <div className={styles.articleMeta}>
                  <Clock size={12} />
                  <span>{new Date(active.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className={styles.articleBody}
                dangerouslySetInnerHTML={{ __html: active.content }} />
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}
