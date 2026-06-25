// File: src/layers/DynamicLayer.js

import { formatDate } from '../utils/helpers';
import { constants } from '../utils/constants';

/**
 * DynamicLayer - Renders dynamic content (citizen data, transaction data)
 * Content that changes per document
 */
export class DynamicLayer {
  /**
   * @param {Object} data - Dynamic layer data
   */
  constructor(data = {}) {
    this.citizen = data.citizen || {};
    this.request = data.request || {};
    this.intialData = data.intialData || {};
    this.stepData = data.stepData || {};
    this.signature = data.signature || {};
    this.staticTexts = {
      ...constants.STATIC_TEXTS,
      ...data.staticTexts
    };
  }

  /**
   * Render approval signatures as a separate section placed at the end
   * @returns {string} HTML markup
   */
  renderApprovalSignatures() {
    const notes = this.stepData._allNotes || [];
    const totalSteps = this.stepData._totalSteps || 0;

    const hasApprovalData = notes.length === 0 && totalSteps > 0 &&
      Object.keys(this.stepData).some(k => !k.startsWith('_') && this.stepData[k]?.employee);

    if (!hasApprovalData) return '';

    const sorted = Object.entries(this.stepData)
      .filter(([k]) => !k.startsWith('_'))
      .sort(([, a], [, b]) => (a.order || 0) - (b.order || 0));

    const employeeSignatures = sorted.map(([section, step]) => `
      <div class="approval-signature-item">
        <div class="approval-signature-line"></div>
        <span class="approval-signature-name">${step.employee || ''}</span>
        <span class="approval-signature-section">${section}</span>
      </div>
    `).join('');

    return `
      <div class="section-frame">
        <div class="section approval-signatures-section">
          <div class="approval-signatures horizontal">
            التوقيع
            ${employeeSignatures}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render dynamic layer HTML
   * @returns {string} HTML markup
   */
  render() {
    const {
      CITIZEN_INFO,
      TRANSACTION_INFO,
      ADDITIONAL_DATA,
      EMPLOYEE_NOTES,
      DATE,
      QR_LABEL
    } = this.staticTexts;

    return `
      <div class="document-body">
        <div class="section-frame">
          <div class="section citizen-info">
            <h4 class="section-title">${CITIZEN_INFO}</h4>
            <table class="info-table">
              <tbody>
                <tr>
                  <td class="label">الاسم الكامل</td>
                  <td class="value">${this.citizen.name || ''}</td>
                </tr>
                <tr>
                  <td class="label">رقم الهوية</td>
                  <td class="value">${this.citizen.nationalId || ''}</td>
                </tr>
                ${this.citizen.birthDate ? `
                <tr>
                  <td class="label">تاريخ الميلاد</td>
                  <td class="value">${formatDate(this.citizen.birthDate)}</td>
                </tr>
                ` : ''}
                ${this.citizen.motherName ? `
                <tr>
                  <td class="label">اسم الأم</td>
                  <td class="value">${this.citizen.motherName}</td>
                </tr>
                ` : ''}
                ${this.citizen.phone ? `
                <tr>
                  <td class="label">الهاتف</td>
                  <td class="value">${this.citizen.phone}</td>
                </tr>
                ` : ''}
              </tbody>
            </table>
          </div>
        </div>

        ${this.renderStepData()}

        <div class="section-frame">
          <div class="section transaction-info">
            <h4 class="section-title">${TRANSACTION_INFO}</h4>
            <table class="info-table">
              <tbody>
                <tr>
                  <td class="label">رقم المعاملة</td>
                  <td class="value">${this.request.id || ''}</td>
                </tr>
                <tr>
                  <td class="label">نوع المعاملة</td>
                  <td class="value">${this.request.type || ''}</td>
                </tr>
                <tr>
                  <td class="label">الحالة</td>
                  <td class="value">${this.getStatusText(this.request.status)}</td>
                </tr>
                ${this.request.createdAt ? `
                <tr>
                  <td class="label">تاريخ الإصدار</td>
                  <td class="value">${formatDate(this.request.createdAt)}</td>
                </tr>
                ` : ''}
              </tbody>
            </table>
          </div>
        </div>

        ${this.renderInitialData()}

        ${this.renderApprovalSignatures()}

        <div class="section qr-section">
          <div class="qr-container" id="qr-placeholder">
            <div class="qr-placeholder">[QR]</div>
            <p class="qr-label">${QR_LABEL}</p>
          </div>
        </div>

        <div class="document-footer">
          <div class="footer-seal">
            <div class="footer-seal-circle">
              <span class="footer-seal-text">الجمهورية العربية السورية</span>
            </div>
          </div>
          <div class="footer-signature">
            <div class="footer-signature-line"></div>
            <span class="footer-signature-label">توقيع المسؤول</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render initial data section
   * @returns {string} HTML markup
   */
  renderInitialData() {
    const entries = Object.entries(this.intialData || {});
    if (entries.length === 0) return '';

    const rowsArr = [];

    const normalizeKey = (k) => (k || '').toString().replace(/[^A-Za-z\u0600-\u06FF]+/g, '').toLowerCase();

    const addEntry = (key, value) => {
      if (value === undefined || value === null) return;
      // If key indicates a legal paragraph or a personal note, skip it
      const normalizedKey = normalizeKey(key);
      if (normalizedKey.includes('legalparagraph') || normalizedKey.includes('personalnote')) return;
      if (typeof value === 'object' && !Array.isArray(value)) {
        // flatten one level of nested object (e.g., cumulativeData)
        for (const [subKey, subVal] of Object.entries(value)) {
          addEntry(subKey, subVal);
        }
        return;
      }

      rowsArr.push(`
      <tr>
        <td class="label">${key}</td>
        <td class="value">${value !== undefined && value !== null ? value : ''}</td>
      </tr>
    `);
    };

    for (const [key, value] of entries) {
      addEntry(key, value);
    }

    if (rowsArr.length === 0) return '';

    const rows = rowsArr.join('');

    return `
      <div class="section-frame">
        <div class="section initial-data">
          <h4 class="section-title">${this.staticTexts.ADDITIONAL_DATA}</h4>
          <table class="info-table">
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  /**
   * Extract the legal paragraph or note text from step data
   * @param {Object} data - Step data object
   * @returns {string} Extracted note text
   */
  extractStepNote(data) {
    if (!data || typeof data !== 'object') return '';
    for (const [key, value] of Object.entries(data)) {
      const lower = key.toLowerCase();
      if ((lower.includes('paragraph') || lower.includes('note')) && typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }
    for (const value of Object.values(data)) {
      if (typeof value === 'string' && value.length > 15) {
        return value.trim();
      }
    }
    return '';
  }

  /**
   * Render step data / employee notes
   * @returns {string} HTML markup
   */
  renderStepData() {
    const notes = this.stepData._allNotes || [];
    const totalSteps = this.stepData._totalSteps || 0;

    const hasApprovalData = notes.length === 0 && totalSteps > 0 &&
      Object.keys(this.stepData).some(k => !k.startsWith('_') && this.stepData[k]?.employee);

    if (hasApprovalData) {
      const sorted = Object.entries(this.stepData)
        .filter(([k]) => !k.startsWith('_'))
        .sort(([, a], [, b]) => (a.order || 0) - (b.order || 0));

      if (sorted.length === 0) return '';

      const narrativeParts = sorted.map(([section, step], i) => {
        const note = this.extractStepNote(step.data) || step.note || step.description || '';
        const connector = i === 0 ? 'بناء على المعلومات المرفقة و موافقة' : 'و موافقة';
        const noteHtml = note ? ` "<span class="approval-note-text">${note}</span>"` : '';
        return `
          ${connector}
          <span class="approval-employee">${step.employee || ''}</span>${noteHtml}
          من قسم <span class="approval-section">${section}</span>
        `;
      });

      return `
        <div class="section-frame">
          <div class="section approval-chain">
            <h4 class="section-title">تفاصيل الموافقات</h4>
            <div class="approval-narrative">
              <p>${narrativeParts.join(' ')}</p>
            </div>
          </div>
        </div>
      `;
    }

    if (notes.length === 0) return '';

    // const noteItems = notes.map((note) => `
    //   <div class="note-item">
    //     <div class="note-header">
    //       <span class="note-section-badge">${note.section}</span>
    //       <span class="note-employee">${note.employee || 'موظف'}</span>
    //       <span class="note-date">${note.date ? formatDate(note.date) : ''}</span>
    //     </div>
    //     <div class="note-body">${note.note}</div>
    //   </div>
    // `).join('');

    // return `
    //   <div class="section-frame">
    //     <div class="section employee-notes">
    //       <h4 class="section-title">${this.staticTexts.EMPLOYEE_NOTES}</h4>
    //       <div class="notes-container">
    //         ${noteItems}
    //         ${this.stepData._completedSteps !== undefined ? `
    //         <div class="progress-info">
    //           <span class="progress-icon">✓</span>
    //           <span>التقدم: ${this.stepData._completedSteps} / ${this.stepData._totalSteps}</span>
    //         </div>
    //         ` : ''}
    //       </div>
    //     </div>
    //   </div>
    // `;
  }

  /**
   * Get status text in Arabic
   * @param {string} status - Status key
   * @returns {string} Arabic status text
   */
  getStatusText(status) {
    const statusMap = {
      'pending': 'قيد الانتظار',
      'in_progress': 'قيد التنفيذ',
      'approved': 'موافقة',
      'rejected': 'مرفوض',
      'completed': 'مكتمل'
    };
    return statusMap[status] || status || 'غير محدد';
  }

  /**
   * Update citizen data
   * @param {Object} citizen - New citizen data
   */
  setCitizen(citizen) {
    this.citizen = { ...this.citizen, ...citizen };
  }

  /**
   * Update request data
   * @param {Object} request - New request data
   */
  setRequest(request) {
    this.request = { ...this.request, ...request };
  }

  /**
   * Get dynamic layer data
   * @returns {Object} Layer data
   */
  getData() {
    return {
      citizen: this.citizen,
      request: this.request,
      intialData: this.intialData,
      stepData: this.stepData,
      signature: this.signature
    };
  }
}

export default DynamicLayer;