'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bookings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      booking_link_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'booking_links',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      booking_code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      customer_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      customer_phone: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      full_address: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      event_venue: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      event_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      event_type: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      referral_source: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      theme_color: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      total_estimate: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true
      },
      customer_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      payment_proof_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      bank_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      account_number: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      account_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      payment_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      submitted_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('bookings', ['booking_code']);
    await queryInterface.addIndex('bookings', ['event_date']);
    await queryInterface.addIndex('bookings', ['event_type']);
    await queryInterface.addIndex('bookings', ['referral_source']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('bookings');
  }
};