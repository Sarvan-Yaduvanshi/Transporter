const asyncHandler = require('../middleware/asyncHandler');
const { Load, Tag, Mine, Permit, Flag, Truck } = require('../models');

// @desc   Get unified dashboard data for both Desktop and Transporter views
// @route  GET /api/dashboard
exports.getDashboard = asyncHandler(async (_req, res) => {
  const [allLoads, activeTags, mines, allPermits, allFlags, allTrucks] =
    await Promise.all([
      Load.find().lean(),
      Tag.find({ status: 'Tagged' }).lean(),
      Mine.find().lean(),
      Permit.find().lean(),
      Flag.find().lean(),
      Truck.find().lean(),
    ]);

  /* ── Loads grouped by category ────────────────────── */
  const loadingLoads = allLoads.filter((l) =>
    ['LOADING', 'LOADED'].includes(l.currentStage)
  );
  const activeLoads = allLoads.filter((l) =>
    ['LOADING', 'LOADED', 'TAGGED'].includes(l.currentStage)
  );
  const completedLoads = allLoads.filter((l) =>
    ['COMPLETED', 'UNLOADED'].includes(l.currentStage)
  );
  const flaggedLoads = allLoads.filter((l) => l.hasFlag);

  /* ── Loading trucks grouped by permit (transporter) ── */
  const loadingTrucks = {};
  loadingLoads.forEach((l) => {
    if (!loadingTrucks[l.permitNumber]) loadingTrucks[l.permitNumber] = [];
    loadingTrucks[l.permitNumber].push({
      id: l._id,
      truckNumber: l.truckNumber,
    });
  });

  /* ── Tags grouped by permit (transporter) ─────────── */
  const tagsByPermit = {};
  activeTags.forEach((t) => {
    if (!tagsByPermit[t.permitNumber]) tagsByPermit[t.permitNumber] = [];
    tagsByPermit[t.permitNumber].push({
      id: t._id,
      truckNumber: t.truckNumber,
      status: t.status,
    });
  });

  /* ── Fleet stats (desktop) ────────────────────────── */
  const totalTrucks = allTrucks.length;
  const onLoad = loadingLoads.length;
  const maintenance = allTrucks.filter((t) => t.status === 'Maintenance').length;
  const available = allTrucks.filter((t) => t.status === 'Available').length;
  const idle = Math.max(0, available - onLoad);

  /* ── Permits with payment pending ─────────────────── */
  const permitsReadyForPayment = allPermits.filter((p) =>
    ['Ready', 'Pending Approval', 'Dispute'].includes(p.paymentStatus)
  );

  /* ── Active (unresolved) flags ────────────────────── */
  const unresolvedFlags = allFlags.filter((f) => f.status !== 'Resolved');

  res.json({
    success: true,
    data: {
      /* shared operational data (transporter) */
      loadingTrucks,
      tags: tagsByPermit,
      mines,

      /* full lists (desktop) */
      loads: allLoads,
      permits: allPermits,
      trucks: allTrucks,
      flags: allFlags,

      /* unified stats both dashboards consume */
      stats: {
        totalLoading: loadingLoads.length,
        totalTagged: activeTags.length,
        permitsReadyForPayment: permitsReadyForPayment.length,
        activeDisputes: unresolvedFlags.length,
        /* fleet stats for desktop */
        totalTrucks,
        onLoad,
        idle,
        maintenance,
        totalActive: activeLoads.length,
        totalCompleted: completedLoads.length,
        totalFlagged: flaggedLoads.length,
      },
    },
  });
});
