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
      
      // BookingModel belongs to Category
      BookingModel.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category'
      });
      
      // BookingModel belongs to Project
      BookingModel.belongsTo(models.Project, {
        foreignKey: 'project_id',
        as: 'project'
      });
    }
  }

  BookingModel.init({
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
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    project_title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'BookingModel',
    tableName: 'booking_models',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return BookingModel;
};
