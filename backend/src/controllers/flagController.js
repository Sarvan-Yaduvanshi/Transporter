const asyncHandler = require('../middleware/asyncHandler');
const { Flag, Load, Notification, User } = require('../models');

// @desc   Get flags (optionally by permit)
// @route  GET /api/flags?permitNumber=P-2024-001
exports.getAll = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.permitNumber) filter.permitNumber = req.query.permitNumber;
  const flags = await Flag.find(filter).sort({ createdAt: -1 }).lean();
  res.json({ success: true, count: flags.length, data: flags });
});

// @desc   Create flag
// @route  POST /api/flags
exports.create = asyncHandler(async (req, res) => {
  const flag = await Flag.create(req.body);
  // Mark the load as flagged
  await Load.findOneAndUpdate({ loadId: flag.loadId }, { hasFlag: true });

  // Notify ALL users (except the creator) about the new flag
  try {
    const creatorId = req.user?._id;
    const query = creatorId ? { _id: { $ne: creatorId } } : {};
    const users = await User.find(query).select('_id').lean();
    if (users.length) {
      const notifications = users.map((u) => ({
        userId: u._id,
        type: 'flag',
        title: 'New Flag Raised',
        message: `A flag has been raised on load ${flag.loadId} (Permit ${flag.permitNumber}): ${flag.reason}`,
        refId: flag._id.toString(),
      }));
      await Notification.insertMany(notifications);
    }
    // Also notify the creator with a confirmation
    if (creatorId) {
      await Notification.create({
        userId: creatorId,
        type: 'flag',
        title: 'Flag Submitted',
        message: `Your flag on load ${flag.loadId} (Permit ${flag.permitNumber}) has been submitted and is under review.`,
        refId: flag._id.toString(),
      });
    }
  } catch (_) { /* notification failure should not block flag creation */ }

  res.status(201).json({ success: true, data: flag });
});

// @desc   Update flag (resolve / escalate)
// @route  PUT /api/flags/:id
exports.update = asyncHandler(async (req, res) => {
  const flag = await Flag.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!flag) {
    const err = new Error('Flag not found');
    err.statusCode = 404;
    throw err;
  }

  // If resolved/withdrawn, check if any active flags remain—if not, clear hasFlag
  if (['Resolved', 'Withdrawn'].includes(flag.status)) {
    const remaining = await Flag.countDocuments({
      loadId: flag.loadId,
      status: { $in: ['Under Review', 'Escalated'] },
    });
    if (remaining === 0) {
      await Load.findOneAndUpdate({ loadId: flag.loadId }, { hasFlag: false });
    }
  }

  res.json({ success: true, data: flag });
});

// @desc   Withdraw flag — deletes the flag and clears hasFlag on the load
// @route  DELETE /api/flags/:id
exports.remove = asyncHandler(async (req, res) => {
  // Only allow Transporter to remove flags
  if (!req.user || req.user.role !== 'Transporter') {
    return res.status(403).json({ success: false, message: 'Only transporter can remove flags' });
  }
  const flag = await Flag.findByIdAndDelete(req.params.id);
  if (!flag) {
    const err = new Error('Flag not found');
    err.statusCode = 404;
    throw err;
  }

  // If no other active flags remain for this load, clear hasFlag on the Load
  const remaining = await Flag.countDocuments({
    loadId: flag.loadId,
    status: { $in: ['Under Review', 'Escalated'] },
  });
  if (remaining === 0) {
    await Load.findOneAndUpdate({ loadId: flag.loadId }, { hasFlag: false });
  }

  res.json({ success: true, data: {} });
});
