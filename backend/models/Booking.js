// models/Booking.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      Booking.belongsTo(models.Customer, {
        foreignKey: 'customer_id',
        as: 'customer'
      });
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

      // ← Relasi ke custom requests
      Booking.hasMany(models.BookingCustomRequest, {
        foreignKey: 'booking_id',
        as: 'customRequests',
        onDelete: 'CASCADE'
      });

      // Add defaultScope to always include Customer
      Booking.addScope('defaultScope', {
        include: [{ model: models.Customer, as: 'customer' }]
      }, { override: true });
    }

    toJSON() {
      const values = { ...this.get() };
      values.customer_name = this.customer ? this.customer.name : null;
      values.customer_phone = this.customer ? this.customer.phone : null;
      values.full_address = this.customer ? this.customer.address : null;
      return values;
    }
  }

  Booking.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id'
      }
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
      type: DataTypes.VIRTUAL,
      get() {
        return this.customer ? this.customer.name : null;
      }
    },
    customer_phone: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.customer ? this.customer.phone : null;
      }
    },
    full_address: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.customer ? this.customer.address : null;
      }
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
      type: DataTypes.ENUM('PENDING', 'WAITING_CONFIRMATION', 'CONFIRMED'),
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
    has_custom_request: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: 'true jika booking mengandung custom request dari customer'
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