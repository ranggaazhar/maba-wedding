// services/reminderService.js
const cron = require('node-cron');
const { Booking, BookingModel, BookingProperty, Invoice } = require('../models');
const whatsappService = require('./whatsappService');
const { Op } = require('sequelize');

class ReminderService {

  /**
   * Ambil semua booking yang event_date = hari ini + N hari
   */
  async getUpcomingBookings(daysAhead) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysAhead);
    const dateStr = targetDate.toISOString().split('T')[0]; // format YYYY-MM-DD

    return await Booking.findAll({
      where: {
        event_date: dateStr,
        payment_status: { [Op.notIn]: ['REJECTED'] }
      },
      include: [
        {
          model: BookingModel,
          as: 'models',
          include: [{ model: require('../models').Project, as: 'project' }]
        },
        {
          model: BookingProperty,
          as: 'properties'
        },
        {
          model: Invoice,
          as: 'invoice'
        }
      ]
    });
  }

  /**
   * Format rupiah
   */
  _formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(Number(amount || 0));
  }

  /**
   * Format tanggal panjang
   */
  _formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  /**
   * Build pesan reminder untuk 1 booking
   */
  _buildBookingMessage(booking, index, total) {


    // Item dekorasi
    const models = booking.models || [];
    const properties = booking.properties || [];
    let itemLines = '';

    if (models.length > 0) {
      itemLines += models.map(m => `   • ${m.project_title || m.project?.title || 'Model'}`).join('\n');
    }
    if (properties.length > 0) {
      if (itemLines) itemLines += '\n';
      itemLines += properties.map(p => `   • ${p.property_name} (${p.quantity}x)`).join('\n');
    }
    if (!itemLines) itemLines = '   • (belum ada item)';

    return `
━━━━━━━━━━━━━━━━━━━━
📌 *JOB ${index} dari ${total}*
━━━━━━━━━━━━━━━━━━━━
👤 *Customer:* ${booking.customer_name}
📞 *No HP:* ${booking.customer_phone}
📋 *Kode:* ${booking.booking_code}
🎭 *Acara:* ${booking.event_type}
📍 *Venue:* ${booking.event_venue}
📅 *Tanggal:* ${this._formatDate(booking.event_date)}

💼 *Item Dekorasi:*
${itemLines}
`.trim();
  }

  /**
   * Kirim reminder H-N ke group WA
   */
  async sendReminder(daysAhead) {
    const GROUP_TARGET = process.env.WA_GROUP_TARGET;
    if (!GROUP_TARGET) {
      console.error('❌ WA_GROUP_TARGET tidak diset di .env');
      return;
    }

    const bookings = await this.getUpcomingBookings(daysAhead);

    if (bookings.length === 0) {
      console.log(`✅ H-${daysAhead}: Tidak ada job pada tanggal tersebut, reminder tidak dikirim.`);
      return;
    }

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysAhead);
    const dateStr = this._formatDate(targetDate.toISOString().split('T')[0]);

    // Header pesan
    const header = `
🔔 *REMINDER H-${daysAhead} — ${dateStr}*
📦 Total Job: *${bookings.length} booking*
⏰ Segera persiapkan perlengkapan!
    `.trim();

    // Detail per booking
    const details = bookings.map((b, i) =>
      this._buildBookingMessage(b, i + 1, bookings.length)
    ).join('\n\n');

    // Footer
    const footer = `\n\n_Pesan ini dikirim otomatis oleh sistem Maba Wedding Decoration_`;

    const fullMessage = `${header}\n\n${details}${footer}`;

    try {
  console.log('📤 Mengirim ke:', GROUP_TARGET);
  console.log('📝 Pesan:', fullMessage);
  await whatsappService.sendMessage(GROUP_TARGET, fullMessage);
  console.log(`✅ Reminder H-5 berhasil dikirim ke group.`);
} catch (err) {
  console.error(`❌ Gagal kirim reminder H-5:`, err.message);
}
  }

  initCronJobs() {
    // H-5 setiap hari jam 08.00 pagi (timezone Asia/Jakarta)
    cron.schedule('00 09 * * *', async () => {
      console.log('⏰ Menjalankan reminder H-5...');
      await this.sendReminder(5);
    }, {
      timezone: 'Asia/Jakarta'
    });

    console.log('✅ Cron job reminder aktif: H-5 setiap hari jam 10.45 WIB (TEST)');
  }
}

module.exports = new ReminderService();