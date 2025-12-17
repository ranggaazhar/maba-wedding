// models/Review.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      // Review belongs to ReviewLink
      Review.belongsTo(models.ReviewLink, {
        foreignKey: 'review_link_id',
        as: 'reviewLink'
      });
      
      // Review belongs to Admin (replied_by)
      Review.belongsTo(models.Admin, {
        foreignKey: 'replied_by',
        as: 'replier'
      });
      
      // Review belongs to Admin (moderated_by)
      Review.belongsTo(models.Admin, {
        foreignKey: 'moderated_by',
        as: 'moderator'
      });
    }
  }

  Review.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    review_link_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    customer_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    review_text: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    is_approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    admin_reply: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    replied_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    replied_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    moderated_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    moderated_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Review',
    tableName: 'reviews',
    underscored: true,
    timestamps: true,
    createdAt: 'submitted_at',
    updatedAt: false
  });

  return Review;
};
