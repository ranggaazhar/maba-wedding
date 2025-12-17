'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('invoices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      booking_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'bookings',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      customer_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      customer_phone: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      customer_address: {
        type: Sequelize.TEXT,
        allowNull: true
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
        allowNull: true
      },
      total: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      down_payment: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      issue_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      due_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      admin_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      payment_terms: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      pdf_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      pdf_generated_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'admins',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
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

    await queryInterface.addIndex('invoices', ['booking_id']);
    await queryInterface.addIndex('invoices', ['customer_name']);
    await queryInterface.addIndex('invoices', ['issue_date']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('invoices');
  }
};