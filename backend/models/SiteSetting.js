// models/SiteSetting.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SiteSetting extends Model {
    static associate(models) {
      // No associations for SiteSetting
    }
  }
  
  SiteSetting.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    setting_key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    setting_value: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    setting_type: {
      type: DataTypes.ENUM('text', 'number', 'boolean', 'json'),
      defaultValue: 'text'
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'SiteSetting',
    tableName: 'site_settings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return SiteSetting;
};