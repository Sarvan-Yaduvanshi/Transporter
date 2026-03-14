const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.use('/dashboard', require('./dashboardRoutes'));
router.use('/trucks', require('./truckRoutes'));
router.use('/mines', require('./mineRoutes'));
router.use('/permits', require('./permitRoutes'));
router.use('/loads', require('./loadRoutes'));
router.use('/tags', require('./tagRoutes'));
router.use('/flags', require('./flagRoutes'));
router.use('/payments', require('./paymentRoutes'));
router.use('/drivers', require('./driverRoutes'));
router.use('/documents', require('./documentRoutes'));
router.use('/notifications', require('./notificationRoutes'));

module.exports = router;
