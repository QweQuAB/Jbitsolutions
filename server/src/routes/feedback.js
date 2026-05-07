import express from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { customer_name, message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });
  try {
    const result = await pool.query(
      'INSERT INTO feedback (customer_name, message) VALUES ($1, $2) RETURNING *',
      [customer_name || 'Anonymous', message]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM feedback ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM feedback WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
