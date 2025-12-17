// models/ProjectDetailItem.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProjectDetailItem extends Model {
    static associate(models) {
      // ProjectDetailItem belongs to ProjectDetail
      ProjectDetailItem.belongsTo(models.ProjectDetail, {
        foreignKey: 'project_detail_id',
        as: 'detail'
      });
    }
  }
  
  ProjectDetailItem.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    project_detail_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    item_text: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'ProjectDetailItem',
    tableName: 'project_detail_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return ProjectDetailItem;
};