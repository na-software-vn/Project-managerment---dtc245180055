const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { ensureAuthenticated } = require('../middlewares/auth');

router.use(ensureAuthenticated);

router.get('/', taskController.index);
router.get('/create', taskController.showCreate);
router.post('/create', taskController.create);

router.get('/:id', taskController.detail);
router.get('/:id/edit', taskController.showEdit);
router.post('/:id/edit', taskController.update);
router.post('/:id/status', taskController.updateStatus);
router.post('/:id/delete', taskController.delete);

router.post('/:id/comments', taskController.addComment);

module.exports = router;

