import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, ArrowLeft, ArrowRight, Tag, Image as ImageIcon } from 'lucide-react';
import { api } from '../../api';
import styles from './GuidesPage.module.css';

const CATEGORY_STYLES = {
  general:    { gradient: 'linear-gradient(135deg,#0d1a3a,#1a0545)', chip: 'var(--accent)' },
  security:   { gradient: 'linear-gradient(135deg,#1a0808,#450515)', chip: '#f04060' },
  networking: { gradient: 'linear-gradient(135deg,#071a2d,#0a3a5a)', chip: 'var(--accent3)' },
  software:   { gradient: 'linear-gradient(135deg,#07122a,#0d2a50)', chip: 'var(--accent2)' },
  hardware:   { gradient: 'linear-gradient(135deg,#1a0d00,#3a1f00)', chip: '#f59e0b' },
  tips:       { gradient: 'linear-gradient(135deg,#0a1a10,#0a3a1a)', chip: '#10b981' },
};

function getCatStyle(cat) {
  return CATEGORY_STYLES[cat?.toLowerCase()] || CATEGORY_STYLES.general;
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function GuidesPage() {
  const [guides, setGuides] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getGuides()
      .then(data => { setGuides(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (active) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [active]);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') setActive(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className={styles.root}>
      <div className={styles.pageHeader}>
        <div className={styles.maxWidth}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}>
            <div className={styles.eyebrow}>Knowledge Base</div>
            <h1 className={styles.title}>
              Guides & <span className={styles.titleAccent}>Resources</span>
            </h1>
            <p className={styles.sub}>
              Technical guides, how-to articles, and IT tips written to help you get the most out of your devices.
            </p>
          </motion.div>
        </div>
      </div>

      <div className={styles.maxWidth}>
        {loading ? (
          <div className={styles.skeletonGrid}>
            {[...Array(6)].map((_, i) => <div key={i} className={styles.skeletonCard} />)}
          </div>
        ) : guides.length === 0 ? (
          <div className={styles.empty}>
            <BookOpen size={36} style={{ opacity: 0.25, marginBottom: 12 }} />
            <p>No guides published yet.</p>
          </div>
        ) : (
          <motion.div
            className={styles.grid}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}>
            {guides.map((guide, i) => (
              <GuideCard key={guide.id} guide={guide} index={i} onClick={() => setActive(guide)} />
            ))}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {active && (
          <ArticleReader
            guide={active}
            allGuides={guides}
            onClose={() => setActive(null)}
            onNavigate={g => setActive(g)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function GuideCard({ guide, index, onClick }) {
  const catStyle = getCatStyle(guide.category);
  const excerpt = stripHtml(guide.content).slice(0, 130) + '…';
  const hasImage = guide.cover_image && guide.cover_image.trim();

  return (
    <motion.article
      className={styles.card}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.07, 0.5) }}
      whileHover={{ y: -5 }}
      onClick={onClick}>
      <div className={styles.cardImage}
        style={{ background: hasImage ? undefined : catStyle.gradient }}>
        {hasImage ? (
          <img src={guide.cover_image} alt={guide.title} className={styles.cardImg} />
        ) : (
          <div className={styles.cardImagePlaceholder}>
            <BookOpen size={28} style={{ opacity: 0.35, color: '#fff' }} />
          </div>
        )}
        <div className={styles.cardImageOverlay} />
        <div className={styles.cardChip} style={{ background: catStyle.chip + '22', color: catStyle.chip, borderColor: catStyle.chip + '44' }}>
          <Tag size={10} />
          {guide.category || 'general'}
        </div>
      </div>
      <div className={styles.cardBody}>
        <h2 className={styles.cardTitle}>{guide.title}</h2>
        <p className={styles.cardExcerpt}>{excerpt}</p>
        <div className={styles.cardFooter}>
          <div className={styles.cardDate}>
            <Clock size={12} />
            {formatDate(guide.created_at)}
          </div>
          <div className={styles.cardRead}>
            Read article <ArrowRight size={13} />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function ArticleReader({ guide, allGuides, onClose, onNavigate }) {
  const catStyle = getCatStyle(guide.category);
  const hasImage = guide.cover_image && guide.cover_image.trim();
  const currentIndex = allGuides.findIndex(g => g.id === guide.id);
  const prev = currentIndex > 0 ? allGuides[currentIndex - 1] : null;
  const next = currentIndex < allGuides.length - 1 ? allGuides[currentIndex + 1] : null;

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div
        className={styles.reader}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ type: 'spring', damping: 30, stiffness: 350 }}>

        <div className={styles.readerToolbar}>
          <button className={styles.backBtn} onClick={onClose}>
            <ArrowLeft size={16} /> Back to Guides
          </button>
          <div className={styles.readerNav}>
            <button className={styles.navBtn} onClick={() => prev && onNavigate(prev)} disabled={!prev}>
              <ArrowLeft size={15} />
            </button>
            <span className={styles.navCount}>{currentIndex + 1} / {allGuides.length}</span>
            <button className={styles.navBtn} onClick={() => next && onNavigate(next)} disabled={!next}>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        <div className={styles.readerCover}
          style={{ background: hasImage ? undefined : catStyle.gradient }}>
          {hasImage ? (
            <img src={guide.cover_image} alt={guide.title} className={styles.readerCoverImg} />
          ) : (
            <div className={styles.readerCoverPlaceholder}>
              <BookOpen size={40} style={{ opacity: 0.2, color: '#fff' }} />
            </div>
          )}
          <div className={styles.readerCoverOverlay} />
          <div className={styles.readerCoverContent}>
            <div className={styles.readerChip} style={{ background: catStyle.chip + '25', color: catStyle.chip, borderColor: catStyle.chip + '50' }}>
              <Tag size={11} /> {guide.category || 'general'}
            </div>
            <h1 className={styles.readerTitle}>{guide.title}</h1>
            <div className={styles.readerMeta}>
              <Clock size={13} /> {formatDate(guide.created_at)}
            </div>
          </div>
        </div>

        <div className={styles.readerContent}>
          <div className={styles.articleBody}
            dangerouslySetInnerHTML={{ __html: guide.content }} />
        </div>

        {(prev || next) && (
          <div className={styles.readerFooter}>
            <div className={styles.readerNavFooter}>
              {prev && (
                <button className={styles.footerNavBtn} onClick={() => onNavigate(prev)}>
                  <ArrowLeft size={14} />
                  <div>
                    <div className={styles.footerNavLabel}>Previous</div>
                    <div className={styles.footerNavTitle}>{prev.title}</div>
                  </div>
                </button>
              )}
              {next && (
                <button className={`${styles.footerNavBtn} ${styles.footerNavBtnRight}`} onClick={() => onNavigate(next)}>
                  <div>
                    <div className={styles.footerNavLabel}>Next</div>
                    <div className={styles.footerNavTitle}>{next.title}</div>
                  </div>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
