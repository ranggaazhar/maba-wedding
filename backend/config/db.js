const db = require('../models');

async function connectDatabase() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Only sync in development
    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync({ alter: false });
      console.log('✅ Database synchronized');
    }

    try {
      await db.sequelize.query('ALTER TABLE booking_models MODIFY COLUMN project_id INT NULL');
      console.log('✅ Database column booking_models.project_id altered to NULL');
    } catch (queryErr) {
      console.log('ℹ️ booking_models.project_id already nullable or table not created:', queryErr.message);
    }

    try {
      await db.sequelize.query('ALTER TABLE booking_properties MODIFY COLUMN property_id INT NULL');
      console.log('✅ Database column booking_properties.property_id altered to NULL');
    } catch (queryErr) {
      console.log('ℹ️ booking_properties.property_id already nullable or table not created:', queryErr.message);
    }

    try {
      await db.sequelize.query("ALTER TABLE bookings MODIFY COLUMN payment_status ENUM('PENDING', 'WAITING_CONFIRMATION', 'CONFIRMED') NOT NULL DEFAULT 'PENDING'");
      console.log('✅ Database bookings.payment_status column altered to remove REJECTED');
    } catch (queryErr) {
      console.log('ℹ️ bookings.payment_status already altered or error altering:', queryErr.message);
    }

    try {
      await db.sequelize.query('ALTER TABLE review_links MODIFY COLUMN booking_id INT NULL');
      console.log('✅ Database column review_links.booking_id altered to NULL');
    } catch (queryErr) {
      console.log('ℹ️ review_links.booking_id already nullable or table not created:', queryErr.message);
    }

    try {
      await db.sequelize.query("UPDATE invoices SET status = 'SENT' WHERE status = 'OVERDUE'");
      await db.sequelize.query("ALTER TABLE invoices MODIFY COLUMN status ENUM('DRAFT', 'SENT', 'PAID') NOT NULL DEFAULT 'DRAFT'");
      console.log('✅ Database invoices.status column altered to remove OVERDUE');
    } catch (queryErr) {
      console.log('ℹ️ invoices.status already altered or error altering:', queryErr.message);
    }

  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = connectDatabase;