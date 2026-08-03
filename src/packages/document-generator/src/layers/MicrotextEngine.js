/**
 * MicrotextEngine.js
 * src/security/MicrotextEngine.js
 *
 * Converts SVG path data into microtext-along-path security elements.
 *
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  SECURITY PRINCIPLE — WHY MICROTEXT WORKS AS A SECURITY LINE        ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║  At font-size 0.50 mm (≈ 1.4 pt) in a 210 mm coordinate space:    ║
 * ║                                                                      ║
 * ║  PDF viewer  100% zoom : 0.50mm → ~1.4 px/glyph                   ║
 * ║              Individual characters invisible → reads as a line      ║
 * ║                                                                      ║
 * ║  PDF viewer  800% zoom : 0.50mm → ~11 px/glyph                    ║
 * ║              Bold monospace glyphs resolve → "GOV-IL · A3F8C2D1"  ║
 * ║                                                                      ║
 * ║  Printer  300 dpi      : 0.50mm → ~5.9 px/glyph                   ║
 * ║              Ink dots larger than glyph detail → smeared line       ║
 * ║                                                                      ║
 * ║  Printer  600 dpi      : 0.50mm → ~11.8 px/glyph                  ║
 * ║              Fonts merge into noise bands, word unreadable          ║
 * ║                                                                      ║
 * ║  Printer 1200 dpi      : 0.50mm → ~23.6 px/glyph                  ║
 * ║              Professional equipment — marginally readable, but at   ║
 * ║              0.40 mm (fontSizeMin) even 1200 dpi cannot resolve    ║
 * ║                                                                      ║
 * ║  Cryptographic anchor: same hash → same seed → same patterns.      ║
 * ║  Institution can recompute from chain and compare to verify.        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Usage:
 *   const engine = new MicrotextEngine({
 *     institutionCode: 'MIN-INT-IL',
 *     txHashFragment:  'A3F8C2D1',
 *     dateFragment:    '2025-06-01',
 *   });
 *
 *   const { def, text } = engine.renderTextPathPair(
 *     engine.pathId('a3f8', 0),
 *     pathDString,
 *     'hsl(215, 80%, 20%)',
 *     0.55,
 *     0.50
 *   );
 *   // Place def inside <defs>…</defs>, text after.
 */

/**
 * @typedef {Object} TextPathPair
 * @property {string} def  - `<path>` element to place inside `<defs>` (invisible rail)
 * @property {string} text - `<text><textPath>` element that renders along the rail
 */

