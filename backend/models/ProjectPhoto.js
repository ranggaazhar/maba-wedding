// models/ProjectPhoto.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProjectPhoto extends Model {
    static associate(models) {
      ProjectPhoto.belongsTo(models.Project, {
        foreignKey: 'project_id',
        as: 'project'
      });

      ProjectPhoto.hasMany(models.ProjectPhotoColor, {
        foreignKey: 'photo_id',
        as: 'colors'
      });

      ProjectPhoto.hasMany(models.ProjectPhotoFlower, {
        foreignKey: 'photo_id',
        as: 'flowers'
      });
    }
  }

  ProjectPhoto.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    caption: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    position: {
      type: DataTypes.ENUM('left', 'right', 'center'),
      defaultValue: 'center'
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    is_hero: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'ProjectPhoto',
    tableName: 'project_photos',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return ProjectPhoto;
};