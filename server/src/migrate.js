import pool from './db.js';

export async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS interactions (
        id SERIAL PRIMARY KEY,
        type VARCHAR(64) NOT NULL,
        page VARCHAR(255) NOT NULL,
        detail TEXT,
        ip VARCHAR(100),
        user_agent TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_interactions_created ON interactions(created_at DESC)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_interactions_ip ON interactions(ip)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_interactions_type ON interactions(type)`);
    console.log('[migrate] interactions table ready');
  } finally {
    client.release();
  }
}
