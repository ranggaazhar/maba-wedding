// // services/bookingModelService.js
// const { BookingModel, Booking, Category, Project } = require('../models');

// class BookingModelService {
//   async getModelsByBookingId(bookingId) {
//     const models = await BookingModel.findAll({
//       where: { booking_id: bookingId },
//       include: [
//         { model: Category, as: 'category' },
//         { model: Project, as: 'project' }
//       ],
//       order: [['display_order', 'ASC'], ['created_at', 'ASC']]
//     });
    
//     return models;
//   }
  
//   async getModelById(id) {
//     const model = await BookingModel.findByPk(id, {
//       include: [
//         { model: Booking, as: 'booking' },
//         { model: Category, as: 'category' },
//         { model: Project, as: 'project' }
//       ]
//     });
    
//     if (!model) {
//       throw new Error('Booking model not found');
//     }
    
//     return model;
//   }
  
//     async createModel(bookingId, data) {
//       // Verify booking exists
//       const booking = await Booking.findByPk(bookingId);
//       if (!booking) {
//         throw new Error('Booking not found');
//       }
      
//       // Verify category exists
//       const category = await Category.findByPk(data.category_id);
//       if (!category) {
//         throw new Error('Category not found');
//       }
      
//       // Verify project exists
//       const project = await Project.findByPk(data.project_id);
//       if (!project) {
//         throw new Error('Project not found');
//       }
      
//       const model = await BookingModel.create({
//         booking_id: bookingId,
//         category_id: data.category_id,
//         project_id: data.project_id,
//         project_title: data.project_title || project.title,
//         price: data.price || project.price,
//         notes: data.notes,
//         display_order: data.display_order
//       });
      
//       return await this.getModelById(model.id);
//     }
    
//     async updateModel(id, data) {
//       const model = await this.getModelById(id);
      
//       // Verify category if being updated
//       if (data.category_id && data.category_id !== model.category_id) {
//         const category = await Category.findByPk(data.category_id);
//         if (!category) {
//           throw new Error('Category not found');
//         }
//       }
      
//       // Verify project if being updated
//       if (data.project_id && data.project_id !== model.project_id) {
//         const project = await Project.findByPk(data.project_id);
//         if (!project) {
//           throw new Error('Project not found');
//         }
//       }
      
//       await model.update(data);
//       return await this.getModelById(id);
//     }
    
//     async deleteModel(id) {
//       const model = await this.getModelById(id);
//       await model.destroy();
//       return { message: 'Booking model deleted successfully' };
//     }
    
//     async bulkCreateModels(bookingId, models) {
//       // Verify booking exists
//       const booking = await Booking.findByPk(bookingId);
//       if (!booking) {
//         throw new Error('Booking not found');
//       }
      
//       const modelData = [];
      
//       for (let i = 0; i < models.length; i++) {
//         const model = models[i];
        
//         // Verify category
//         const category = await Category.findByPk(model.category_id);
//         if (!category) {
//           throw new Error(`Category not found for model at index ${i}`);
//         }
        
//         // Verify project
//         const project = await Project.findByPk(model.project_id);
//         if (!project) {
//           throw new Error(`Project not found for model at index ${i}`);
//         }
        
//         modelData.push({
//           booking_id: bookingId,
//           category_id: model.category_id,
//           project_id: model.project_id,
//           project_title: model.project_title || project.title,
//           price: model.price || project.price,
//           notes: model.notes,
//           display_order: model.display_order !== undefined ? model.display_order : i
//         });
//       }
      
//       const created = await BookingModel.bulkCreate(modelData);
//       return created;
//     }
    
//     async reorderModels(bookingId, modelIds) {
//       // Verify booking exists
//       const booking = await Booking.findByPk(bookingId);
//       if (!booking) {
//         throw new Error('Booking not found');
//       }
      
//       const updatePromises = modelIds.map((modelId, index) => {
//         return BookingModel.update(
//           { display_order: index },
//           { where: { id: modelId, booking_id: bookingId } }
//         );
//       });
      
//       await Promise.all(updatePromises);
//       return await this.getModelsByBookingId(bookingId);
//     }
//   }

// module.exports = new BookingModelService();