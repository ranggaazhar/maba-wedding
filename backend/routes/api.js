// routes/api.js
const express = require('express');
const router = express.Router();

// ── Route modules ──────────────────────────────────────────────
const authRoutes             = require('./authRoutes');
const categoryRoutes         = require('./categoryRoutes');
const propertyCategoryRoutes = require('./propertyCategoryRoutes');
const projectRoutes          = require('./projectRoutes');
const propertyRoutes         = require('./propertyRoutes');
const bookingRoutes          = require('./bookingRoutes');
const reviewRoutes           = require('./reviewRoutes');
const siteSettingRoutes      = require('./siteSettingRoutes');
const invoiceRoutes          = require('./invoiceRoutes');
const invoiceItemRoutes      = require('./invoiceItemRoutes');
const dashboardRoutes        = require('./dashboardRoutes');
const customRequestRoutes    = require('./customRequestRoutes');
const authMiddleware         = require('../middleware/auth');

// ── Misc ───────────────────────────────────────────────────────
router.post('/wa-webhook', (req, res) => {
  console.log('📩 WA Webhook:', JSON.stringify(req.body, null, 2));
  res.json({ status: 'ok' });
});

router.get('/test-reminder', authMiddleware, async (req, res) => {
  const reminderService = require('../services/admin/reminderService');
  await reminderService.sendReminder(5);
  res.json({ success: true, message: 'Reminder dikirim' });
});

// ── Mount routes ───────────────────────────────────────────────
router.use('/auth',                authRoutes);
router.use('/categories',          categoryRoutes);
router.use('/property-categories', propertyCategoryRoutes);
router.use('/projects',            projectRoutes);
router.use('/properties',          propertyRoutes);
router.use('/bookings',            bookingRoutes);
router.use('/reviews',             reviewRoutes);
router.use('/invoices',            invoiceRoutes);
router.use('/invoice-items',       invoiceItemRoutes);
router.use('/site-settings',       siteSettingRoutes);
router.use('/dashboard',           dashboardRoutes);
router.use('/', customRequestRoutes);

module.exports = router;