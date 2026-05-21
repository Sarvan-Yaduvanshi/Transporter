const asyncHandler = require('../middleware/asyncHandler');
const { User, Otp } = require('../models');
const admin = require('../config/firebaseAdmin'); // make sure this is initialised

/* ── helper: build user response ───────────────── */
const userResponse = (user, statusCode, res) => {
    res.status(statusCode).json({
        success: true,
        data: {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone || null,
                nickname: user.nickname || '',
                role: user.role,
                avatar: user.avatar,
                banner: user.banner || '',
                provider: user.provider,
                createdAt: user.createdAt,
            },
        },
    });
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_RE = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
const PHONE_RE = /^\+?[1-9]\d{6,14}$/;

// ────────────────────────────────────────────────────
// @desc   Register a new user (default role = Driver)
// @route  POST /api/auth/signup
// ────────────────────────────────────────────────────
exports.signup = asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please provide name, email and password');
    }

    if (name.trim().length < 2 || name.trim().length > 50) {
        res.status(400);
        throw new Error('Name must be between 2 and 50 characters');
    }

    if (!EMAIL_RE.test(email)) {
        res.status(400);
        throw new Error('Please provide a valid email address');
    }

    if (password.length < 6) {
        res.status(400);
        throw new Error('Password must be at least 6 characters');
    }

    if (!PASSWORD_RE.test(password)) {
        res.status(400);
        throw new Error('Password must contain at least one uppercase letter and one number');
    }

    const exists = await User.findOne({ email });
    if (exists) {
        res.status(409);
        throw new Error('An account with this email already exists');
    }

    if (phone) {
        const cleanedPhone = phone.replace(/[\s\-()]/g, '');
        if (!PHONE_RE.test(cleanedPhone)) {
            res.status(400);
            throw new Error('Please provide a valid phone number');
        }
        const phoneExists = await User.findOne({ phone: cleanedPhone });
        if (phoneExists) {
            res.status(409);
            throw new Error('An account with this phone number already exists');
        }
    }

    const user = await User.create({
        name,
        email,
        password,
        phone: phone ? phone.replace(/[\s\-()]/g, '') : undefined,
        role: 'Driver',
        provider: 'local',
    });

    userResponse(user, 201, res);
});

// ────────────────────────────────────────────────────
// @desc   Login with email & password
// @route  POST /api/auth/login
// ────────────────────────────────────────────────────
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide email and password');
    }

    if (!EMAIL_RE.test(email)) {
        res.status(400);
        throw new Error('Please provide a valid email address');
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    userResponse(user, 200, res);
});

// ────────────────────────────────────────────────────
// @desc   Firebase ID token — create or login user
// @route  POST /api/auth/google
// @body   { token }   ← Firebase ID token from signInWithPopup
// ────────────────────────────────────────────────────
exports.googleAuth = asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
        res.status(400);
        throw new Error('Firebase ID token is required');
    }

    // Verify the token with Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    const {
        uid,
        name,
        email,
        picture,
        firebase: firebaseInfo = {}
    } = decodedToken;

    if (!email) {
        res.status(400);
        throw new Error('Firebase account must have an email address');
    }

    // Find existing user or create a new one
    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
        user = await User.findOne({ email });
    }

    const providerMap = {
        'google.com': 'google',
        'facebook.com': 'facebook',
        phone: 'phone',
        password: 'local'
    };
    const provider = providerMap[firebaseInfo.sign_in_provider] || 'local';

    if (user) {
        // Update provider and avatar if the account was originally local
        if (user.provider !== provider) user.provider = provider;
        if (picture && !user.avatar) user.avatar = picture;
        if (!user.firebaseUid) user.firebaseUid = uid;
        await user.save();
    } else {
        user = await User.create({
            name: name || email.split('@')[0],
            email,
            avatar: picture || '',
            role: 'Driver',
            provider,
            firebaseUid: uid,
        });
    }

    userResponse(user, 200, res);
});

