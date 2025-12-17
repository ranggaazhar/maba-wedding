// models/Property.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Property extends Model {
    static associate(models) {
      // Property belongs to PropertyCategory
      Property.belongsTo(models.PropertyCategory, {
        foreignKey: 'category_id',
        as: 'category'
      });

      // Property has many BookingProperties
      Property.hasMany(models.BookingProperty, {
        foreignKey: 'property_id',
        as: 'bookingProperties'
      });
    }
  }
  
  Property.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    base_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Property',
    tableName: 'properties',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return Property;
};