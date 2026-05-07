import express from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM guides WHERE active=true ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { title, content, category, cover_image } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Missing required fields' });
  try {
    const result = await pool.query(
      'INSERT INTO guides (title, content, category, cover_image) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, content, category || 'general', cover_image || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const { title, content, category, active, cover_image } = req.body;
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE guides SET title=$1, content=$2, category=$3, active=$4, cover_image=$5, updated_at=NOW() WHERE id=$6 RETURNING *',
      [title, content, category, active, cover_image || null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM guides WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
