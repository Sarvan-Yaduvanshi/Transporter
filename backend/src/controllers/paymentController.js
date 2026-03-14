const asyncHandler = require('../middleware/asyncHandler');
const { Permit, Notification, User } = require('../models');

// @desc   Get permits ready for payment
// @route  GET /api/payments
exports.getAll = asyncHandler(async (_req, res) => {
  const permits = await Permit.find({
    paymentStatus: { $in: ['Ready', 'Pending Approval', 'Dispute'] },
  })
    .select('permitNumber route paymentSummary paymentStatus')
    .lean();

  const data = permits.map((p) => ({
    permitNumber: p.permitNumber,
    route: p.route,
    completedLoads: p.paymentSummary?.completedLoads ?? 0,
    paymentStatus: p.paymentStatus,
  }));

  res.json({ success: true, count: data.length, data });
});

// @desc   Get payment detail for a single permit
// @route  GET /api/payments/:permitNumber
exports.getOne = asyncHandler(async (req, res) => {
  const permit = await Permit.findOne({ permitNumber: req.params.permitNumber })
    .select('permitNumber route paymentSummary paymentStatus')
    .lean();

  if (!permit) {
    const err = new Error('Permit not found');
    err.statusCode = 404;
    throw err;
  }

  res.json({ success: true, data: permit });
});

// @desc   Approve / update payment status
// @route  PUT /api/payments/:permitNumber
exports.updateStatus = asyncHandler(async (req, res) => {
  const { paymentStatus } = req.body;
  if (!paymentStatus) {
    const err = new Error('paymentStatus is required');
    err.statusCode = 400;
    throw err;
  }

  const permit = await Permit.findOneAndUpdate(
    { permitNumber: req.params.permitNumber },
    { paymentStatus },
    { new: true, runValidators: true }
  );

  if (!permit) {
    const err = new Error('Permit not found');
    err.statusCode = 404;
    throw err;
  }

  // Notify all Transporter users about the payment status change
  try {
    const transporters = await User.find({ role: 'Transporter' }).select('_id').lean();
    if (transporters.length) {
      const notifications = transporters.map((t) => ({
        userId: t._id,
        type: 'payment',
        title: 'Payment Status Updated',
        message: `Payment for permit ${req.params.permitNumber} has been updated to "${paymentStatus}".`,
        refId: permit._id.toString(),
      }));
      await Notification.insertMany(notifications);
    }
  } catch (_) { /* notification failure should not block payment update */ }

  res.json({ success: true, data: permit });
});
