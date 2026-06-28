import { constants } from '../utils/constants';

export class GuillocheLayer {
  constructor(dataHash, config = {}) {
    this.hash = dataHash || '0x' + '0'.repeat(64);
    this.config = {
      centerY: config.centerY || -45,
      arcRadius: config.arcRadius || 114,
      ringBase: config.ringBase || 10,
      ringMax: config.ringMax || 8,
      ...config
    };
    this.seed = this.hashToSeed(this.hash);
  }

  hashToSeed(hash) {
    let seed = 0;
    const cleanHash = hash.replace('0x', '');
    for (let i = 0; i < cleanHash.length; i++) {
      seed = ((seed << 5) - seed) + cleanHash.charCodeAt(i);
      seed = seed & seed;
    }
    return Math.abs(seed) || 42;
  }

  createRNG(seed) {
    return function() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  /**
   * Build an SVG path string from an array of points using smooth
   * Catmull-Rom to cubic bezier conversion for fluid curves.
   */
  buildSmoothPath(pts) {
    if (pts.length < 3) {
      return pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join('');
    }
    let d = 'M' + pts[0][0].toFixed(2) + ' ' + pts[0][1].toFixed(2);
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[(i - 1 + pts.length) % pts.length];
      const p1 = pts[i];
      const p2 = pts[(i + 1) % pts.length];
      const p3 = pts[(i + 2) % pts.length];
      const tension = 0.25;
      const cp1x = p1[0] + (p2[0] - p0[0]) * tension;
      const cp1y = p1[1] + (p2[1] - p0[1]) * tension;
      const cp2x = p2[0] - (p3[0] - p1[0]) * tension;
      const cp2y = p2[1] - (p3[1] - p1[1]) * tension;
      d += ' C' + cp1x.toFixed(2) + ',' + cp1y.toFixed(2) +
           ' ' + cp2x.toFixed(2) + ',' + cp2y.toFixed(2) +
           ' ' + p2[0].toFixed(2) + ',' + p2[1].toFixed(2);
    }
    return d;
  }

  /**
   * Generate the main concentric rosette rings. Each ring uses compound
   * sinusoidal modulation (3 harmonics) plus optional radial distortion
   * to create the classic guilloché look.
   */
  generateConcentricRings(cx, cy, R, rng, points) {
    const count = 24 + (this.seed % 10);
    const paths = [];
    const baseFreq = 6 + (this.seed % 10);

    for (let i = 0; i < count; i++) {
      const radius = 8 + (i / count) * (R - 16);
      const phase = rng() * Math.PI * 2;

      // Three harmonics with different frequencies and amplitudes
      const amp1 = 0.4 + rng() * 0.8;
      const amp2 = 0.2 + rng() * 0.5;
      const amp3 = 0.1 + rng() * 0.3;
      const freq1 = baseFreq;
      const freq2 = baseFreq * 1.7 + rng() * 2;
      const freq3 = baseFreq * 0.3 + rng() * 1.5;

      const thickness = (0.1 + rng() * 0.2) * (1 + i / count * 0.3);
      const shade = 15 + (i / count) * 35;
      const colorType = i % 3;
      const color = colorType === 0
        ? `hsl(215, 80%, ${shade}%)`
        : colorType === 1
          ? `hsl(40, 90%, ${shade + 20}%)`
          : `hsl(180, 60%, ${shade + 10}%)`;
      const opacity = 0.08 + (i / count) * 0.22 + rng() * 0.05;

      const pts = [];
      for (let j = 0; j <= points; j++) {
        const theta = (j / points) * Math.PI * 2;
        const wave =
          Math.sin(theta * freq1 + phase) * amp1 +
          Math.sin(theta * freq2 + phase * 1.3) * amp2 +
          Math.sin(theta * freq3 + phase * 0.7) * amp3;
        const r = radius + wave;
        const distortX = 1 + 0.04 * Math.sin(theta * 4 + phase);
        const distortY = 1 + 0.04 * Math.cos(theta * 4 + phase);
        pts.push([
          cx + r * Math.cos(theta) * distortX,
          cy + r * Math.sin(theta) * distortY
        ]);
      }
      paths.push({
        d: this.buildSmoothPath(pts),
        color, thickness, opacity,
        strokeLinecap: 'butt', strokeLinejoin: 'round',
        zIndex: 0
      });
    }
    return paths;
  }

