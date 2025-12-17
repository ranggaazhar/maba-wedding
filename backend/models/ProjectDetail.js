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
        foreignKey: 'project_detail_id',
        as: 'items'
      });
    }
  }
  
  ProjectDetail.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    section_title: {
      type: DataTypes.STRING(100),
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
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return ProjectDetail;
};