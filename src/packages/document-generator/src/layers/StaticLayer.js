// File: src/layers/StaticLayer.js

import { constants } from '../utils/constants';

/**
 * StaticLayer - Renders static content (logo, header, republic name)
 * Content that doesn't change between documents
 */
export class StaticLayer {
  /**
   * @param {Object} data - Static layer data
   * @param {Object} data.institution - Institution data
   * @param {string} data.logo - Logo URL/path
   * @param {Object} data.config - Configuration overrides
   */
  constructor(data = {}) {
    this.institution = data.institution || {};
    this.logo = data.logo || constants.DEFAULT_LOGO;
    this.config = data.config || {};
    this.staticTexts = {
      ...constants.STATIC_TEXTS,
      ...data.staticTexts
    };
  }

  /**
   * Render static layer HTML
   * @returns {string} HTML markup
   */
  render() {
    const { REPUBLIC, OFFICIAL_DOCUMENT } = this.staticTexts;
    const institutionName = this.institution.name || '';
    const logoHtml = this.logo
      ? `<img src="${this.logo}" alt="شعار الجمهورية" class="logo" />`
      : '<div class="logo-placeholder"></div>';

    const now = new Date();
    const dateStr = now.toLocaleDateString('ar-SY', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    return `
      <div class="document-header">
        <div class="header-top">
          <div class="header-logo">
            ${logoHtml}
          </div>
          <div class="header-text">
            <h1 class="republic-name">${REPUBLIC}</h1>
            <div class="header-decorative-line"></div>
            <h2 class="institution-name">${institutionName}</h2>
          </div>
        </div>
        <div class="official-document-frame">
          <span class="official-document-text">${OFFICIAL_DOCUMENT}</span>
        </div>
        <div class="header-divider"></div>
        <div class="document-info-row">
          <span class="info-item">التاريخ: <span class="info-value">${dateStr}</span></span>
        </div>
        <div class="header-bottom-bar"></div>
      </div>
    `;
  }

  /**
   * Update institution name (useful for dynamic changes)
   * @param {string} name - New institution name
   */
  setInstitutionName(name) {
    this.institution.name = name;
  }

  /**
   * Update logo
   * @param {string} logo - New logo URL/path
   */
  setLogo(logo) {
    this.logo = logo;
  }

  /**
   * Get static layer data
   * @returns {Object} Layer data
   */
  getData() {
    return {
      institution: this.institution,
      logo: this.logo,
      staticTexts: this.staticTexts
    };
  }
}

export default StaticLayer;