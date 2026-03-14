const router = require('express').Router();
const c = require('../controllers/truckController');

router.route('/').get(c.getAll).post(c.create);
router.get('/approved', c.getApproved);
router.route('/:truckNumber').get(c.getOne).put(c.update).delete(c.remove);

module.exports = router;
