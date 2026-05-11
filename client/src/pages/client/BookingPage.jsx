import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Send, MessageCircle, Mail, CheckCircle, Phone,
  Clock, MapPin, Zap, ArrowRight, ChevronDown, X
} from 'lucide-react';
import { api } from '../../api';
import { useTrackClick } from '../../hooks/useTracker';
import styles from './BookingPage.module.css';

const EMAIL = 'juanbonal26@gmail.com';
const PHONE = '+233554141150';
const DISPLAY_PHONE = '055 414 1150';

const WHY_US = [
  { icon: <Clock size={18} />, title: 'Same Day Response', sub: 'We confirm bookings within 24 hours' },
  { icon: <CheckCircle size={18} />, title: '7–14 Day Warranty', sub: 'All services backed by warranty' },
  { icon: <MapPin size={18} />, title: 'Remote & Onsite', sub: 'Wherever you need us' },
  { icon: <Zap size={18} />, title: 'Fast Turnaround', sub: 'Most jobs completed same day' },
];

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    customer_name: '',
    phone: '',
    service_name: searchParams.get('service') || '',
    notes: ''
  });
  const [feedback, setFeedback] = useState({ customer_name: '', message: '' });
  const [bookResult, setBookResult] = useState(null);
  const [fbResult, setFbResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fbLoading, setFbLoading] = useState(false);
  const trackClick = useTrackClick();

  useEffect(() => {
    api.getServices().then(setServices).catch(() => {});
  }, []);

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));
  const setFb = field => e => setFeedback(f => ({ ...f, [field]: e.target.value }));

  function validate() {
    if (!form.customer_name.trim()) { setBookResult({ type: 'error', msg: 'Please enter your name.' }); return false; }
    if (!form.phone.trim()) { setBookResult({ type: 'error', msg: 'Please enter your phone number.' }); return false; }
    if (!form.service_name) { setBookResult({ type: 'error', msg: 'Please select a service.' }); return false; }
    return true;
  }

  async function handleEmail() {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.createBooking(form);
      trackClick('Book a Service', `email:${form.service_name}`);
      const sub = encodeURIComponent(`Booking Request: ${form.service_name}`);
      const body = encodeURIComponent(`Hi JB IT Solutions,\n\nI'd like to book: ${form.service_name}\n\nName: ${form.customer_name}\nPhone: ${form.phone}\nNotes: ${form.notes || 'None'}`);
      window.location.href = `mailto:${EMAIL}?subject=${sub}&body=${body}`;
      setBookResult({ type: 'success', msg: 'Booking saved! Your email app will open with the pre-filled request.' });
      setForm({ customer_name: '', phone: '', service_name: '', notes: '' });
    } catch (e) { setBookResult({ type: 'error', msg: e.message }); }
    setLoading(false);
  }

  async function handleSMS() {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.createBooking(form);
      trackClick('Book a Service', `sms:${form.service_name}`);
      const body = encodeURIComponent(`Booking Request\nService: ${form.service_name}\nName: ${form.customer_name}\nPhone: ${form.phone}\nNotes: ${form.notes || 'None'}`);
      window.location.href = `sms:${PHONE}?body=${body}`;
      setBookResult({ type: 'success', msg: 'Booking saved! Opening SMS...' });
    } catch (e) { setBookResult({ type: 'error', msg: e.message }); }
    setLoading(false);
  }

  async function handleSave() {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.createBooking(form);
      trackClick('Book a Service', `saved:${form.service_name}`);
      setBookResult({ type: 'success', msg: 'Your booking request has been saved. We\'ll be in touch shortly!' });
      setForm({ customer_name: '', phone: '', service_name: '', notes: '' });
    } catch (e) { setBookResult({ type: 'error', msg: e.message }); }
    setLoading(false);
  }

  async function handleFeedback() {
    if (!feedback.message.trim()) { setFbResult({ type: 'error', msg: 'Please write your feedback first.' }); return; }
    setFbLoading(true);
    try {
      await api.createFeedback(feedback);
      setFbResult({ type: 'success', msg: 'Thank you for your feedback! It helps us improve.' });
      setFeedback({ customer_name: '', message: '' });
    } catch (e) { setFbResult({ type: 'error', msg: e.message }); }
    setFbLoading(false);
  }

  return (
    <div className={styles.root}>
      <div className={styles.pageHero}>
        <div className={styles.maxWidth}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}>
            <div className={styles.eyebrow}>Book a Service</div>
            <h1 className={styles.title}>
              Let's Fix It <span className={styles.titleAccent}>Together</span>
            </h1>
            <p className={styles.sub}>
              Fill out the form and we'll confirm your booking within 24 hours. Or reach us directly below.
            </p>

            <div className={styles.directContact}>
              <a href={`tel:${PHONE}`} className={styles.contactCard}>
                <div className={styles.contactCardIcon}><Phone size={20} /></div>
                <div>
                  <div className={styles.contactCardLabel}>Call / WhatsApp</div>
                  <div className={styles.contactCardValue}>{DISPLAY_PHONE}</div>
                </div>
                <ArrowRight size={16} className={styles.contactArrow} />
              </a>
              <a href={`mailto:${EMAIL}`} className={styles.contactCard}>
                <div className={styles.contactCardIcon}><Mail size={20} /></div>
                <div>
                  <div className={styles.contactCardLabel}>Email Us</div>
                  <div className={styles.contactCardValue}>{EMAIL}</div>
                </div>
                <ArrowRight size={16} className={styles.contactArrow} />
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      <div className={styles.maxWidth}>
        <div className={styles.whyUs}>
          {WHY_US.map(({ icon, title, sub }) => (
            <div key={title} className={styles.whyCard}>
              <div className={styles.whyIcon}>{icon}</div>
              <div className={styles.whyTitle}>{title}</div>
              <div className={styles.whySub}>{sub}</div>
            </div>
          ))}
        </div>

        <div className={styles.mainGrid}>
          <motion.div
            className={styles.formCard}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}>
            <div className={styles.formCardHeader}>
              <div>
                <h2 className={styles.formCardTitle}>Book a Service</h2>
                <p className={styles.formCardSub}>We'll confirm within 24 hours</p>
              </div>
              <div className={styles.stepBadge}>Step 1 of 1</div>
            </div>

            <div className={styles.form}>
              <div className={styles.formRow}>
                <Field label="Your Name" required>
                  <input className={styles.input} placeholder="Full name" value={form.customer_name} onChange={set('customer_name')} />
                </Field>
                <Field label="Phone / WhatsApp" required>
                  <input className={styles.input} placeholder="e.g. 055 414 1150" value={form.phone} onChange={set('phone')} />
                </Field>
              </div>

              <Field label="Service Required" required>
                <div className={styles.selectWrap}>
                  <select className={styles.input} value={form.service_name} onChange={set('service_name')}>
                    <option value="">Choose a service...</option>
                    {services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                  <ChevronDown size={15} className={styles.selectArrow} />
                </div>
              </Field>

              <Field label="Additional Notes">
                <textarea className={`${styles.input} ${styles.textarea}`}
                  placeholder="Describe your issue, location preferences, or any details that might help..."
                  value={form.notes} onChange={set('notes')} rows={4} />
              </Field>

              {bookResult && (
                <motion.div
                  className={`${styles.result} ${bookResult.type === 'success' ? styles.resultSuccess : styles.resultError}`}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}>
                  {bookResult.type === 'success' ? <CheckCircle size={16} /> : <X size={16} />}
                  <span>{bookResult.msg}</span>
                  <button className={styles.resultClose} onClick={() => setBookResult(null)}>
                    <X size={14} />
                  </button>
                </motion.div>
              )}

              <div className={styles.actions}>
                <button className={styles.actionPrimary} onClick={handleEmail} disabled={loading}>
                  <Mail size={15} />
                  <span>{loading ? 'Saving...' : 'Send by Email'}</span>
                </button>
                <button className={styles.actionSecondary} onClick={handleSMS} disabled={loading}>
                  <MessageCircle size={15} />
                  <span>Send by SMS</span>
                </button>
                <button className={styles.actionGhost} onClick={handleSave} disabled={loading}>
                  Save Request
                </button>
              </div>

              <p className={styles.formNote}>
                Submitting saves your request to our system. Email/SMS also opens your app with the details pre-filled.
              </p>
            </div>
          </motion.div>

          <motion.div
            className={styles.sidePanel}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}>
            <div className={styles.availCard}>
              <div className={styles.availHeader}>
                <span className={styles.availDot} />
                <span className={styles.availLabel}>Currently Available</span>
              </div>
              <p className={styles.availText}>
                We're taking new bookings and typically respond within a few hours.
                Complex or parts-requiring jobs may take longer.
              </p>
              <div className={styles.availTimes}>
                <div className={styles.availTime}><span>Mon – Sat</span><span>8am – 8pm</span></div>
                <div className={styles.availTime}><span>Sunday</span><span>By appointment</span></div>
              </div>
            </div>

            <div className={styles.feedbackCard}>
              <div className={styles.formCardHeader}>
                <div>
                  <h2 className={styles.formCardTitle}>Leave Feedback</h2>
                  <p className={styles.formCardSub}>Your experience matters to us</p>
                </div>
              </div>
              <div className={styles.form}>
                <Field label="Your Name (optional)">
                  <input className={styles.input} placeholder="Anonymous is fine" value={feedback.customer_name} onChange={setFb('customer_name')} />
                </Field>
                <Field label="Feedback" required>
                  <textarea className={`${styles.input} ${styles.textarea}`}
                    placeholder="How was your experience? Any suggestions?"
                    value={feedback.message} onChange={setFb('message')} rows={4} />
                </Field>

                {fbResult && (
                  <motion.div
                    className={`${styles.result} ${fbResult.type === 'success' ? styles.resultSuccess : styles.resultError}`}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}>
                    {fbResult.type === 'success' ? <CheckCircle size={16} /> : <X size={16} />}
                    <span>{fbResult.msg}</span>
                  </motion.div>
                )}

                <button className={styles.actionPrimary} onClick={handleFeedback} disabled={fbLoading} style={{ '--btn-color': 'var(--accent2)', '--btn-glow': 'rgba(var(--accent2-rgb),0.3)' }}>
                  <Send size={15} />
                  <span>{fbLoading ? 'Submitting...' : 'Submit Feedback'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>
        {label}{required && <span className={styles.labelRequired}>*</span>}
      </label>
      {children}
    </div>
  );
}
