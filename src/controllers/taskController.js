const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

const taskController = {
  async index(req, res) {
    try {
      const { projectId, status, priority, assignedTo, search } = req.query;
      const tasks = await Task.getAll({ projectId, status, priority, assignedTo, search });
      const projects = await Project.getAll();
      const users = await User.getAll();
      const stats = await Task.getOverallStats();

      res.render('tasks/index', {
        title: 'Quản Lý Công Việc (Tasks)',
        tasks,
        projects,
        users,
        stats,
        filters: {
          projectId: projectId || '',
          status: status || 'all',
          priority: priority || 'all',
          assignedTo: assignedTo || 'all',
          search: search || ''
        }
      });
    } catch (error) {
      console.error('Task index error:', error);
      req.flash('error', 'Lỗi khi tải danh sách công việc.');
      res.redirect('/dashboard');
    }
  },

  async showCreate(req, res) {
    try {
      const currentUser = req.session.user;
      if (currentUser.role === 'member') {
        req.flash('error', 'Chỉ Quản lý (Manager) hoặc Quản trị viên (Admin) mới có quyền tạo công việc từ trang này.');
        return res.redirect('/tasks');
      }

      const { projectId } = req.query;
      const projects = await Project.getAll();
      const users = await User.getAll();

      res.render('tasks/create', {
        title: 'Tạo Công Việc Mới',
        projects,
        users,
        defaultProjectId: projectId || ''
      });
    } catch (error) {
      console.error('Task create form error:', error);
      res.redirect('/tasks');
    }
  },

  async create(req, res) {
    try {
      const currentUser = req.session.user;
      const { project_id, title, description, status, priority, assigned_to, start_date, due_date, progress, redirect_to } = req.body;
      const created_by = currentUser.id;

      if (!project_id || !title) {
        req.flash('error', 'Vui lòng chọn dự án và nhập tiêu đề công việc.');
        return res.redirect(redirect_to || '/tasks/create');
      }

      // If user is member, ensure they are at least part of the project
      if (currentUser.role === 'member') {
        const project = await Project.getById(project_id);
        const isMember = project && project.members && project.members.some(m => m.user_id === currentUser.id);
        if (!isMember) {
          req.flash('error', 'Bạn không phải là thành viên của dự án này nên không thể thêm công việc.');
          return res.redirect(redirect_to || '/tasks');
        }
      }

      await Task.create({
        project_id: parseInt(project_id, 10),
        title: title.trim(),
        description: description ? description.trim() : '',
        status: status || 'todo',
        priority: priority || 'medium',
        assigned_to: assigned_to ? parseInt(assigned_to, 10) : null,
        created_by,
        start_date: start_date || null,
        due_date: due_date || null,
        progress: progress ? parseInt(progress, 10) : 0
      });

      req.flash('success', `Đã thêm công việc "${title}" thành công!`);

      if (redirect_to) {
        return res.redirect(redirect_to);
      }
      res.redirect(`/projects/${project_id}`);
    } catch (error) {
      console.error('Task create error:', error);
      req.flash('error', 'Lỗi khi tạo công việc: ' + error.message);
      res.redirect('/tasks/create');
    }
  },

  async detail(req, res) {
    try {
      const { id } = req.params;
      const task = await Task.getById(id);

      if (!task) {
        req.flash('error', 'Không tìm thấy công việc.');
        return res.redirect('/tasks');
      }

      const users = await User.getAll();

      res.render('tasks/detail', {
        title: `Công việc: ${task.title}`,
        task,
        users
      });
    } catch (error) {
      console.error('Task detail error:', error);
      req.flash('error', 'Lỗi khi xem chi tiết công việc.');
      res.redirect('/tasks');
    }
  },

  async showEdit(req, res) {
    try {
      const { id } = req.params;
      const task = await Task.getById(id);

      if (!task) {
        req.flash('error', 'Không tìm thấy công việc.');
        return res.redirect('/tasks');
      }

      const currentUser = req.session.user;
      const canEdit = currentUser.role === 'admin' || currentUser.role === 'manager' || task.created_by === currentUser.id;
      if (!canEdit) {
        req.flash('error', 'Bạn không có quyền chỉnh sửa thông tin công việc này.');
        return res.redirect(`/tasks/${id}`);
      }

      const projects = await Project.getAll();
      const users = await User.getAll();

      res.render('tasks/edit', {
        title: `Chỉnh Sửa: ${task.title}`,
        task,
        projects,
        users
      });
    } catch (error) {
      console.error('Task edit form error:', error);
      res.redirect('/tasks');
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { project_id, title, description, status, priority, assigned_to, start_date, due_date, progress, redirect_to } = req.body;
      const currentUser = req.session.user;

      const task = await Task.getById(id);
      if (!task) {
        req.flash('error', 'Không tìm thấy công việc.');
        return res.redirect('/tasks');
      }

      // Check permission
      const canEdit = currentUser.role === 'admin' || currentUser.role === 'manager' || task.created_by === currentUser.id;
      if (!canEdit) {
        req.flash('error', 'Bạn không có quyền chỉnh sửa công việc này.');
        return res.redirect(redirect_to || `/tasks/${id}`);
      }

      if (!title) {
        req.flash('error', 'Tiêu đề công việc không được để trống.');
        return res.redirect(`/tasks/${id}/edit`);
      }

      await Task.update(id, {
        project_id: project_id ? parseInt(project_id, 10) : null,
        title: title.trim(),
        description: description ? description.trim() : '',
        status,
        priority,
        assigned_to: assigned_to ? parseInt(assigned_to, 10) : null,
        start_date: start_date || null,
        due_date: due_date || null,
        progress: progress ? parseInt(progress, 10) : 0
      });

      req.flash('success', 'Đã cập nhật công việc thành công!');

      if (redirect_to) {
        return res.redirect(redirect_to);
      }
      res.redirect(`/tasks/${id}`);
    } catch (error) {
      console.error('Task update error:', error);
      req.flash('error', 'Lỗi khi cập nhật công việc.');
      res.redirect(`/tasks/${req.params.id}/edit`);
    }
  },

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, redirect_to } = req.body;
      const currentUser = req.session.user;

      const task = await Task.getById(id);
      if (!task) {
        req.flash('error', 'Không tìm thấy công việc.');
        return res.redirect(redirect_to || '/tasks');
      }

      // PERMISSION CHECK: Admin, Manager, Assignee, or Creator
      const isAllowed = 
        currentUser.role === 'admin' || 
        currentUser.role === 'manager' || 
        task.assigned_to === currentUser.id || 
        task.created_by === currentUser.id;

      if (!isAllowed) {
        if (req.xhr || req.headers.accept?.includes('application/json')) {
          return res.status(403).json({ success: false, error: 'Bạn không có quyền thay đổi trạng thái công việc này.' });
        }
        req.flash('error', 'Bạn chỉ có quyền cập nhật trạng thái của công việc được phân công cho mình.');
        return res.redirect(redirect_to || 'back');
      }

      await Task.updateStatus(id, status);

      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.json({ success: true, message: 'Đã cập nhật trạng thái!' });
      }

      req.flash('success', 'Đã cập nhật trạng thái công việc!');
      res.redirect(redirect_to || 'back');
    } catch (error) {
      console.error('Update status error:', error);
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(500).json({ success: false, error: error.message });
      }
      req.flash('error', 'Lỗi khi cập nhật trạng thái.');
      res.redirect('back');
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const { redirect_to } = req.body;
      const currentUser = req.session.user;

      const task = await Task.getById(id);
      if (!task) {
        req.flash('error', 'Không tìm thấy công việc.');
        return res.redirect(redirect_to || '/tasks');
      }

      // Check permission: Admin, Manager, or Creator
      const canDelete = currentUser.role === 'admin' || currentUser.role === 'manager' || task.created_by === currentUser.id;
      if (!canDelete) {
        req.flash('error', 'Bạn không có quyền xóa công việc này.');
        return res.redirect(redirect_to || '/tasks');
      }

      await Task.delete(id);
      req.flash('success', 'Đã xóa công việc thành công.');
      res.redirect(redirect_to || '/tasks');
    } catch (error) {
      console.error('Task delete error:', error);
      req.flash('error', 'Lỗi khi xóa công việc.');
      res.redirect('/tasks');
    }
  },

  async addComment(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.session.user.id;

      if (!content || content.trim() === '') {
        req.flash('error', 'Nội dung bình luận không được để trống.');
        return res.redirect(`/tasks/${id}`);
      }

      await Task.addComment(id, userId, content.trim());
      req.flash('success', 'Đã thêm bình luận.');
      res.redirect(`/tasks/${id}`);
    } catch (error) {
      console.error('Add comment error:', error);
      req.flash('error', 'Lỗi khi thêm bình luận.');
      res.redirect(`/tasks/${req.params.id}`);
    }
  }
};

module.exports = taskController;
