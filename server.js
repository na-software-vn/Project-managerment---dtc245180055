const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');
const client = require('prom-client');
require('dotenv').config();

const { testConnection } = require('./src/config/db');
const { attachLocals } = require('./src/middlewares/auth');

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy (Nginx)
app.set('trust proxy', 1);

// Initialize Prometheus metrics collection
client.collectDefaultMetrics({ prefix: 'nodejs_' });

const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.2, 0.5, 1, 2, 5]
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Middleware to record request metrics
app.use((req, res, next) => {
  if (req.path === '/metrics') return next();
  const start = process.hrtime();
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const duration = diff[0] + diff[1] / 1e9;
    const route = req.baseUrl || req.path || 'unknown';
    httpRequestDurationMicroseconds.labels(req.method, route, res.statusCode).observe(duration);
    httpRequestsTotal.labels(req.method, route, res.statusCode).inc();
  });
  next();
});

// Metrics endpoint for Prometheus scraping
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// Body Parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Static files
app.use(express.static(path.join(__dirname, 'src/public')));

// Template engine setup
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'ejs');

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'project_management_secret_key_2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  })
);

// Flash messages
app.use(flash());

// Global locals middleware (currentUser, flash messages, current path)
app.use(attachLocals);

// Routes mounting
const authRoutes = require('./src/routes/authRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const projectRoutes = require('./src/routes/projectRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const memberRoutes = require('./src/routes/memberRoutes');

app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/projects', projectRoutes);
app.use('/tasks', taskRoutes);
app.use('/members', memberRoutes);

// Root redirect
app.get('/', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  return res.redirect('/auth/login');
});

// 404 Handler
app.use((req, res) => {
  res.status(404).render('layouts/header', { title: '404 - Không tìm thấy trang' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).send(`
    <div style="font-family: sans-serif; padding: 40px; text-align: center;">
      <h2 style="color: #e11d48;">Đã xảy ra lỗi máy chủ nội bộ (500)</h2>
      <p style="color: #64748b;">${err.message || 'Lỗi không xác định'}</p>
      <a href="/dashboard" style="display: inline-block; padding: 10px 20px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">Về Bảng Điều Khiển</a>
    </div>
  `);
});

// Start Server & Check DB Connection
async function startServer() {
  const dbOk = await testConnection();
  if (!dbOk) {
    console.warn('⚠️ Warning: MySQL connection could not be established immediately. Check docker container pm_mysql.');
  }

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Hệ thống Quản lý Dự án đang chạy tại:`);
    console.log(`👉 Web App:    http://localhost:${PORT}`);
    console.log(`👉 phpMyAdmin: http://localhost:8085`);
    console.log(`👉 MySQL:      localhost:3306 (DB: ${process.env.DB_NAME || 'project_manager_db'})`);
    console.log(`=======================================================`);
  });
}

startServer();

