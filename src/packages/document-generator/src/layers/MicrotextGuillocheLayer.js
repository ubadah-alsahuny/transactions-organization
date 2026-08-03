/**
 * MicrotextGuillocheLayer.js
 * src/layers/MicrotextGuillocheLayer.js
 *
 * Drop-in replacement for GuillocheLayer where every stroke-rendered path
 * is replaced by microtext flowing along the same geometric rail.
 *
 * What is inherited (unchanged):
 *   · hashToSeed()            — deterministic seed derivation
 *   · createRNG()             — LCG pseudo-random number generator
 *   · buildSmoothPath()       — Catmull-Rom → cubic bezier interpolation
 *   · generateConcentricRings()
 *   · generateFineRings()
 *   · generateCrossHatch()
 *   · generateLissajousCurves()
 *   · generateSpiralConnectors()
 *   · generateCentralMedallion()
 *   · generateRadialSpokes()
 *   · generateMoireRings()
 *   · generateMicroDots()     — dots remain as <circle>s (already sub-mm)
 *   · getVerificationData()
 *
 * What is overridden (only the rendering step):
 *   · _renderPathCollection() — stroke → <textPath> microtext
 *
 * Usage:
 *   import { MicrotextGuillocheLayer } from './MicrotextGuillocheLayer';
 *
 *   const layer = new MicrotextGuillocheLayer(txHash, {
 *     institutionCode: 'MIN-INT-IL',
 *     dateFragment:    '2025-06-01',
 *     // all standard GuillocheLayer config also accepted:
 *     centerY:    -45,
 *     arcRadius:  114,
 *   });
 *
 *   document.body.innerHTML += layer.renderSVG(210, 80);
 *
 * Verification:
 *   Given the same txHash and institutionCode, renderSVG() always produces
 *   the identical SVG — making server-side re-render a valid audit tool.
 */

import { GuillocheLayer } from './GuillocheLayer';
import { MicrotextEngine } from './MicrotextEngine';

export class MicrotextGuillocheLayer extends GuillocheLayer {
  /**
   * @param {string} dataHash   Transaction / document hash from the blockchain
   * @param {Object} config     All GuillocheLayer options, plus microtext options below
   *
   * Microtext-specific options:
   * @param {string} [config.institutionCode='GOV']  Short institution identifier
   * @param {string} [config.dateFragment='']         ISO date string, e.g. "2025-06-01"
   *
   * Typography overrides (all optional — defaults produce optimal security output):
   * @param {number} [config.microtextFontSize]
   * @param {number} [config.microtextFontSizeMin]
   * @param {number} [config.microtextFontSizeMax]
   * @param {number} [config.microtextLetterSpacing]
   * @param {string} [config.microtextFontFamily]
   */
  constructor(dataHash, config = {}) {
    super(dataHash, config);

    // The first 8 hex chars of the hash become part of the readable microtext.
    // A different hash → a different fragment → different text visible under zoom.
    const txFragment = this.hash.replace('0x', '').slice(0, 8).toUpperCase();

    this._engineConfig = {
      institutionCode: config.institutionCode  || 'GOV',
      txHashFragment:  txFragment,
      dateFragment:    config.dateFragment     || '',
      // Typography — map config keys so callers don't need to know internal names
      fontSize:        config.microtextFontSize,
      fontSizeMin:     config.microtextFontSizeMin,
      fontSizeMax:     config.microtextFontSizeMax,
      letterSpacing:   config.microtextLetterSpacing,
      fontFamily:      config.microtextFontFamily,
      contentRepeatCount: config.contentRepeatCount,
      strokeScale: config.microtextStrokeScale ?? config.strokeScale,
    };

    // 4-char slug from the hash — used in path IDs.
    // Short enough to keep IDs compact; unique enough for document-level IDs.
    this._idSlice = this.hash.replace('0x', '').slice(0, 4).toLowerCase();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // OVERRIDE — render hook only; all geometry is inherited
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Replaces every `<path stroke="…">` with a `<textPath>` element that
   * flows microtext along the identical geometric curve.
   *
   * The result is visually identical to the stroked version at normal scale,
   * but reveals institution + hash content when zoomed in a PDF viewer,
   * and collapses to smeared noise when printed on ordinary printers.
   *
   * Structure of the returned SVG fragment:
   *
   *   <defs>
   *     <path id="mt_a3f8_0000" d="M…" fill="none" stroke="none"/>
   *     <path id="mt_a3f8_0001" d="M…" fill="none" stroke="none"/>
   *     …
   *   </defs>
   *   <text font-size="0.480" …><textPath href="#mt_a3f8_0000">GOV-IL · A3F8C2D1 · …</textPath></text>
   *   <text font-size="0.500" …><textPath href="#mt_a3f8_0001">GOV-IL · A3F8C2D1 · …</textPath></text>
   *   …
   *
   * @param  {Array<{d,color,thickness,opacity,strokeLinecap,strokeLinejoin,zIndex}>} paths
   * @returns {string}  SVG markup fragment (no wrapping <svg> tag)
   */
  _renderPathCollection(paths) {
    const engine = new MicrotextEngine(this._engineConfig);
    const defs   = [];
    const texts  = [];

    for (let i = 0; i < paths.length; i++) {
      const p  = paths[i];
      const id = engine.pathId(this._idSlice, i);

      // Scale font size to match the visual weight of the original stroke.
      // Concentric rings (thin, ~0.15) → 0.40 mm
      // Cross-hatch (thick, ~0.6-1.4)  → 0.58–0.62 mm
      const fs = engine.fontSizeFromThickness(p.thickness);

      // opacity is passed through unchanged — the fill-opacity of the microtext
      // text should match the stroke-opacity the caller intended.
      const { def, text } = engine.renderTextPathPair(id, p.d, p.color, p.opacity, fs);
      defs.push(def);
      texts.push(text);
    }

    return `<defs>\n${defs.join('\n')}\n</defs>\n${texts.join('\n')}\n`;
  }
}

export default MicrotextGuillocheLayer;
