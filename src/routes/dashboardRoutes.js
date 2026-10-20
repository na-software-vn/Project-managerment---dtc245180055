const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { ensureAuthenticated } = require('../middlewares/auth');

router.get('/', ensureAuthenticated, dashboardController.index);

module.exports = router;

