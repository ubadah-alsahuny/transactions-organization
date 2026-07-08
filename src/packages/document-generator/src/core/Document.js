import { constants } from '../utils/constants';

const DOCUMENT_CSS = `
.document-container {
  direction: rtl;
  font-family: "Qomra", "GE SS Two", "Noto Naskh Arabic", "Trajan Pro", "Noto Sans", sans-serif;
  color: #1a1a1a;
  background: white;
  position: relative;
}
.document-header { margin-bottom: 20px; }
.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 12px;
  direction: ltr;
}
.header-logo { flex-shrink: 0; }
.header-logo .logo {
  max-height: 100px;
  width: auto;
  object-fit: contain;
}
.header-logo .logo-placeholder {
  width: 80px;
  height: 80px;
  background: #f5f0e8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #b8944b;
}
.header-text { flex: 1; text-align: right; direction: rtl; }
.header-text .republic-name {
  font-size: 25px;
  font-weight: bold;
  color: #1a3a5c;
  margin: 0 0 4px 0;
  letter-spacing: 1px;
}
.header-text .institution-name {
  font-size: 20px;
  font-weight: normal;
  color: #1a3a5c;
  margin: 0 0 3px 0;
}
.header-text .document-type {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin: 0;
  border: 1px solid #b8944b;
  display: inline-block;
  padding: 2px 16px;
  border-radius: 3px;
}
.header-divider {
  border-bottom: 2px solid #1a3a5c;
  margin-top: 5px;
}
.header-divider::after {
  content: '';
  display: block;
  border-bottom: 1px solid #b8944b;
  margin-top: 2px;
}
.document-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0 4px 0;
  font-size: 12px;
  color: #555;
}
.document-info-row .info-item {
  font-weight: bold;
  color: #1a3a5c;
  letter-spacing: 1px;
}
.document-info-row .info-value {
  color: #1a3a5c;
  font-weight: bold;
}
.header-bottom-bar {
  height: 3px;
  background: linear-gradient(to left, #1a3a5c, #b8944b, #1a3a5c);
  margin-top: 6px;
  border-radius: 1px;
}
.section { margin-bottom: 18px; }
.citizen-qr-row {
  display: flex;
  gap: 16px;
  align-items: stretch;
  margin-bottom: 18px;
}
.citizen-qr-row .section-frame {
  flex: 1;
  margin-bottom: 0;
}
.qr-section-inline {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}
.qr-section-inline .qr-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.qr-section-inline .qr-placeholder {
  width: 80px;
  height: 80px;
  background: #faf8f3;
  border: 2px dashed #d4af37;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #b8944b;
}
.qr-section-inline .qr-label {
  font-size: 10px;
  color: #999;
  margin: 0;
  text-align: center;
}
.section-title {
  font-size: 15px;
  font-weight: bold;
  color: #1a3a5c;
  border-bottom: 2px solid #d4c8a8;
  padding-bottom: 6px;
  margin-bottom: 10px;
}
.info-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.info-table td {
  padding: 5px 10px;
  border-bottom: 1px solid #e8e0d0;
}
.info-table .label {
  width: 30%;
  color: #555;
  font-weight: bold;
  background: #faf8f3;
}
.info-table .value {
  width: 70%;
  color: #1a1a1a;
}
.initial-data .info-table .label { background: #fdfbf7; }
.notes-container { display: flex; flex-direction: column; gap: 8px; }
.note-item {
  background: #faf8f3;
  border-right: 3px solid #b8944b;
  padding: 8px 12px;
  border-radius: 3px;
}
.note-header {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #555;
  margin-bottom: 4px;
  flex-wrap: wrap;
}
.note-header .note-employee { color: #1a3a5c; font-weight: bold; }
.note-header .note-date { color: #999; font-size: 11px; }
.note-body { font-size: 13px; color: #1a1a1a; line-height: 1.5; }
.approval-signatures {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: nowrap;
  width: 100%;
}
.approval-signature-item {
  text-align: center;
  min-width: 120px;
  flex: 0 1 auto;
}
.approval-signature-line {
  width: 80%;
  margin: 0 auto 6px auto;
  border-bottom: 2px solid #1a3a5c;
}
.approval-signature-name {
  display: block;
  font-size: 12px;
  font-weight: bold;
  color: #1a3a5c;
  margin-bottom: 2px;
}
.approval-signature-section {
  display: block;
  font-size: 10px;
  color: #777;
}

.progress-info {
  margin-top: 8px;
  padding: 6px 10px;
  background: #f0f7f0;
  border-radius: 3px;
  font-size: 12px;
  color: #2e7d32;
}
.signature-block {
  margin-top: 25px;
  padding-top: 15px;
  border-top: 2px dashed #ccc;
}
.signature-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 30px;
  flex-wrap: wrap;
}
.signature-item { flex: 1; min-width: 180px; }
.signature-line {
  border-bottom: 2px solid #1a1a1a;
  display: inline-block;
  min-width: 160px;
  padding-bottom: 4px;
  margin-bottom: 4px;
  font-weight: bold;
  font-size: 15px;
}
.signature-title { font-size: 12px; color: #555; margin: 4px 0; }
.signature-date { font-size: 12px; color: #777; margin: 4px 0; }
.stamp-container { flex-shrink: 0; text-align: center; }
.stamp-image {
  max-width: 85px;
  max-height: 85px;
  opacity: 0.85;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 4px;
  background: white;
}
.qr-section { margin-top: 15px; padding-top: 10px; border-top: 1px solid #eee; }
.qr-container { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.qr-placeholder {
  width: 70px; height: 70px;
  background: #faf8f3;
  border: 2px dashed #d4c8a8;
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; color: #b8944b;
}
.qr-label { font-size: 10px; color: #999; margin: 0; }
.document-footer {
  margin-top: 25px; padding-top: 8px;
  border-top: 1px solid #e0d8c8;
  font-size: 10px; color: #aaa;
  text-align: center;
}
@media print {
  body { background: white !important; margin: 0 !important; padding: 0 !important; }
  .document-container {
    width: 100% !important; min-height: 100vh !important;
    padding: 12mm !important; margin: 0 !important;
    box-shadow: none !important;
  }
  .no-print { display: none !important; }
  .info-table td { border-bottom: 1px solid #ddd !important; }
  .header-text .republic-name { color: #1a3a5c !important; }
  .section-title { color: #1a3a5c !important; }
  .header-top { direction: ltr !important; }
  .header-text { direction: rtl !important; text-align: right !important; }
  .document-info-row { direction: rtl !important; justify-content: space-between !important; }
  .document-info-row .info-item:first-child { direction: rtl !important; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}
`;

