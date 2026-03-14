const router = require('express').Router();
const ctrl = require('../controllers/driverController');

router.route('/').get(ctrl.getAll).post(ctrl.create);
router.route('/:licenseNumber').get(ctrl.getOne).put(ctrl.update).delete(ctrl.remove);

module.exports = router;
