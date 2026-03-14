const router = require('express').Router();
const c = require('../controllers/paymentController');

router.route('/').get(c.getAll);
router.route('/:permitNumber').get(c.getOne).put(c.updateStatus);

module.exports = router;
