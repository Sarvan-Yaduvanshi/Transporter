const router = require('express').Router();
const c = require('../controllers/permitController');

router.route('/').get(c.getAll).post(c.create);
router.get('/active', c.getActive);
router.route('/:permitNumber').get(c.getOne).put(c.update).delete(c.remove);

module.exports = router;
