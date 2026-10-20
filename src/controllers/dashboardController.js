const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

const dashboardController = {
  async index(req, res) {
    try {
      const currentUserId = req.session.user.id;

      // Overall stats
      const projectStats = await Project.getOverallStats();
      const taskStats = await Task.getOverallStats();
      const allUsers = await User.getAll();

      // Recent projects
      const recentProjects = await Project.getAll();

      // My assigned tasks
      const myTasks = await Task.getAll({ assignedTo: currentUserId });

      // Recent general tasks
      const allTasks = await Task.getAll();

      res.render('dashboard/index', {
        title: 'Bảng Điều Khiển - Tổng Quan Dự Án',
        projectStats,
        taskStats,
        totalMembers: allUsers.length,
        recentProjects: recentProjects.slice(0, 5),
        myTasks: myTasks.slice(0, 6),
        recentTasks: allTasks.slice(0, 6)
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      req.flash('error', 'Không thể tải dữ liệu bảng điều khiển.');
      res.render('dashboard/index', {
        title: 'Bảng Điều Khiển',
        projectStats: {},
        taskStats: {},
        totalMembers: 0,
        recentProjects: [],
        myTasks: [],
        recentTasks: []
      });
    }
  }
};

module.exports = dashboardController;

