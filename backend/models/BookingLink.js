// models/BookingLink.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BookingLink extends Model {
    static associate(models) {
      // BookingLink belongs to Admin
      BookingLink.belongsTo(models.Admin, {
        foreignKey: 'created_by',
        as: 'creator'
      });
      
      // BookingLink has one Booking
      BookingLink.hasOne(models.Booking, {
        foreignKey: 'booking_link_id',
        as: 'booking'
      });
    }
  }

  BookingLink.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    token: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    customer_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    customer_phone: {
      type: DataTypes.STRING(20),
      allowNull: true
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
    },
    notes: {
      type: DataTypes.TEXT,
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