// ────────────────────────────────────────────────────
// @desc   Facebook OAuth — create or login
// @route  POST /api/auth/facebook
// @body   { facebookId, name, email, avatar }
// ────────────────────────────────────────────────────
exports.facebookAuth = asyncHandler(async (req, res) => {
    const { facebookId, name, email, avatar } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Facebook auth requires an email');
    }

    let user = await User.findOne({ email });

    if (user) {
        if (!user.facebookId && facebookId) {
            user.facebookId = facebookId;
            user.provider = 'facebook';
            if (avatar && !user.avatar) user.avatar = avatar;
            await user.save();
        }
    } else {
        user = await User.create({
            name: name || email.split('@')[0],
            email,
            facebookId,
            avatar: avatar || '',
            role: 'Driver',
            provider: 'facebook',
        });
    }

    userResponse(user, 200, res);
});

// ────────────────────────────────────────────────────
// @desc   Get current user profile
// @route  GET /api/auth/me
// ────────────────────────────────────────────────────
exports.getMe = asyncHandler(async (req, res) => {
    res.json({ success: true, data: req.user });
});

// ────────────────────────────────────────────────────
// @desc   Update current user profile
// @route  PUT /api/auth/profile
// ────────────────────────────────────────────────────
exports.updateProfile = asyncHandler(async (req, res) => {
    const { nickname, avatar, banner } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (nickname !== undefined) {
        if (nickname.length > 30) {
            res.status(400);
            throw new Error('Nickname cannot exceed 30 characters');
        }
        user.nickname = nickname.trim();
    }

    if (avatar !== undefined) user.avatar = avatar;
    if (banner !== undefined) user.banner = banner;

    await user.save();

    res.json({
        success: true,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone || null,
            nickname: user.nickname || '',
            role: user.role,
            avatar: user.avatar,
            banner: user.banner || '',
            provider: user.provider,
            createdAt: user.createdAt,
        },
    });
});

// ────────────────────────────────────────────────────
// @desc   Send OTP to a phone number
// @route  POST /api/auth/send-otp
// @body   { phone }
// ────────────────────────────────────────────────────
exports.sendOtp = asyncHandler(async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        res.status(400);
        throw new Error('Phone number is required');
    }

    const cleaned = phone.replace(/[\s\-()]/g, '');
    if (!PHONE_RE.test(cleaned)) {
        res.status(400);
        throw new Error('Please provide a valid phone number');
    }

    await Otp.deleteMany({ phone: cleaned });

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await Otp.create({ phone: cleaned, code, expiresAt });

    // ── In production replace this with Twilio / MSG91 / etc. ──
    console.log(`\n📱  OTP for ${cleaned}: ${code}\n`);

    res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        ...(process.env.NODE_ENV !== 'production' && { otp: code }),
    });
});

// ────────────────────────────────────────────────────
// @desc   Verify OTP and login / register
// @route  POST /api/auth/verify-otp
// @body   { phone, otp, name? }
// ────────────────────────────────────────────────────
exports.verifyOtp = asyncHandler(async (req, res) => {
    const { phone, otp, name } = req.body;

    if (!phone || !otp) {
        res.status(400);
        throw new Error('Phone and OTP are required');
    }

    const cleaned = phone.replace(/[\s\-()]/g, '');

    const record = await Otp.findOne({
        phone: cleaned,
        code: otp,
        expiresAt: { $gt: new Date() },
        verified: false,
    });

    if (!record) {
        res.status(401);
        throw new Error('Invalid or expired OTP');
    }

    record.verified = true;
    await record.save();

    let user = await User.findOne({ phone: cleaned });

    if (!user) {
        user = await User.create({
            name: name || `User ${cleaned.slice(-4)}`,
            email: `${cleaned}@phone.local`,
            phone: cleaned,
            role: 'Driver',
            provider: 'phone',
        });
    }

    userResponse(user, 200, res);
});
