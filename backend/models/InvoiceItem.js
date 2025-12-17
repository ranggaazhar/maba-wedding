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
      
      // InvoiceItem belongs to Project
      InvoiceItem.belongsTo(models.Project, {
        foreignKey: 'project_id',
        as: 'project'
      });
      
      // InvoiceItem belongs to Property
      InvoiceItem.belongsTo(models.Property, {
        foreignKey: 'property_id',
        as: 'property'
      });
    }
  }

  InvoiceItem.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    invoice_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    item_name: {
      type: DataTypes.STRING(255),
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
    subtotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    property_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'InvoiceItem',
    tableName: 'invoice_items',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return InvoiceItem;
};