export class MicrotextEngine {
  /**
   * @param {Object}  config
   *
   * Identity (drives the readable content revealed under zoom):
   * @param {string}  config.institutionCode   Short code, e.g. "GOV-IL", "MIN-INT"
   * @param {string}  config.txHashFragment    First 8 hex chars of the tx hash (uppercase)
   * @param {string}  [config.dateFragment]    Optional date string, e.g. "2025-06-01"
   *
   * Typography:
   * @param {number}  [config.fontSize=0.50]     Default glyph height in SVG/mm units
   * @param {number}  [config.fontSizeMin=0.40]  Minimum — used for the thinnest paths
   * @param {number}  [config.fontSizeMax=0.62]  Maximum — used for the thickest paths
   * @param {string}  [config.fontFamily]         CSS font stack
   * @param {string}  [config.fontWeight='bold']  bold creates a denser, more line-like fill
   * @param {number}  [config.letterSpacing=-0.01]
   *   Negative value pulls glyphs together slightly:
   *   · characters overlap a hair → the text column looks more like a solid line
   *   · still individually legible when zoomed in PDF
   */
  constructor(config = {}) {
    // ── Identity ──────────────────────────────────────────────────────────
    this.institutionCode = (config.institutionCode || 'SECURE-DOC').toUpperCase();
    this.txHashFragment  = (config.txHashFragment  || '00000000').toUpperCase();
    this.dateFragment    =  config.dateFragment    || '';

    // ── Typography ────────────────────────────────────────────────────────
    // Bold monospace: all caps have equal height (no descenders) → uniform
    // visual "band" at small sizes. Courier New is near-universal and
    // reliably embedded by every PDF renderer.
    this.fontFamily    = config.fontFamily    ?? "'Courier New', 'Lucida Console', monospace";
    this.fontWeight    = config.fontWeight    ?? 'bold';
    this.letterSpacing = config.letterSpacing ?? -0.01;

    // Font-size range (mm / SVG coordinate units)
    this.fontSizeDefault = config.fontSize    ?? 0.50;
    this.fontSizeMin     = config.fontSizeMin ?? 0.40;
    this.fontSizeMax     = config.fontSizeMax ?? 0.62;

    // Middle-dot separator — looks official when revealed under zoom
    this._sep = ' \u00B7 ';   // ' · '

    // Pre-build the repeating text unit once
    this._unit = this._buildUnit();

    this._contentRepeatCount = config.contentRepeatCount ?? 300;
    this._strokeScale = config.strokeScale ?? 0.22;
    this._escapedContentCache = new Map();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Map an original stroke-width value to the appropriate microtext font-size.
   *
   * Thicker visual bands need slightly larger glyphs to fill the intended
   * stroke area, but every size is still below ordinary-printer resolution.
   *
   *   ┌───────────────────┬────────────────────┐
   *   │ stroke-width (mm) │ microtext size (mm) │
   *   ├───────────────────┼────────────────────┤
   *   │ ≤ 0.15            │ 0.40               │
   *   │ 0.15 – 0.30       │ 0.48               │
   *   │ 0.30 – 0.60       │ 0.50               │
   *   │ 0.60 – 1.00       │ 0.58               │
   *   │ > 1.00            │ 0.62               │
   *   └───────────────────┴────────────────────┘
   *
   * @param  {number} strokeWidth  Original stroke-width from a path descriptor
   * @returns {number}             Font-size in SVG / mm units
   */
  fontSizeFromThickness(strokeWidth) {
    if (strokeWidth <= 0.15) return this.fontSizeMin;
    if (strokeWidth <= 0.30) return this.fontSizeMin + 0.08;   // 0.48
    if (strokeWidth <= 0.60) return this.fontSizeDefault;       // 0.50
    if (strokeWidth <= 1.00) return this.fontSizeMax - 0.04;   // 0.58
    return this.fontSizeMax;                                     // 0.62
  }

  /**
   * Build a unique, XML-safe element ID.
   *
   * IDs are deterministic — the same document always produces the same IDs,
   * which is important when verifying by re-rendering from chain data.
   *
   * @param  {string} hashSlice  4–8 hex chars from the document hash
   * @param  {number} index      Sequential index within the render batch
   * @returns {string}
   */
  pathId(hashSlice, index) {
    return `mt_${hashSlice}_${String(index).padStart(4, '0')}`;
  }

  /**
   * Build repeated text content long enough to fill any path length.
   * SVG textPath silently clips text at the path end — over-filling is safe
   * and avoids the need to compute actual path lengths.
   *
   * Sizing reference:
   *   Largest ring in GuillocheLayer: R ≈ 114 mm → circumference ≈ 716 mm
   *   At font-size 0.50 mm, Courier New char width ≈ 0.30 mm
   *   → ~2387 characters needed for one full ring
   *   At 35 chars/unit, 300 repeats = 10 500 chars — safely covers all paths.
   *
   * @param  {number} [repeatCount=300]
   * @returns {string}
   */
  buildContent(repeatCount = 300) {
    return this._unit.repeat(repeatCount);
  }

  _getEscapedContent(repeatCount = this._contentRepeatCount) {
    const cached = this._escapedContentCache.get(repeatCount);
    if (cached) return cached;
    const next = this._escapeXml(this.buildContent(repeatCount));
    this._escapedContentCache.set(repeatCount, next);
    return next;
  }

  /**
   * Produce the `<defs>` entry and the `<text><textPath>` element for one path.
   *
   * The def is an invisible path element (no stroke, no fill) that acts as a
   * geometric rail. The text element flows along that rail using `<textPath>`.
   *
   * Placement:
   *   Collect all `def` strings into one `<defs>…</defs>` block.
   *   Emit all `text` strings after the defs, in z-order.
   *
   * @param  {string}  id        Unique XML id — generate with pathId()
   * @param  {string}  pathData  SVG `d` attribute string
   * @param  {string}  color     CSS color (hsl/hex/rgb)
   * @param  {number}  opacity   fill-opacity 0–1
   * @param  {number}  [fontSize] Overrides instance default when supplied
   * @returns {TextPathPair}
   */
  renderTextPathPair(id, pathData, color, opacity, fontSize) {
    const fs      = (fontSize !== undefined && fontSize !== null) ? fontSize : this.fontSizeDefault;
    const content = this._getEscapedContent();
    const strokeWidth = Math.max(0, (fs * this._strokeScale));

    // Invisible geometric rail — the path itself is never visible.
    const def = `<path id="${id}" d="${pathData}" fill="none" stroke="none"/>`;

    // text-rendering / shape-rendering: instruct PDF exporters (Puppeteer,
    // svg2pdf, etc.) to preserve sub-pixel vector fidelity, which is what
    // makes the microtext legible under zoom even at tiny sizes.
    const text =
      `<text` +
      ` font-size="${fs.toFixed(3)}"` +
      ` font-family="${this.fontFamily}"` +
      ` font-weight="${this.fontWeight}"` +
      ` fill="${color}"` +
      ` fill-opacity="${Math.min(1, Math.max(0, opacity)).toFixed(3)}"` +
      ` stroke="${color}"` +
      ` stroke-opacity="${Math.min(1, Math.max(0, opacity)).toFixed(3)}"` +
      ` stroke-width="${strokeWidth.toFixed(3)}"` +
      ` paint-order="stroke fill"` +
      ` stroke-linejoin="round"` +
      ` stroke-linecap="round"` +
      ` letter-spacing="${this.letterSpacing.toFixed(3)}"` +
      ` text-rendering="geometricPrecision"` +
      ` shape-rendering="geometricPrecision"` +
      ` dominant-baseline="middle"` +
      `><textPath href="#${id}" xlink:href="#${id}" startOffset="0" method="align" spacing="exact">${content}</textPath></text>`;

    return { def, text };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Build the single repeating unit that will fill every security path.
   * The unit contains enough identifying information to be meaningful when
   * revealed under zoom:
   *   "GOV-IL · A3F8C2D1 · 2025-06-01 · "
   *
   * The trailing separator ensures clean visual rhythm between repetitions.
   */
  _buildUnit() {
    const parts = [this.institutionCode];
    if (this.txHashFragment) parts.push(this.txHashFragment);
    if (this.dateFragment)   parts.push(this.dateFragment);
    return parts.join(this._sep) + this._sep;
  }

  /** Minimal XML entity escaping for SVG text content. */
  _escapeXml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

export default MicrotextEngine;
