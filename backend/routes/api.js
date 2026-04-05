// routes/api.js
const express = require('express');
const router = express.Router();

// ── Route modules ──────────────────────────────────────────────
const authRoutes           = require('./authRoutes');
const categoryRoutes       = require('./categoryRoutes');
const propertyCategoryRoutes = require('./propertyCategoryRoutes');
const projectRoutes        = require('./projectRoutes');
const propertyRoutes       = require('./propertyRoutes');
const propertyImageRoutes  = require('./propertyImageRoutes');
const bookingRoutes        = require('./bookingRoutes');
const reviewRoutes         = require('./reviewRoutes');
const siteSettingRoutes    = require('./siteSettingRoutes');
const invoiceRoutes        = require('./invoiceRoutes');
const invoiceItemRoutes    = require('./invoiceItemRoutes');
const dashboardRoutes      = require('./dashboardRoutes');

// ── Misc ───────────────────────────────────────────────────────
router.post('/wa-webhook', (req, res) => {
  console.log('📩 WA Webhook:', JSON.stringify(req.body, null, 2));
  res.json({ status: 'ok' });
});

router.get('/test-reminder', async (req, res) => {
  const reminderService = require('../services/admin/reminderService');
  await reminderService.sendReminder(5);
  res.json({ success: true, message: 'Reminder dikirim' });
});

// ── Mount routes ───────────────────────────────────────────────
router.use('/auth',               authRoutes);
router.use('/categories',         categoryRoutes);
router.use('/property-categories',propertyCategoryRoutes);
router.use('/projects',           projectRoutes);
router.use('/properties',         propertyRoutes);
router.use('/property-images',    propertyImageRoutes);
router.use('/bookings',           bookingRoutes);
router.use('/reviews',            reviewRoutes);
router.use('/invoices',           invoiceRoutes);
router.use('/invoice-items',      invoiceItemRoutes);
router.use('/site-settings',      siteSettingRoutes);
router.use('/dashboard',          dashboardRoutes);

module.exports = router;