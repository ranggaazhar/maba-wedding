const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/admin/invoiceController');
const authMiddleware = require('../middleware/auth');
const {
  createInvoiceValidation,
  updateInvoiceValidation,
  createInvoiceItemValidation,
  invoiceIdValidation,
  validate,
} = require('../validators/siteSettingValidator');

// Invoices
router.get('/',                           authMiddleware, invoiceController.getAllInvoices);
router.get('/statistics',                 authMiddleware, invoiceController.getStatistics);
router.get('/date-range',                 authMiddleware, invoiceController.getInvoicesByDateRange);
router.get('/:id',                        authMiddleware, invoiceIdValidation, validate, invoiceController.getInvoiceById);
router.post('/',                          authMiddleware, createInvoiceValidation, validate, invoiceController.createInvoice);
router.post('/from-booking/:bookingId',   authMiddleware, invoiceController.createInvoiceFromBooking);
router.put('/:id',                        authMiddleware, updateInvoiceValidation, validate, invoiceController.updateInvoice);
router.delete('/:id',                     authMiddleware, invoiceIdValidation, validate, invoiceController.deleteInvoice);
router.patch('/:id/update-pdf',           authMiddleware, invoiceIdValidation, validate, invoiceController.updatePdfUrl);
router.patch('/:id/recalculate',          authMiddleware, invoiceIdValidation, validate, invoiceController.recalculateTotal);
router.patch('/:id/mark-sent',            authMiddleware, invoiceIdValidation, validate, invoiceController.markAsSent);
router.patch('/:id/mark-paid',            authMiddleware, invoiceIdValidation, validate, invoiceController.markAsPaid);
router.patch('/:id/mark-overdue',         authMiddleware, invoiceIdValidation, validate, invoiceController.markAsOverdue);
router.post('/:id/send-whatsapp',         authMiddleware, invoiceIdValidation, validate, invoiceController.sendInvoiceWhatsapp);

// Invoice Items
router.get('/:invoiceId/items',                  authMiddleware, invoiceController.getItemsByInvoice);
router.get('/:invoiceId/items/calculate-total',  authMiddleware, invoiceController.calculateItemsTotal);
router.post('/:invoiceId/items',                 authMiddleware, createInvoiceItemValidation, validate, invoiceController.createItem);
router.post('/:invoiceId/items/bulk',            authMiddleware, invoiceController.bulkCreateItems);
router.post('/:invoiceId/items/reorder',         authMiddleware, invoiceController.reorderItems);

module.exports = router;