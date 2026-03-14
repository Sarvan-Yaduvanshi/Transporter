const router = require('express').Router();
const c = require('../controllers/loadController');

router.route('/').get(c.getAll).post(c.create);
router.route('/:loadId').get(c.getOne).put(c.update).delete(c.remove);

module.exports = router;
