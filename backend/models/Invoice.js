// models/Invoice.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Invoice extends Model {
    static associate(models) {
      // Invoice belongs to Booking
      Invoice.belongsTo(models.Booking, {
        foreignKey: 'booking_id',
        as: 'booking'
      });

      // Invoice has many InvoiceItems
      Invoice.hasMany(models.InvoiceItem, {
        foreignKey: 'invoice_id',
        as: 'items'
      });
    }
  }
  
  Invoice.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    booking_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    invoice_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    issue_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    subtotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    tax_amount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    discount_amount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    total_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    paid_amount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    payment_status: {
      type: DataTypes.ENUM('unpaid', 'partial', 'paid', 'overdue'),
      defaultValue: 'unpaid'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Invoice',
    tableName: 'invoices',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return Invoice;
};