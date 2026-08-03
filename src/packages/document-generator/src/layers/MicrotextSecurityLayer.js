/**
 * MicrotextSecurityLayer.js
 * src/layers/MicrotextSecurityLayer.js
 *
 * Drop-in replacement for SecurityLayer where every security fiber (the
 * short wavy/straight stroked lines) is replaced by microtext that flows
 * along the identical geometric path.
 *
 * This replicates the technique used in real banknote security threads:
 * fine embedded fibers that, under magnification, resolve as a repeating
 * text string. Here the "magnification" is PDF zoom rather than a loupe.
 *
 * What is inherited (unchanged):
 *   · hashToSeed()         — deterministic seed from blockchain hash
 *   · createRNG()          — LCG pseudo-random number generator
 *   · generateLineId()     — unique line identifier
 *   · generateLines()      — produces line descriptor objects
 *   · lineToPathData()     — converts a line descriptor to SVG path `d` string
 *   · matches()            — cross-instance pattern verification
 *   · getVerificationData()
 *
 * What is overridden:
 *   · _renderLines()       — stroke → microtext-along-path
 *
 * Usage:
 *   import { MicrotextSecurityLayer } from './MicrotextSecurityLayer';
 *
 *   const layer = new MicrotextSecurityLayer(txHash, {
 *     institutionCode: 'MIN-INT-IL',
 *     dateFragment:    '2025-06-01',
 *     lineCount:       45,            // standard SecurityLayer option
 *   });
 *
 *   document.body.innerHTML += layer.renderSVG(210, 297);
 *
 * On font size:
 *   Security fibers are 15–60 mm long. At font-size 0.50 mm (Courier New
 *   bold), each character is ~0.30 mm wide, giving 50–200 characters per
 *   fiber — enough for 1–6 full repetitions of the institution identifier
 *   without content wrapping.
 *
 *   At 300 dpi print: 0.50 mm → ~5.9 px/glyph → smears to a line.
 *   At PDF 800% zoom: 0.50 mm → ~11 px/glyph  → "GOV-IL · A3F8C2D1" legible.
 */

import { SecurityLayer } from './SecurityLayer';
import { MicrotextEngine } from './MicrotextEngine';
import { samplePath, computeTangents } from './CanvasMicrotextRenderer';

/**
 * Escape a character for safe inclusion in SVG text content.
 * @param {string} char
 * @returns {string}
 */
function escXml(char) {
  if (char === '&') return '&amp;';
  if (char === '<') return '&lt;';
  if (char === '>') return '&gt;';
  if (char === '"') return '&quot;';
  return char;
}

export class MicrotextSecurityLayer extends SecurityLayer {
  /**
   * @param {string} dataHash  Transaction / document hash from the blockchain
   * @param {Object} config    All SecurityLayer options, plus microtext options below
   *
   * Microtext-specific options:
   * @param {string} [config.institutionCode='GOV']  Short institution identifier
   * @param {string} [config.dateFragment='']         ISO date string
   *
   * Typography overrides (all optional):
   * @param {number} [config.microtextFontSize]
   * @param {number} [config.microtextFontSizeMin]
   * @param {number} [config.microtextFontSizeMax]
   * @param {number} [config.microtextLetterSpacing]
   * @param {string} [config.microtextFontFamily]
   */
  constructor(dataHash, config = {}) {
    super(dataHash, config);

    const txFragment = this.hash.replace('0x', '').slice(0, 8).toUpperCase();

    this._engineConfig = {
      institutionCode: config.institutionCode  || 'GOV',
      txHashFragment:  txFragment,
      dateFragment:    config.dateFragment     || '',
      fontSize:        config.microtextFontSize,
      fontSizeMin:     config.microtextFontSizeMin,
      fontSizeMax:     config.microtextFontSizeMax,
      letterSpacing:   config.microtextLetterSpacing,
      fontFamily:      config.microtextFontFamily,
      contentRepeatCount: config.contentRepeatCount,
      strokeScale: config.microtextStrokeScale ?? config.strokeScale,
    };

    this._idSlice = this.hash.replace('0x', '').slice(0, 4).toLowerCase();
  }

  /**
   * Renders security fibers as individual <text> elements positioned
   * along the path with per-character rotation — no <textPath> needed.
   *
   * Works reliably in every SVG renderer (browser, print, PDF via html2canvas).
   *
   * @param  {Array}  lines  Output of generateLines()
   * @param  {number} width  Page width in mm
   * @param  {number} height Page height in mm
   * @returns {string}       SVG markup fragment
   */
  _renderLines(lines, width, height) {
    const engine = new MicrotextEngine(this._engineConfig);
    const textContent = engine.buildContent();
    const strokeScale = this._engineConfig.strokeScale ?? 0.22;
    let svg = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const pathData = this.lineToPathData(line, width, height);
      const fs = engine.fontSizeFromThickness(line.thickness);
      const color = `hsl(${line.hue.toFixed(1)}, 40%, 35%)`;
      const opacity = Math.min(1, Math.max(0, line.opacity));
      const strokeWidth = fs * strokeScale;

      const points = samplePath(pathData, 5);
      const tangents = computeTangents(points);
      const advancePerChar = fs * 0.55;

      let textIndex = 0, distance = 0;
      for (let j = 0; j < tangents.length; j++) {
        const pt = tangents[j];
        if (distance >= advancePerChar || j === 0) {
          const char = textContent[textIndex % textContent.length];
          textIndex++;
          const angleDeg = (pt.angle * 180 / Math.PI).toFixed(1);
          const x = pt.x.toFixed(2);
          const y = pt.y.toFixed(2);
          svg += `<text x="${x}" y="${y}" transform="rotate(${angleDeg} ${x} ${y})" font-size="${fs.toFixed(3)}" font-family="${engine.fontFamily}" font-weight="${engine.fontWeight}" fill="${color}" fill-opacity="${opacity.toFixed(3)}" stroke="${color}" stroke-opacity="${opacity.toFixed(3)}" stroke-width="${strokeWidth.toFixed(3)}" paint-order="stroke fill" dominant-baseline="middle" text-anchor="middle">${escXml(char)}</text>\n`;
        }
        if (j < tangents.length - 1) {
          const dx = tangents[j + 1].x - pt.x;
          const dy = tangents[j + 1].y - pt.y;
          distance += Math.sqrt(dx * dx + dy * dy);
        }
      }
    }

    return svg;
  }
}

export default MicrotextSecurityLayer;
