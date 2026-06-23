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

    const fileName = `booking-${booking.booking_code}.pdf`;
    const filePath = path.join(outputDir, fileName);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // ── Header ────────────────────────────────────────────────
      const logoPath = path.join(process.cwd(), 'assets/logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 50, { width: 42 });
      }

      doc.fillColor('#111827').fontSize(14).font('Helvetica-Bold')
         .text('MABA WEDDING DEKOR', 105, 52);
      
      doc.fillColor('#4b5563').fontSize(9).font('Helvetica')
         .text('Kulon Progo, Yogyakarta', 105, 70)
         .text('WA: 081215061622', 105, 83);

      doc.fillColor('#111827').fontSize(20).font('Helvetica-Bold')
         .text('DETAIL BOOKING', 350, 48, { align: 'right', width: 195 });
      
      doc.fillColor('#2563eb').fontSize(11).font('Helvetica-Bold')
         .text(`Kode: ${booking.booking_code}`, 350, 72, { align: 'right', width: 195 });
      
      doc.fillColor('#4b5563').fontSize(9).font('Helvetica')
         .text(`Tgl: ${this._formatDate(booking.submitted_at)}`, 350, 88, { align: 'right', width: 195 });

      // Divider line
      doc.moveTo(50, 112).lineTo(545, 112).lineWidth(1).strokeColor('#e5e7eb').stroke();

      // ── Customer & Event Details (2-Column) ───────────────────
      // Data Customer
      doc.fillColor('#6b7280').fontSize(8).font('Helvetica-Bold')
         .text('DATA CUSTOMER', 50, 135);
      doc.fillColor('#111827').fontSize(12).font('Helvetica-Bold')
         .text(booking.customer_name || '-', 50, 148);
      doc.fillColor('#4b5563').fontSize(9).font('Helvetica')
         .text(booking.customer_phone || '-', 50, 163)
         .text(booking.full_address || '-', 50, 176, { width: 240 });

      // Informasi Acara
      doc.fillColor('#6b7280').fontSize(8).font('Helvetica-Bold')
         .text('INFORMASI ACARA', 320, 135);
      doc.fillColor('#111827').fontSize(12).font('Helvetica-Bold')
         .text(booking.event_type || 'Wedding', 320, 148);
      doc.fillColor('#4b5563').fontSize(9).font('Helvetica')
         .text(booking.event_venue || '-', 320, 163)
         .text(`Tanggal: ${this._formatDate(booking.event_date, true)}`, 320, 176);

      if (booking.theme_color) {
        doc.fillColor('#6b7280').fontSize(8).font('Helvetica-Bold').text(`Warna Tema: ${booking.theme_color}`, 320, 193);
      }

      let currentY = 220;

      // ── Customer Notes ────────────────────────────────────────
      if (booking.customer_notes) {
        const notesText = booking.customer_notes;
        const notesHeight = doc.heightOfString(notesText, { width: 475 }) + 30;

        doc.save();
        doc.roundedRect(50, currentY, 495, notesHeight, 6).fill('#f9fafb');
        doc.roundedRect(50, currentY, 495, notesHeight, 6).lineWidth(1).stroke('#e5e7eb');
        doc.restore();

        doc.fillColor('#9ca3af').fontSize(7.5).font('Helvetica-Bold')
           .text('CATATAN PELANGGAN', 62, currentY + 10);
        doc.fillColor('#374151').fontSize(8.5).font('Helvetica')
           .text(notesText, 62, currentY + 22, { width: 471, lineGap: 3 });

        currentY += notesHeight + 20;
      }

      // Helper to check page break
      const checkPageBreak = (neededHeight) => {
        if (currentY + neededHeight > 730) {
          doc.addPage();
          currentY = 50;
          return true;
        }
        return false;
      };

      // ── Model Dekorasi ────────────────────────────────────────
      if (booking.models && booking.models.length > 0) {
        checkPageBreak(30);
        doc.fillColor('#111827').fontSize(11).font('Helvetica-Bold').text('MODEL DEKORASI', 50, currentY);
        doc.moveTo(50, currentY + 14).lineTo(545, currentY + 14).lineWidth(1).strokeColor('#e5e7eb').stroke();
        currentY += 24;

        booking.models.forEach((model, i) => {
          let rowHeight = 90;
          checkPageBreak(rowHeight + 10);

          // Card background & border
          doc.save();
          doc.roundedRect(50, currentY, 495, rowHeight, 8).fill('#f9fafb');
          doc.roundedRect(50, currentY, 495, rowHeight, 8).lineWidth(1).stroke('#e5e7eb');
          doc.restore();

          const photo = model.project?.photos?.[0];
          let textStartX = 62;

          if (photo && photo.url) {
            const resolved = this._resolveImagePath(photo.url);
            if (resolved) {
              try {
                doc.image(resolved, 62, currentY + 10, { fit: [105, 70] });
                textStartX = 182;
              } catch (imgError) {
                console.error('Failed to embed model image in PDF:', imgError.message);
              }
            }
          }

          doc.fillColor('#111827').fontSize(10).font('Helvetica-Bold')
             .text(`${i + 1}. ${model.project_title}`, textStartX, currentY + 12);
          
          doc.fillColor('#4b5563').fontSize(8.5).font('Helvetica')
             .text(`Kategori: ${model.category?.name || '-'}`, textStartX, currentY + 28)
             .text(`Harga: ${this._formatRupiah(model.price)}`, textStartX, currentY + 42);

          if (model.notes) {
            doc.fillColor('#6b7280').text(`Catatan: ${model.notes}`, textStartX, currentY + 56, { width: 530 - textStartX });
          }

          currentY += rowHeight + 10;
        });
        currentY += 10;
      }

      // ── Properti Tambahan ─────────────────────────────────────
      if (booking.properties && booking.properties.length > 0) {
        checkPageBreak(30);
        doc.fillColor('#111827').fontSize(11).font('Helvetica-Bold').text('PROPERTI TAMBAHAN', 50, currentY);
        doc.moveTo(50, currentY + 14).lineTo(545, currentY + 14).lineWidth(1).strokeColor('#e5e7eb').stroke();
        currentY += 24;

        booking.properties.forEach((prop, i) => {
          let rowHeight = 90;
          checkPageBreak(rowHeight + 10);

          // Card background & border
          doc.save();
          doc.roundedRect(50, currentY, 495, rowHeight, 8).fill('#f9fafb');
          doc.roundedRect(50, currentY, 495, rowHeight, 8).lineWidth(1).stroke('#e5e7eb');
          doc.restore();

          const imageUrl = prop.property?.image_url;
          let textStartX = 62;

          if (imageUrl) {
            const resolved = this._resolveImagePath(imageUrl);
            if (resolved) {
              try {
                doc.image(resolved, 62, currentY + 10, { fit: [105, 70] });
                textStartX = 182;
              } catch (imgError) {
                console.error('Failed to embed property image in PDF:', imgError.message);
              }
            }
          }

          doc.fillColor('#111827').fontSize(10).font('Helvetica-Bold')
             .text(`${i + 1}. ${prop.property_name}`, textStartX, currentY + 12);
          
          doc.fillColor('#4b5563').fontSize(8.5).font('Helvetica')
             .text(`Kategori: ${prop.property_category}`, textStartX, currentY + 28)
             .text(`Harga: ${this._formatRupiah(prop.price)} × ${prop.quantity}`, textStartX, currentY + 42)
             .text(`Subtotal: ${this._formatRupiah(prop.subtotal)}`, textStartX, currentY + 56);

          currentY += rowHeight + 10;
        });
        currentY += 10;
      }

      // ── Custom Request ────────────────────────────────────────
      if (booking.customRequests && booking.customRequests.length > 0) {
        checkPageBreak(30);
        doc.fillColor('#111827').fontSize(11).font('Helvetica-Bold').text('REQUEST KUSTOM (CUSTOM REQUEST)', 50, currentY);
        doc.moveTo(50, currentY + 14).lineTo(545, currentY + 14).lineWidth(1).strokeColor('#e5e7eb').stroke();
        currentY += 24;

        booking.customRequests.forEach((req, i) => {
          let rowHeight = 110;
          checkPageBreak(rowHeight + 10);

          // Card background & border
          doc.save();
          doc.roundedRect(50, currentY, 495, rowHeight, 8).fill('#f9fafb');
          doc.roundedRect(50, currentY, 495, rowHeight, 8).lineWidth(1).stroke('#e5e7eb');
          doc.restore();

          doc.fillColor('#111827').fontSize(10).font('Helvetica-Bold')
             .text(`${i + 1}. ${req.title}`, 62, currentY + 12);
          
          doc.fillColor('#4b5563').fontSize(8.5).font('Helvetica')
             .text(req.description || '-', 62, currentY + 28, { width: 471 });

          if (req.color_theme) {
            doc.text(`Warna Tema: ${req.color_theme}`, 62, currentY + 45);
          }

          // Reference Images
          if (req.reference_images && req.reference_images.length > 0) {
            let imgX = 62;
            let imgY = currentY + 60;
            req.reference_images.forEach((imgUrl) => {
              const resolved = this._resolveImagePath(imgUrl);
              if (resolved) {
                try {
                  doc.image(resolved, imgX, imgY, { fit: [60, 40] });
                  imgX += 70;
                } catch (imgError) {
                  console.error('Failed to embed custom request reference image in PDF:', imgError.message);
                }
              }
            });
          }

          currentY += rowHeight + 10;
        });
      }

      // ── Footer ────────────────────────────────────────────────
      doc.moveTo(50, 755).lineTo(545, 755).lineWidth(1).strokeColor('#f3f4f6').stroke();
      doc.fillColor('#9ca3af').fontSize(7.5).font('Helvetica')
         .text('Dokumen ini dibuat otomatis oleh sistem Maba Wedding Decoration', 50, 764, { align: 'center', width: 495 })
         .text(`Kode Booking: ${booking.booking_code} | Dihasilkan: ${new Date().toLocaleString('id-ID')}`, { align: 'center', width: 495 });

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

  _formatDate(dateStr, long = false) {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', long
        ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
        : { day: 'numeric', month: 'long', year: 'numeric' }
      );
    } catch { return dateStr; }
  }

  _formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(Number(amount || 0));
  }
}

module.exports = new BookingPdfService();