// controllers/bookingPropertyController.js
const bookingPropertyService = require('../services/bookingPropertyService');

class BookingPropertyController {
  async getPropertiesByBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const properties = await bookingPropertyService.getPropertiesByBookingId(bookingId);
      
      return res.status(200).json({
        success: true,
        message: 'Booking properties retrieved successfully',
        data: properties
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve booking properties',
        error: error.message
      });
    }
  }
  
  async getPropertyById(req, res) {
    try {
      const { id } = req.params;
      const property = await bookingPropertyService.getPropertyById(id);
      
      return res.status(200).json({
        success: true,
        message: 'Booking property retrieved successfully',
        data: property
      });
    } catch (error) {
      const statusCode = error.message === 'Booking property not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async createProperty(req, res) {
    try {
      const { bookingId } = req.params;
      const property = await bookingPropertyService.createProperty(bookingId, req.body);
      
      return res.status(201).json({
        success: true,
        message: 'Booking property created successfully',
        data: property
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async updateProperty(req, res) {
    try {
      const { id } = req.params;
      const property = await bookingPropertyService.updateProperty(id, req.body);
      
      return res.status(200).json({
        success: true,
        message: 'Booking property updated successfully',
        data: property
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async deleteProperty(req, res) {
    try {
      const { id } = req.params;
      const result = await bookingPropertyService.deleteProperty(id);
      
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message === 'Booking property not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async bulkCreateProperties(req, res) {
    try {
      const { bookingId } = req.params;
      const { properties } = req.body;
      
      if (!Array.isArray(properties)) {
        return res.status(400).json({
          success: false,
          message: 'properties must be an array'
        });
      }
      
      const created = await bookingPropertyService.bulkCreateProperties(bookingId, properties);
      
      return res.status(201).json({
        success: true,
        message: 'Booking properties created successfully',
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
  
  async calculateTotal(req, res) {
    try {
      const { bookingId } = req.params;
      const result = await bookingPropertyService.calculateTotal(bookingId);
      
      return res.status(200).json({
        success: true,
        message: 'Total calculated successfully',
        data: result
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to calculate total',
        error: error.message
      });
    }
  }
}

module.exports = new BookingPropertyController();