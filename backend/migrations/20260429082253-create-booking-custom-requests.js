'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('booking_custom_requests', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      booking_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'bookings',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: 'Judul singkat permintaan custom'
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Deskripsi detail model dekorasi yang diinginkan'
      },

      color_theme: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Tema warna yang diinginkan customer'
      },

      reference_images: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null,
        comment: 'Array URL foto referensi yang diupload customer'
      },
      estimated_price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Estimasi harga yang diisi admin setelah review'
      },

      admin_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Catatan admin terkait request ini'
      },

      reviewed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Admin ID yang mereview request'
      },

      reviewed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },

      status: {
        type: Sequelize.ENUM('PENDING', 'REVIEWED', 'APPROVED', 'REJECTED'),
        defaultValue: 'PENDING',
        allowNull: false,
        comment: 'PENDING=baru masuk, REVIEWED=sudah dicek admin, APPROVED=disetujui, REJECTED=ditolak'
      },

      rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Alasan penolakan jika status REJECTED'
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // ── Index ─────────────────────────────────────────────────
    await queryInterface.addIndex('booking_custom_requests', ['booking_id'], {
      name: 'idx_custom_requests_booking_id'
    });

    await queryInterface.addIndex('booking_custom_requests', ['status'], {
      name: 'idx_custom_requests_status'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('booking_custom_requests', 'idx_custom_requests_status');
    await queryInterface.removeIndex('booking_custom_requests', 'idx_custom_requests_booking_id');
    await queryInterface.dropTable('booking_custom_requests');
  }
};