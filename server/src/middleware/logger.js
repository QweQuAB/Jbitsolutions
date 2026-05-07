import pool from '../db.js';

export function trafficLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', async () => {
    const ms = Date.now() - start;
    try {
      await pool.query(
        `INSERT INTO traffic_logs (method, path, status_code, ip, user_agent, response_time_ms)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          req.method,
          req.path,
          res.statusCode,
          req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown',
          req.headers['user-agent'] || '',
          ms
        ]
      );
    } catch (e) {
      // silent fail on logging
    }
  });
  next();
}
