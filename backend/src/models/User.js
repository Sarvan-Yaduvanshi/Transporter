const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
                'Please provide a valid email address',
            ],
        },
        password: {
            type: String,
            minlength: [6, 'Password must be at least 6 characters'],
            select: false, // never return password by default
        },
        role: {
            type: String,
            enum: ['Driver', 'Transporter', 'Admin'],
            default: 'Driver',
        },
        avatar: {
            type: String,
            default: '',
        },
        nickname: {
            type: String,
            trim: true,
            maxlength: [30, 'Nickname cannot exceed 30 characters'],
            default: '',
        },
        banner: {
            type: String,
            default: '',
        },
        /* ── Phone login ────────────────────────────── */
        phone: {
            type: String,
            default: null,
            unique: true,
            sparse: true,
            trim: true,
        },
        /* ── OAuth fields ───────────────────────────── */
        googleId: { type: String, default: null },
        facebookId: { type: String, default: null },
        provider: {
            type: String,
            enum: ['local', 'google', 'facebook', 'phone'],
            default: 'local',
        },
    },
    { timestamps: true }
);

/* ── Hash password before save ─────────────────── */
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

/* ── Compare password helper ───────────────────── */
userSchema.methods.matchPassword = async function (entered) {
    return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
