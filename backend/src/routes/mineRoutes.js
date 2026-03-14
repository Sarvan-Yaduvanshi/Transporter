const router = require('express').Router();
const c = require('../controllers/mineController');

router.route('/').get(c.getAll).post(c.create);
router.route('/:id').get(c.getOne).put(c.update).delete(c.remove);

module.exports = router;
