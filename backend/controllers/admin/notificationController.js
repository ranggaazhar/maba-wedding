const { Op } = require('sequelize');
const db = require('../../models');

class NotificationController {
  async getNotifications(req, res) {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // 1. Get recent bookings (last 24 hours)
      const bookings = await db.Booking.findAll({
        where: {
          submitted_at: {
            [Op.gte]: oneDayAgo
          }
        },
        order: [['submitted_at', 'DESC']],
        limit: 10
      });

      // 2. Get recent reviews (last 24 hours)
      const reviews = await db.Review.findAll({
        where: {
          submitted_at: {
            [Op.gte]: oneDayAgo
          }
        },
        order: [['submitted_at', 'DESC']],
        limit: 10
      });

      // 3. Format notifications
      const notifications = [];

      bookings.forEach(b => {
        const isUnread = b.payment_status === 'WAITING_CONFIRMATION' || b.payment_status === 'PENDING';
        notifications.push({
          id: `booking-${b.id}`,
          type: 'booking',
          target_id: b.id,
          title: `Booking Baru: ${b.booking_code}`,
          message: `${b.customer_name} - ${b.event_type} di ${b.event_venue}`,
          date: b.submitted_at,
          unread: isUnread
        });
      });

      reviews.forEach(r => {
        const isUnread = !r.admin_reply;
        notifications.push({
          id: `review-${r.id}`,
          type: 'review',
          target_id: r.id,
          title: `Review Baru dari ${r.customer_name}`,
          message: `⭐ ${r.rating} - "${r.review_text.substring(0, 45)}..."`,
          date: r.submitted_at,
          unread: isUnread
        });
      });

      // Sort by date DESC
      notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Count unread
      const unreadCount = notifications.filter(n => n.unread).length;

      res.json({
        success: true,
        data: {
          notifications: notifications.slice(0, 8),
          unreadCount
        }
      });
    } catch (err) {
      console.error('Get Notifications Error:', err);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
}

module.exports = new NotificationController();
