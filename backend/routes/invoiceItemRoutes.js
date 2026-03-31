const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/admin/invoiceController');
const authMiddleware = require('../middleware/auth');

router.get('/:id',    authMiddleware, invoiceController.getItemById);
router.put('/:id',    authMiddleware, invoiceController.updateItem);
router.delete('/:id', authMiddleware, invoiceController.deleteItem);

module.exports = router;