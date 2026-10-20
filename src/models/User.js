const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, department, avatar, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  async getAll() {
    const [rows] = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, u.department, u.avatar, u.created_at,
             COUNT(DISTINCT pm.project_id) AS total_projects,
             COUNT(DISTINCT t.id) AS total_tasks
      FROM users u
      LEFT JOIN project_members pm ON u.id = pm.user_id
      LEFT JOIN tasks t ON u.id = t.assigned_to
      GROUP BY u.id
      ORDER BY u.id ASC
    `);
    return rows;
  },

  async create({ name, email, password, role = 'member', department = 'Engineering' }) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, department) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, department]
    );
    return result.insertId;
  },

  async update(id, { name, role, department }) {
    await pool.query(
      'UPDATE users SET name = ?, role = ?, department = ? WHERE id = ?',
      [name, role, department, id]
    );
  },

  async updatePassword(id, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
  },

  async delete(id) {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
  },

  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },

  async getUserStats(userId) {
    const [taskStats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) as todo,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'review' THEN 1 ELSE 0 END) as review,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done
      FROM tasks WHERE assigned_to = ?
    `, [userId]);

    return taskStats[0] || { total: 0, todo: 0, in_progress: 0, review: 0, done: 0 };
  }
};

module.exports = User;

