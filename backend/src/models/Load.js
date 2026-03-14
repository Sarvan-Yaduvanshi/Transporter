const mongoose = require('mongoose');

const STAGES = ['CREATED', 'TAGGED', 'LOADING', 'LOADED', 'UNLOADED', 'COMPLETED'];

const loadSchema = new mongoose.Schema(
  {
    loadId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    permitNumber: {
      type: String,
      required: true,
      index: true,
    },
    truckNumber: {
      type: String,
      required: true,
    },
    currentStage: {
      type: String,
      enum: STAGES,
      default: 'CREATED',
    },
    hasFlag: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

loadSchema.statics.STAGES = STAGES;

module.exports = mongoose.model('Load', loadSchema);
