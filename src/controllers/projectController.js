const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

const projectController = {
  async index(req, res) {
    try {
      const { status, search } = req.query;
      const currentUser = req.session.user;

      // Nếu là Member: chỉ hiển thị các dự án mà mình được phân công tham gia
      const filterUserId = currentUser.role === 'member' ? currentUser.id : null;

      const projects = await Project.getAll({ status, search, userId: filterUserId });
      const overallStats = await Project.getOverallStats(filterUserId);

      res.render('projects/index', {
        title: 'Quản Lý Dự Án',
        projects,
        currentStatus: status || 'all',
        searchTerm: search || '',
        overallStats
      });
    } catch (error) {
      console.error('Projects index error:', error);
      req.flash('error', 'Lỗi khi tải danh sách dự án.');
      res.redirect('/dashboard');
    }
  },

  async showCreate(req, res) {
    try {
      const users = await User.getAll();
      res.render('projects/create', {
        title: 'Tạo Dự Án Mới',
        users
      });
    } catch (error) {
      console.error('Project create form error:', error);
      res.redirect('/projects');
    }
  },

  async create(req, res) {
    try {
      const { code, name, description, status, priority, start_date, end_date, budget } = req.body;
      const created_by = req.session.user.id;

      if (!code || !name) {
        req.flash('error', 'Mã dự án và tên dự án không được để trống.');
        return res.redirect('/projects/create');
      }

      await Project.create({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description: description ? description.trim() : '',
        status: status || 'planning',
        priority: priority || 'medium',
        start_date: start_date || null,
        end_date: end_date || null,
        budget: budget ? parseFloat(budget) : 0,
        created_by
      });

      req.flash('success', `Đã tạo dự án "${name}" thành công!`);
      res.redirect('/projects');
    } catch (error) {
      console.error('Project create error:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        req.flash('error', 'Mã dự án này đã tồn tại, vui lòng chọn mã khác.');
      } else {
        req.flash('error', 'Lỗi khi tạo dự án: ' + error.message);
      }
      res.redirect('/projects/create');
    }
  },

  async detail(req, res) {
    try {
      const { id } = req.params;
      const project = await Project.getById(id);

      if (!project) {
        req.flash('error', 'Không tìm thấy dự án yêu cầu.');
        return res.redirect('/projects');
      }

      const tasks = await Task.getByProjectId(id);
      const allUsers = await User.getAll();

      // Nếu là Member: kiểm tra quyền truy cập (chỉ được xem dự án mình tham gia)
      const currentUser = req.session.user;
      if (currentUser.role === 'member') {
        const isMember = (project.members || []).some(m => m.user_id === currentUser.id) ||
                         project.created_by === currentUser.id ||
                         (tasks || []).some(t => t.assigned_to === currentUser.id);
        if (!isMember) {
          req.flash('error', 'Bạn không có quyền truy cập vào dự án này (Bạn chưa được phân công vào dự án).');
          return res.redirect('/projects');
        }
      }

      // Separate tasks by status for Kanban Board
      const kanban = {
        todo: tasks.filter(t => t.status === 'todo'),
        in_progress: tasks.filter(t => t.status === 'in_progress'),
        review: tasks.filter(t => t.status === 'review'),
        done: tasks.filter(t => t.status === 'done')
      };

      // Filter out users who are already members
      const memberIds = (project.members || []).map(m => m.user_id);
      const nonMembers = allUsers.filter(u => !memberIds.includes(u.id));

      res.render('projects/detail', {
        title: `Dự án: ${project.name}`,
        project,
        tasks,
        kanban,
        nonMembers,
        members: project.members
      });
    } catch (error) {
      console.error('Project detail error:', error);
      req.flash('error', 'Lỗi khi tải chi tiết dự án.');
      res.redirect('/projects');
    }
  },

  async showEdit(req, res) {
    try {
      const { id } = req.params;
      const project = await Project.getById(id);

      if (!project) {
        req.flash('error', 'Không tìm thấy dự án.');
        return res.redirect('/projects');
      }

      res.render('projects/edit', {
        title: `Chỉnh Sửa Dự Án: ${project.name}`,
        project
      });
    } catch (error) {
      console.error('Project edit form error:', error);
      res.redirect('/projects');
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description, status, priority, start_date, end_date, budget } = req.body;

      if (!name) {
        req.flash('error', 'Tên dự án không được để trống.');
        return res.redirect(`/projects/${id}/edit`);
      }

      await Project.update(id, {
        name: name.trim(),
        description: description ? description.trim() : '',
        status,
        priority,
        start_date: start_date || null,
        end_date: end_date || null,
        budget: budget ? parseFloat(budget) : 0
      });

      req.flash('success', 'Đã cập nhật thông tin dự án thành công!');
      res.redirect(`/projects/${id}`);
    } catch (error) {
      console.error('Project update error:', error);
      req.flash('error', 'Lỗi khi cập nhật dự án.');
      res.redirect(`/projects/${req.params.id}/edit`);
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      await Project.delete(id);
      req.flash('success', 'Đã xóa dự án thành công.');
      res.redirect('/projects');
    } catch (error) {
      console.error('Project delete error:', error);
      req.flash('error', 'Lỗi khi xóa dự án: ' + error.message);
      res.redirect('/projects');
    }
  },

  async addMember(req, res) {
    try {
      const { id } = req.params;
      const { user_id, role_in_project } = req.body;

      if (!user_id) {
        req.flash('error', 'Vui lòng chọn thành viên.');
        return res.redirect(`/projects/${id}`);
      }

      await Project.addMember(id, user_id, role_in_project || 'developer');
      req.flash('success', 'Đã thêm thành viên vào dự án!');
      res.redirect(`/projects/${id}`);
    } catch (error) {
      console.error('Add member error:', error);
      req.flash('error', 'Lỗi khi thêm thành viên.');
      res.redirect(`/projects/${req.params.id}`);
    }
  },

  async removeMember(req, res) {
    try {
      const { id, userId } = req.params;
      await Project.removeMember(id, userId);
      req.flash('success', 'Đã xóa thành viên khỏi dự án.');
      res.redirect(`/projects/${id}`);
    } catch (error) {
      console.error('Remove member error:', error);
      req.flash('error', 'Lỗi khi xóa thành viên.');
      res.redirect(`/projects/${req.params.id}`);
    }
  }
};

module.exports = projectController;

