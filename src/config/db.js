const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USER || 'pm_user',
  password: process.env.DB_PASSWORD || 'pm_password',
  database: process.env.DB_NAME || 'project_manager_db',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Smart query helper to support mysql-like [rows, result] and '?' placeholders
async function query(sql, params = []) {
  // Convert '?' placeholders to '$1, $2, $3...'
  let paramIndex = 1;
  let pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);

  // Replace CURDATE() with CURRENT_DATE
  pgSql = pgSql.replace(/CURDATE\(\)/gi, 'CURRENT_DATE');

  // If it's an INSERT statement and doesn't already have RETURNING id, append RETURNING id
  const isInsert = /^\s*INSERT\s+INTO/i.test(pgSql);
  if (isInsert && !/RETURNING/i.test(pgSql)) {
    pgSql += ' RETURNING id';
  }

  const res = await pool.query(pgSql, params);
  const result = {
    insertId: (res.rows && res.rows[0] && res.rows[0].id) ? res.rows[0].id : null,
    rowCount: res.rowCount,
    affectedRows: res.rowCount
  };

  // Convert string counts/sums to numbers
  const rows = res.rows.map(row => {
    const formatted = { ...row };
    for (const key of Object.keys(formatted)) {
      if (typeof formatted[key] === 'string' && /^(total|completed|todo|in_progress|review|done|overdue|progress|budget|total_tasks|total_projects|comments_count)/i.test(key)) {
        const num = Number(formatted[key]);
        if (!isNaN(num)) formatted[key] = num;
      }
    }
    return formatted;
  });

  return [rows, result];
}

// Test connection helper
async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    console.log('✅ Connected successfully to PostgreSQL database:', process.env.DB_NAME);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL database:', error.message);
    return false;
  }
}

module.exports = {
  pool: {
    query,
    originalPool: pool
  },
  testConnection
};
