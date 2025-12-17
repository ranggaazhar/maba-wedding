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
      
      // Property belongs to Admin
      Property.belongsTo(models.Admin, {
        foreignKey: 'created_by',
        as: 'creator'
      });
      
      // Property has many PropertyImages
      Property.hasMany(models.PropertyImage, {
        foreignKey: 'property_id',
        as: 'images'
      });
      
      // Property has many BookingProperties
      Property.hasMany(models.BookingProperty, {
        foreignKey: 'property_id',
        as: 'bookingProperties'
      });
      
      // Property has many InvoiceItems
      Property.hasMany(models.InvoiceItem, {
        foreignKey: 'property_id',
        as: 'invoiceItems'
      });
    }
  }

  Property.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Property',
    tableName: 'properties',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Property;
};