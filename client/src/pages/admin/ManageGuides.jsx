import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, Check, X, Eye, EyeOff,
  Bold, Italic, Heading2, Heading3, List, Link2, Image, Minus, Code, Quote
} from 'lucide-react';
import { api } from '../../api';
import PageHeader from '../../components/PageHeader';
import Btn from '../../components/Btn';
import styles from './ManageGuides.module.css';

const EMPTY = { title: '', content: '', category: 'general', cover_image: '', active: true };

const CATEGORIES = ['general', 'security', 'networking', 'software', 'hardware', 'tips'];

export default function ManageGuides() {
  const [guides, setGuides] = useState([]);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    api.getGuides().then(d => { setGuides(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  function startEdit(g) { setEditing(g.id); setForm({ ...g, cover_image: g.cover_image || '' }); setCreating(false); setPreview(false); }
  function startCreate() { setCreating(true); setEditing(null); setForm(EMPTY); setPreview(false); }
  function cancel() { setEditing(null); setCreating(false); setPreview(false); }
  function set(f) {
    return e => setForm(prev => ({
      ...prev,
      [f]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
    }));
  }

  async function save() {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    try {
      if (creating) {
        const g = await api.createGuide(form);
        setGuides(prev => [g, ...prev]);
      } else {
        const g = await api.updateGuide(editing, form);
        setGuides(prev => prev.map(x => x.id === editing ? g : x));
      }
      cancel();
    } catch (e) {}
    setSaving(false);
  }

  async function del(id) {
    if (!confirm('Delete this guide? This cannot be undone.')) return;
    await api.deleteGuide(id);
    setGuides(prev => prev.filter(g => g.id !== id));
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader title="Guides" subtitle="Manage knowledge base articles" badge="// GUIDES">
        <Btn onClick={startCreate}><Plus size={15} />New Guide</Btn>
      </PageHeader>

      <AnimatePresence>
        {(creating || editing) && (
          <motion.div className={styles.formPanel}
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>

            <div className={styles.formTop}>
              <div className={styles.formTitleRow}>
                <h3 className={styles.formTitle}>{creating ? 'New Guide' : 'Edit Guide'}</h3>
                <div className={styles.formTitleActions}>
                  <button
                    className={`${styles.previewToggle} ${preview ? styles.previewToggleActive : ''}`}
                    onClick={() => setPreview(!preview)}>
                    {preview ? <EyeOff size={14} /> : <Eye size={14} />}
                    {preview ? 'Edit' : 'Preview'}
                  </button>
                  <button className={styles.cancelIconBtn} onClick={cancel}><X size={16} /></button>
                </div>
              </div>

              <div className={styles.metaRow}>
                <div className={styles.field}>
                  <label className={styles.label}>Article Title *</label>
                  <input className={styles.input} placeholder="e.g. How to speed up your PC" value={form.title} onChange={set('title')} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Category</label>
                  <div className={styles.selectWrap}>
                    <select className={styles.input} value={form.category} onChange={set('category')}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Cover Image URL</label>
                  <input className={styles.input} placeholder="https://images.unsplash.com/..." value={form.cover_image} onChange={set('cover_image')} />
                </div>
              </div>

              {form.cover_image && (
                <div className={styles.imagePreviewWrap}>
                  <img src={form.cover_image} alt="Cover preview" className={styles.imagePreview}
                    onError={e => { e.target.style.display = 'none'; }} />
                </div>
              )}
            </div>

            <div className={styles.editorSection}>
              <div className={styles.editorLabel}>
                <span>Article Content</span>
                <span className={styles.editorHint}>HTML is supported — use the toolbar to format</span>
              </div>

              {preview ? (
                <div className={styles.previewPane}>
                  {form.content ? (
                    <div className={styles.previewBody} dangerouslySetInnerHTML={{ __html: form.content }} />
                  ) : (
                    <div className={styles.previewEmpty}>Nothing to preview yet. Switch to Edit and add some content.</div>
                  )}
                </div>
              ) : (
                <RichTextEditor
                  value={form.content}
                  onChange={val => setForm(prev => ({ ...prev, content: val }))}
                />
              )}
            </div>

            {editing && (
              <div className={styles.activeRow}>
                <label className={styles.toggleLabel}>
                  <div className={`${styles.toggle} ${form.active ? styles.toggleOn : ''}`}
                    onClick={() => setForm(p => ({ ...p, active: !p.active }))}>
                    <div className={styles.toggleThumb} />
                  </div>
                  <span className={styles.toggleText}>
                    {form.active ? 'Visible to users' : 'Hidden from users'}
                  </span>
                </label>
              </div>
            )}

            <div className={styles.formActions}>
              <Btn onClick={save} disabled={saving || !form.title.trim() || !form.content.trim()}>
                <Check size={14} />{saving ? 'Saving...' : creating ? 'Publish Guide' : 'Save Changes'}
              </Btn>
              <Btn variant="ghost" onClick={cancel}><X size={14} />Cancel</Btn>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className={styles.loading}>
          {[...Array(3)].map((_, i) => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : guides.length === 0 ? (
        <div className={styles.empty}>
          <p>No guides yet. Create your first one above.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {guides.map((g, i) => (
            <motion.div key={g.id} className={styles.guideCard}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}>
              {g.cover_image && (
                <div className={styles.guideCardThumb}>
                  <img src={g.cover_image} alt={g.title}
                    onError={e => { e.target.parentElement.style.display = 'none'; }} />
                </div>
              )}
              <div className={styles.guideInfo}>
                <div className={styles.guideMetaRow}>
                  <span className={styles.guideCat}>{g.category}</span>
                  <span className={g.active ? styles.badgeActive : styles.badgeInactive}>
                    {g.active ? 'Published' : 'Hidden'}
                  </span>
                </div>
                <div className={styles.guideTitle}>{g.title}</div>
                <div className={styles.guideMeta}>
                  Created {new Date(g.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div className={styles.guideActions}>
                <button className={styles.editBtn} onClick={() => startEdit(g)} title="Edit">
                  <Pencil size={14} />
                </button>
                <button className={styles.delBtn} onClick={() => del(g.id)} title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function RichTextEditor({ value, onChange }) {
  const ref = useRef(null);

  function wrap(before, after) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    const newVal = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(newVal);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  }

  function insert(text) {
    const el = ref.current;
    if (!el) return;
    const pos = el.selectionStart;
    const newVal = value.slice(0, pos) + text + value.slice(pos);
    onChange(newVal);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(pos + text.length, pos + text.length);
    }, 0);
  }

  function insertLine(tag) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const selected = value.slice(start, el.selectionEnd);
    const text = selected || 'Text here';
    const block = `<${tag}>${text}</${tag}>\n`;
    const newVal = value.slice(0, start) + block + value.slice(el.selectionEnd);
    onChange(newVal);
    setTimeout(() => { el.focus(); }, 0);
  }

  const tools = [
    { icon: <Bold size={14} />, title: 'Bold', action: () => wrap('<strong>', '</strong>') },
    { icon: <Italic size={14} />, title: 'Italic', action: () => wrap('<em>', '</em>') },
    { type: 'sep' },
    { icon: <Heading2 size={14} />, title: 'Heading 2', action: () => insertLine('h2') },
    { icon: <Heading3 size={14} />, title: 'Heading 3', action: () => insertLine('h3') },
    { type: 'sep' },
    { icon: <List size={14} />, title: 'Bullet list item', action: () => wrap('<ul>\n  <li>', '</li>\n</ul>') },
    { icon: <Quote size={14} />, title: 'Blockquote', action: () => wrap('<blockquote>', '</blockquote>') },
    { icon: <Code size={14} />, title: 'Inline code', action: () => wrap('<code>', '</code>') },
    { type: 'sep' },
    {
      icon: <Link2 size={14} />, title: 'Link', action: () => {
        const url = prompt('Enter URL:');
        if (url) {
          const el = ref.current;
          const selected = value.slice(el.selectionStart, el.selectionEnd) || 'link text';
          wrap(`<a href="${url}" target="_blank">`, `</a>`);
        }
      }
    },
    {
      icon: <Image size={14} />, title: 'Image', action: () => {
        const url = prompt('Image URL:');
        const alt = url ? prompt('Alt text (optional):') || '' : '';
        if (url) insert(`\n<img src="${url}" alt="${alt}" style="max-width:100%;border-radius:8px;margin:12px 0;" />\n`);
      }
    },
    { icon: <Minus size={14} />, title: 'Divider', action: () => insert('\n<hr />\n') },
  ];

  return (
    <div className={styles.richEditor}>
      <div className={styles.toolbar}>
        {tools.map((t, i) =>
          t.type === 'sep'
            ? <div key={i} className={styles.toolSep} />
            : (
              <button key={i} type="button" className={styles.toolBtn}
                title={t.title} onClick={t.action} tabIndex={-1}>
                {t.icon}
              </button>
            )
        )}
        <div className={styles.toolbarRight}>
          <span className={styles.charCount}>{value.length} chars</span>
        </div>
      </div>
      <textarea
        ref={ref}
        className={styles.richTextarea}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={'<h2>Section Title</h2>\n<p>Your content here...</p>\n<ul>\n  <li>Bullet point</li>\n</ul>'}
        spellCheck={false}
      />
    </div>
  );
}
