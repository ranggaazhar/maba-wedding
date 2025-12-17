// models/SiteSetting.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SiteSetting extends Model {
    static associate(models) {
      // SiteSetting belongs to Admin
      SiteSetting.belongsTo(models.Admin, {
        foreignKey: 'updated_by',
        as: 'updater'
      });
    }
  }

  SiteSetting.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
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
      type: DataTypes.STRING(50),
      defaultValue: 'text'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'SiteSetting',
    tableName: 'site_settings',
    underscored: true,
    timestamps: true,
    createdAt: false,
    updatedAt: 'updated_at'
  });

  return SiteSetting;
};