const { pool } = require('../config/db');

const Task = {
  async getAll({ projectId, status, priority, assignedTo, search } = {}) {
    let sql = `
      SELECT t.*,
             p.name AS project_name, p.code AS project_code,
             u_assign.name AS assignee_name, u_assign.email AS assignee_email,
             u_creator.name AS creator_name,
             (SELECT COUNT(*) FROM task_comments tc WHERE tc.task_id = t.id) AS comments_count
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u_assign ON t.assigned_to = u_assign.id
      JOIN users u_creator ON t.created_by = u_creator.id
      WHERE 1=1
    `;
    const params = [];

    if (projectId) {
      sql += ' AND t.project_id = ?';
      params.push(projectId);
    }

    if (status && status !== 'all') {
      sql += ' AND t.status = ?';
      params.push(status);
    }

    if (priority && priority !== 'all') {
      sql += ' AND t.priority = ?';
      params.push(priority);
    }

    if (assignedTo && assignedTo !== 'all') {
      sql += ' AND t.assigned_to = ?';
      params.push(assignedTo);
    }

    if (search && search.trim() !== '') {
      sql += ' AND (t.title LIKE ? OR t.description LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    sql += ' ORDER BY FIELD(t.priority, "urgent", "high", "medium", "low"), t.due_date ASC, t.id DESC';

    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query(`
      SELECT t.*,
             p.name AS project_name, p.code AS project_code,
             u_assign.name AS assignee_name, u_assign.email AS assignee_email,
             u_creator.name AS creator_name
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u_assign ON t.assigned_to = u_assign.id
      JOIN users u_creator ON t.created_by = u_creator.id
      WHERE t.id = ?
      LIMIT 1
    `, [id]);

    if (!rows[0]) return null;
    const task = rows[0];
    task.comments = await this.getComments(id);
    return task;
  },

  async getByProjectId(projectId) {
    const [rows] = await pool.query(`
      SELECT t.*,
             u_assign.name AS assignee_name,
             u_assign.email AS assignee_email,
             (SELECT COUNT(*) FROM task_comments tc WHERE tc.task_id = t.id) AS comments_count
      FROM tasks t
      LEFT JOIN users u_assign ON t.assigned_to = u_assign.id
      WHERE t.project_id = ?
      ORDER BY FIELD(t.priority, "urgent", "high", "medium", "low"), t.due_date ASC
    `, [projectId]);
    return rows;
  },

  async create({ project_id, title, description, status = 'todo', priority = 'medium', assigned_to, created_by, start_date, due_date, progress = 0 }) {
    const [result] = await pool.query(
      `INSERT INTO tasks (project_id, title, description, status, priority, assigned_to, created_by, start_date, due_date, progress)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [project_id, title, description, status, priority, assigned_to || null, created_by, start_date || null, due_date || null, progress || 0]
    );
    return result.insertId;
  },

  async update(id, { project_id, title, description, status, priority, assigned_to, start_date, due_date, progress }) {
    await pool.query(
      `UPDATE tasks
       SET project_id = COALESCE(?, project_id),
           title = ?,
           description = ?,
           status = ?,
           priority = ?,
           assigned_to = ?,
           start_date = ?,
           due_date = ?,
           progress = ?
       WHERE id = ?`,
      [project_id || null, title, description, status, priority, assigned_to || null, start_date || null, due_date || null, progress || 0, id]
    );
  },

  async updateStatus(id, status) {
    let progressUpdate = '';
    if (status === 'done') {
      progressUpdate = ', progress = 100';
    } else if (status === 'todo') {
      progressUpdate = ', progress = 0';
    }
    await pool.query(
      `UPDATE tasks SET status = ? ${progressUpdate} WHERE id = ?`,
      [status, id]
    );
  },

  async delete(id) {
    await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
  },

  async getComments(taskId) {
    const [rows] = await pool.query(`
      SELECT tc.*, u.name AS user_name, u.avatar
      FROM task_comments tc
      JOIN users u ON tc.user_id = u.id
      WHERE tc.task_id = ?
      ORDER BY tc.created_at ASC
    `, [taskId]);
    return rows;
  },

  async addComment(taskId, userId, content) {
    const [result] = await pool.query(
      'INSERT INTO task_comments (task_id, user_id, content) VALUES (?, ?, ?)',
      [taskId, userId, content]
    );
    return result.insertId;
  },

  async getOverallStats() {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) AS total_tasks,
        SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) AS todo,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress,
        SUM(CASE WHEN status = 'review' THEN 1 ELSE 0 END) AS review,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS done,
        SUM(CASE WHEN due_date < CURDATE() AND status != 'done' THEN 1 ELSE 0 END) AS overdue
      FROM tasks
    `);
    return stats[0] || { total_tasks: 0, todo: 0, in_progress: 0, review: 0, done: 0, overdue: 0 };
  }
};

module.exports = Task;

