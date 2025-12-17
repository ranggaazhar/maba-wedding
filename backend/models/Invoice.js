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
      
      // Invoice belongs to Admin
      Invoice.belongsTo(models.Admin, {
        foreignKey: 'created_by',
        as: 'creator'
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
      autoIncrement: true,
      allowNull: false
    },
    booking_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    customer_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    customer_phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    customer_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    event_venue: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    event_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    event_type: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    total: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    down_payment: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    issue_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    admin_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    payment_terms: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    pdf_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    pdf_generated_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Invoice',
    tableName: 'invoices',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Invoice;
};
