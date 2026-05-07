import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Wrench, Calendar, MessageSquare,
  Activity, BookOpen, LogOut, Menu, X, Shield, ChevronRight
} from 'lucide-react';
import styles from './AdminLayout.module.css';

export default function AdminLayout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={17} />, end: true },
    { to: '/admin/services', label: 'Services', icon: <Wrench size={17} /> },
    { to: '/admin/bookings', label: 'Bookings', icon: <Calendar size={17} /> },
    { to: '/admin/feedback', label: 'Feedback', icon: <MessageSquare size={17} /> },
    { to: '/admin/guides', label: 'Guides', icon: <BookOpen size={17} /> },
    { to: '/admin/logs', label: 'Traffic Logs', icon: <Activity size={17} /> },
  ];

  function logout() {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  }

  return (
    <div className={styles.root}>
      <div className={styles.scanline} />
      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.adminBrand}>
            <div className={styles.adminLogoBox}>
              <Shield size={16} />
            </div>
            {!collapsed && (
              <div className={styles.adminBrandText}>
                <span className={styles.adminBrandName}>Admin</span>
                <span className={styles.adminBrandSub}>JB IT Solutions</span>
              </div>
            )}
          </div>
          <button className={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
            <ChevronRight size={14} className={collapsed ? '' : styles.rotated} />
          </button>
        </div>

        <nav className={styles.sideNav}>
          {navItems.map(({ to, label, icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `${styles.sideNavLink} ${isActive ? styles.sideNavActive : ''}`}
              title={collapsed ? label : undefined}>
              <span className={styles.sideNavIcon}>{icon}</span>
              {!collapsed && <span className={styles.sideNavLabel}>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={logout} title={collapsed ? 'Logout' : undefined}>
            <LogOut size={16} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className={styles.content}>
        <AnimatePresence mode="wait">
          <Outlet />
        </AnimatePresence>
      </main>
    </div>
  );
}
