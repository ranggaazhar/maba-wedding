const db = require('../../models');
const { Op } = require('sequelize');

class SearchController {
  async globalSearch(req, res) {
    try {
      const { q } = req.query;
      if (!q) {
        return res.json({
          success: true,
          data: { bookings: [], projects: [], properties: [] }
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

      res.json({
        success: true,
        data: {
          bookings: bookings.map(b => ({ id: b.id, code: b.booking_code, name: b.customer_name })),
          projects: projects.map(p => ({ id: p.id, slug: p.slug, title: p.title })),
          properties: properties.map(p => ({ id: p.id, name: p.name }))
        }
      });
    } catch (err) {
      console.error('Global Search Error:', err);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
}

module.exports = new SearchController();
