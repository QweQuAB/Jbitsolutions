import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, BookOpen, Calendar, Menu, X, Sun, Moon, Zap, ArrowRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import styles from './ClientLayout.module.css';

export default function ClientLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { to: '/', label: 'Services', icon: <Monitor size={15} />, end: true },
    { to: '/guides', label: 'Guides', icon: <BookOpen size={15} /> },
    { to: '/booking', label: 'Book Now', icon: <Calendar size={15} /> },
  ];

  return (
    <div className={styles.root}>
      <div className={styles.bgOrb1} />
      <div className={styles.bgOrb2} />
      <div className={styles.bgOrb3} />
      <div className={styles.bgNoise} />

      <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.brand}>
            <div className={styles.logoBox}>
              <Zap size={18} className={styles.logoIcon} />
            </div>
            <div className={styles.brandText}>
              <span className={styles.brandName}>JB IT Solutions</span>
              <span className={styles.brandSub}>Tech Services & Support</span>
            </div>
          </Link>

          <nav className={styles.nav}>
            {navItems.map(({ to, label, icon, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navActive : ''}`}>
                {icon}
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className={styles.headerActions}>
            <div className={styles.statusBadge}>
              <span className={styles.statusDot} />
              <span>Available</span>
            </div>
            <button className={styles.themeToggle} onClick={toggle} title="Toggle theme" aria-label="Toggle theme">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={theme}
                  initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
                  transition={{ duration: 0.2 }}>
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </motion.span>
              </AnimatePresence>
            </button>
            <Link to="/booking" className={styles.bookBtn}>
              Book a Service <ArrowRight size={14} />
            </Link>
            <button className={styles.mobileMenuBtn} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div className={styles.mobileMenu}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}>
              <div className={styles.mobileMenuInner}>
                {navItems.map(({ to, label, icon, end }) => (
                  <NavLink key={to} to={to} end={end} onClick={() => setMenuOpen(false)}
                    className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.navActive : ''}`}>
                    {icon}<span>{label}</span>
                  </NavLink>
                ))}
                <div className={styles.mobileDivider} />
                <button className={styles.mobileTheme} onClick={() => { toggle(); setMenuOpen(false); }}>
                  {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>
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
          <div className={styles.footerLeft}>
            <div className={styles.footerBrand}>
              <Zap size={16} className={styles.footerIcon} />
              <span>JB IT Solutions</span>
            </div>
            <p className={styles.footerTagline}>Professional tech support for your home & business.</p>
          </div>
          <div className={styles.footerLinks}>
            {navItems.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={styles.footerLink}>{label}</NavLink>
            ))}
          </div>
          <div className={styles.footerContact}>
            <a href="tel:+233554141150" className={styles.footerContactItem}>055 414 1150</a>
            <a href="mailto:juanbonal26@gmail.com" className={styles.footerContactItem}>juanbonal26@gmail.com</a>
            <span className={styles.footerNote}>7–14 day warranty on all services</span>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} JB IT Solutions. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
