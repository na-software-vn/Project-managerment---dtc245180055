const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runInit() {
  console.log('🔄 Initializing database schema and seed data...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'pm_user',
    password: process.env.DB_PASSWORD || 'pm_password',
    multipleStatements: true,
    charset: 'utf8mb4'
  });

  try {
    await connection.query('SET NAMES utf8mb4;');
    const schemaSql = fs.readFileSync(path.join(__dirname, '../../sql/schema.sql'), 'utf8');
    await connection.query(schemaSql);
    console.log('✅ Database schema and seed data loaded successfully with UTF-8 support!');
  } catch (err) {
    console.error('❌ Error executing init SQL:', err.message);
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  runInit().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = runInit;
