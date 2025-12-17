// models/ProjectMood.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProjectMood extends Model {
    static associate(models) {
      // ProjectMood belongs to Project
      ProjectMood.belongsTo(models.Project, {
        foreignKey: 'project_id',
        as: 'project'
      });
    }
  }

  ProjectMood.init({
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
    mood: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'ProjectMood',
    tableName: 'project_moods',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return ProjectMood;
};