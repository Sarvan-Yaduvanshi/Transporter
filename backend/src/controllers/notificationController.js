const asyncHandler = require('../middleware/asyncHandler');
const { Notification } = require('../models');

// @desc   Get notifications for the logged-in user (with optional time filter)
// @route  GET /api/notifications?hours=6
exports.getAll = asyncHandler(async (req, res) => {
    const filter = { userId: req.user._id };

    // Optional time window filter: ?hours=6 | 12 | 24
    const hours = parseInt(req.query.hours, 10);
    if (hours && [6, 12, 24].includes(hours)) {
        filter.createdAt = { $gte: new Date(Date.now() - hours * 60 * 60 * 1000) };
    }

    const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

    res.json({ success: true, count: notifications.length, data: notifications });
});

// @desc   Get unread notification count
// @route  GET /api/notifications/unread-count
exports.unreadCount = asyncHandler(async (req, res) => {
    const count = await Notification.countDocuments({ userId: req.user._id, read: false });
    res.json({ success: true, data: { count } });
});

// @desc   Mark a single notification as read
// @route  PUT /api/notifications/:id/read
exports.markRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        { read: true },
        { new: true }
    );
    if (!notification) {
        const err = new Error('Notification not found');
        err.statusCode = 404;
        throw err;
    }
    res.json({ success: true, data: notification });
});

// @desc   Mark all notifications as read
// @route  PUT /api/notifications/read-all
exports.markAllRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { userId: req.user._id, read: false },
        { read: true }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
});

// @desc   Clear (delete) all notifications for the logged-in user
// @route  DELETE /api/notifications/clear-all
exports.clearAll = asyncHandler(async (req, res) => {
    await Notification.deleteMany({ userId: req.user._id });
    res.json({ success: true, message: 'All notifications cleared' });
});
