const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        /** Who receives the notification */
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        /** Notification category */
        type: {
            type: String,
            enum: ['payment', 'flag', 'system'],
            required: true,
        },
        /** Short title */
        title: {
            type: String,
            required: true,
            maxlength: 120,
        },
        /** Longer description */
        message: {
            type: String,
            required: true,
            maxlength: 500,
        },
        /** Has the user seen it? */
        read: {
            type: Boolean,
            default: false,
        },
        /** Optional reference id (e.g. permitNumber, flag id) */
        refId: String,
    },
    { timestamps: true }
);

// Compound index for fast queries: unread first, newest first
notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
