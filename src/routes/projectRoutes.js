const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { ensureAuthenticated, ensureRole } = require('../middlewares/auth');

router.use(ensureAuthenticated);

router.get('/', projectController.index);
router.get('/create', ensureRole(['admin', 'manager']), projectController.showCreate);
router.post('/create', ensureRole(['admin', 'manager']), projectController.create);

router.get('/:id', projectController.detail);
router.get('/:id/edit', ensureRole(['admin', 'manager']), projectController.showEdit);
router.post('/:id/edit', ensureRole(['admin', 'manager']), projectController.update);
router.post('/:id/delete', ensureRole(['admin']), projectController.delete);

// Member management inside project: Admin and Manager only
router.post('/:id/members', ensureRole(['admin', 'manager']), projectController.addMember);
router.post('/:id/members/:userId/delete', ensureRole(['admin', 'manager']), projectController.removeMember);

module.exports = router;
