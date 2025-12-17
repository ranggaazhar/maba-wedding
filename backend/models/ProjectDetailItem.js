// models/ProjectDetailItem.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProjectDetailItem extends Model {
    static associate(models) {
      // ProjectDetailItem belongs to ProjectDetail
      ProjectDetailItem.belongsTo(models.ProjectDetail, {
        foreignKey: 'detail_id',
        as: 'detail'
      });
    }
  }

  ProjectDetailItem.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    detail_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
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
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return ProjectDetailItem;
};
