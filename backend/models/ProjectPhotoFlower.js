// models/ProjectPhotoFlower.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProjectPhotoFlower extends Model {
    static associate(models) {
      ProjectPhotoFlower.belongsTo(models.ProjectPhoto, {
        foreignKey: 'photo_id',
        as: 'photo'
      });
    }
  }

  ProjectPhotoFlower.init({
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
    flower_name: {
      type: DataTypes.STRING(100),
      allowNull: false
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
    modelName: 'ProjectPhotoFlower',
    tableName: 'project_photo_flowers',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return ProjectPhotoFlower;
};