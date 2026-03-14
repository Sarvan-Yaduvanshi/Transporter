const asyncHandler = require('../middleware/asyncHandler');
const { Permit, Load, Flag } = require('../models');

// @desc   Get all permits (with nested loads & flags)
// @route  GET /api/permits
exports.getAll = asyncHandler(async (_req, res) => {
  const permits = await Permit.find().sort({ permitNumber: 1 }).lean();

  // Attach loads & flags per permit
  const permitNumbers = permits.map((p) => p.permitNumber);
  const [loads, flags] = await Promise.all([
    Load.find({ permitNumber: { $in: permitNumbers } }).lean(),
    Flag.find({ permitNumber: { $in: permitNumbers } }).lean(),
  ]);

  const loadsByPermit = {};
  const flagsByPermit = {};
  loads.forEach((l) => {
    (loadsByPermit[l.permitNumber] ||= []).push(l);
  });
  flags.forEach((f) => {
    (flagsByPermit[f.permitNumber] ||= []).push(f);
  });

  const data = permits.map((p) => ({
    ...p,
    activeLoads: loadsByPermit[p.permitNumber] || [],
    flags: flagsByPermit[p.permitNumber] || [],
  }));

  res.json({ success: true, count: data.length, data });
});

// @desc   Get active permits (summary)
// @route  GET /api/permits/active
exports.getActive = asyncHandler(async (_req, res) => {
  const permits = await Permit.find({ status: 'Active' })
    .select('permitNumber route material remainingTonnage')
    .lean();
  res.json({ success: true, count: permits.length, data: permits });
});

// @desc   Get single permit (full detail)
// @route  GET /api/permits/:permitNumber
exports.getOne = asyncHandler(async (req, res) => {
  const permit = await Permit.findOne({ permitNumber: req.params.permitNumber }).lean();
  if (!permit) {
    const err = new Error('Permit not found');
    err.statusCode = 404;
    throw err;
  }

  const [activeLoads, flags] = await Promise.all([
    Load.find({ permitNumber: permit.permitNumber }).lean(),
    Flag.find({ permitNumber: permit.permitNumber }).lean(),
  ]);

  res.json({ success: true, data: { ...permit, activeLoads, flags } });
});

// @desc   Create permit
// @route  POST /api/permits
exports.create = asyncHandler(async (req, res) => {
  const permit = await Permit.create(req.body);
  res.status(201).json({ success: true, data: permit });
});

// @desc   Update permit
// @route  PUT /api/permits/:permitNumber
exports.update = asyncHandler(async (req, res) => {
  const permit = await Permit.findOneAndUpdate(
    { permitNumber: req.params.permitNumber },
    req.body,
    { new: true, runValidators: true }
  );
  if (!permit) {
    const err = new Error('Permit not found');
    err.statusCode = 404;
    throw err;
  }
  res.json({ success: true, data: permit });
});

// @desc   Delete permit
// @route  DELETE /api/permits/:permitNumber
exports.remove = asyncHandler(async (req, res) => {
  const permit = await Permit.findOneAndDelete({
    permitNumber: req.params.permitNumber,
  });
  if (!permit) {
    const err = new Error('Permit not found');
    err.statusCode = 404;
    throw err;
  }
  // Cascade: remove related loads, flags, tags
  const Tag = require('../models/Tag');
  await Promise.all([
    Load.deleteMany({ permitNumber: permit.permitNumber }),
    Flag.deleteMany({ permitNumber: permit.permitNumber }),
    Tag.deleteMany({ permitNumber: permit.permitNumber }),
  ]);
  res.json({ success: true, data: {} });
});
