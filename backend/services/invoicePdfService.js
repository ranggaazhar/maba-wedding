// services/invoicePdfService.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class InvoicePdfService {

  /**
   * Generate PDF invoice dan simpan ke disk
   * @param {Object} invoice - data invoice lengkap (dengan items)
   * @returns {string} filePath - absolute path file PDF
   */
  async generateInvoicePdf(invoice) {
    const outputDir = path.join(__dirname, '../uploads/invoice-pdfs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const fileName = `invoice-${invoice.invoice_number}-${Date.now()}.pdf`;
    const filePath = path.join(outputDir, fileName);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // ── Header ────────────────────────────────────────────────
      doc.fontSize(22).font('Helvetica-Bold')
        .text('MABA WEDDING DECORATION', { align: 'center' });
      doc.fontSize(11).font('Helvetica')
        .text('Jasa Dekorasi Pernikahan & Event', { align: 'center' });
      doc.moveDown(0.3);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(2).stroke();
      doc.moveDown(0.5);

      // ── Invoice Identity ──────────────────────────────────────
      const leftX  = 50;
      const rightX = 350;
      const startY = doc.y;

      // Kiri: info customer
      doc.fontSize(10).font('Helvetica-Bold').text('TAGIHAN KEPADA:', leftX, startY);
      doc.font('Helvetica')
        .text(invoice.customer_name || '-', leftX, doc.y)
        .text(invoice.customer_phone || '-', leftX)
        .text(invoice.customer_address || '-', leftX, doc.y, { width: 250 });

      // Kanan: nomor invoice & tanggal
      doc.fontSize(10).font('Helvetica-Bold').text('INVOICE', rightX, startY);
      doc.font('Helvetica');
      this._rowAt(doc, rightX, 'No. Invoice', invoice.invoice_number || '-');
      this._rowAt(doc, rightX, 'Tanggal',     this._formatDate(invoice.issue_date));
      this._rowAt(doc, rightX, 'Jatuh Tempo', this._formatDate(invoice.due_date));
      this._rowAt(doc, rightX, 'Status',      this._statusLabel(invoice.status));

      doc.moveDown(2);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);

      // ── Detail Acara ──────────────────────────────────────────
      doc.fontSize(11).font('Helvetica-Bold').text('DETAIL ACARA');
      doc.moveDown(0.2);
      this._row(doc, 'Venue',        invoice.event_venue || '-');
      this._row(doc, 'Tanggal Acara',this._formatDate(invoice.event_date, true));
      if (invoice.event_type) this._row(doc, 'Jenis Acara', invoice.event_type);
      doc.moveDown(0.5);

      // ── Tabel Item ────────────────────────────────────────────
      doc.fontSize(11).font('Helvetica-Bold').text('RINCIAN ITEM');
      doc.moveDown(0.3);

      // Header tabel
      const colItem     = 50;
      const colQty      = 300;
      const colPrice    = 360;
      const colSubtotal = 450;

      doc.fontSize(9).font('Helvetica-Bold');
      doc.rect(50, doc.y, 495, 16).fillAndStroke('#2c3e50', '#2c3e50');
      const headerY = doc.y + 3;
      doc.fillColor('#ffffff');
      doc.text('Item / Deskripsi', colItem + 3, headerY, { width: 240 });
      doc.text('Qty',   colQty,      headerY, { width: 50,  align: 'center' });
      doc.text('Harga', colPrice,    headerY, { width: 80,  align: 'right' });
      doc.text('Total', colSubtotal, headerY, { width: 90,  align: 'right' });
      doc.fillColor('#000000');
      doc.moveDown(1.2);

      // Rows
      const items = invoice.items || invoice.InvoiceItems || [];
      let rowBg = false;
      items.forEach((item) => {
        const isDiscount = item.item_type === 'discount';
        const rowY = doc.y;
        const rowH = 20;

        if (rowBg) {
          doc.rect(50, rowY, 495, rowH).fill('#f8f9fa').stroke('#dee2e6');
        } else {
          doc.rect(50, rowY, 495, rowH).stroke('#dee2e6');
        }
        rowBg = !rowBg;

        doc.fillColor(isDiscount ? '#27ae60' : '#000000').fontSize(9).font('Helvetica');
        const label = item.item_name + (item.description ? `\n${item.description}` : '');
        doc.text(
          (isDiscount ? '(-) ' : '') + item.item_name,
          colItem + 3, rowY + 5, { width: 240 }
        );
        doc.text(String(item.quantity || 1), colQty,      rowY + 5, { width: 50, align: 'center' });
        doc.text(this._formatRupiah(item.unit_price),     colPrice, rowY + 5, { width: 80, align: 'right' });
        doc.text(
          (isDiscount ? '-' : '') + this._formatRupiah(item.subtotal),
          colSubtotal, rowY + 5, { width: 90, align: 'right' }
        );
        doc.fillColor('#000000');
        doc.moveDown(1.3);
      });

      // ── Total ─────────────────────────────────────────────────
      doc.moveDown(0.3);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.3);

      const total       = Number(invoice.total || 0);
      const downPayment = Number(invoice.down_payment || 0);
      const remaining   = Math.max(0, total - downPayment);

      this._totalRow(doc, 'Total',         this._formatRupiah(total));
      this._totalRow(doc, 'DP Terbayar',   this._formatRupiah(downPayment));
      doc.moveDown(0.2);
      doc.moveTo(350, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.2);

      // Sisa tagihan — merah kalau belum lunas
      doc.fontSize(12).font('Helvetica-Bold')
        .fillColor(remaining > 0 ? '#e74c3c' : '#27ae60');
      doc.text(
        `Sisa Tagihan: ${this._formatRupiah(remaining)}`,
        { align: 'right' }
      );
      doc.fillColor('#000000');
      doc.moveDown(0.8);

      // ── Syarat Pembayaran ─────────────────────────────────────
      if (invoice.payment_terms) {
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica-Bold').text('SYARAT PEMBAYARAN');
        doc.moveDown(0.2);
        doc.fontSize(9).font('Helvetica').fillColor('#555555')
          .text(invoice.payment_terms, { width: 495 });
        doc.fillColor('#000000');
        doc.moveDown(0.5);
      }

      // ── Catatan ───────────────────────────────────────────────
      if (invoice.notes) {
        doc.fontSize(10).font('Helvetica-Bold').text('CATATAN');
        doc.moveDown(0.2);
        doc.fontSize(9).font('Helvetica').fillColor('#555555')
          .text(invoice.notes, { width: 495 });
        doc.fillColor('#000000');
        doc.moveDown(0.5);
      }

      // ── Footer ────────────────────────────────────────────────
      doc.moveDown(1);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);
      doc.fontSize(8).font('Helvetica').fillColor('#888888')
        .text('Dokumen ini dibuat otomatis oleh sistem Maba Wedding Decoration', { align: 'center' })
        .text(`No. Invoice: ${invoice.invoice_number} | Dihasilkan: ${new Date().toLocaleString('id-ID')}`, { align: 'center' });

      doc.end();
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    });
  }

  // ── Helpers ──────────────────────────────────────────────────

  _row(doc, label, value) {
    doc.fontSize(9).font('Helvetica-Bold').text(`${label}:`, { continued: true, width: 130 });
    doc.font('Helvetica').text(` ${value || '-'}`);
  }

  _rowAt(doc, x, label, value) {
    const y = doc.y;
    doc.fontSize(9).font('Helvetica-Bold').text(`${label}:`, x, y, { continued: true, width: 100 });
    doc.font('Helvetica').text(` ${value || '-'}`);
  }

  _totalRow(doc, label, value) {
    doc.fontSize(10).font('Helvetica')
      .text(label, 350, doc.y, { width: 100, align: 'left', continued: false });
    doc.text(value, 450, doc.y - doc.currentLineHeight(), { width: 95, align: 'right' });
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

  _statusLabel(status) {
    const map = { DRAFT: 'Draft', SENT: 'Terkirim', PAID: 'Lunas', OVERDUE: 'Jatuh Tempo' };
    return map[status] || status || '-';
  }

  _formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(Number(amount || 0));
  }
}

module.exports = new InvoicePdfService();