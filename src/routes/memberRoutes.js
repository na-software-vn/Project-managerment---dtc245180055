const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const { ensureAuthenticated, ensureRole } = require('../middlewares/auth');

router.use(ensureAuthenticated);

router.get('/', ensureRole(['admin', 'manager']), memberController.index);
router.post('/create', ensureRole(['admin', 'manager']), memberController.create);
router.post('/:id/edit', ensureRole(['admin']), memberController.update);
router.post('/:id/delete', ensureRole(['admin']), memberController.delete);

module.exports = router;
