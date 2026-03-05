// // controllers/bookingModelController.js
// const bookingModelService = require('../services/bookingModelService');

// class BookingModelController {
//   async getModelsByBooking(req, res) {
//     try {
//       const { bookingId } = req.params;
//       const models = await bookingModelService.getModelsByBookingId(bookingId);
      
//       return res.status(200).json({
//         success: true,
//         message: 'Booking models retrieved successfully',
//         data: models
//       });
//     } catch (error) {
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to retrieve booking models',
//         error: error.message
//       });
//     }
//   }
  
//   async getModelById(req, res) {
//     try {
//       const { id } = req.params;
//       const model = await bookingModelService.getModelById(id);
      
//       return res.status(200).json({
//         success: true,
//         message: 'Booking model retrieved successfully',
//         data: model
//       });
//     } catch (error) {
//       const statusCode = error.message === 'Booking model not found' ? 404 : 500;
//       return res.status(statusCode).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }
  
//   async createModel(req, res) {
//     try {
//       const { bookingId } = req.params;
//       const model = await bookingModelService.createModel(bookingId, req.body);
      
//       return res.status(201).json({
//         success: true,
//         message: 'Booking model created successfully',
//         data: model
//       });
//     } catch (error) {
//       const statusCode = error.message.includes('not found') ? 404 : 500;
//       return res.status(statusCode).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }
  
//   async updateModel(req, res) {
//     try {
//       const { id } = req.params;
//       const model = await bookingModelService.updateModel(id, req.body);
      
//       return res.status(200).json({
//         success: true,
//         message: 'Booking model updated successfully',
//         data: model
//       });
//     } catch (error) {
//       const statusCode = error.message.includes('not found') ? 404 : 500;
//       return res.status(statusCode).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }
  
//   async deleteModel(req, res) {
//     try {
//       const { id } = req.params;
//       const result = await bookingModelService.deleteModel(id);
      
//       return res.status(200).json({
//         success: true,
//         message: result.message
//       });
//     } catch (error) {
//       const statusCode = error.message === 'Booking model not found' ? 404 : 500;
//       return res.status(statusCode).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }
  
//   async bulkCreateModels(req, res) {
//     try {
//       const { bookingId } = req.params;
//       const { models } = req.body;
      
//       if (!Array.isArray(models)) {
//         return res.status(400).json({
//           success: false,
//           message: 'models must be an array'
//         });
//       }
      
//       const created = await bookingModelService.bulkCreateModels(bookingId, models);
      
//       return res.status(201).json({
//         success: true,
//         message: 'Booking models created successfully',
//         data: created
//       });
//     } catch (error) {
//       const statusCode = error.message.includes('not found') ? 404 : 500;
//       return res.status(statusCode).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }
  
//   async reorderModels(req, res) {
//     try {
//       const { bookingId } = req.params;
//       const { modelIds } = req.body;
      
//       if (!Array.isArray(modelIds)) {
//         return res.status(400).json({
//           success: false,
//           message: 'modelIds must be an array'
//         });
//       }
      
//       const models = await bookingModelService.reorderModels(bookingId, modelIds);
      
//       return res.status(200).json({
//         success: true,
//         message: 'Booking models reordered successfully',
//         data: models
//       });
//     } catch (error) {
//       const statusCode = error.message === 'Booking not found' ? 404 : 500;
//       return res.status(statusCode).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }
// }

// module.exports = new BookingModelController();