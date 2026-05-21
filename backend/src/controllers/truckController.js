const asyncHandler = require('../middleware/asyncHandler');
const { Truck } = require('../models');

// @desc   Get all trucks
// @route  GET /api/trucks
exports.getAll = asyncHandler(async (_req, res) => {
  const trucks = await Truck.find().sort({ truckNumber: 1 }).lean();
  res.json({ success: true, count: trucks.length, data: trucks });
});

// @desc   Get approved / available trucks
// @route  GET /api/trucks/approved
exports.getApproved = asyncHandler(async (_req, res) => {
  const trucks = await Truck.find({ status: 'Available' })
    .select('truckNumber availabilityWindow')
    .lean();
  res.json({ success: true, count: trucks.length, data: trucks });
});

// @desc   Get single truck
// @route  GET /api/trucks/:truckNumber
exports.getOne = asyncHandler(async (req, res) => {
  const truck = await Truck.findOne({ truckNumber: req.params.truckNumber }).lean();
  if (!truck) {
    const err = new Error('Truck not found');
    err.statusCode = 404;
    throw err;
  }
  res.json({ success: true, data: truck });
});

// @desc   Create truck
// @route  POST /api/trucks
exports.create = asyncHandler(async (req, res) => {
  const truckNumber = (req.body.truckNumber || '').trim();
  if (!truckNumber) {
    const err = new Error('Truck number is required');
    err.statusCode = 400;
    throw err;
  }

  const exists = await Truck.findOne({ truckNumber }).lean();
  if (exists) {
    const err = new Error('Truck number already exists');
    err.statusCode = 409;
    throw err;
  }

  const truck = await Truck.create({
    truckNumber,
    owner: (req.body.owner || '').trim(),
    driver: (req.body.driver || '').trim(),
    status: req.body.status,
    availabilityWindow: (req.body.availabilityWindow || '').trim()
  });
  res.status(201).json({ success: true, data: truck });
});

// @desc   Update truck
// @route  PUT /api/trucks/:truckNumber
exports.update = asyncHandler(async (req, res) => {
  const updates = {
    owner: req.body.owner,
    driver: req.body.driver,
    status: req.body.status,
    availabilityWindow: req.body.availabilityWindow
  };
  if (updates.owner !== undefined) updates.owner = updates.owner.trim();
  if (updates.driver !== undefined) updates.driver = updates.driver.trim();
  if (updates.availabilityWindow !== undefined) updates.availabilityWindow = updates.availabilityWindow.trim();
  Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

  const truck = await Truck.findOneAndUpdate(
    { truckNumber: req.params.truckNumber },
    updates,
    { new: true, runValidators: true }
  );
  if (!truck) {
    const err = new Error('Truck not found');
    err.statusCode = 404;
    throw err;
  }
  res.json({ success: true, data: truck });
});

// @desc   Delete truck
// @route  DELETE /api/trucks/:truckNumber
exports.remove = asyncHandler(async (req, res) => {
  const truck = await Truck.findOneAndDelete({ truckNumber: req.params.truckNumber });
  if (!truck) {
    const err = new Error('Truck not found');
    err.statusCode = 404;
    throw err;
  }
  res.json({ success: true, data: {} });
});
