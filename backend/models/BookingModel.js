// models/BookingModel.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BookingModel extends Model {
    static associate(models) {
      // BookingModel belongs to Booking
      BookingModel.belongsTo(models.Booking, {
        foreignKey: 'booking_id',
        as: 'booking'
      });
    }
  }
  
  BookingModel.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    booking_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    model_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    model_category: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'BookingModel',
    tableName: 'booking_models',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });
  
  return BookingModel;
};