  /**
   * Generate high-frequency fine rings with very thin strokes.
   * These add the micro-detail typical of banknote guilloché.
   */
  generateFineRings(cx, cy, R, rng, points) {
    const count = 8 + (this.seed % 8);
    const paths = [];
    const baseFreq = 12 + (this.seed % 15);

    for (let i = 0; i < count; i++) {
      const radius = 12 + (i / count) * (R - 20);
      const phase = rng() * Math.PI * 2;
      const amp = 0.15 + rng() * 0.3;
      const thickness = 0.08 + rng() * 0.15;
      const shade = 60 + (i / count) * 25;

      const pts = [];
      for (let j = 0; j <= points; j++) {
        const theta = (j / points) * Math.PI * 2;
        const wave = Math.sin(theta * baseFreq + phase) * amp;
        const r = radius + wave;
        pts.push([cx + r * Math.cos(theta), cy + r * Math.sin(theta)]);
      }
      paths.push({
        d: this.buildSmoothPath(pts),
        color: `hsl(0, 0%, ${shade}%)`,
        thickness,
        opacity: 0.25 + rng() * 0.15,
        strokeLinecap: 'round', strokeLinejoin: 'round',
        zIndex: 1
      });
    }
    return paths;
  }

  /**
   * Generate cross-hatching rings that overlap the concentric pattern.
   * Uses wider amplitude and different frequency ratios to create
   * the intersecting mesh typical of guilloché security printing.
   */
  generateCrossHatch(cx, cy, R, rng, points) {
    const count = 6 + (this.seed % 6);
    const paths = [];
    const baseFreq = 3 + (this.seed % 5);

    for (let i = 0; i < count; i++) {
      const radius = 15 + (i / count) * (R - 25);
      const phase = rng() * Math.PI * 2;
      const amp = 0.8 + rng() * 1.5;
      const thickness = 0.6 + rng() * 0.8;

      const pts = [];
      for (let j = 0; j <= points; j++) {
        const theta = (j / points) * Math.PI * 2;
        const wave =
          Math.sin(theta * baseFreq + phase) * amp +
          Math.sin(theta * baseFreq * 2.5 + phase * 2) * amp * 0.3 +
          Math.sin(theta * 2 + phase * 2) * 0.2;
        const r = radius + wave;
        pts.push([cx + r * Math.cos(theta), cy + r * Math.sin(theta)]);
      }
      paths.push({
        d: this.buildSmoothPath(pts),
        color: `hsl(30, 70%, 30%)`,
        thickness,
        opacity: 0.05 + rng() * 0.08,
        strokeLinecap: 'butt', strokeLinejoin: 'round',
        zIndex: 2
      });
    }
    return paths;
  }

  /**
   * Generate Lissajous-style curves that weave through the rosette.
   * These are parametric curves (sin(a*t), sin(b*t)) that create
   * the complex interlocking loops seen in high-security guilloché.
   */
  generateLissajousCurves(cx, cy, R, rng, points) {
    const count = 3 + (this.seed % 3);
    const paths = [];

    const ratios = [
      [3, 2], [5, 4], [7, 6], [5, 3], [8, 5], [4, 3]
    ];
    const selected = [];
    for (let i = 0; i < count; i++) {
      selected.push(ratios[(this.seed + i) % ratios.length]);
    }

    for (let i = 0; i < count; i++) {
      const [a, b] = selected[i];
      const phaseX = rng() * Math.PI * 2;
      const phaseY = rng() * Math.PI * 2;
      const scaleX = (R * 0.6) + rng() * (R * 0.3);
      const scaleY = (R * 0.4) + rng() * (R * 0.3);
      const thickness = 0.15 + rng() * 0.25;
      const shade = 30 + rng() * 30;
      const isGold = i % 2 === 0;

      const pts = [];
      for (let j = 0; j <= points; j++) {
        const t = (j / points) * Math.PI * 2;
        const x = cx + Math.sin(a * t + phaseX) * scaleX;
        const y = cy + Math.sin(b * t + phaseY) * scaleY;
        pts.push([x, y]);
      }
      paths.push({
        d: this.buildSmoothPath(pts),
        color: isGold ? `hsl(40, 80%, ${shade}%)` : `hsl(215, 70%, ${shade}%)`,
        thickness,
        opacity: 0.12 + rng() * 0.15,
        strokeLinecap: 'round', strokeLinejoin: 'round',
        zIndex: 3
      });
    }
    return paths;
  }

