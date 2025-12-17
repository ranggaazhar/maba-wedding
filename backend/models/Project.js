// models/Project.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    static associate(models) {
      // Project belongs to Category
      Project.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category'
      });
      
      // Project belongs to Admin
      Project.belongsTo(models.Admin, {
        foreignKey: 'created_by',
        as: 'creator'
      });
      
      // Project has many ProjectPhotos
      Project.hasMany(models.ProjectPhoto, {
        foreignKey: 'project_id',
        as: 'photos'
      });
      
      // Project has many ProjectDetails
      Project.hasMany(models.ProjectDetail, {
        foreignKey: 'project_id',
        as: 'details'
      });
      
      // Project has many ProjectIncludes
      Project.hasMany(models.ProjectInclude, {
        foreignKey: 'project_id',
        as: 'includes'
      });
      
      // Project has many ProjectMoods
      Project.hasMany(models.ProjectMood, {
        foreignKey: 'project_id',
        as: 'moods'
      });
      
      // Project has many BookingModels
      Project.hasMany(models.BookingModel, {
        foreignKey: 'project_id',
        as: 'bookingModels'
      });
      
      // Project has many InvoiceItems
      Project.hasMany(models.InvoiceItem, {
        foreignKey: 'project_id',
        as: 'invoiceItems'
      });
    }
  }

  Project.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    theme: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    atmosphere_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    view_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Project',
    tableName: 'projects',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Project;
};