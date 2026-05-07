import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageCircle, Save, CheckCircle, Phone, Mail } from 'lucide-react';
import { api } from '../../api';
import Btn from '../../components/Btn';
import styles from './BookingPage.module.css';

const EMAIL = 'juanbonal26@gmail.com';
const PHONE = '+233554141150';

export default function BookingPage() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ customer_name: '', phone: '', service_name: '', notes: '' });
  const [feedback, setFeedback] = useState({ customer_name: '', message: '' });
  const [bookResult, setBookResult] = useState(null);
  const [fbResult, setFbResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getServices().then(setServices).catch(() => {});
  }, []);

  function set(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })); }
  function setFb(field) { return e => setFeedback(f => ({ ...f, [field]: e.target.value })); }

  async function handleEmail() {
    if (!form.customer_name || !form.phone || !form.service_name) {
      setBookResult({ type: 'error', msg: 'Please fill in name, phone, and service.' });
      return;
    }
    setLoading(true);
    try {
      await api.createBooking(form);
      const sub = encodeURIComponent(`Booking: ${form.service_name}`);
      const body = encodeURIComponent(`Name: ${form.customer_name}\nPhone: ${form.phone}\nService: ${form.service_name}\nNotes: ${form.notes}`);
      window.location.href = `mailto:${EMAIL}?subject=${sub}&body=${body}`;
      setBookResult({ type: 'success', msg: 'Booking saved and email draft opened!' });
      setForm({ customer_name: '', phone: '', service_name: '', notes: '' });
    } catch (e) {
      setBookResult({ type: 'error', msg: e.message });
    }
    setLoading(false);
  }

  async function handleSMS() {
    if (!form.customer_name || !form.phone || !form.service_name) {
      setBookResult({ type: 'error', msg: 'Please fill in name, phone, and service.' });
      return;
    }
    setLoading(true);
    try {
      await api.createBooking(form);
      const body = encodeURIComponent(`Booking:\nService: ${form.service_name}\nName: ${form.customer_name}\nContact: ${form.phone}\nNotes: ${form.notes}`);
      window.location.href = `sms:${PHONE}?body=${body}`;
      setBookResult({ type: 'success', msg: 'Booking saved and SMS draft opened!' });
    } catch (e) {
      setBookResult({ type: 'error', msg: e.message });
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!form.customer_name || !form.phone || !form.service_name) {
      setBookResult({ type: 'error', msg: 'Please fill in name, phone, and service.' });
      return;
    }
    setLoading(true);
    try {
      await api.createBooking(form);
      setBookResult({ type: 'success', msg: 'Booking request saved successfully!' });
      setForm({ customer_name: '', phone: '', service_name: '', notes: '' });
    } catch (e) {
      setBookResult({ type: 'error', msg: e.message });
    }
    setLoading(false);
  }

  async function handleFeedback() {
    if (!feedback.message) {
      setFbResult({ type: 'error', msg: 'Please enter your feedback.' });
      return;
    }
    try {
      await api.createFeedback(feedback);
      setFbResult({ type: 'success', msg: 'Feedback submitted. Thank you!' });
      setFeedback({ customer_name: '', message: '' });
    } catch (e) {
      setFbResult({ type: 'error', msg: e.message });
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.root}>
      <div className={styles.heroTag}>// REQUEST SERVICE</div>
      <h1 className={styles.title}>Booking & <span className={styles.accent}>Contact</span></h1>
      <p className={styles.sub}>Fill out the form below or reach us directly at any time.</p>

      <div className={styles.contactBar}>
        <a href={`tel:${PHONE}`} className={styles.contactItem}>
          <Phone size={14} /><span>055 414 1150</span>
        </a>
        <a href={`mailto:${EMAIL}`} className={styles.contactItem}>
          <Mail size={14} /><span>{EMAIL}</span>
        </a>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Book a Service</div>
            <div className={styles.cardSub}>We'll confirm your booking within 24 hours</div>
          </div>

          <div className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Your Name *</label>
              <input className={styles.input} placeholder="Enter your name" value={form.customer_name} onChange={set('customer_name')} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Phone / WhatsApp *</label>
              <input className={styles.input} placeholder="Your contact number" value={form.phone} onChange={set('phone')} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Service Required *</label>
              <select className={styles.input} value={form.service_name} onChange={set('service_name')}>
                <option value="">Select a service...</option>
                {services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Additional Notes</label>
              <textarea className={`${styles.input} ${styles.textarea}`} placeholder="Describe your issue or any details..." value={form.notes} onChange={set('notes')} rows={3} />
            </div>

            {bookResult && (
              <div className={`${styles.result} ${bookResult.type === 'success' ? styles.resultSuccess : styles.resultError}`}>
                {bookResult.type === 'success' && <CheckCircle size={14} />}
                {bookResult.msg}
              </div>
            )}

            <div className={styles.actions}>
              <Btn onClick={handleEmail} disabled={loading}><Mail size={14} />Email Request</Btn>
              <Btn variant="secondary" onClick={handleSMS} disabled={loading}><MessageCircle size={14} />SMS Request</Btn>
              <Btn variant="ghost" onClick={handleSave} disabled={loading}><Save size={14} />Save</Btn>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Leave Feedback</div>
            <div className={styles.cardSub}>Suggestions or comments are always welcome</div>
          </div>

          <div className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Your Name (Optional)</label>
              <input className={styles.input} placeholder="Anonymous is fine" value={feedback.customer_name} onChange={setFb('customer_name')} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Feedback *</label>
              <textarea className={`${styles.input} ${styles.textarea}`} placeholder="Share your thoughts..." value={feedback.message} onChange={setFb('message')} rows={5} />
            </div>

            {fbResult && (
              <div className={`${styles.result} ${fbResult.type === 'success' ? styles.resultSuccess : styles.resultError}`}>
                {fbResult.type === 'success' && <CheckCircle size={14} />}
                {fbResult.msg}
              </div>
            )}

            <Btn onClick={handleFeedback}><Send size={14} />Submit Feedback</Btn>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
