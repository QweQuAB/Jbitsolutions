import express from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// ─── Public: record a client-side interaction ────────────────────────────────
router.post('/interaction', async (req, res) => {
  const { type, page, detail } = req.body;
  if (!type || !page) return res.status(400).json({ error: 'type and page required' });
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim()
    || req.socket.remoteAddress
    || 'unknown';
  const ua = req.headers['user-agent'] || '';
  try {
    await pool.query(
      `INSERT INTO interactions (type, page, detail, ip, user_agent) VALUES ($1,$2,$3,$4,$5)`,
      [type, page, detail || null, ip, ua]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'log failed' });
  }
});

// ─── Admin: dashboard overview ────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
  try {
    const [services, bookings, feedback, traffic, recentBookings, topPaths, bookingsByStatus, dailyTraffic] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM services WHERE active=true'),
      pool.query('SELECT COUNT(*) FROM bookings'),
      pool.query('SELECT COUNT(*) FROM feedback'),
      pool.query(`SELECT COUNT(*) FROM traffic_logs WHERE created_at > NOW() - INTERVAL '24 hours'`),
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

// ─── Admin: rich visitor analytics ───────────────────────────────────────────
router.get('/analytics', requireAuth, async (req, res) => {
  try {
    const mem = process.memoryUsage();
    const uptimeSecs = Math.floor(process.uptime());

    const [
      uniqueVisitorsToday,
      uniqueVisitorsTotal,
      pageViewsToday,
      pageViewsTotal,
      topPages,
      topInteractions,
      hourlyTraffic,
      avgResponseTime,
      recentInteractions,
      mobileVsDesktop,
      requestsPerMinute
    ] = await Promise.all([
      pool.query(`SELECT COUNT(DISTINCT ip) as count FROM interactions WHERE created_at > NOW() - INTERVAL '24 hours'`),
      pool.query(`SELECT COUNT(DISTINCT ip) as count FROM interactions`),
      pool.query(`SELECT COUNT(*) as count FROM interactions WHERE type='pageview' AND created_at > NOW() - INTERVAL '24 hours'`),
      pool.query(`SELECT COUNT(*) as count FROM interactions WHERE type='pageview'`),
      pool.query(`
        SELECT page, COUNT(*) as views
        FROM interactions WHERE type='pageview'
        GROUP BY page ORDER BY views DESC LIMIT 10
      `),
      pool.query(`
        SELECT type, detail, COUNT(*) as count
        FROM interactions WHERE type != 'pageview'
        GROUP BY type, detail ORDER BY count DESC LIMIT 15
      `),
      pool.query(`
        SELECT DATE_TRUNC('hour', created_at) as hour, COUNT(*) as hits
        FROM traffic_logs
        WHERE created_at > NOW() - INTERVAL '24 hours'
        GROUP BY hour ORDER BY hour
      `),
      pool.query(`
        SELECT ROUND(AVG(response_time_ms)::numeric, 1) as avg_ms,
               MAX(response_time_ms) as max_ms
        FROM traffic_logs
        WHERE created_at > NOW() - INTERVAL '1 hour'
      `),
      pool.query(`
        SELECT type, page, detail, ip, created_at
        FROM interactions ORDER BY created_at DESC LIMIT 20
      `),
      pool.query(`
        SELECT
          SUM(CASE WHEN user_agent ILIKE '%mobile%' OR user_agent ILIKE '%android%' OR user_agent ILIKE '%iphone%' THEN 1 ELSE 0 END) as mobile,
          SUM(CASE WHEN user_agent NOT ILIKE '%mobile%' AND user_agent NOT ILIKE '%android%' AND user_agent NOT ILIKE '%iphone%' THEN 1 ELSE 0 END) as desktop
        FROM interactions
        WHERE created_at > NOW() - INTERVAL '24 hours'
      `),
      pool.query(`
        SELECT COUNT(*) as count FROM traffic_logs
        WHERE created_at > NOW() - INTERVAL '1 minute'
      `)
    ]);

    res.json({
      visitors: {
        unique_today: parseInt(uniqueVisitorsToday.rows[0].count),
        unique_total: parseInt(uniqueVisitorsTotal.rows[0].count),
        page_views_today: parseInt(pageViewsToday.rows[0].count),
        page_views_total: parseInt(pageViewsTotal.rows[0].count),
      },
      resources: {
        memory_rss_mb: Math.round(mem.rss / 1024 / 1024),
        memory_heap_used_mb: Math.round(mem.heapUsed / 1024 / 1024),
        memory_heap_total_mb: Math.round(mem.heapTotal / 1024 / 1024),
        uptime_seconds: uptimeSecs,
        avg_response_ms: parseFloat(avgResponseTime.rows[0]?.avg_ms || 0),
        max_response_ms: parseInt(avgResponseTime.rows[0]?.max_ms || 0),
        requests_per_minute: parseInt(requestsPerMinute.rows[0].count),
      },
      topPages: topPages.rows,
      topInteractions: topInteractions.rows,
      hourlyTraffic: hourlyTraffic.rows,
      recentInteractions: recentInteractions.rows,
      deviceSplit: mobileVsDesktop.rows[0] || { mobile: 0, desktop: 0 },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Admin: raw logs ──────────────────────────────────────────────────────────
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
