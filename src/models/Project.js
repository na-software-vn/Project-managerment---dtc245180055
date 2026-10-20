const { pool } = require('../config/db');

const Project = {
  async getAll({ status, search } = {}) {
    let sql = `
      SELECT p.*, 
             u.name AS creator_name,
             (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id) AS total_members,
             (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) AS total_tasks,
             (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'done') AS completed_tasks
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND p.status = ?';
      params.push(status);
    }

    if (search && search.trim() !== '') {
      sql += ' AND (p.name LIKE ? OR p.code LIKE ? OR p.description LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY p.id DESC';

    const [rows] = await pool.query(sql, params);
    return rows.map(project => {
      const total = project.total_tasks || 0;
      const completed = project.completed_tasks || 0;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        ...project,
        progress
      };
    });
  },

  async getById(id) {
    const [rows] = await pool.query(`
      SELECT p.*, u.name AS creator_name, u.email AS creator_email
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.id = ?
      LIMIT 1
    `, [id]);

    if (!rows[0]) return null;
    const project = rows[0];

    // Get members
    const members = await this.getMembers(id);
    project.members = members;

    // Get task statistics
    const [taskStats] = await pool.query(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) AS todo,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress,
        SUM(CASE WHEN status = 'review' THEN 1 ELSE 0 END) AS review,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS done
      FROM tasks
      WHERE project_id = ?
    `, [id]);

    const stats = taskStats[0] || { total: 0, todo: 0, in_progress: 0, review: 0, done: 0 };
    project.taskStats = stats;
    project.progress = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

    return project;
  },

  async create({ code, name, description, status = 'planning', priority = 'medium', start_date, end_date, budget = 0, created_by }) {
    const [result] = await pool.query(
      `INSERT INTO projects (code, name, description, status, priority, start_date, end_date, budget, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, name, description, status, priority, start_date || null, end_date || null, budget, created_by]
    );

    const projectId = result.insertId;
    // Automatically add creator as leader
    await this.addMember(projectId, created_by, 'leader');
    return projectId;
  },

  async update(id, { name, description, status, priority, start_date, end_date, budget }) {
    await pool.query(
      `UPDATE projects 
       SET name = ?, description = ?, status = ?, priority = ?, start_date = ?, end_date = ?, budget = ?
       WHERE id = ?`,
      [name, description, status, priority, start_date || null, end_date || null, budget, id]
    );
  },

  async delete(id) {
    await pool.query('DELETE FROM projects WHERE id = ?', [id]);
  },

  async getMembers(projectId) {
    const [rows] = await pool.query(`
      SELECT pm.id as membership_id, pm.role_in_project, pm.joined_at,
             u.id as user_id, u.name, u.email, u.role as system_role, u.department, u.avatar
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = ?
      ORDER BY FIELD(pm.role_in_project, 'leader', 'developer', 'tester', 'designer', 'viewer'), u.name ASC
    `, [projectId]);
    return rows;
  },

  async addMember(projectId, userId, role = 'developer') {
    await pool.query(`
      INSERT INTO project_members (project_id, user_id, role_in_project)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE role_in_project = VALUES(role_in_project)
    `, [projectId, userId, role]);
  },

  async removeMember(projectId, userId) {
    await pool.query('DELETE FROM project_members WHERE project_id = ? AND user_id = ?', [projectId, userId]);
  },

  async getOverallStats() {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) AS total_projects,
        SUM(CASE WHEN status = 'planning' THEN 1 ELSE 0 END) AS planning,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN status = 'on_hold' THEN 1 ELSE 0 END) AS on_hold
      FROM projects
    `);
    return stats[0] || { total_projects: 0, planning: 0, in_progress: 0, completed: 0, on_hold: 0 };
  }
};

module.exports = Project;

