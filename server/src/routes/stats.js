import express from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const [services, bookings, feedback, traffic, recentBookings, topPaths, bookingsByStatus, dailyTraffic] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM services WHERE active=true'),
      pool.query('SELECT COUNT(*) FROM bookings'),
      pool.query('SELECT COUNT(*) FROM feedback'),
      pool.query('SELECT COUNT(*) FROM traffic_logs WHERE created_at > NOW() - INTERVAL \'24 hours\''),
      pool.query('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5'),
      pool.query(`SELECT path, COUNT(*) as hits FROM traffic_logs WHERE path NOT LIKE '%/api/logs%' GROUP BY path ORDER BY hits DESC LIMIT 10`),
      pool.query(`SELECT status, COUNT(*) as count FROM bookings GROUP BY status`),
      pool.query(`
        SELECT DATE_TRUNC('hour', created_at) as hour, COUNT(*) as hits
        FROM traffic_logs
        WHERE created_at > NOW() - INTERVAL '24 hours'
        GROUP BY hour ORDER BY hour
      `)
    ]);

    res.json({
      totals: {
        services: parseInt(services.rows[0].count),
        bookings: parseInt(bookings.rows[0].count),
        feedback: parseInt(feedback.rows[0].count),
        traffic_24h: parseInt(traffic.rows[0].count)
      },
      recentBookings: recentBookings.rows,
      topPaths: topPaths.rows,
      bookingsByStatus: bookingsByStatus.rows,
      dailyTraffic: dailyTraffic.rows
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/logs', requireAuth, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 100, 500);
  const offset = parseInt(req.query.offset) || 0;
  try {
    const result = await pool.query(
      'SELECT * FROM traffic_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    const total = await pool.query('SELECT COUNT(*) FROM traffic_logs');
    res.json({ logs: result.rows, total: parseInt(total.rows[0].count) });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
