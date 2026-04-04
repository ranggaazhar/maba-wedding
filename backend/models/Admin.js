// models/Admin.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    static associate(models) {
      // Admin has many Projects
      Admin.hasMany(models.Project, {
        foreignKey: 'created_by',
        as: 'projects'
      });

      Admin.hasMany(models.Property, {
        foreignKey: 'created_by',
        as: 'properties'
      });
 
      Admin.hasMany(models.BookingLink, {
        foreignKey: 'created_by',
        as: 'bookingLinks'
      });
      
      // Admin has many Invoices
      Admin.hasMany(models.Invoice, {
        foreignKey: 'created_by',
        as: 'invoices'
      });
      
      // Admin has many ReviewLinks
      Admin.hasMany(models.ReviewLink, {
        foreignKey: 'created_by',
        as: 'reviewLinks'
      });
      
      // Admin has many Reviews (replied_by)
      Admin.hasMany(models.Review, {
        foreignKey: 'replied_by',
        as: 'repliedReviews'
      });
      
      // Admin has many Reviews (moderated_by)
      Admin.hasMany(models.Review, {
        foreignKey: 'moderated_by',
        as: 'moderatedReviews'
      });
      
      // // Admin has many SiteSettings
      // Admin.hasMany(models.SiteSetting, {
      //   foreignKey: 'updated_by',
      //   as: 'updatedSettings'
      // });
    }
  }

  Admin.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Admin',
    tableName: 'admins',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Admin;
};