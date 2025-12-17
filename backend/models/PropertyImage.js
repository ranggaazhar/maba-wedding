// models/PropertyImage.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PropertyImage extends Model {
    static associate(models) {
      // PropertyImage belongs to Property
      PropertyImage.belongsTo(models.Property, {
        foreignKey: 'property_id',
        as: 'property'
      });
    }
  }

  PropertyImage.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    property_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'PropertyImage',
    tableName: 'property_images',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return PropertyImage;
};