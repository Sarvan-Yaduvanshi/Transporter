const asyncHandler = require('../middleware/asyncHandler');
const { Load } = require('../models');

// @desc   Get loads for a permit
// @route  GET /api/loads?permitNumber=P-2024-001
exports.getAll = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.permitNumber) filter.permitNumber = req.query.permitNumber;
  const loads = await Load.find(filter).sort({ createdAt: -1 }).lean();
  res.json({ success: true, count: loads.length, data: loads });
});

// @desc   Get single load
// @route  GET /api/loads/:loadId
exports.getOne = asyncHandler(async (req, res) => {
  const load = await Load.findOne({ loadId: req.params.loadId }).lean();
  if (!load) {
    const err = new Error('Load not found');
    err.statusCode = 404;
    throw err;
  }
  res.json({ success: true, data: load });
});

// @desc   Create load
// @route  POST /api/loads
exports.create = asyncHandler(async (req, res) => {
  const loadId = (req.body.loadId || '').trim();
  const permitNumber = (req.body.permitNumber || '').trim();
  const truckNumber = (req.body.truckNumber || '').trim();

  if (!loadId || !permitNumber || !truckNumber) {
    const err = new Error('Load ID, permit number, and truck number are required');
    err.statusCode = 400;
    throw err;
  }

  const exists = await Load.findOne({ loadId }).lean();
  if (exists) {
    const err = new Error('Load ID already exists');
    err.statusCode = 409;
    throw err;
  }

  const load = await Load.create({
    loadId,
    permitNumber,
    truckNumber,
    currentStage: req.body.currentStage,
    hasFlag: Boolean(req.body.hasFlag)
  });
  res.status(201).json({ success: true, data: load });
});

// @desc   Update load stage / flag
// @route  PUT /api/loads/:loadId
exports.update = asyncHandler(async (req, res) => {
  const updates = {
    permitNumber: req.body.permitNumber,
    truckNumber: req.body.truckNumber,
    currentStage: req.body.currentStage,
    hasFlag: req.body.hasFlag
  };

  if (updates.permitNumber !== undefined) {
    updates.permitNumber = updates.permitNumber.trim();
    if (!updates.permitNumber) {
      const err = new Error('Permit number cannot be empty');
      err.statusCode = 400;
      throw err;
    }
  }
  if (updates.truckNumber !== undefined) {
    updates.truckNumber = updates.truckNumber.trim();
    if (!updates.truckNumber) {
      const err = new Error('Truck number cannot be empty');
      err.statusCode = 400;
      throw err;
    }
  }
  Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

  const load = await Load.findOneAndUpdate(
    { loadId: req.params.loadId },
    updates,
    { new: true, runValidators: true }
  );
  if (!load) {
    const err = new Error('Load not found');
    err.statusCode = 404;
    throw err;
  }
  res.json({ success: true, data: load });
});

// @desc   Delete load
// @route  DELETE /api/loads/:loadId
exports.remove = asyncHandler(async (req, res) => {
  const load = await Load.findOneAndDelete({ loadId: req.params.loadId });
  if (!load) {
    const err = new Error('Load not found');
    err.statusCode = 404;
    throw err;
  }
  res.json({ success: true, data: {} });
});
