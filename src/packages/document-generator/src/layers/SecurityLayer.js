// File: src/layers/SecurityLayer.js

import { constants } from '../utils/constants';

/**
 * SecurityLayer - Generates security pattern lines based on data hash
 * Uses seeded PRNG for reproducible patterns
 */
export class SecurityLayer {
  /**
   * @param {string} dataHash - Hash from blockchain/backend
   * @param {Object} config - Configuration options
   */
  constructor(dataHash, config = {}) {
    this.hash = dataHash || '0x' + '0'.repeat(64);
    this.config = {
      lineCount: config.lineCount || 45,
      opacityMin: config.opacityMin || 0.3,
      opacityMax: config.opacityMax || 0.5,
      ...config
    };
    this.seed = this.hashToSeed(this.hash);
  }

  /**
   * Convert hash to numeric seed for PRNG
   * @param {string} hash - Hex hash
   * @returns {number} Numeric seed
   */
  hashToSeed(hash) {
    let seed = 0;
    const cleanHash = hash.replace('0x', '');
    for (let i = 0; i < cleanHash.length; i++) {
      seed = ((seed << 5) - seed) + cleanHash.charCodeAt(i);
      seed = seed & seed;
    }
    return Math.abs(seed) || 42;
  }

  /**
   * Create seeded Pseudo-Random Number Generator
   * @param {number} seed - Initial seed
   * @returns {Function} PRNG function
   */
  createRNG(seed) {
    return function() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  /**
   * Generate unique ID for each line
   * @param {number} index - Line index
   * @returns {string} Unique line ID
   */
  generateLineId(index) {
    const hashPart = this.hash.replace('0x', '').slice(0, 6);
    return `L${String(index).padStart(3, '0')}-${hashPart}`;
  }

  /**
   * Generate security lines based on hash
   * @param {number} count - Number of lines to generate
   * @returns {Array} Array of line objects
   */
  generateLines(count = null) {
    const totalLines = count || this.config.lineCount;
    const lines = [];
    const rng = this.createRNG(this.seed);
    const { opacityMin, opacityMax } = this.config;

    for (let i = 0; i < totalLines; i++) {
      const x = rng() * 100;
      const y = rng() * 100;
      const angle = rng() * 360;
      const length = 15 + rng() * 45;
      const thickness = 0.05 + rng() * 0.15;
      const opacity = opacityMin + rng() * (opacityMax - opacityMin) + 0.5;
      const hue = 200 + rng() * 60;
      const dashPattern = [
        2 + rng() * 4,
        1 + rng() * 3
      ];
      const waviness = rng() * 0.4;

      lines.push({
        id: this.generateLineId(i),
        x, y, angle, length, thickness, opacity, hue,
        dash: dashPattern,
        waviness,
        raw: { x, y, angle, length }
      });
    }

    return lines;
  }

  /**
   * Compute SVG path data string for a single security line descriptor.
   * Shared by both the stroke renderer and the microtext renderer.
   *
   * @param  {Object} line   Line descriptor from generateLines()
   * @param  {number} width  Page width in mm
   * @param  {number} height Page height in mm
   * @returns {string}       SVG path `d` value
   */
  lineToPathData(line, width, height) {
    const x1       = (line.x / 100) * width;
    const y1       = (line.y / 100) * height;
    const angleRad = line.angle * Math.PI / 180;
    const x2       = x1 + Math.cos(angleRad) * line.length;
    const y2       = y1 + Math.sin(angleRad) * line.length;
    const midX     = (x1 + x2) / 2 + Math.sin(line.angle * 0.1) * line.waviness * 3;
    const midY     = (y1 + y2) / 2 + Math.cos(line.angle * 0.1) * line.waviness * 3;
    return line.waviness > 0.1
      ? `M ${x1.toFixed(2)} ${y1.toFixed(2)} Q ${midX.toFixed(2)} ${midY.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)}`
      : `M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  }

  /**
   * Protected render hook — converts line descriptors to SVG markup.
   * Override in subclasses to swap stroke rendering for microtext rendering.
   *
   * @param  {Array}  lines  Output of generateLines()
   * @param  {number} width  Page width in mm
   * @param  {number} height Page height in mm
   * @returns {string}       SVG markup (no wrapping <svg> tag)
   */
  _renderLines(lines, width, height) {
    let svg = '';
    for (const line of lines) {
      const d = this.lineToPathData(line, width, height);
      svg += `<path d="${d}" stroke="hsla(${line.hue}, 40%, 35%, ${line.opacity})" stroke-width="${line.thickness}" stroke-dasharray="${line.dash.join(', ')}" data-line-id="${line.id}" fill="none" />\n`;
    }
    return svg;
  }

  /**
   * Render security lines as SVG
   * @param {number} width - Page width in mm
   * @param {number} height - Page height in mm
   * @returns {string} SVG markup
   */
  renderSVG(width = constants.PAGE_WIDTH, height = constants.PAGE_HEIGHT) {
    const lines = this.generateLines();
    
    let svg = `
      <svg
        viewBox="0 0 ${width} ${height}"
        style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        data-hash="${this.hash}"
        data-line-count="${lines.length}"
      >
        <g>
    `;

    svg += this._renderLines(lines, width, height);

    svg += `
        </g>
      </svg>
    `;

    return svg;
  }

  /**
   * Verify if two security layers match
   * @param {SecurityLayer} other - Another SecurityLayer instance
   * @returns {boolean} True if patterns match
   */
  matches(other) {
    if (!(other instanceof SecurityLayer)) return false;
    
    // Compare hashes
    if (this.hash !== other.hash) return false;
    
    // Compare line count
    const myLines = this.generateLines();
    const otherLines = other.generateLines();
    
    if (myLines.length !== otherLines.length) return false;
    
    // Compare first 10 lines as sample
    const sampleSize = Math.min(10, myLines.length);
    for (let i = 0; i < sampleSize; i++) {
      const my = myLines[i];
      const other = otherLines[i];
      
      // Allow small float differences (0.01 tolerance)
      if (Math.abs(my.x - other.x) > 0.01) return false;
      if (Math.abs(my.y - other.y) > 0.01) return false;
      if (Math.abs(my.angle - other.angle) > 0.01) return false;
      if (Math.abs(my.length - other.length) > 0.1) return false;
    }
    
    return true;
  }

  /**
   * Get verification data for QR code
   * @returns {Object} Verification data
   */
  getVerificationData() {
    return {
      hash: this.hash,
      lineCount: this.config.lineCount,
      seed: this.seed,
      timestamp: new Date().toISOString()
    };
  }
}

export default SecurityLayer;
