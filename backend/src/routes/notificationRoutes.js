const router = require('express').Router();
const c = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// All notification routes require authentication
router.use(protect);

router.get('/', c.getAll);
router.get('/unread-count', c.unreadCount);
router.put('/read-all', c.markAllRead);
router.delete('/clear-all', c.clearAll);
router.put('/:id/read', c.markRead);

module.exports = router;
