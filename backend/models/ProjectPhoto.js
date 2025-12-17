// models/ProjectPhoto.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProjectPhoto extends Model {
    static associate(models) {
      // ProjectPhoto belongs to Project
      ProjectPhoto.belongsTo(models.Project, {
        foreignKey: 'project_id',
        as: 'project'
      });
    }
  }
  
  ProjectPhoto.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    caption: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'ProjectPhoto',
    tableName: 'project_photos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return ProjectPhoto;
};