// services/bookingPdfService.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class BookingPdfService {
  async generateBookingPdf(booking) {
    const outputDir = path.join(process.cwd(), 'uploads/booking-pdfs');
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

          // Render model photo if available
          const photo = model.project?.photos?.[0];
          if (photo && photo.url) {
            const resolved = this._resolveImagePath(photo.url);
            if (resolved) {
              doc.moveDown(0.2);
              try {
                doc.image(resolved, { fit: [150, 100] });
                doc.moveDown(0.2);
              } catch (imgError) {
                console.error('Failed to embed model image:', imgError.message);
              }
            }
          }
          doc.moveDown(0.3);
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

          // Render property image if available
          const imageUrl = prop.property?.image_url;
          if (imageUrl) {
            const resolved = this._resolveImagePath(imageUrl);
            if (resolved) {
              doc.moveDown(0.2);
              try {
                doc.image(resolved, { fit: [120, 80] });
                doc.moveDown(0.2);
              } catch (imgError) {
                console.error('Failed to embed property image:', imgError.message);
              }
            }
          }
          doc.moveDown(0.3);
        });
        doc.moveDown(0.5);
      }

      // ── Custom Request ──────────────────────────────
      if (booking.customRequests && booking.customRequests.length > 0) {
        doc.fontSize(13).font('Helvetica-Bold').text('REQUEST KUSTOM (CUSTOM REQUEST)');
        doc.moveDown(0.3);

        booking.customRequests.forEach((req, i) => {
          doc.fontSize(10).font('Helvetica-Bold').text(`${i + 1}. ${req.title}`);
          doc.font('Helvetica').text(`   Deskripsi  : ${req.description}`);
          if (req.color_theme) doc.text(`   Warna Tema : ${req.color_theme}`);
          if (req.estimated_price) doc.text(`   Estimasi Harga: ${this._formatRupiah(req.estimated_price)}`);

          // Render reference images
          if (req.reference_images && req.reference_images.length > 0) {
            doc.text(`   Foto Referensi:`);
            doc.moveDown(0.2);
            let startX = doc.x + 15;
            let startY = doc.y;
            let currentX = startX;
            let currentY = startY;
            let maxImageHeight = 80;

            req.reference_images.forEach((imgUrl) => {
              const resolved = this._resolveImagePath(imgUrl);
              if (resolved) {
                if (currentX + 110 > 545) { // page width boundary
                  currentX = startX;
                  currentY += maxImageHeight + 10;
                  if (currentY + maxImageHeight > doc.page.height - doc.page.margins.bottom) {
                    doc.addPage();
                    currentY = doc.y;
                  }
                }
                try {
                  doc.image(resolved, currentX, currentY, { fit: [100, maxImageHeight] });
                  currentX += 110;
                } catch (imgError) {
                  console.error('Failed to embed custom request image:', imgError.message);
                }
              }
            });
            doc.y = currentY + maxImageHeight + 10;
            if (doc.y > doc.page.height - doc.page.margins.bottom) {
              doc.addPage();
            }
          }
          doc.moveDown(0.3);
        });
        doc.moveDown(0.5);
      }

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

  _resolveImagePath(imageUrl) {
    if (!imageUrl) return null;
    let cleaned = imageUrl.replace(/\\/g, '/');
    if (cleaned.startsWith('/')) {
      cleaned = cleaned.substring(1);
    }
    if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
      const urlParts = cleaned.split('/uploads/');
      if (urlParts.length > 1) {
        cleaned = `uploads/${urlParts[1]}`;
      } else {
        return null;
      }
    }
    const fullPath = path.join(process.cwd(), cleaned);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
    return null;
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