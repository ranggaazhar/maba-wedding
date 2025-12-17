// models/PropertyCategory.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PropertyCategory extends Model {
    static associate(models) {
      // PropertyCategory has many Properties
      PropertyCategory.hasMany(models.Property, {
        foreignKey: 'category_id',
        as: 'properties'
      });
    }
  }

  PropertyCategory.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    name: {
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
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'PropertyCategory',
    tableName: 'property_categories',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return PropertyCategory;
};
