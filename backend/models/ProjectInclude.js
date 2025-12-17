// models/ProjectInclude.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProjectInclude extends Model {
    static associate(models) {
      // ProjectInclude belongs to Project
      ProjectInclude.belongsTo(models.Project, {
        foreignKey: 'project_id',
        as: 'project'
      });
    }
  }
  
  ProjectInclude.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    project_id: {
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
    modelName: 'ProjectInclude',
    tableName: 'project_includes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return ProjectInclude;
};