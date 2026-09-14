import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';
import { api } from '../../api';
import PageHeader from '../../components/PageHeader';
import styles from './ChangePassword.module.css';

export default function ChangePassword() {
  const [form, setForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.newPw.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (form.newPw !== form.confirm) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { token } = await api.changePassword(form.current, form.newPw);
      localStorage.setItem('admin_token', token);
      setSuccess('Password updated successfully');
      setForm({ current: '', newPw: '', confirm: '' });
    } catch (e) {
      setError(e.message || 'Failed to change password');
    }
    setLoading(false);
  }

  function toggleShow(field) {
    setShowPw(prev => ({ ...prev, [field]: !prev[field] }));
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader title="Change Password" subtitle="Update your admin credentials" badge="// SECURITY" />

      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <KeyRound size={20} />
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Current Password</label>
            <div className={styles.pwWrap}>
              <input className={styles.input} type={showPw.current ? 'text' : 'password'}
                placeholder="Enter current password"
                value={form.current} onChange={e => setForm(f => ({ ...f, current: e.target.value }))} autoFocus />
              <button type="button" className={styles.eyeBtn} onClick={() => toggleShow('current')}>
                {showPw.current ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>New Password</label>
            <div className={styles.pwWrap}>
              <input className={styles.input} type={showPw.newPw ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={form.newPw} onChange={e => setForm(f => ({ ...f, newPw: e.target.value }))} />
              <button type="button" className={styles.eyeBtn} onClick={() => toggleShow('newPw')}>
                {showPw.newPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Confirm New Password</label>
            <div className={styles.pwWrap}>
              <input className={styles.input} type={showPw.confirm ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} />
              <button type="button" className={styles.eyeBtn} onClick={() => toggleShow('confirm')}>
                {showPw.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div className={styles.error}>
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          {success && (
            <div className={styles.success}>
              <CheckCircle size={14} /> {success}
            </div>
          )}

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            <KeyRound size={15} />
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
