// models/Booking.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      // Booking belongs to BookingLink
      Booking.belongsTo(models.BookingLink, {
        foreignKey: 'booking_link_id',
        as: 'bookingLink'
      });

      // Booking has many BookingModels
      Booking.hasMany(models.BookingModel, {
        foreignKey: 'booking_id',
        as: 'models'
      });

      // Booking has many BookingProperties
      Booking.hasMany(models.BookingProperty, {
        foreignKey: 'booking_id',
        as: 'properties'
      });

      // Booking has one Invoice
      Booking.hasOne(models.Invoice, {
        foreignKey: 'booking_id',
        as: 'invoice'
      });

      // Booking has one ReviewLink
      Booking.hasOne(models.ReviewLink, {
        foreignKey: 'booking_id',
        as: 'reviewLink'
      });
    }
  }
  
  Booking.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    booking_link_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    booking_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    customer_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    customer_email: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    customer_phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    event_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    event_location: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    guest_count: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    total_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
      defaultValue: 'pending'
    }
  }, {
    sequelize,
    modelName: 'Booking',
    tableName: 'bookings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return Booking;
};