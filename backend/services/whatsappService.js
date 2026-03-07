// services/whatsappService.js
// Menggunakan Fonnte Free — kirim teks + link download PDF (tanpa attachment)

const axios = require('axios');

class WhatsappService {

  /**
   * Kirim pesan teks ke nomor WA customer
   */
  async sendMessage(phone, message) {
    const token = process.env.FONNTE_TOKEN;
    console.log('🔍 FONNTE_TOKEN:', token); // ← tambah ini sementara
  console.log('🔍 TARGET:', phone);
    if (!token) throw new Error('FONNTE_TOKEN tidak diset di .env');

    const normalizedPhone = this._normalizePhone(phone);

    const response = await axios.post(
      'https://api.fonnte.com/send',
      { target: normalizedPhone, message },
      { headers: { Authorization: token } }
    );

    return response.data;
  }

  /**
   * Flow lengkap konfirmasi booking:
   * Kirim 1 pesan berisi ringkasan + link download PDF
   *
   * @param {Object} booking  - data booking lengkap
   * @param {string} pdfPath  - path file PDF di server (misal: uploads/booking-pdfs/booking-BK2603001.pdf)
   */
  async sendBookingConfirmation(booking, pdfPath) {
    try {
      const dpAmount = Number(booking.dp_amount || Math.ceil(Number(booking.total_estimate) * 0.1));
      const remaining = Number(booking.total_estimate || 0) - dpAmount;

      const eventDate = new Date(booking.event_date).toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });

      // Buat URL publik untuk download PDF
      const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
      // pdfPath contoh: uploads/booking-pdfs/booking-BK2603001-xxx.pdf
      const pdfUrl = `${BASE_URL}/${pdfPath.replace(/\\/g, '/')}`;

      const message = `
✅ *BOOKING DIKONFIRMASI*

Halo *${booking.customer_name}*! 🌸

Pembayaran DP Anda telah kami konfirmasi. Berikut ringkasan booking:

📋 *Kode Booking:* ${booking.booking_code}
📅 *Tanggal Acara:* ${eventDate}
📍 *Lokasi:* ${booking.event_venue}
💰 *DP Dibayar:* ${this._formatRupiah(dpAmount)}
💳 *Sisa Pelunasan:* ${this._formatRupiah(remaining)}

📄 *Download detail booking lengkap:*
${pdfUrl}

_Link aktif selama 30 hari_

Terima kasih telah mempercayakan dekorasi kepada *Maba Wedding Decoration* 💍
Hubungi kami jika ada pertanyaan.
      `.trim();

      await this.sendMessage(booking.customer_phone, message);

      return { success: true, message: 'Pesan berhasil dikirim ke WhatsApp', pdf_url: pdfUrl };
    } catch (error) {
      console.error('❌ WhatsApp send error:', error.message);
      // Tidak throw — WA failure tidak boleh batalkan konfirmasi booking
      return { success: false, message: error.message };
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  // Normalisasi nomor: 08xxx → 628xxx
  _normalizePhone(phone) {
    if (!phone) return phone;
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = '62' + cleaned.slice(1);
    if (!cleaned.startsWith('62')) cleaned = '62' + cleaned;
    return cleaned;
  }

  _formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(amount || 0));
  }
}

module.exports = new WhatsappService();