  /**
   * Generate spiral connectors that bridge between ring layers.
   * These Archimedean-style spirals add depth and complexity
   * by visually linking the concentric rings.
   */
  generateSpiralConnectors(cx, cy, R, rng, points) {
    const count = 2 + (this.seed % 3);
    const paths = [];

    for (let i = 0; i < count; i++) {
      const startAngle = rng() * Math.PI * 2;
      const turns = 3 + Math.floor(rng() * 4);
      const innerR = 12 + rng() * 20;
      const outerR = R * (0.5 + rng() * 0.4);
      const thickness = 0.2 + rng() * 0.3;
      const waveAmp = 1 + rng() * 2;
      const waveFreq = 8 + Math.floor(rng() * 12);
      const shade = 20 + rng() * 25;

      const pts = [];
      for (let j = 0; j <= points; j++) {
        const t = j / points;
        const angle = startAngle + t * turns * Math.PI * 2;
        const baseR = innerR + t * (outerR - innerR);
        const wave = Math.sin(angle * waveFreq) * waveAmp * t;
        const r = baseR + wave;
        pts.push([
          cx + r * Math.cos(angle),
          cy + r * Math.sin(angle)
        ]);
      }
      paths.push({
        d: this.buildSmoothPath(pts),
        color: `hsl(200, 50%, ${shade}%)`,
        thickness,
        opacity: 0.08 + rng() * 0.1,
        strokeLinecap: 'round', strokeLinejoin: 'round',
        zIndex: 2
      });
    }
    return paths;
  }

  /**
   * Generate the central medallion — a denser rosette motif at the
   * center of the pattern. Uses tighter rings and higher amplitude
   * modulation to create a focal point.
   */
  generateCentralMedallion(cx, cy, R, rng, points) {
    const innerR = 6 + rng() * 8;
    const outerR = innerR + 10 + rng() * 12;
    const ringCount = 5 + Math.floor(rng() * 4);
    const freq = 8 + Math.floor(rng() * 6);
    const paths = [];

    for (let i = 0; i < ringCount; i++) {
      const t = i / ringCount;
      const radius = innerR + t * (outerR - innerR);
      const amp = 0.3 + rng() * 0.6;
      const phase = rng() * Math.PI * 2;
      const thickness = 0.15 + rng() * 0.2;

      const pts = [];
      for (let j = 0; j <= points; j++) {
        const theta = (j / points) * Math.PI * 2;
        const wave = Math.sin(theta * freq + phase) * amp +
                     Math.sin(theta * freq * 2.3 + phase * 0.7) * amp * 0.4;
        const r = radius + wave;
        pts.push([cx + r * Math.cos(theta), cy + r * Math.sin(theta)]);
      }
      paths.push({
        d: this.buildSmoothPath(pts),
        color: `hsl(40, 85%, ${30 + t * 25}%)`,
        thickness,
        opacity: 0.15 + t * 0.1,
        strokeLinecap: 'round', strokeLinejoin: 'round',
        zIndex: 4
      });
    }
    return paths;
  }

