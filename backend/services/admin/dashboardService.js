// services/dashboardService.js
const { Booking, Project, Property, Review } = require('../../models');
const { Op, fn, col, literal } = require('sequelize');

class DashboardService {
  _getMonthRange(monthsAgo = 0) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
    const end = monthsAgo === 0
      ? now
      : new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0);
    return { start, end };
  }

  _calcTrend(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  async getStats() {
    const { start: thisMonthStart } = this._getMonthRange(0);
    const { start: lastMonthStart, end: lastMonthEnd } = this._getMonthRange(1);

    // ── Booking counts ─────────────────────────────────────────────
    const [
      totalBookings,
      bookingsThisMonth,
      bookingsLastMonth,
      pending,
      waitingConfirmation,
      confirmed,
      rejected,
    ] = await Promise.all([
      Booking.count(),
      Booking.count({ where: { submitted_at: { [Op.gte]: thisMonthStart } } }),
      Booking.count({ where: { submitted_at: { [Op.between]: [lastMonthStart, lastMonthEnd] } } }),
      Booking.count({ where: { payment_status: 'PENDING' } }),
      Booking.count({ where: { payment_status: 'WAITING_CONFIRMATION' } }),
      Booking.count({ where: { payment_status: 'CONFIRMED' } }),
      Booking.count({ where: { payment_status: 'REJECTED' } }),
    ]);

    // ── Revenue (dp_amount from CONFIRMED bookings) ────────────────
    const [revenueThisMonth, revenueLastMonth, totalDpConfirmed, totalEstimateAll] = await Promise.all([
      Booking.sum('dp_amount', {
        where: { payment_status: 'CONFIRMED', confirmed_at: { [Op.gte]: thisMonthStart } },
      }),
      Booking.sum('dp_amount', {
        where: { payment_status: 'CONFIRMED', confirmed_at: { [Op.between]: [lastMonthStart, lastMonthEnd] } },
      }),
      Booking.sum('dp_amount', { where: { payment_status: 'CONFIRMED' } }),
      Booking.sum('total_estimate'),
    ]);

    // ── Project & Property counts ──────────────────────────────────
    const [totalProjects, publishedProjects, totalProperties, availableProperties] = await Promise.all([
      Project.count(),
      Project.count({ where: { is_published: true } }),
      Property.count(),
      Property.count({ where: { is_available: true } }),
    ]);

    // ── Review stats — reuse reviewService logic ───────────────────
    const reviewStats = await Review.findOne({
      attributes: [
        [fn('COUNT', col('id')), 'total'],
        [fn('AVG', col('rating')), 'avg_rating'],
      ],
      where: { is_approved: true, is_published: true },
      raw: true,
    });

    // ── Monthly chart data (12 bulan terakhir) ─────────────────────
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyData = await Booking.findAll({
      attributes: [
        [fn('DATE_FORMAT', col('submitted_at'), '%Y-%m'), 'month'],
        [fn('COUNT', col('id')), 'total'],
        [fn('SUM', col('dp_amount')), 'revenue'],
      ],
      where: { submitted_at: { [Op.gte]: twelveMonthsAgo } },
      group: [literal("DATE_FORMAT(submitted_at, '%Y-%m')")],
      order: [[literal("DATE_FORMAT(submitted_at, '%Y-%m')"), 'ASC']],
      raw: true,
    });

    return {
      bookings: {
        total: totalBookings,
        thisMonth: bookingsThisMonth,
        trend: this._calcTrend(bookingsThisMonth, bookingsLastMonth),
        byStatus: { pending, waitingConfirmation, confirmed, rejected },
      },
      revenue: {
        thisMonth: revenueThisMonth || 0,
        lastMonth: revenueLastMonth || 0,
        trend: this._calcTrend(revenueThisMonth || 0, revenueLastMonth || 0),
        totalDpConfirmed: totalDpConfirmed || 0,
        totalEstimateAll: totalEstimateAll || 0,
      },
      projects: {
        total: totalProjects,
        published: publishedProjects,
      },
      properties: {
        total: totalProperties,
        available: availableProperties,
      },
      reviews: {
        total: parseInt(reviewStats?.total || 0),
        avgRating: parseFloat(reviewStats?.avg_rating || 0).toFixed(1),
      },
      charts: {
        monthlyBookings: monthlyData,
      },
    };
  }

  async getRecentBookings(limit = 5) {
    const bookings = await Booking.findAll({
      attributes: [
        'id', 'booking_code', 'customer_name', 'customer_phone',
        'event_date', 'event_venue', 'event_type',
        'total_estimate', 'dp_amount', 'payment_status', 'submitted_at',
      ],
      order: [['submitted_at', 'DESC']],
      limit: parseInt(limit),
    });
    return bookings;
  }

  async getRecentReviews(limit = 5) {
    const reviews = await Review.findAll({
      attributes: ['id', 'customer_name', 'rating', 'review_text', 'submitted_at'],
      where: { is_approved: true, is_published: true },
      order: [['submitted_at', 'DESC']],
      limit: parseInt(limit),
    });
    return reviews;
  }
}

module.exports = new DashboardService();