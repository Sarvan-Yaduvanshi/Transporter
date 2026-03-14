const router = require('express').Router();
const c = require('../controllers/tagController');

router.route('/').get(c.getAll).post(c.create);
router.route('/:id').put(c.update).delete(c.remove);

module.exports = router;