/**
 * Document - Main document object
 * Contains all layers and provides rendering methods
 */
export class Document {
  /**
   * @param {Object} data - Document data from builder
   */
  constructor(data) {
    this.securityLayer = data.securityLayer;
    this.guillocheLayer = data.guillocheLayer;
    this.staticLayer = data.staticLayer;
    this.dynamicLayer = data.dynamicLayer;
    this.metadata = data.metadata || {};
    this.styles = data.styles || {};
    this.components = data.components || {};
    this._htmlCache = null;
  }

  /**
   * Render complete document HTML
   * @returns {string} Complete HTML document
   */
  render() {
    if (this._htmlCache) return this._htmlCache;

    const { PAGE_WIDTH, PAGE_HEIGHT, PAGE_MARGIN } = constants;
    const { primaryColor = '#1a3a5c', fontFamily = 'Traditional Arabic, Arial, sans-serif' } = this.styles;

    const securityHTML = this.securityLayer.renderSVG(PAGE_WIDTH, PAGE_HEIGHT);
    const guillocheHTML = this.guillocheLayer
      ? this.guillocheLayer.renderSVG(PAGE_WIDTH)
      : '';
    const staticHTML = this.staticLayer.render();
    const dynamicHTML = this.dynamicLayer.render();

    const customCSS = this.styles.customCSS || '';

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
<title>وثيقة رسمية</title>
<style>
@page {
  size: A4 portrait;
  margin: 0;
}
* { margin:0; padding:0; box-sizing:border-box; }
body {
  background: #f5f3f0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  min-height: 100vh;
  font-family: ${fontFamily};
  direction: rtl;
  margin: 0;
  padding: 0;
}
.document-container {
  width: ${PAGE_WIDTH}mm;
  min-height: ${PAGE_HEIGHT}mm;
  padding: ${PAGE_MARGIN}mm;
  background: white;
  box-shadow: 0 2px 30px rgba(0,0,0,0.12);
  position: relative;
  margin: 20px auto;
}
.security-layer {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none; z-index: 0;
}
.guilloche-layer {
  position: absolute;
  top: -2mm;
  left: 0;
  width: 100%;
  height: 80mm;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.static-layer, .dynamic-layer { position: relative; z-index: 1; }
@media print {
  body { background: white; margin: 0; padding: 0; }
  .document-container { box-shadow: none; margin: 0 auto; padding: 12mm; width: 100%; min-height: 100vh; }
}
@media screen and (max-width: 800px) {
  .document-container { width: 100%; min-height: auto; padding: 10mm; margin: 10px; }
}

/* Toolbar styling */
.preview-toolbar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  background: rgba(21, 66, 57, 0.95);
  backdrop-filter: blur(10px);
  padding: 12px 24px;
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99999;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-bottom: 2px solid #b8944b;
  width: 100%;
}
.preview-toolbar button {
  padding: 10px 20px;
  border-radius: 12px;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  border: none;
}
.preview-toolbar .btn-print {
  background: #b8944b;
  color: white;
}
.preview-toolbar .btn-print:hover {
  background: #a3813c;
  transform: translateY(-1px);
}
.preview-toolbar .btn-close {
  background: transparent;
  color: #ffcdd2;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.preview-toolbar .btn-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.preview-toolbar .spinner {
  animation: spin 1s linear infinite;
}
@media print {
  .preview-toolbar {
    display: none !important;
  }
}
</style>
<style>${DOCUMENT_CSS}</style>
<style>${customCSS}</style>
</head>
<body>
<div class="preview-toolbar no-print">
  <button class="btn-print" onclick="window.print()">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
    طباعة المستند
  </button>
  <button class="btn-close" onclick="window.close()">
    إغلاق المعاينة
  </button>
</div>
<div class="document-container" data-document-id="${this.metadata.id || ''}">
  <div class="security-layer">${securityHTML}</div>
  ${guillocheHTML ? '<div class="guilloche-layer">' + guillocheHTML + '</div>' : ''}
  <div class="static-layer">${staticHTML}</div>
  <div class="dynamic-layer">${dynamicHTML}</div>
  <div class="document-footer">
    <span>النسخة ${this.metadata.version || '1.0'}</span>
    <span style="margin:0 8px;">|</span>
    <span>${new Date(this.metadata.createdAt || Date.now()).toLocaleString('ar-SY')}</span>
    ${this.metadata.documentId ? `<span style="margin:0 8px;">|</span><span>رقم: ${this.metadata.documentId}</span>` : ''}
  </div>
</div>
</body>
</html>`;

    this._htmlCache = html;
    return html;
  }

  /**
   * Render document to DOM element
   * @returns {HTMLElement} Document element
   */
  renderToElement() {
    const container = document.createElement('div');
    container.innerHTML = this.render();
    const docElement = container.querySelector('.document-container');
    if (docElement) {
      // Clone all style elements and append them to docElement so they are active and bundled
      const styles = container.querySelectorAll('style');
      styles.forEach(style => {
        docElement.appendChild(style.cloneNode(true));
      });
      return docElement;
    }
    return container.firstElementChild;
  }

  /**
   * Open document preview in a new tab without auto-printing
   * @returns {Window|null} The new window reference
   */
  preview() {
    const win = window.open('', '_blank', 'width=900,height=700,scrollbars=yes');
    if (!win) {
      throw new Error('Could not open preview window. Please allow popups.');
    }
    win.document.write(this.render());
    win.document.close();
    win.focus();
    return win;
  }

  /**
   * Print document
   */
  print() {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      throw new Error('Could not open print window. Please allow popups.');
    }
    printWindow.document.write(this.render());
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => { printWindow.print(); };
  }

  /**
   * Export document as PDF
   * @param {string} filename - Output filename
   * @param {Object} options - PDF options
   * @returns {Promise} PDF generation promise
   */
  async toPDF(filename = 'document.pdf', options = {}) {
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);

    const targetElement = options.element || this.renderToElement();
    const shouldManageLifecycle = !options.element;

    if (shouldManageLifecycle) {
      document.body.appendChild(targetElement);
    }

    try {
      const canvas = await html2canvas(targetElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        ...options.html2canvas,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        ...options.jsPDF,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(filename);
    } finally {
      if (shouldManageLifecycle) {
        document.body.removeChild(targetElement);
      }
    }
  }

  /**
   * Get verification data for QR code
   * @returns {Object} Verification data
   */
  getVerificationData() {
    return {
      hash: this.metadata.hash || this.securityLayer?.hash || null,
      documentId: this.metadata.id || null,
      createdAt: this.metadata.createdAt || null,
      institution: this.metadata.institution?.name || null,
      citizen: this.metadata.citizen?.name || null,
      ...this.securityLayer?.getVerificationData?.() || {}
    };
  }

  getMetadata() { return { ...this.metadata }; }
  getStyles() { return { ...this.styles }; }
  invalidateCache() { this._htmlCache = null; }
}

export default Document;