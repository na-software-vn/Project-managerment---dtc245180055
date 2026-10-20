module.exports = {
  ensureAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
      return next();
    }
    req.flash('error', 'Vui lòng đăng nhập để truy cập tính năng này.');
    return res.redirect('/auth/login');
  },

  ensureRole(roles = []) {
    return (req, res, next) => {
      if (!req.session || !req.session.user) {
        req.flash('error', 'Vui lòng đăng nhập.');
        return res.redirect('/auth/login');
      }

      const userRole = req.session.user.role;
      if (roles.length && !roles.includes(userRole)) {
        req.flash('error', 'Bạn không có quyền thực hiện hành động này.');
        return res.redirect('back');
      }

      next();
    };
  },

  attachLocals(req, res, next) {
    res.locals.currentUser = req.session ? req.session.user : null;
    res.locals.successMsg = req.flash('success');
    res.locals.errorMsg = req.flash('error');
    res.locals.currentPath = req.path;
    next();
  }
};