  /**
   * Generate radial spoke lines emanating from the center.
   * These thin lines add a starburst effect behind the rosette.
   */
  generateRadialSpokes(cx, cy, R, rng) {
    const count = 12 + Math.floor(rng() * 12);
    const paths = [];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + rng() * 0.1;
      const innerR = 3 + rng() * 8;
      const outerR = R * (0.6 + rng() * 0.35);
      const thickness = 0.06 + rng() * 0.1;

      const x1 = cx + innerR * Math.cos(angle);
      const y1 = cy + innerR * Math.sin(angle);
      const x2 = cx + outerR * Math.cos(angle);
      const y2 = cy + outerR * Math.sin(angle);

      paths.push({
        d: `M${x1.toFixed(2)} ${y1.toFixed(2)}L${x2.toFixed(2)} ${y2.toFixed(2)}`,
        color: `hsl(220, 40%, 50%)`,
        thickness,
        opacity: 0.04 + rng() * 0.06,
        strokeLinecap: 'round', strokeLinejoin: 'round',
        zIndex: -1
      });
    }
    return paths;
  }

  /**
   * Scatter micro-dots across the pattern area for texture.
   */
  generateMicroDots(cx, cy, R, rng) {
    const count = 50 + (this.seed % 80);
    let dots = '';
    for (let i = 0; i < count; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = 8 + rng() * (R - 12);
      const x = cx + dist * Math.cos(angle);
      const y = cy + dist * Math.sin(angle);
      const size = 0.3 + rng() * 0.8;
      const opacity = 0.1 + rng() * 0.3;
      dots += `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${size.toFixed(2)}" fill="hsl(40, 50%, 40%)" opacity="${opacity.toFixed(3)}" />\n`;
    }
    return dots;
  }

  /**
   * Generate moiré interference rings. When overlaid on the main
   * rosette, these create the shimmering moiré effect used in
   * security printing to deter counterfeiting.
   */
  generateMoireRings(cx, cy, R, rng, points) {
    const count = 3 + (this.seed % 3);
    const paths = [];

    for (let i = 0; i < count; i++) {
      const radius = 20 + i * ((R - 30) / count);
      const phase = rng() * Math.PI * 2;
      const freq = 15 + (this.seed % 10);
      const amp = 0.5 + rng() * 0.8;
      const thickness = 0.5 + rng() * 0.5;
      const opacity = 0.02 + rng() * 0.03;

      const pts = [];
      for (let j = 0; j <= points * 2; j++) {
        const theta = (j / (points * 2)) * Math.PI * 2;
        const wave = Math.sin(theta * freq + phase) * amp;
        const r = radius + wave;
        pts.push([cx + r * Math.cos(theta), cy + r * Math.sin(theta)]);
      }
      paths.push({
        d: this.buildSmoothPath(pts),
        color: 'hsl(220, 30%, 50%)',
        thickness,
        opacity,
        strokeLinecap: 'butt',
        strokeLinejoin: 'round',
        zIndex: 1
      });
    }
    return paths;
  }

  /**
   * Main entry point — assembles all guilloché sub-patterns
   * and returns the combined SVG markup.
   */
  generateRosette(width, height) {
    const rng = this.createRNG(this.seed);
    const cx = width / 2;
    const cy = this.config.centerY;
    const R = this.config.arcRadius;
    const points = 200 + (this.seed % 80);

    const allPaths = [];

    // Layer 1: Radial spokes (background starburst)
    allPaths.push(...this.generateRadialSpokes(cx, cy, R, rng));

    // Layer 2: Concentric rings with compound waves
    allPaths.push(...this.generateConcentricRings(cx, cy, R, rng, points));

    // Layer 3: Fine high-frequency rings
    allPaths.push(...this.generateFineRings(cx, cy, R, rng, points));

    // Layer 4: Cross-hatch intersecting rings
    allPaths.push(...this.generateCrossHatch(cx, cy, R, rng, points));

    // Layer 5: Spiral connectors bridging ring layers
    allPaths.push(...this.generateSpiralConnectors(cx, cy, R, rng, points));

    // Layer 6: Lissajous overlay curves
    allPaths.push(...this.generateLissajousCurves(cx, cy, R, rng, points));

    // Layer 7: Central medallion focal point
    allPaths.push(...this.generateCentralMedallion(cx, cy, R, rng, points));

    // Layer 8: Moiré interference rings
    allPaths.push(...this.generateMoireRings(cx, cy, R, rng, points));

    // Sort by zIndex so background elements render first
    allPaths.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    // Render all paths to SVG strings
    let svg = '';
    for (const p of allPaths) {
      svg += `<path d="${p.d}" fill="none" stroke="${p.color}" stroke-width="${p.thickness.toFixed(3)}" stroke-opacity="${p.opacity.toFixed(3)}" stroke-linecap="${p.strokeLinecap}" stroke-linejoin="${p.strokeLinejoin}" />\n`;
    }

    // Layer 9: Micro-dots (rendered as circles, not paths)
    svg += this.generateMicroDots(cx, cy, R, rng);

    return svg;
  }
  renderSVG(width = constants.PAGE_WIDTH, height = 80) {
    const svgHeight = height;
    const svgTop = -2;
    const paths = this.generateRosette(width, svgHeight);

    return `
      <svg
        viewBox="0 ${svgTop} ${width} ${svgHeight}"
        style="position:absolute;top:0;left:0;width:100%;height:${svgHeight}mm;overflow:hidden;pointer-events:none;z-index:0;"
        xmlns="http://www.w3.org/2000/svg"
        data-hash="${this.hash}"
      >
        ${paths}
      </svg>
    `;
  }

  getVerificationData() {
    return {
      hash: this.hash,
      seed: this.seed,
      timestamp: new Date().toISOString()
    };
  }
}

export default GuillocheLayer;
