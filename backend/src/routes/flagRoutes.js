const router = require('express').Router();
const c = require('../controllers/flagController');
const { protect } = require('../middleware/auth');

router.route('/').get(c.getAll).post(protect, c.create);
router.route('/:id').put(protect, c.update).delete(protect, c.remove);

module.exports = router;
