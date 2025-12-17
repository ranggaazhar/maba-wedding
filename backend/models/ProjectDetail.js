// models/ProjectDetail.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProjectDetail extends Model {
    static associate(models) {
      // ProjectDetail belongs to Project
      ProjectDetail.belongsTo(models.Project, {
        foreignKey: 'project_id',
        as: 'project'
      });
      
      // ProjectDetail has many ProjectDetailItems
      ProjectDetail.hasMany(models.ProjectDetailItem, {
        foreignKey: 'detail_id',
        as: 'items'
      });
    }
  }

  ProjectDetail.init({
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
    detail_type: {
      type: DataTypes.ENUM('color_palette', 'flowers', 'other'),
      defaultValue: 'other'
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'ProjectDetail',
    tableName: 'project_details',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return ProjectDetail;
};
