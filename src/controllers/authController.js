const User = require('../models/User');

const authController = {
  showLogin(req, res) {
    if (req.session && req.session.user) {
      return res.redirect('/dashboard');
    }
    res.render('auth/login', { title: 'Đăng nhập - Quản lý Dự án' });
  },

  async login(req, res) {
    const { email, password } = req.body;
    try {
      if (!email || !password) {
        req.flash('error', 'Vui lòng nhập đầy đủ email và mật khẩu.');
        return res.redirect('/auth/login');
      }

      const user = await User.findByEmail(email.trim());
      if (!user) {
        req.flash('error', 'Email hoặc mật khẩu không chính xác.');
        return res.redirect('/auth/login');
      }

      const isMatch = await User.verifyPassword(password, user.password);
      if (!isMatch) {
        req.flash('error', 'Email hoặc mật khẩu không chính xác.');
        return res.redirect('/auth/login');
      }

      // Save user in session (excluding password)
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.avatar
      };

      req.flash('success', `Chào mừng ${user.name} đã quay trở lại!`);
      res.redirect('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      req.flash('error', 'Đã xảy ra lỗi máy chủ, vui lòng thử lại sau.');
      res.redirect('/auth/login');
    }
  },

  showRegister(req, res) {
    if (req.session && req.session.user) {
      return res.redirect('/dashboard');
    }
    res.render('auth/register', { title: 'Đăng ký Tài khoản' });
  },

  async register(req, res) {
    const { name, email, password, confirm_password, department, role } = req.body;
    try {
      if (!name || !email || !password) {
        req.flash('error', 'Vui lòng điền đầy đủ các thông tin bắt buộc.');
        return res.redirect('/auth/register');
      }

      if (password !== confirm_password) {
        req.flash('error', 'Mật khẩu xác nhận không khớp.');
        return res.redirect('/auth/register');
      }

      if (password.length < 6) {
        req.flash('error', 'Mật khẩu phải chứa ít nhất 6 ký tự.');
        return res.redirect('/auth/register');
      }

      const existingUser = await User.findByEmail(email.trim());
      if (existingUser) {
        req.flash('error', 'Email này đã được sử dụng. Vui lòng chọn email khác.');
        return res.redirect('/auth/register');
      }

      const newUserId = await User.create({
        name: name.trim(),
        email: email.trim(),
        password,
        role: role || 'member',
        department: department || 'Phát Triển'
      });

      req.flash('success', 'Đăng ký thành công! Bạn có thể đăng nhập ngay.');
      res.redirect('/auth/login');
    } catch (error) {
      console.error('Register error:', error);
      req.flash('error', 'Đã xảy ra lỗi trong quá trình tạo tài khoản.');
      res.redirect('/auth/register');
    }
  },

  logout(req, res) {
    req.session.destroy(() => {
      res.redirect('/auth/login');
    });
  }
};

module.exports = authController;

