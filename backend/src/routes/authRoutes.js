const router = require('express').Router();
const c = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/signup', c.signup);
router.post('/login', c.login);
router.post('/google', c.googleAuth);
router.post('/facebook', c.facebookAuth);
router.post('/send-otp', c.sendOtp);
router.post('/verify-otp', c.verifyOtp);
router.get('/me', protect, c.getMe);
router.put('/profile', protect, c.updateProfile);

module.exports = router;
