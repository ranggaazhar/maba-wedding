// // services/bookingPropertyService.js
// const { BookingProperty, Booking, Property } = require('../models');

// class BookingPropertyService {
//   async getPropertiesByBookingId(bookingId) {
//     const properties = await BookingProperty.findAll({
//       where: { booking_id: bookingId },
//       include: [
//         { model: Property, as: 'property' }
//       ],
//       order: [['created_at', 'ASC']]
//     });
    
//     return properties;
//   }
  
//   async getPropertyById(id) {
//     const property = await BookingProperty.findByPk(id, {
//       include: [
//         { model: Booking, as: 'booking' },
//         { model: Property, as: 'property' }
//       ]
//     });
    
//     if (!property) {
//       throw new Error('Booking property not found');
//     }
    
//     return property;
//   }
  
//   async createProperty(bookingId, data) {
//     // Verify booking exists
//     const booking = await Booking.findByPk(bookingId);
//     if (!booking) {
//       throw new Error('Booking not found');
//     }
    
//     // Verify property exists if property_id is provided
//     let propertyData = {
//       property_name: data.property_name,
//       property_category: data.property_category
//     };
    
//     if (data.property_id) {
//       const property = await Property.findByPk(data.property_id);
//       if (!property) {
//         throw new Error('Property not found');
//       }
      
//       // Use property data if not provided
//       propertyData.property_name = data.property_name || property.name;
//       propertyData.property_category = data.property_category || property.category?.name || 'Uncategorized';
//     }
    
//     const quantity = data.quantity || 1;
//     const price = parseFloat(data.price);
//     const subtotal = data.subtotal || (price * quantity);
    
//     const bookingProperty = await BookingProperty.create({
//       booking_id: bookingId,
//       property_id: data.property_id,
//       property_name: propertyData.property_name,
//       property_category: propertyData.property_category,
//       quantity,
//       price,
//       subtotal
//     });
    
//     return await this.getPropertyById(bookingProperty.id);
//   }
  
//   async updateProperty(id, data) {
//     const bookingProperty = await this.getPropertyById(id);
    
//     // Verify property if being updated
//     if (data.property_id && data.property_id !== bookingProperty.property_id) {
//       const property = await Property.findByPk(data.property_id);
//       if (!property) {
//         throw new Error('Property not found');
//       }
//     }
    
//     // Recalculate subtotal if quantity or price changes
//     const updateData = { ...data };
//     if (data.quantity || data.price) {
//       const quantity = data.quantity || bookingProperty.quantity;
//       const price = data.price || bookingProperty.price;
//       updateData.subtotal = parseFloat(price) * parseInt(quantity);
//     }
    
//     await bookingProperty.update(updateData);
//     return await this.getPropertyById(id);
//   }
  
//   async deleteProperty(id) {
//     const bookingProperty = await this.getPropertyById(id);
//     await bookingProperty.destroy();
//     return { message: 'Booking property deleted successfully' };
//   }
  
//   async bulkCreateProperties(bookingId, properties) {
//     // Verify booking exists
//     const booking = await Booking.findByPk(bookingId);
//     if (!booking) {
//       throw new Error('Booking not found');
//     }
    
//     const propertyData = [];
    
//     for (let i = 0; i < properties.length; i++) {
//       const prop = properties[i];
      
//       let propInfo = {
//         property_name: prop.property_name,
//         property_category: prop.property_category
//       };
      
//       // Verify and get property data if property_id is provided
//       if (prop.property_id) {
//         const property = await Property.findByPk(prop.property_id);
//         if (!property) {
//           throw new Error(`Property not found for item at index ${i}`);
//         }
        
//         propInfo.property_name = prop.property_name || property.name;
//         propInfo.property_category = prop.property_category || property.category?.name || 'Uncategorized';
//       }
      
//       const quantity = prop.quantity || 1;
//       const price = parseFloat(prop.price);
//       const subtotal = prop.subtotal || (price * quantity);
      
//       propertyData.push({
//         booking_id: bookingId,
//         property_id: prop.property_id,
//         property_name: propInfo.property_name,
//         property_category: propInfo.property_category,
//         quantity,
//         price,
//         subtotal
//       });
//     }
    
//     const created = await BookingProperty.bulkCreate(propertyData);
//     return created;
//   }
  
//   async calculateTotal(bookingId) {
//     const properties = await this.getPropertiesByBookingId(bookingId);
    
//     const total = properties.reduce((sum, prop) => {
//       return sum + parseFloat(prop.subtotal);
//     }, 0);
    
//     return {
//       total,
//       count: properties.length,
//       properties
//     };
//   }
// }

// module.exports = new BookingPropertyService();