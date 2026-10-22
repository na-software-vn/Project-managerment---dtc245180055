const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

async function runInit() {
  console.log('🔄 Initializing PostgreSQL database schema and seed data...');
  const client = new Client({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER || 'pm_user',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'project_manager_db',
  });

  try {
    await client.connect();
    const schemaSql = fs.readFileSync(path.join(__dirname, '../../sql/schema_pg.sql'), 'utf8');
    await client.query(schemaSql);
    console.log('✅ PostgreSQL database schema and seed data loaded successfully!');
  } catch (err) {
    console.error('❌ Error executing PostgreSQL init SQL:', err.message);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  runInit().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = runInit;
