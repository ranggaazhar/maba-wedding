// models/ReviewLink.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ReviewLink extends Model {
    static associate(models) {
      // ReviewLink belongs to Booking
      ReviewLink.belongsTo(models.Booking, {
        foreignKey: 'booking_id',
        as: 'booking'
      });
      
      // ReviewLink belongs to Admin
      ReviewLink.belongsTo(models.Admin, {
        foreignKey: 'created_by',
        as: 'creator'
      });
      
      // ReviewLink has one Review
      ReviewLink.hasOne(models.Review, {
        foreignKey: 'review_link_id',
        as: 'review'
      });
    }
  }

  ReviewLink.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    booking_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    token: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
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
    modelName: 'ReviewLink',
    tableName: 'review_links',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return ReviewLink;
};