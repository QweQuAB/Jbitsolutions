import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, BookOpen, Calendar, Menu, X, Cpu, Zap } from 'lucide-react';
import styles from './ClientLayout.module.css';

export default function ClientLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { to: '/', label: 'Services', icon: <Monitor size={15} />, end: true },
    { to: '/guides', label: 'Guides', icon: <BookOpen size={15} /> },
    { to: '/booking', label: 'Book Now', icon: <Calendar size={15} /> },
  ];

  return (
    <div className={styles.root}>
      <div className={styles.gridBg} />
      <div className={styles.glowOrb1} />
      <div className={styles.glowOrb2} />

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <div className={styles.logoBox}>
              <Cpu size={22} className={styles.logoIcon} />
            </div>
            <div className={styles.brandText}>
              <span className={styles.brandName}>JB IT Solutions</span>
              <span className={styles.brandTag}>Tech Services & Support</span>
            </div>
          </div>

          <nav className={styles.nav}>
            {navItems.map(({ to, label, icon, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navActive : ''}`}>
                {icon}{label}
              </NavLink>
            ))}
          </nav>

          <div className={styles.headerRight}>
            <div className={styles.statusBadge}>
              <span className={styles.statusDot} />
              Available
            </div>
            <button className={styles.mobileMenu} onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div className={styles.mobileNav}
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {navItems.map(({ to, label, icon, end }) => (
                <NavLink key={to} to={to} end={end} onClick={() => setMenuOpen(false)}
                  className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.navActive : ''}`}>
                  {icon}{label}
                </NavLink>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className={styles.main}>
        <AnimatePresence mode="wait">
          <Outlet />
        </AnimatePresence>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <Zap size={14} />
            <span>JB IT Solutions</span>
          </div>
          <div className={styles.footerContact}>
            <span>055 414 1150</span>
            <span className={styles.footerDot}>•</span>
            <span>juanbonal26@gmail.com</span>
          </div>
          <div className={styles.footerNote}>Warranty: 7–14 days on all services</div>
        </div>
      </footer>
    </div>
  );
}
