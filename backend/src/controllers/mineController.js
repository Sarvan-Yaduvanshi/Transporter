const asyncHandler = require('../middleware/asyncHandler');
const { Mine } = require('../models');

// @desc   Get all mines
// @route  GET /api/mines
exports.getAll = asyncHandler(async (_req, res) => {
  const mines = await Mine.find().lean();
  res.json({ success: true, count: mines.length, data: mines });
});

// @desc   Get single mine
// @route  GET /api/mines/:id
exports.getOne = asyncHandler(async (req, res) => {
  const mine = await Mine.findById(req.params.id).lean();
  if (!mine) {
    const err = new Error('Mine not found');
    err.statusCode = 404;
    throw err;
  }
  res.json({ success: true, data: mine });
});

// @desc   Create mine
// @route  POST /api/mines
exports.create = asyncHandler(async (req, res) => {
  const mine = await Mine.create(req.body);
  res.status(201).json({ success: true, data: mine });
});

// @desc   Update mine
// @route  PUT /api/mines/:id
exports.update = asyncHandler(async (req, res) => {
  const mine = await Mine.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!mine) {
    const err = new Error('Mine not found');
    err.statusCode = 404;
    throw err;
  }
  res.json({ success: true, data: mine });
});

// @desc   Delete mine
// @route  DELETE /api/mines/:id
exports.remove = asyncHandler(async (req, res) => {
  const mine = await Mine.findByIdAndDelete(req.params.id);
  if (!mine) {
    const err = new Error('Mine not found');
    err.statusCode = 404;
    throw err;
  }
  res.json({ success: true, data: {} });
});
