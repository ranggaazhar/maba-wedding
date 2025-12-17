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
      autoIncrement: true,
      allowNull: false
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    item: {
      type: DataTypes.TEXT,
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
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return ProjectInclude;
};