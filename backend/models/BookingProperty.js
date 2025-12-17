// models/BookingProperty.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BookingProperty extends Model {
    static associate(models) {
      // BookingProperty belongs to Booking
      BookingProperty.belongsTo(models.Booking, {
        foreignKey: 'booking_id',
        as: 'booking'
      });
      
      // BookingProperty belongs to Property
      BookingProperty.belongsTo(models.Property, {
        foreignKey: 'property_id',
        as: 'property'
      });
    }
  }

  BookingProperty.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    booking_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    property_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    property_name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    property_category: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    subtotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'BookingProperty',
    tableName: 'booking_properties',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return BookingProperty;
};