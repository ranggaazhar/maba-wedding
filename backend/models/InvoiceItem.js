// models/InvoiceItem.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class InvoiceItem extends Model {
    static associate(models) {
      InvoiceItem.belongsTo(models.Invoice, {
        foreignKey: 'invoice_id',
        as: 'invoice'
      });

      InvoiceItem.belongsTo(models.Project, {
        foreignKey: 'project_id',
        as: 'project'
      });

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
      allowNull: false,
      references: { model: 'invoices', key: 'id' }
    },
    item_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    item_type: {
      type: DataTypes.ENUM('item', 'discount', 'penalty', 'adjustment'),
      allowNull: false,
      defaultValue: 'item',
      comment: 'item=normal, discount=kurangi total, penalty=denda/kerusakan, adjustment=koreksi harga'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
      allowNull: true,
      references: { model: 'projects', key: 'id' }
    },
    property_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'properties', key: 'id' }
    },
    display_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
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