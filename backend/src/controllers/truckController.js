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
  const truck = await Truck.create(req.body);
  res.status(201).json({ success: true, data: truck });
});

// @desc   Update truck
// @route  PUT /api/trucks/:truckNumber
exports.update = asyncHandler(async (req, res) => {
  const truck = await Truck.findOneAndUpdate(
    { truckNumber: req.params.truckNumber },
    req.body,
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
