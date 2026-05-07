import express from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services WHERE active = true ORDER BY section, id');
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/all', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services ORDER BY section, id');
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { section, name, note, base_price } = req.body;
  if (!section || !name || !base_price) return res.status(400).json({ error: 'Missing required fields' });
  try {
    const result = await pool.query(
      'INSERT INTO services (section, name, note, base_price) VALUES ($1, $2, $3, $4) RETURNING *',
      [section, name, note || '', base_price]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const { section, name, note, base_price, active } = req.body;
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE services SET section=$1, name=$2, note=$3, base_price=$4, active=$5, updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [section, name, note, base_price, active, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE services SET active=false WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
