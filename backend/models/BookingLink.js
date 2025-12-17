// models/BookingLink.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BookingLink extends Model {
    static associate(models) {
      // BookingLink has many Bookings
      BookingLink.hasMany(models.Booking, {
        foreignKey: 'booking_link_id',
        as: 'bookings'
      });
    }
  }
  
  BookingLink.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    unique_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    max_bookings: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    current_bookings: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'BookingLink',
    tableName: 'booking_links',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return BookingLink;
};