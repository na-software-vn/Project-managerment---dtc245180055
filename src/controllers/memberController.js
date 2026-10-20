const User = require('../models/User');

const memberController = {
  async index(req, res) {
    try {
      const members = await User.getAll();
      res.render('members/index', {
        title: 'Quản Lý Thành Viên',
        members
      });
    } catch (error) {
      console.error('Member index error:', error);
      req.flash('error', 'Lỗi khi tải danh sách thành viên.');
      res.redirect('/dashboard');
    }
  },

  async create(req, res) {
    try {
      const { name, email, password, role, department } = req.body;

      if (!name || !email || !password) {
        req.flash('error', 'Họ tên, email và mật khẩu là bắt buộc.');
        return res.redirect('/members');
      }

      const existing = await User.findByEmail(email.trim());
      if (existing) {
        req.flash('error', 'Email này đã tồn tại trong hệ thống.');
        return res.redirect('/members');
      }

      await User.create({
        name: name.trim(),
        email: email.trim(),
        password,
        role: role || 'member',
        department: department || 'Engineering'
      });

      req.flash('success', `Đã thêm thành viên "${name}" thành công!`);
      res.redirect('/members');
    } catch (error) {
      console.error('Member create error:', error);
      req.flash('error', 'Lỗi khi thêm thành viên: ' + error.message);
      res.redirect('/members');
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, role, department } = req.body;

      await User.update(id, { name: name.trim(), role, department });
      req.flash('success', 'Đã cập nhật thông tin thành viên!');
      res.redirect('/members');
    } catch (error) {
      console.error('Member update error:', error);
      req.flash('error', 'Lỗi khi cập nhật thành viên.');
      res.redirect('/members');
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      if (parseInt(id, 10) === req.session.user.id) {
        req.flash('error', 'Bạn không thể tự xóa tài khoản của chính mình.');
        return res.redirect('/members');
      }

      await User.delete(id);
      req.flash('success', 'Đã xóa tài khoản thành viên thành công.');
      res.redirect('/members');
    } catch (error) {
      console.error('Member delete error:', error);
      req.flash('error', 'Lỗi khi xóa thành viên: ' + error.message);
      res.redirect('/members');
    }
  }
};

module.exports = memberController;

