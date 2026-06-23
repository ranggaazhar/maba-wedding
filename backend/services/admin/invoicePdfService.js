// services/invoicePdfService.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class InvoicePdfService {

  async generateInvoicePdf(invoice) {
    const outputDir = path.join(process.cwd(), 'uploads/invoice-pdfs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const fileName = `invoice-${invoice.invoice_number}.pdf`;
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

      doc.fillColor('#111827').fontSize(24).font('Helvetica-Bold')
         .text('INVOICE', 350, 48, { align: 'right', width: 195 });
      
      doc.fillColor('#2563eb').fontSize(11).font('Helvetica-Bold')
         .text(invoice.invoice_number || '-', 350, 72, { align: 'right', width: 195 });
      
      doc.fillColor('#4b5563').fontSize(9).font('Helvetica')
         .text(`Tgl: ${this._formatDate(invoice.issue_date)}`, 350, 88, { align: 'right', width: 195 });

      // Divider line
      doc.moveTo(50, 112).lineTo(545, 112).lineWidth(1).strokeColor('#e5e7eb').stroke();

      // ── Customer & Event Details ──────────────────────────────
      // Tagihan Kepada
      doc.fillColor('#6b7280').fontSize(8).font('Helvetica-Bold')
         .text('TAGIHAN KEPADA', 50, 135);
      doc.fillColor('#111827').fontSize(12).font('Helvetica-Bold')
         .text(invoice.customer_name || '-', 50, 148);
      doc.fillColor('#4b5563').fontSize(9).font('Helvetica')
         .text(invoice.customer_phone || '-', 50, 163)
         .text(invoice.customer_address || '-', 50, 176, { width: 240 });

      // Detail Acara
      doc.fillColor('#6b7280').fontSize(8).font('Helvetica-Bold')
         .text('DETAIL ACARA', 320, 135);
      doc.fillColor('#111827').fontSize(12).font('Helvetica-Bold')
         .text(invoice.event_type || 'Wedding', 320, 148);
      doc.fillColor('#4b5563').fontSize(9).font('Helvetica')
         .text(invoice.event_venue || '-', 320, 163)
         .text(`Tanggal: ${this._formatDate(invoice.event_date, true)}`, 320, 176);

      // ── Table Items ───────────────────────────────────────────
      const colNo = 50;
      const colItem = 80;
      const colType = 300;
      const colQty = 350;
      const colPrice = 390;
      const colSubtotal = 465;

      let currentY = 220;
      const tableStartY = currentY;
      const headerHeight = 24;

      // Draw table header background with top rounded corners
      this._fillTopRoundedRect(doc, 50, currentY, 495, headerHeight, 8, '#f8fafc');

      // Table Header Row
      doc.fillColor('#4b5563').fontSize(8.5).font('Helvetica-Bold');
      doc.text('No', colNo + 5, currentY + 8);
      doc.text('Item', colItem, currentY + 8);
      doc.text('Tipe', colType, currentY + 8, { width: 50, align: 'center' });
      doc.text('Qty', colQty, currentY + 8, { width: 35, align: 'center' });
      doc.text('Harga', colPrice, currentY + 8, { width: 70, align: 'right' });
      doc.text('Subtotal', colSubtotal, currentY + 8, { width: 80, align: 'right' });

      // Header Bottom Line
      doc.moveTo(50, currentY + headerHeight).lineTo(545, currentY + headerHeight).lineWidth(1).strokeColor('#e5e7eb').stroke();

      currentY += headerHeight;

      // Table Rows
      const items = invoice.items || invoice.InvoiceItems || [];
      items.forEach((item, index) => {
        let rowHeight = 32;
        if (item.description) {
          rowHeight = 44;
        }

        doc.fillColor('#4b5563').fontSize(9).font('Helvetica');
        doc.text(String(index + 1), colNo + 5, currentY + 8);

        doc.fillColor('#111827').font('Helvetica-Bold');
        doc.text(item.item_name, colItem, currentY + 8, { width: 210 });
        if (item.description) {
          doc.fillColor('#6b7280').fontSize(8).font('Helvetica');
          doc.text(item.description, colItem, currentY + 21, { width: 210 });
        }

        doc.fillColor('#111827').fontSize(9).font('Helvetica-Bold');
        const typeLabel = item.item_type === 'discount' ? 'Diskon' : item.item_type === 'penalty' ? 'Denda' : 'Item';
        doc.text(typeLabel, colType, currentY + 8, { width: 50, align: 'center' });
        
        doc.fillColor('#111827').font('Helvetica');
        doc.text(String(item.quantity || 1), colQty, currentY + 8, { width: 35, align: 'center' });
        
        doc.fillColor('#4b5563').font('Helvetica');
        doc.text(this._formatRupiah(item.unit_price), colPrice, currentY + 8, { width: 70, align: 'right' });

        const isDiscount = item.item_type === 'discount';
        doc.fillColor(isDiscount ? '#16a34a' : '#111827').font('Helvetica-Bold');
        doc.text((isDiscount ? '- ' : '') + this._formatRupiah(item.subtotal), colSubtotal, currentY + 8, { width: 80, align: 'right' });

        // Divider row line
        if (index < items.length - 1) {
          doc.moveTo(50, currentY + rowHeight).lineTo(545, currentY + rowHeight).lineWidth(1).strokeColor('#f3f4f6').stroke();
        }

        currentY += rowHeight;
      });

      // Draw rounded border around table
      const tableHeight = currentY - tableStartY;
      doc.roundedRect(50, tableStartY, 495, tableHeight, 8).lineWidth(1).strokeColor('#e5e7eb').stroke();

      // ── Totals ────────────────────────────────────────────────
      let totalY = currentY + 15;
      const total = Number(invoice.total || 0);
      const downPayment = Number(invoice.down_payment || 0);
      const remaining = Math.max(0, total - downPayment);

      // Total Tagihan
      doc.fillColor('#4b5563').fontSize(9).font('Helvetica')
         .text('Total Tagihan', 320, totalY, { width: 120, align: 'left' });
      doc.fillColor('#111827').font('Helvetica-Bold')
         .text(this._formatRupiah(total), 440, totalY, { width: 105, align: 'right' });

      totalY += 18;

      // DP Dibayar (10%)
      doc.fillColor('#4b5563').fontSize(9).font('Helvetica')
         .text('DP Dibayar (10%)', 320, totalY, { width: 120, align: 'left' });
      doc.fillColor('#111827').font('Helvetica-Bold')
         .text(`- ${this._formatRupiah(downPayment)}`, 440, totalY, { width: 105, align: 'right' });

      totalY += 18;

      // Divider line
      doc.moveTo(320, totalY).lineTo(545, totalY).lineWidth(1).strokeColor('#e5e7eb').stroke();
      totalY += 8;

      // Sisa Pembayaran
      doc.fillColor('#111827').fontSize(12).font('Helvetica-Bold')
         .text('Sisa Pembayaran', 320, totalY, { width: 120, align: 'left' });

      if (remaining > 0) {
        doc.fillColor('#e11d48') // Rose-600
           .text(this._formatRupiah(remaining), 440, totalY, { width: 105, align: 'right' });
      } else {
        doc.fillColor('#16a34a') // Green-600 'Lunas'
           .text('Lunas', 440, totalY, { width: 105, align: 'right' });
      }

      totalY += 25;

      // ── Syarat Pembayaran ─────────────────────────────────────
      if (invoice.payment_terms) {
        const termsText = invoice.payment_terms;
        const termsHeight = doc.heightOfString(termsText, { width: 475 }) + 30;

        if (totalY + termsHeight > 740) {
          doc.addPage();
          totalY = 50;
        }

        // Gray Box
        doc.roundedRect(50, totalY, 495, termsHeight, 6).fillColor('#f9fafb').fill();
        
        doc.fillColor('#9ca3af').fontSize(7.5).font('Helvetica-Bold')
           .text('SYARAT PEMBAYARAN', 62, totalY + 10);
        
        doc.fillColor('#374151').fontSize(8.5).font('Helvetica')
           .text(termsText, 62, totalY + 22, { width: 471, lineGap: 3 });

        totalY += termsHeight + 15;
      }

      // ── Catatan ───────────────────────────────────────────────
      if (invoice.notes) {
        const notesText = invoice.notes;
        const notesHeight = doc.heightOfString(notesText, { width: 475 }) + 30;

        if (totalY + notesHeight > 740) {
          doc.addPage();
          totalY = 50;
        }

        doc.roundedRect(50, totalY, 495, notesHeight, 6).fillColor('#f9fafb').fill();
        
        doc.fillColor('#9ca3af').fontSize(7.5).font('Helvetica-Bold')
           .text('CATATAN', 62, totalY + 10);
        
        doc.fillColor('#374151').fontSize(8.5).font('Helvetica')
           .text(notesText, 62, totalY + 22, { width: 471, lineGap: 3 });

        totalY += notesHeight + 15;
      }

      // ── Footer ────────────────────────────────────────────────
      doc.moveTo(50, 755).lineTo(545, 755).lineWidth(1).strokeColor('#f3f4f6').stroke();
      doc.fillColor('#9ca3af').fontSize(7.5).font('Helvetica')
         .text('Dokumen ini dibuat otomatis oleh sistem Maba Wedding Decoration', 50, 764, { align: 'center', width: 495 })
         .text(`No. Invoice: ${invoice.invoice_number} | Dihasilkan: ${new Date().toLocaleString('id-ID')}`, { align: 'center', width: 495 });

      doc.end();
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    });
  }

  // ── Helpers ──────────────────────────────────────────────────

  _fillTopRoundedRect(doc, x, y, w, h, r, fillColor) {
    doc.save()
       .fillColor(fillColor)
       .moveTo(x + r, y)
       .lineTo(x + w - r, y)
       .quadraticCurveTo(x + w, y, x + w, y + r)
       .lineTo(x + w, y + h)
       .lineTo(x, y + h)
       .lineTo(x, y + r)
       .quadraticCurveTo(x, y, x + r, y)
       .closePath()
       .fill()
       .restore();
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

module.exports = new InvoicePdfService();