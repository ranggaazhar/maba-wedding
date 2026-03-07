// services/bookingPdfService.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class BookingPdfService {
  async generateBookingPdf(booking) {
    const outputDir = path.join(__dirname, '../uploads/booking-pdfs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const fileName = `booking-${booking.booking_code}-${Date.now()}.pdf`;
    const filePath = path.join(outputDir, fileName);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);
      doc.fontSize(22).font('Helvetica-Bold').text('MABA WEDDING DECORATION', { align: 'center' });
      doc.fontSize(11).font('Helvetica').text('Detail Booking Dekorasi', { align: 'center' });
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown();

      // ── Booking Info ────────────────────────────────
      doc.fontSize(13).font('Helvetica-Bold').text('INFORMASI BOOKING');
      doc.moveDown(0.3);
      this._row(doc, 'Kode Booking', booking.booking_code);
      this._row(doc, 'Tanggal Submit', new Date(booking.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
      this._row(doc, 'Status Pembayaran', 'DP Terkonfirmasi ✓');
      doc.moveDown();

      // ── Customer Info ───────────────────────────────
      doc.fontSize(13).font('Helvetica-Bold').text('DATA CUSTOMER');
      doc.moveDown(0.3);
      this._row(doc, 'Nama', booking.customer_name);
      this._row(doc, 'No. Telepon', booking.customer_phone);
      this._row(doc, 'Alamat', booking.full_address);
      this._row(doc, 'Lokasi Acara', booking.event_venue);
      this._row(doc, 'Tanggal Acara', new Date(booking.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
      this._row(doc, 'Jenis Acara', booking.event_type);
      if (booking.theme_color) this._row(doc, 'Warna Tema', booking.theme_color);
      if (booking.customer_notes) this._row(doc, 'Catatan', booking.customer_notes);
      doc.moveDown();

      // ── Model Dekorasi ──────────────────────────────
      if (booking.models && booking.models.length > 0) {
        doc.fontSize(13).font('Helvetica-Bold').text('MODEL DEKORASI');
        doc.moveDown(0.3);

        booking.models.forEach((model, i) => {
          doc.fontSize(10).font('Helvetica-Bold').text(`${i + 1}. ${model.project_title}`);
          doc.font('Helvetica').text(`   Kategori : ${model.category?.name || '-'}`);
          doc.text(`   Harga    : ${this._formatRupiah(model.price)}`);
          if (model.notes) doc.text(`   Catatan  : ${model.notes}`);
          doc.moveDown(0.2);
        });
        doc.moveDown(0.5);
      }

      // ── Property ────────────────────────────────────
      if (booking.properties && booking.properties.length > 0) {
        doc.fontSize(13).font('Helvetica-Bold').text('PROPERTI TAMBAHAN');
        doc.moveDown(0.3);

        booking.properties.forEach((prop, i) => {
          doc.fontSize(10).font('Helvetica-Bold').text(`${i + 1}. ${prop.property_name}`);
          doc.font('Helvetica').text(`   Kategori  : ${prop.property_category}`);
          doc.text(`   Harga     : ${this._formatRupiah(prop.price)} × ${prop.quantity}`);
          doc.text(`   Subtotal  : ${this._formatRupiah(prop.subtotal)}`);
          doc.moveDown(0.2);
        });
        doc.moveDown(0.5);
      }

      // ── Harga ────────────────────────────────────────
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);
      doc.fontSize(13).font('Helvetica-Bold').text('RINCIAN HARGA');
      doc.moveDown(0.3);

      const totalEstimate = Number(booking.total_estimate || 0);
      const dpAmount = Number(booking.dp_amount || Math.ceil(totalEstimate * 0.1));
      const remaining = totalEstimate - dpAmount;

      this._row(doc, 'Total Estimasi', this._formatRupiah(totalEstimate));
      this._row(doc, 'DP Dibayar (10%)', this._formatRupiah(dpAmount));

      if (booking.bank_name) {
        this._row(doc, 'Rekening Pengirim', `${booking.bank_name} - ${booking.account_number} a/n ${booking.account_name}`);
      }

      doc.moveDown(0.3);
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#e74c3c')
        .text(`Sisa Pelunasan: ${this._formatRupiah(remaining)}`, { align: 'right' });
      doc.fillColor('#000000');
      doc.moveDown(0.5);
      doc.fontSize(9).font('Helvetica').fillColor('#666666')
        .text('* Pelunasan dilakukan sebelum hari acara', { align: 'right' });
      doc.fillColor('#000000');

      // ── Footer ───────────────────────────────────────
      doc.moveDown(2);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);
      doc.fontSize(9).font('Helvetica').fillColor('#888888')
        .text(`Dokumen ini dibuat otomatis oleh sistem Maba Wedding Decoration`, { align: 'center' });
      doc.text(`Dihasilkan pada: ${new Date().toLocaleString('id-ID')}`, { align: 'center' });
      doc.text(`Booking Code: ${booking.booking_code}`, { align: 'center' });

      doc.end();

      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    });
  }

  _row(doc, label, value) {
    doc.fontSize(10).font('Helvetica-Bold').text(`${label}:`, { continued: true, width: 140 });
    doc.font('Helvetica').text(` ${value || '-'}`);
  }

  _formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(amount || 0));
  }
}

module.exports = new BookingPdfService();