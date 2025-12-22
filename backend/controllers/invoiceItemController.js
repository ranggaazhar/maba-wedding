// controllers/invoiceItemController.js
const invoiceItemService = require('../services/invoiceItemService');

class InvoiceItemController {
  async getItemsByInvoice(req, res) {
    try {
      const { invoiceId } = req.params;
      const items = await invoiceItemService.getItemsByInvoiceId(invoiceId);
      
      return res.status(200).json({
        success: true,
        message: 'Invoice items retrieved successfully',
        data: items
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve invoice items',
        error: error.message
      });
    }
  }
  
  async getItemById(req, res) {
    try {
      const { id } = req.params;
      const item = await invoiceItemService.getItemById(id);
      
      return res.status(200).json({
        success: true,
        message: 'Invoice item retrieved successfully',
        data: item
      });
    } catch (error) {
      const statusCode = error.message === 'Invoice item not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async createItem(req, res) {
    try {
      const { invoiceId } = req.params;
      const item = await invoiceItemService.createItem(invoiceId, req.body);
      
      return res.status(201).json({
        success: true,
        message: 'Invoice item created successfully',
        data: item
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async updateItem(req, res) {
    try {
      const { id } = req.params;
      const item = await invoiceItemService.updateItem(id, req.body);
      
      return res.status(200).json({
        success: true,
        message: 'Invoice item updated successfully',
        data: item
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async deleteItem(req, res) {
    try {
      const { id } = req.params;
      const result = await invoiceItemService.deleteItem(id);
      
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message === 'Invoice item not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async bulkCreateItems(req, res) {
    try {
      const { invoiceId } = req.params;
      const { items } = req.body;
      
      if (!Array.isArray(items)) {
        return res.status(400).json({
          success: false,
          message: 'items must be an array'
        });
      }
      
      const created = await invoiceItemService.bulkCreateItems(invoiceId, items);
      
      return res.status(201).json({
        success: true,
        message: 'Invoice items created successfully',
        data: created
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async reorderItems(req, res) {
    try {
      const { invoiceId } = req.params;
      const { itemIds } = req.body;
      
      if (!Array.isArray(itemIds)) {
        return res.status(400).json({
          success: false,
          message: 'itemIds must be an array'
        });
      }
      
      const items = await invoiceItemService.reorderItems(invoiceId, itemIds);
      
      return res.status(200).json({
        success: true,
        message: 'Invoice items reordered successfully',
        data: items
      });
    } catch (error) {
      const statusCode = error.message === 'Invoice not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async calculateItemsTotal(req, res) {
    try {
      const { invoiceId } = req.params;
      const result = await invoiceItemService.calculateItemsTotal(invoiceId);
      
      return res.status(200).json({
        success: true,
        message: 'Items total calculated successfully',
        data: result
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to calculate items total',
        error: error.message
      });
    }
  }
}

module.exports = new InvoiceItemController();