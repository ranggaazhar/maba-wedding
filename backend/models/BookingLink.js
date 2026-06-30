// models/BookingLink.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BookingLink extends Model {
    static associate(models) {
      BookingLink.belongsTo(models.Customer, {
        foreignKey: 'customer_id',
        as: 'customer'
      });
      // BookingLink belongs to Admin
      BookingLink.belongsTo(models.Admin, {
        foreignKey: 'created_by',
        as: 'creator'
      });
      
      // BookingLink has one Booking
      BookingLink.hasOne(models.Booking, {
        foreignKey: 'booking_link_id',
        as: 'booking',
        onDelete: 'SET NULL'
      });

      // Add defaultScope to always include Customer
      BookingLink.addScope('defaultScope', {
        include: [{ model: models.Customer, as: 'customer' }]
      }, { override: true });
    } 

    toJSON() {
      const values = { ...this.get() };
      values.customer_name = this.customer ? this.customer.name : null;
      values.customer_phone = this.customer ? this.customer.phone : null;
      return values;
    }
  }

  BookingLink.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'customers',
        key: 'id'
      }
    },
    token: {
      type: DataTypes.STRING(100),
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
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'BookingLink',
    tableName: 'booking_links',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return BookingLink;
};