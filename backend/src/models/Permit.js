const mongoose = require('mongoose');

const paymentSummarySchema = new mongoose.Schema(
  {
    totalLoads: { type: Number, default: 0 },
    completedLoads: { type: Number, default: 0 },
    pendingLoads: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
  },
  { _id: false }
);

const permitSchema = new mongoose.Schema(
  {
    permitNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    route: {
      from: { type: String, required: true },
      to: { type: String, required: true },
    },
    material: {
      type: String,
      required: true,
    },
    remainingTonnage: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Expired', 'Suspended'],
      default: 'Active',
    },
    paymentSummary: {
      type: paymentSummarySchema,
      default: () => ({}),
    },
    paymentStatus: {
      type: String,
      enum: ['Ready', 'Pending', 'Pending Approval', 'Dispute', 'Cleared'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Permit', permitSchema);
