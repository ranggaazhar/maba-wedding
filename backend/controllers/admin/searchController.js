const db = require('../../models');
const { Op } = require('sequelize');

class SearchController {
  async globalSearch(req, res) {
    try {
      const { q } = req.query;
      if (!q) {
        return res.json({
          success: true,
          data: {
            bookings: [],
            projects: [],
            properties: [],
            invoices: [],
            reviews: [],
            propertyCategories: [],
            categories: []
          }
        });
      }

      // Search Bookings
      const bookings = await db.Booking.findAll({
        where: {
          [Op.or]: [
            { booking_code: { [Op.like]: `%${q}%` } },
            { customer_name: { [Op.like]: `%${q}%` } },
            { customer_phone: { [Op.like]: `%${q}%` } }
          ]
        },
        limit: 5
      });

      // Search Projects
      const projects = await db.Project.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.like]: `%${q}%` } },
            { description: { [Op.like]: `%${q}%` } }
          ]
        },
        limit: 5
      });

      // Search Properties
      const properties = await db.Property.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${q}%` } },
            { description: { [Op.like]: `%${q}%` } }
          ]
        },
        limit: 5
      });

      // Search Invoices
      const invoices = await db.Invoice.findAll({
        where: {
          [Op.or]: [
            { invoice_number: { [Op.like]: `%${q}%` } },
            { customer_name: { [Op.like]: `%${q}%` } },
            { customer_phone: { [Op.like]: `%${q}%` } }
          ]
        },
        limit: 5
      });

      // Search Reviews
      const reviews = await db.Review.findAll({
        where: {
          [Op.or]: [
            { customer_name: { [Op.like]: `%${q}%` } },
            { review_text: { [Op.like]: `%${q}%` } }
          ]
        },
        limit: 5
      });

      // Search Property Categories
      const propertyCategories = await db.PropertyCategory.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${q}%` } },
            { description: { [Op.like]: `%${q}%` } }
          ]
        },
        limit: 5
      });

      // Search Project Categories
      const categories = await db.Category.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${q}%` } },
            { description: { [Op.like]: `%${q}%` } }
          ]
        },
        limit: 5
      });

      res.json({
        success: true,
        data: {
          bookings: bookings.map(b => ({ id: b.id, code: b.booking_code, name: b.customer_name })),
          projects: projects.map(p => ({ id: p.id, slug: p.slug, title: p.title })),
          properties: properties.map(p => ({ id: p.id, name: p.name })),
          invoices: invoices.map(i => ({ id: i.id, invoice_number: i.invoice_number, customer_name: i.customer_name })),
          reviews: reviews.map(r => ({ id: r.id, customer_name: r.customer_name, rating: r.rating, review_text: r.review_text })),
          propertyCategories: propertyCategories.map(pc => ({ id: pc.id, name: pc.name })),
          categories: categories.map(c => ({ id: c.id, name: c.name }))
        }
      });
    } catch (err) {
      console.error('Global Search Error:', err);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
}

module.exports = new SearchController();
