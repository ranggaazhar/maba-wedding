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
      autoIncrement: true
    },
    booking_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    unique_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    is_used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ReviewLink',
    tableName: 'review_links',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return ReviewLink;
};