import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Cpu, Shield, Wifi, Tv, Star, Printer,
  ArrowRight, Calendar, CheckCircle, X, Zap, Clock, Award
} from 'lucide-react';
import { api } from '../../api';
import styles from './ServicesPage.module.css';

const SECTIONS = [
  { id: 'all', label: 'All' },
  { id: 'software', label: 'Software & Data', icon: <Cpu size={14} /> },
  { id: 'care', label: 'PC & Laptop', icon: <Shield size={14} /> },
  { id: 'network', label: 'Networking', icon: <Wifi size={14} /> },
  { id: 'media', label: 'Home Media', icon: <Tv size={14} /> },
  { id: 'deals', label: 'Special Deals', icon: <Star size={14} /> },
];

const SECTION_COLORS = {
  software: { accent: 'var(--accent)', dim: 'var(--accent-dim)' },
  care: { accent: 'var(--accent2)', dim: 'var(--accent2-dim)' },
  network: { accent: 'var(--accent3)', dim: 'rgba(var(--accent3-rgb),0.12)' },
  media: { accent: '#f59e0b', dim: 'rgba(245,158,11,0.12)' },
  deals: { accent: '#ec4899', dim: 'rgba(236,72,153,0.12)' },
};

const TRUST_ITEMS = [
  { icon: <Award size={16} />, label: '7–14 Day Warranty' },
  { icon: <Clock size={16} />, label: 'Same Day Response' },
  { icon: <Wifi size={16} />, label: 'Remote & Onsite' },
  { icon: <Zap size={16} />, label: 'Fast Turnaround' },
];

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [section, setSection] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.getServices()
      .then(data => { setServices(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = services.filter(s => {
    const matchSection = section === 'all' || s.section === section;
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.note?.toLowerCase().includes(search.toLowerCase());
    return matchSection && matchSearch;
  });

  const grouped = SECTIONS.slice(1).reduce((acc, sec) => {
    const items = filtered.filter(s => s.section === sec.id);
    if (items.length) acc.push({ ...sec, items });
    return acc;
  }, []);

  return (
    <div>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}>
            <div className={styles.heroEyebrow}>
              <span className={styles.eyebrowDot} />
              Premium Tech Support — Ghana
            </div>
            <h1 className={styles.heroTitle}>
              Expert IT Services<br />
              <span className={styles.heroGradient}>For Home & Business</span>
            </h1>
            <p className={styles.heroSub}>
              Professional IT solutions with transparent pricing. Every job backed
              by a warranty and delivered with precision.
            </p>
            <div className={styles.heroCTAs}>
              <Link to="/booking" className={styles.ctaPrimary}>
                Book a Service <ArrowRight size={16} />
              </Link>
              <Link to="/guides" className={styles.ctaGhost}>
                Browse Guides
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div
          className={styles.heroCards}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}>
          <div className={styles.floatingCard}>
            <div className={styles.fcIcon} style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
              <Cpu size={18} />
            </div>
            <div>
              <div className={styles.fcName}>Windows Installation</div>
              <div className={styles.fcNote}>Fresh install + updates</div>
            </div>
            <div className={styles.fcPrice}>₵120</div>
          </div>
          <div className={`${styles.floatingCard} ${styles.fcOffset}`}>
            <div className={styles.fcIcon} style={{ background: 'var(--accent2-dim)', color: 'var(--accent2)' }}>
              <Shield size={18} />
            </div>
            <div>
              <div className={styles.fcName}>Virus Removal</div>
              <div className={styles.fcNote}>Deep scan & cleanup</div>
            </div>
            <div className={styles.fcPrice}>₵80</div>
          </div>
          <div className={`${styles.floatingCard} ${styles.fcOffset2}`}>
            <div className={styles.fcIcon} style={{ background: 'rgba(var(--accent3-rgb),0.12)', color: 'var(--accent3)' }}>
              <Wifi size={18} />
            </div>
            <div>
              <div className={styles.fcName}>Network Setup</div>
              <div className={styles.fcNote}>Full router configuration</div>
            </div>
            <div className={styles.fcPrice}>₵150</div>
          </div>
        </motion.div>
      </section>

      <div className={styles.trustBar}>
        <div className={styles.trustBarInner}>
          {TRUST_ITEMS.map(({ icon, label }) => (
            <div key={label} className={styles.trustItem}>
              <span className={styles.trustIcon}>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.catalogueSection}>
        <div className={styles.catalogueHeader}>
          <div>
            <div className={styles.sectionLabel}>Price Catalogue</div>
            <h2 className={styles.catalogueTitle}>All Services</h2>
          </div>
          <button className={styles.printBtn} onClick={() => window.print()}>
            <Printer size={13} /> Print
          </button>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Search size={15} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Search services..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className={styles.searchClear} onClick={() => setSearch('')}>
                <X size={14} />
              </button>
            )}
          </div>
          <div className={styles.filters}>
            {SECTIONS.map(sec => (
              <button key={sec.id}
                onClick={() => setSection(sec.id)}
                className={`${styles.filterBtn} ${section === sec.id ? styles.filterActive : ''}`}>
                {sec.icon}<span>{sec.label}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className={styles.skeletonGrid}>
            {[...Array(9)].map((_, i) => <div key={i} className={styles.skeleton} />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div className={styles.empty} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Search size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p>No services match "{search}"</p>
            <button onClick={() => setSearch('')} className={styles.emptyReset}>Clear search</button>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={section + search} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {section === 'all' ? (
                grouped.map((group, gi) => (
                  <div key={group.id} className={styles.group}>
                    <div className={styles.groupHeader}>
                      <div className={styles.groupTitle}
                        style={{ color: SECTION_COLORS[group.id]?.accent || 'var(--text)' }}>
                        {group.icon}
                        <span>{group.label}</span>
                      </div>
                      <div className={styles.groupCount}>{group.items.length} services</div>
                    </div>
                    <div className={styles.serviceGrid}>
                      {group.items.map((s, i) => (
                        <ServiceCard key={s.id} service={s} index={i}
                          color={SECTION_COLORS[s.section]}
                          onClick={() => setSelected(s)} />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.serviceGrid}>
                  {filtered.map((s, i) => (
                    <ServiceCard key={s.id} service={s} index={i}
                      color={SECTION_COLORS[s.section]}
                      onClick={() => setSelected(s)} />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <ServiceModal service={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function ServiceCard({ service, index, color, onClick }) {
  const max = Math.round(service.base_price * 1.25);
  const c = color || { accent: 'var(--accent)', dim: 'var(--accent-dim)' };
  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4) }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      style={{ '--card-accent': c.accent, '--card-dim': c.dim }}>
      <div className={styles.cardAccentBar} />
      <div className={styles.cardBody}>
        <div className={styles.cardName}>{service.name}</div>
        <div className={styles.cardNote}>{service.note}</div>
      </div>
      <div className={styles.cardFooter}>
        <div className={styles.cardPrice}>
          <span className={styles.priceFrom}>from</span>
          <span className={styles.priceValue}>₵{service.base_price}</span>
          <span className={styles.priceTo}>– ₵{max}</span>
        </div>
        <div className={styles.cardCTA}>
          Book <ArrowRight size={12} />
        </div>
      </div>
    </motion.div>
  );
}

function ServiceModal({ service, onClose }) {
  const max = Math.round(service.base_price * 1.25);
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <motion.div className={styles.overlay}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div className={styles.modal}
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}>
        <button className={styles.modalClose} onClick={onClose}><X size={18} /></button>
        <div className={styles.modalBody}>
          <div className={styles.modalCategory}>{service.section?.replace('software','Software & Data').replace('care','PC & Laptop Care').replace('network','Networking').replace('media','Home Media').replace('deals','Special Deals')}</div>
          <h2 className={styles.modalTitle}>{service.name}</h2>
          <p className={styles.modalNote}>{service.note}</p>
          <div className={styles.modalPriceRow}>
            <div className={styles.modalPrice}>
              <span className={styles.modalPriceLabel}>Starting from</span>
              <span className={styles.modalPriceVal}>₵{service.base_price}</span>
              <span className={styles.modalPriceTo}>– ₵{max}</span>
            </div>
          </div>
          <div className={styles.modalInfo}>
            <div className={styles.modalInfoItem}><CheckCircle size={15} /> 7–14 day warranty included</div>
            <div className={styles.modalInfoItem}><CheckCircle size={15} /> Remote & onsite available</div>
            <div className={styles.modalInfoItem}><CheckCircle size={15} /> Parts & complex jobs may carry additional costs</div>
          </div>
          <Link to={`/booking?service=${encodeURIComponent(service.name)}`} className={styles.modalBook} onClick={onClose}>
            Book This Service <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
