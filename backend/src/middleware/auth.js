const admin = require('../config/firebaseAdmin');
const { User } = require('../models');
const asyncHandler = require('./asyncHandler');

/**
 * Protect Middleware — Verifies Firebase ID Token
 */
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized — No token provided' });
    }

    let decodedToken;
    try {
        // 1. Verify the token with Firebase
        decodedToken = await admin.auth().verifyIdToken(token);
    } catch (error) {
        console.error('Firebase Auth Error:', error);
        return res.status(401).json({ success: false, message: 'Token is invalid or expired' });
    }

    // 2. Find the user in MongoDB using Firebase UID first, then email/phone
    let user = null;
    if (decodedToken.uid) {
        user = await User.findOne({ firebaseUid: decodedToken.uid }).select('-password');
    }

    if (!user && decodedToken.email) {
        user = await User.findOne({ email: decodedToken.email }).select('-password');
    }

    if (!user && decodedToken.phone_number) {
        const cleanedPhone = decodedToken.phone_number.replace(/[\s\-()]/g, '');
        user = await User.findOne({ phone: cleanedPhone }).select('-password');
    }

    if (!user) {
        return res.status(401).json({ success: false, message: 'User does not exist in local database' });
    }

    if (!user.firebaseUid && decodedToken.uid) {
        user.firebaseUid = decodedToken.uid;
        await user.save();
    }

    req.user = user;
    next();
});
