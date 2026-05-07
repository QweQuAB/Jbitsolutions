import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, LogIn } from 'lucide-react';
import { api } from '../../api';
import styles from './AdminLogin.module.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token } = await api.login(form.username, form.password);
      localStorage.setItem('admin_token', token);
      navigate('/admin');
    } catch (e) {
      setError('Invalid username or password');
    }
    setLoading(false);
  }

  return (
    <div className={styles.root}>
      <div className={styles.gridBg} />
      <div className={styles.glow} />

      <motion.div className={styles.card}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}>

        <div className={styles.iconWrap}>
          <div className={styles.iconBox}>
            <Shield size={26} />
          </div>
          <div className={styles.iconRing} />
        </div>

        <div className={styles.heading}>
          <div className={styles.tag}>// ADMIN ACCESS</div>
          <h1 className={styles.title}>Secure Login</h1>
          <p className={styles.sub}>JB IT Solutions — Admin Portal</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Username</label>
            <input className={styles.input} type="text" placeholder="admin"
              value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} autoFocus />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <div className={styles.pwWrap}>
              <input className={styles.input} type={showPw ? 'text' : 'password'} placeholder="••••••••"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            <LogIn size={16} />
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>

        <div className={styles.footer}>
          <a href="/" className={styles.backLink}>← Back to public site</a>
        </div>
      </motion.div>
    </div>
  );
}
