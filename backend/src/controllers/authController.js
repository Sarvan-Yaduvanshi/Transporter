const asyncHandler = require('../middleware/asyncHandler');
const { User, Otp } = require('../models');
const { signToken } = require('../middleware/auth');

/* ── helper: build user response with token ─────── */
const userResponse = (user, statusCode, res) => {
    const token = signToken(user._id);
    res.status(statusCode).json({
        success: true,
        data: {
            token,
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

// ────────────────────────────────────────────────────
// @desc   Register a new user (default role = Driver)
// @route  POST /api/auth/signup
// ────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_RE = /^(?=.*[A-Z])(?=.*\d).{6,}$/;

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

    // Validate phone if provided
    if (phone) {
        const cleanedPhone = phone.replace(/[\s\-()]/g, '');
        if (!/^\+?[1-9]\d{6,14}$/.test(cleanedPhone)) {
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
        role: 'Driver', // default role
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
// @desc   Google OAuth — create or login
// @route  POST /api/auth/google
// @body   { idToken, name, email, avatar }
// ────────────────────────────────────────────────────
exports.googleAuth = asyncHandler(async (req, res) => {
    const { googleId, name, email, avatar } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Google auth requires an email');
    }

    let user = await User.findOne({ email });

    if (user) {
        // Link Google ID if not already linked
        if (!user.googleId && googleId) {
            user.googleId = googleId;
            user.provider = 'google';
            if (avatar && !user.avatar) user.avatar = avatar;
            await user.save();
        }
    } else {
        user = await User.create({
            name: name || email.split('@')[0],
            email,
            googleId,
            avatar: avatar || '',
            role: 'Driver',
            provider: 'google',
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

    if (avatar !== undefined) {
        user.avatar = avatar;
    }

    if (banner !== undefined) {
        user.banner = banner;
    }

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
const PHONE_RE = /^\+?[1-9]\d{6,14}$/;

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

    // Remove any previous OTPs for this phone
    await Otp.deleteMany({ phone: cleaned });

    // Generate a 6-digit OTP
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await Otp.create({ phone: cleaned, code, expiresAt });

    // ── In production, send SMS via Twilio / MSG91 / etc. ──
    // For now, log to console so you can test locally.
    console.log(`\n📱  OTP for ${cleaned}: ${code}\n`);

    res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        // Include OTP in response ONLY for development / demo
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

    // Mark OTP as used
    record.verified = true;
    await record.save();

    // Find or create user by phone
    let user = await User.findOne({ phone: cleaned });

    if (!user) {
        user = await User.create({
            name: name || `User ${cleaned.slice(-4)}`,
            email: `${cleaned}@phone.local`, // placeholder email
            phone: cleaned,
            role: 'Driver',
            provider: 'phone',
        });
    }

    userResponse(user, 200, res);
});
