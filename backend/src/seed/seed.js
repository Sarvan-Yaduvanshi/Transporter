/**
 * Seed script — populates MongoDB with the same data that was in mockData.ts.
 * Run:  npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Truck, Permit, Load, Tag, Flag, Mine, Driver, Document, User } = require('../models');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/transporter_ops';

// ── Trucks ─────────────────────────────────────────────────
const trucks = [
  { truckNumber: 'MH12AB1234', availabilityWindow: 'Next 6 hours', status: 'Available', owner: 'Rajesh Transport', driver: 'Ramesh Kumar' },
  { truckNumber: 'MH12AB5678', availabilityWindow: 'Next 4 hours', status: 'Available', owner: 'Rajesh Transport', driver: 'Suresh Patil' },
  { truckNumber: 'GJ01CD9012', availabilityWindow: 'Next 8 hours', status: 'Available', owner: 'Gujarat Carriers', driver: 'Vikram Singh' },
  { truckNumber: 'MH14EF3456', availabilityWindow: 'Next 3 hours', status: 'Maintenance', owner: 'Rajesh Transport', driver: 'Ajay Sharma' },
  { truckNumber: 'MH14EF7890', availabilityWindow: 'Next 2 hours', status: 'Available', owner: 'Gujarat Carriers', driver: '' },
  { truckNumber: 'GJ02GH1234', availabilityWindow: 'Next 5 hours', status: 'In-Transit', owner: 'Gujarat Carriers', driver: '' },
  { truckNumber: 'RJ05IJ5678', availabilityWindow: 'Next 5 hours', status: 'Available', owner: 'Rajasthan Logistics', driver: 'Prakash Yadav' },
];

// ── Mines ──────────────────────────────────────────────────
const mines = [
  {
    name: 'Mine A - Konkan Coal',
    routes: [{ from: 'Mine A', to: 'Port Mumbai', activeTrucks: 5, permitNumber: 'P-2024-001' }],
  },
  {
    name: 'Mine B - Rajasthan Stone',
    routes: [{ from: 'Mine B', to: 'Port Mumbai', activeTrucks: 3, permitNumber: 'P-2024-003' }],
  },
  {
    name: 'Mine C - Gujarat Minerals',
    routes: [{ from: 'Mine C', to: 'Port Kandla', activeTrucks: 2, permitNumber: 'P-2024-002' }],
  },
];

// ── Permits ────────────────────────────────────────────────
const permits = [
  {
    permitNumber: 'P-2024-001',
    route: { from: 'Mine A', to: 'Port Mumbai' },
    material: 'Coal',
    remainingTonnage: 250,
    status: 'Active',
    paymentSummary: { totalLoads: 15, completedLoads: 12, pendingLoads: 3, totalAmount: 450000 },
    paymentStatus: 'Pending Approval',
  },
  {
    permitNumber: 'P-2024-002',
    route: { from: 'Mine C', to: 'Port Kandla' },
    material: 'Limestone',
    remainingTonnage: 180,
    status: 'Active',
    paymentSummary: { totalLoads: 10, completedLoads: 8, pendingLoads: 2, totalAmount: 280000 },
    paymentStatus: 'Pending',
  },
  {
    permitNumber: 'P-2024-003',
    route: { from: 'Mine B', to: 'Port Mumbai' },
    material: 'Stone Aggregate',
    remainingTonnage: 320,
    status: 'Active',
    paymentSummary: { totalLoads: 20, completedLoads: 15, pendingLoads: 5, totalAmount: 600000 },
    paymentStatus: 'Pending',
  },
  {
    permitNumber: 'P-2024-005',
    route: { from: 'Mine B', to: 'Port Mumbai' },
    material: 'Stone Aggregate',
    remainingTonnage: 100,
    status: 'Active',
    paymentSummary: { totalLoads: 18, completedLoads: 15, pendingLoads: 3, totalAmount: 540000 },
    paymentStatus: 'Dispute',
  },
];

// ── Loads ──────────────────────────────────────────────────
const loads = [
  { loadId: 'LD-2024-101', permitNumber: 'P-2024-001', truckNumber: 'MH12AB1234', currentStage: 'LOADING', hasFlag: false },
  { loadId: 'LD-2024-102', permitNumber: 'P-2024-001', truckNumber: 'MH12AB5678', currentStage: 'LOADED', hasFlag: false },
  { loadId: 'LD-2024-103', permitNumber: 'P-2024-001', truckNumber: 'MH14EF3456', currentStage: 'TAGGED', hasFlag: false },
  { loadId: 'LD-2024-201', permitNumber: 'P-2024-002', truckNumber: 'GJ01CD9012', currentStage: 'LOADING', hasFlag: false },
  { loadId: 'LD-2024-202', permitNumber: 'P-2024-002', truckNumber: 'GJ02GH1234', currentStage: 'TAGGED', hasFlag: false },
  { loadId: 'LD-2024-301', permitNumber: 'P-2024-003', truckNumber: 'RJ05IJ5678', currentStage: 'UNLOADED', hasFlag: false },
];

// ── Tags ───────────────────────────────────────────────────
const tags = [
  { permitNumber: 'P-2024-001', truckNumber: 'MH14EF3456', status: 'Tagged' },
  { permitNumber: 'P-2024-001', truckNumber: 'MH14EF7890', status: 'Tagged' },
  { permitNumber: 'P-2024-002', truckNumber: 'GJ02GH1234', status: 'Tagged' },
];

// ── Flags ──────────────────────────────────────────────────
const flags = [];

// ── Drivers ────────────────────────────────────────────────
const drivers = [
  { name: 'Ramesh Kumar', phone: '+91 98765 00001', licenseNumber: 'DL-MH-2020-001', licenseExpiry: '2026-08-15', assignedTruck: 'MH12AB1234', status: 'Active', address: 'Mumbai, MH', emergencyContact: '+91 98765 99001' },
  { name: 'Suresh Patil', phone: '+91 98765 00002', licenseNumber: 'DL-MH-2019-002', licenseExpiry: '2026-03-20', assignedTruck: 'MH12AB5678', status: 'Active', address: 'Pune, MH', emergencyContact: '+91 98765 99002' },
  { name: 'Vikram Singh', phone: '+91 98765 00003', licenseNumber: 'DL-GJ-2021-003', licenseExpiry: '2027-01-10', assignedTruck: 'GJ01CD9012', status: 'Active', address: 'Ahmedabad, GJ', emergencyContact: '+91 98765 99003' },
  { name: 'Ajay Sharma', phone: '+91 98765 00004', licenseNumber: 'DL-MH-2018-004', licenseExpiry: '2025-12-01', assignedTruck: 'MH14EF3456', status: 'On Leave', address: 'Nashik, MH', emergencyContact: '+91 98765 99004' },
  { name: 'Prakash Yadav', phone: '+91 98765 00005', licenseNumber: 'DL-RJ-2022-005', licenseExpiry: '2027-06-30', assignedTruck: 'RJ05IJ5678', status: 'Active', address: 'Jaipur, RJ', emergencyContact: '+91 98765 99005' },
];

// ── Documents (driver personal + truck) ────────────────────
const documents = [
  // Truck documents
  { ownerType: 'Truck', ownerId: 'MH12AB1234', docType: 'Registration Certificate (RC)', docNumber: 'RC-MH12AB1234', issueDate: '2022-03-15', expiryDate: '2037-03-14', status: 'Valid' },
  { ownerType: 'Truck', ownerId: 'MH12AB1234', docType: 'Insurance', docNumber: 'INS-2024-001', issueDate: '2024-01-10', expiryDate: '2026-04-10', status: 'Valid', notes: 'Comprehensive cover' },
  { ownerType: 'Truck', ownerId: 'MH12AB1234', docType: 'Fitness Certificate', docNumber: 'FIT-2024-001', issueDate: '2024-06-01', expiryDate: '2026-06-01', status: 'Valid' },
  { ownerType: 'Truck', ownerId: 'MH12AB1234', docType: 'Pollution Certificate (PUC)', docNumber: 'PUC-2025-001', issueDate: '2025-01-15', expiryDate: '2026-01-14', status: 'Expired' },
  { ownerType: 'Truck', ownerId: 'MH12AB5678', docType: 'Registration Certificate (RC)', docNumber: 'RC-MH12AB5678', issueDate: '2021-07-20', expiryDate: '2036-07-19', status: 'Valid' },
  { ownerType: 'Truck', ownerId: 'MH12AB5678', docType: 'Insurance', docNumber: 'INS-2024-002', issueDate: '2024-03-01', expiryDate: '2026-03-15', status: 'Valid' },
  { ownerType: 'Truck', ownerId: 'GJ01CD9012', docType: 'Registration Certificate (RC)', docNumber: 'RC-GJ01CD9012', issueDate: '2023-01-05', expiryDate: '2038-01-04', status: 'Valid' },
  { ownerType: 'Truck', ownerId: 'GJ01CD9012', docType: 'National Permit', docNumber: 'NP-2024-003', issueDate: '2024-02-01', expiryDate: '2026-04-01', status: 'Valid' },
  // Driver documents
  { ownerType: 'Driver', ownerId: 'DL-MH-2020-001', docType: 'Driving License', docNumber: 'DL-MH-2020-001', issueDate: '2020-08-15', expiryDate: '2026-08-15', status: 'Valid' },
  { ownerType: 'Driver', ownerId: 'DL-MH-2020-001', docType: 'Aadhar Card', docNumber: 'XXXX-XXXX-1234', issueDate: '2018-05-20', expiryDate: '', status: 'Valid' },
  { ownerType: 'Driver', ownerId: 'DL-MH-2019-002', docType: 'Driving License', docNumber: 'DL-MH-2019-002', issueDate: '2019-03-20', expiryDate: '2026-03-20', status: 'Valid' },
  { ownerType: 'Driver', ownerId: 'DL-MH-2019-002', docType: 'Medical Certificate', docNumber: 'MED-2025-002', issueDate: '2025-01-10', expiryDate: '2026-01-09', status: 'Expired' },
  { ownerType: 'Driver', ownerId: 'DL-GJ-2021-003', docType: 'Driving License', docNumber: 'DL-GJ-2021-003', issueDate: '2021-01-10', expiryDate: '2027-01-10', status: 'Valid' },
];

// ── Runner ─────────────────────────────────────────────────
async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Drop existing data
    await Promise.all([
      Truck.deleteMany(),
      Mine.deleteMany(),
      Permit.deleteMany(),
      Load.deleteMany(),
      Tag.deleteMany(),
      Flag.deleteMany(),
      Driver.deleteMany(),
      Document.deleteMany(),
      User.deleteMany(),
    ]);
    console.log('Cleared existing collections');

    // Create a test user (password: test1234)
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('test1234', salt);
    await User.create({
      name: 'Test Transporter',
      email: 'test@test.com',
      password: hashedPassword,
      role: 'Transporter',
      provider: 'local',
    });
    console.log('Created test user: test@test.com / test1234');

    // Insert
    await Promise.all([
      Truck.insertMany(trucks),
      Mine.insertMany(mines),
      Permit.insertMany(permits),
      Load.insertMany(loads),
      Tag.insertMany(tags),
      Flag.insertMany(flags),
      Driver.insertMany(drivers),
      Document.insertMany(documents),
    ]);

    console.log('Seed complete ✓');
    console.log(`  Trucks   : ${trucks.length}`);
    console.log(`  Mines    : ${mines.length}`);
    console.log(`  Permits  : ${permits.length}`);
    console.log(`  Loads    : ${loads.length}`);
    console.log(`  Tags     : ${tags.length}`);
    console.log(`  Flags    : ${flags.length}`);
    console.log(`  Drivers  : ${drivers.length}`);
    console.log(`  Documents: ${documents.length}`);
    console.log(`  User     : 1 (test@test.com / test1234)`);
  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
