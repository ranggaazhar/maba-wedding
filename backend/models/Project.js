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
    }
  }
  
  Project.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    client_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    event_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cover_image: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    view_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Project',
    tableName: 'projects',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return Project;
};