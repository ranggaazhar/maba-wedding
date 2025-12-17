// models/InvoiceItem.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class InvoiceItem extends Model {
    static associate(models) {
      // InvoiceItem belongs to Invoice
      InvoiceItem.belongsTo(models.Invoice, {
        foreignKey: 'invoice_id',
        as: 'invoice'
      });
    }
  }
  
  InvoiceItem.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    invoice_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    item_type: {
      type: DataTypes.ENUM('property', 'service', 'other'),
      allowNull: false
    },
    item_name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    unit_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    total_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'InvoiceItem',
    tableName: 'invoice_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });
  
  return InvoiceItem;
};