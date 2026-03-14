const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'transporter-ops-secret-dev';

/**
 * Generate a signed JWT for a given user id.
 */
const signToken = (userId) =>
    jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });

/**
 * Express middleware — verifies the Bearer token and attaches `req.user`.
 */
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res
            .status(401)
            .json({ success: false, message: 'Not authorised — no token' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
            return res
                .status(401)
                .json({ success: false, message: 'User no longer exists' });
        }
        next();
    } catch (err) {
        return res
            .status(401)
            .json({ success: false, message: 'Token invalid or expired' });
    }
};

module.exports = { signToken, protect, JWT_SECRET };
