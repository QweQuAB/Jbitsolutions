import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ChevronRight, Cpu, Shield, Wifi, Tv, Star, Printer } from 'lucide-react';
import { api } from '../../api';
import styles from './ServicesPage.module.css';

const SECTIONS = [
  { id: 'all', label: 'All Services' },
  { id: 'software', label: 'Software & Data', icon: <Cpu size={14} /> },
  { id: 'care', label: 'PC & Laptop Care', icon: <Shield size={14} /> },
  { id: 'network', label: 'Networking & Builds', icon: <Wifi size={14} /> },
  { id: 'media', label: 'Home Media', icon: <Tv size={14} /> },
  { id: 'deals', label: 'Special Deals', icon: <Star size={14} /> },
];

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [section, setSection] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getServices().then(data => { setServices(data); setLoading(false); }).catch(() => setLoading(false));
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className={styles.hero}>
        <div className={styles.heroTag}>// PRICE CATALOGUE</div>
        <h1 className={styles.heroTitle}>Tech Services & <span className={styles.heroAccent}>Solutions</span></h1>
        <p className={styles.heroSub}>Professional IT services with transparent pricing. Parts & complex jobs may carry additional charges.</p>
        <div className={styles.heroBadges}>
          <span className={styles.heroBadge}><span className={styles.badgeDot} style={{background:'var(--accent3)'}} />7–14 Day Warranty</span>
          <span className={styles.heroBadge}><span className={styles.badgeDot} style={{background:'var(--accent)'}} />Remote & Onsite</span>
          <span className={styles.heroBadge}><span className={styles.badgeDot} style={{background:'#a78bfa'}} />Fast Turnaround</span>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={15} className={styles.searchIcon} />
          <input className={styles.searchInput} placeholder="Search services..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className={styles.filters}>
          {SECTIONS.map(sec => (
            <button key={sec.id} onClick={() => setSection(sec.id)}
              className={`${styles.filterBtn} ${section === sec.id ? styles.filterActive : ''}`}>
              {sec.icon}{sec.label}
            </button>
          ))}
        </div>
        <button className={styles.printBtn} onClick={() => window.print()}>
          <Printer size={14} /> Print
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>
          {[...Array(6)].map((_, i) => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : (
        <AnimatePresence>
          {section === 'all' ? (
            grouped.map((group, gi) => (
              <motion.div key={group.id} className={styles.group}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.05 }}>
                <div className={styles.groupHeader}>
                  <div className={styles.groupTitle}>{group.icon}{group.label}</div>
                  <div className={styles.groupCount}>{group.items.length} services</div>
                </div>
                <div className={styles.serviceGrid}>
                  {group.items.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
                </div>
              </motion.div>
            ))
          ) : (
            <div className={styles.serviceGrid}>
              {filtered.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className={styles.empty}>No services match your search.</div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}

function ServiceCard({ service, index }) {
  const max = Math.round(service.base_price * 1.25);
  return (
    <motion.div className={styles.card}
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }} whileHover={{ y: -3 }}>
      <div className={styles.cardBody}>
        <div className={styles.cardName}>{service.name}</div>
        <div className={styles.cardNote}>{service.note}</div>
      </div>
      <div className={styles.cardFooter}>
        <div className={styles.cardPrice}>
          <span className={styles.priceLabel}>FROM</span>
          <span className={styles.priceValue}>₵{service.base_price}</span>
          <span className={styles.priceTo}>– ₵{max}</span>
        </div>
        <ChevronRight size={14} className={styles.cardArrow} />
      </div>
    </motion.div>
  );
}
