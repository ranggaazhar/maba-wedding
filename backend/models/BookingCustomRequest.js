'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BookingCustomRequest extends Model {
    static associate(models) {
      BookingCustomRequest.belongsTo(models.Booking, {
        foreignKey: 'booking_id',
        as: 'booking'
      });
      BookingCustomRequest.belongsTo(models.Admin, {
        foreignKey: 'reviewed_by',
        as: 'reviewer'
      });
    }
  }

  BookingCustomRequest.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },

    booking_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Judul request tidak boleh kosong' },
        len: { args: [1, 200], msg: 'Judul maksimal 200 karakter' }
      }
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Deskripsi tidak boleh kosong' }
      }
    },

    color_theme: {
      type: DataTypes.STRING(100),
      allowNull: true
    },

    reference_images: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
      // Getter: selalu return array meskipun null
      get() {
        const raw = this.getDataValue('reference_images');
        if (!raw) return [];
        if (typeof raw === 'string') {
          try { return JSON.parse(raw); } catch { return []; }
        }
        return raw;
      }
    },

    estimated_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      validate: {
        min: { args: [0], msg: 'Estimasi harga tidak boleh negatif' }
      }
    },

    admin_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    reviewed_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },

    status: {
      type: DataTypes.ENUM('PENDING', 'REVIEWED', 'APPROVED', 'REJECTED'),
      defaultValue: 'PENDING',
      allowNull: false,
      validate: {
        isIn: {
          args: [['PENDING', 'REVIEWED', 'APPROVED', 'REJECTED']],
          msg: 'Status tidak valid'
        }
      }
    },

    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    }

  }, {
    sequelize,
    modelName: 'BookingCustomRequest',
    tableName: 'booking_custom_requests',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return BookingCustomRequest;
};