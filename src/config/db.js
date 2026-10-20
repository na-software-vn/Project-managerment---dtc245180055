const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'pm_user',
  password: process.env.DB_PASSWORD || 'pm_password',
  database: process.env.DB_NAME || 'project_manager_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// Test connection helper
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.query('SET NAMES utf8mb4;');
    console.log('✅ Connected successfully to MySQL database:', process.env.DB_NAME);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MySQL database:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
