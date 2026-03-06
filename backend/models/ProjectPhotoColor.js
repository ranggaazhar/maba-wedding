// models/ProjectPhotoColor.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProjectPhotoColor extends Model {
    static associate(models) {
      ProjectPhotoColor.belongsTo(models.ProjectPhoto, {
        foreignKey: 'photo_id',
        as: 'photo'
      });
    }
  }

  ProjectPhotoColor.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    photo_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    color_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    color_hex: {
      type: DataTypes.STRING(7),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'ProjectPhotoColor',
    tableName: 'project_photo_colors',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return ProjectPhotoColor;
};