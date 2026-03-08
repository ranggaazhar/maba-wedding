// models/Booking.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      Booking.belongsTo(models.BookingLink, {
        foreignKey: 'booking_link_id',
        as: 'bookingLink'
      });
      Booking.hasMany(models.BookingModel, {
        foreignKey: 'booking_id',
        as: 'models'
      });
      Booking.hasMany(models.BookingProperty, {
        foreignKey: 'booking_id',
        as: 'properties'
      });
      Booking.hasOne(models.Invoice, {
        foreignKey: 'booking_id',
        as: 'invoice'
      });
      Booking.hasOne(models.ReviewLink, {
        foreignKey: 'booking_id',
        as: 'reviewLink'
      });
    }
  }

  Booking.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    booking_link_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: true
    },
    booking_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    customer_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    customer_phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    full_address: {
      type: DataTypes.TEXT,
      allowNull: false
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
      allowNull: false
    },
    referral_source: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    theme_color: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    total_estimate: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    dp_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    customer_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    payment_proof_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    bank_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    account_number: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    account_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // ── Field baru ──────────────────────────────────────
    payment_status: {
      type: DataTypes.ENUM('PENDING', 'WAITING_CONFIRMATION', 'CONFIRMED', 'REJECTED'),
      defaultValue: 'PENDING',
      allowNull: false
    },
    confirmed_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    confirmed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Booking',
    tableName: 'bookings',
    underscored: true,
    timestamps: true,
    createdAt: 'submitted_at',
    updatedAt: 'updated_at'
  });

  return Booking;
};