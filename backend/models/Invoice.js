// models/Invoice.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Invoice extends Model {
    static associate(models) {
      Invoice.belongsTo(models.Booking, {
        foreignKey: 'booking_id',
        as: 'booking'
      });

      Invoice.belongsTo(models.Admin, {
        foreignKey: 'created_by',
        as: 'creator'
      });

      Invoice.hasMany(models.InvoiceItem, {
        foreignKey: 'invoice_id',
        as: 'items',
        onDelete: 'CASCADE'
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
    invoice_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
      comment: 'Format: INV2603001'
    },
    booking_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'bookings', key: 'id' }
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
      allowNull: false,
      defaultValue: 0
    },
    down_payment: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'SENT', 'PAID', 'OVERDUE'),
      allowNull: false,
      defaultValue: 'DRAFT',
      comment: 'DRAFT=belum dikirim, SENT=sudah dikirim ke customer, PAID=lunas, OVERDUE=lewat jatuh tempo'
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    issue_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Batas waktu pelunasan'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Catatan untuk customer'
    },
    admin_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Catatan internal admin'
    },
    payment_terms: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Syarat pembayaran'
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
      allowNull: true,
      references: { model: 'admins', key: 'id' }
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