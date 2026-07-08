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
  generateConcentricRings(cx, cy, R, rng, points, viewport = {}) {
    const { minDistance = 0, startTheta = 0, endTheta = Math.PI * 2, arcRatio = 1, skipOptimization = true } = viewport;
    const count = 24 + (this.seed % 10);
    const paths = [];
    const baseFreq = 6 + (this.seed % 10);

    for (let i = 0; i < count; i++) {
      const radius = 8 + (i / count) * (R - 16);
      
      // If the ring is completely outside the viewport, skip it.
      // Maximum wave/distortion amplitude is approx 2.3 (harmonics) + 0.04 * radius (distortion)
      const maxWaveAmp = 2.3 + 0.04 * radius;
      if (!skipOptimization && radius + maxWaveAmp < minDistance) {
        continue;
      }

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
      const numPts = skipOptimization ? points : Math.ceil(points * arcRatio);
      const thetaSpan = endTheta - startTheta;

      for (let j = 0; j <= numPts; j++) {
        const theta = startTheta + (j / numPts) * thetaSpan;
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
  generateFineRings(cx, cy, R, rng, points, viewport = {}) {
    const { minDistance = 0, startTheta = 0, endTheta = Math.PI * 2, arcRatio = 1, skipOptimization = true } = viewport;
    const count = 8 + (this.seed % 8);
    const paths = [];
    const baseFreq = 12 + (this.seed % 15);

    for (let i = 0; i < count; i++) {
      const radius = 12 + (i / count) * (R - 20);
      
      // Skip if the ring never reaches viewport
      const maxWaveAmp = 0.45; // amp is 0.15 + rng() * 0.3 (max 0.45)
      if (!skipOptimization && radius + maxWaveAmp < minDistance) {
        continue;
      }

      const phase = rng() * Math.PI * 2;
      const amp = 0.15 + rng() * 0.3;
      const thickness = 0.08 + rng() * 0.15;
      const shade = 60 + (i / count) * 25;

      const pts = [];
      const numPts = skipOptimization ? points : Math.ceil(points * arcRatio);
      const thetaSpan = endTheta - startTheta;

      for (let j = 0; j <= numPts; j++) {
        const theta = startTheta + (j / numPts) * thetaSpan;
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
  generateCrossHatch(cx, cy, R, rng, points, viewport = {}) {
    const { minDistance = 0, startTheta = 0, endTheta = Math.PI * 2, arcRatio = 1, skipOptimization = true } = viewport;
    const count = 6 + (this.seed % 6);
    const paths = [];
    const baseFreq = 3 + (this.seed % 5);

    for (let i = 0; i < count; i++) {
      const radius = 15 + (i / count) * (R - 25);
      
      // Skip if the ring never reaches viewport.
      // amp can be up to 2.3. Total wave amplitude: amp + amp * 0.3 + 0.2 = 1.3 * amp + 0.2 (max ~3.2).
      const maxWaveAmp = 3.2;
      if (!skipOptimization && radius + maxWaveAmp < minDistance) {
        continue;
      }

      const phase = rng() * Math.PI * 2;
      const amp = 0.8 + rng() * 1.5;
      const thickness = 0.6 + rng() * 0.8;

      const pts = [];
      const numPts = skipOptimization ? points : Math.ceil(points * arcRatio);
      const thetaSpan = endTheta - startTheta;

      for (let j = 0; j <= numPts; j++) {
        const theta = startTheta + (j / numPts) * thetaSpan;
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
  generateLissajousCurves(cx, cy, R, rng, points, viewport = {}) {
    const { yMin = -2, yMax = 80, width = 210, skipOptimization = true } = viewport;
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

      // Skip entirely if the curve is completely above yMin
      if (!skipOptimization && cy + scaleY < yMin) {
        continue;
      }

      const thickness = 0.15 + rng() * 0.25;
      const shade = 30 + rng() * 30;
      const isGold = i % 2 === 0;

      const color = isGold ? `hsl(40, 80%, ${shade}%)` : `hsl(215, 70%, ${shade}%)`;
      const opacity = 0.12 + rng() * 0.15;

      if (skipOptimization) {
        const pts = [];
        for (let j = 0; j <= points; j++) {
          const t = (j / points) * Math.PI * 2;
          const x = cx + Math.sin(a * t + phaseX) * scaleX;
          const y = cy + Math.sin(b * t + phaseY) * scaleY;
          pts.push([x, y]);
        }
        paths.push({
          d: this.buildSmoothPath(pts),
          color, thickness, opacity,
          strokeLinecap: 'round', strokeLinejoin: 'round',
          zIndex: 3
        });
      } else {
        // Group visible points into separate segments
        let currentSegment = [];
        const segments = [];
        for (let j = 0; j <= points; j++) {
          const t = (j / points) * Math.PI * 2;
          const x = cx + Math.sin(a * t + phaseX) * scaleX;
          const y = cy + Math.sin(b * t + phaseY) * scaleY;

          // Check if point is inside viewport with a 15-unit safety margin
          const isVisible = (x >= -15 && x <= width + 15 && y >= yMin - 15 && y <= yMax + 15);
          if (isVisible) {
            currentSegment.push([x, y]);
          } else {
            if (currentSegment.length > 0) {
              segments.push(currentSegment);
              currentSegment = [];
            }
          }
        }
        if (currentSegment.length > 0) {
          segments.push(currentSegment);
        }

        for (const seg of segments) {
          if (seg.length >= 2) {
            paths.push({
              d: this.buildSmoothPath(seg),
              color, thickness, opacity,
              strokeLinecap: 'round', strokeLinejoin: 'round',
              zIndex: 3
            });
          }
        }
      }
    }
    return paths;
  }

  /**
   * Generate spiral connectors that bridge between ring layers.
   * These Archimedean-style spirals add depth and complexity
   * by visually linking the concentric rings.
   */
  generateSpiralConnectors(cx, cy, R, rng, points, viewport = {}) {
    const { minDistance = 0, startTheta = 0, endTheta = Math.PI * 2, skipOptimization = true } = viewport;
    const count = 2 + (this.seed % 3);
    const paths = [];

    for (let i = 0; i < count; i++) {
      const startAngle = rng() * Math.PI * 2;
      const turns = 3 + Math.floor(rng() * 4);
      const innerR = 12 + rng() * 20;
      const outerR = R * (0.5 + rng() * 0.4);
      
      // Skip if the spiral outer bounds never reach the viewport
      const maxRadius = outerR + 3; // 3 is max waveAmp
      if (!skipOptimization && maxRadius < minDistance) {
        continue;
      }

      const thickness = 0.2 + rng() * 0.3;
      const waveAmp = 1 + rng() * 2;
      const waveFreq = 8 + Math.floor(rng() * 12);
      const shade = 20 + rng() * 25;
      const color = `hsl(200, 50%, ${shade}%)`;
      const opacity = 0.08 + rng() * 0.1;

      if (skipOptimization) {
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
          color, thickness, opacity,
          strokeLinecap: 'round', strokeLinejoin: 'round',
          zIndex: 2
        });
      } else {
        // Spirals can cross the visible sector multiple times (multi-turn).
        // Only keep segments that fall inside the sector and meet the minimum radius.
        let currentSegment = [];
        const segments = [];
        for (let j = 0; j <= points; j++) {
          const t = j / points;
          const angle = startAngle + t * turns * Math.PI * 2;
          const baseR = innerR + t * (outerR - innerR);
          const wave = Math.sin(angle * waveFreq) * waveAmp * t;
          const r = baseR + wave;

          // Normalize angle to [0, 2*Math.PI]
          let normAngle = angle % (Math.PI * 2);
          if (normAngle < 0) normAngle += Math.PI * 2;

          const inSector = (normAngle >= startTheta && normAngle <= endTheta);
          const inRadius = (r >= minDistance - 5); // 5 is a safety margin

          if (inSector && inRadius) {
            currentSegment.push([
              cx + r * Math.cos(angle),
              cy + r * Math.sin(angle)
            ]);
          } else {
            if (currentSegment.length > 0) {
              segments.push(currentSegment);
              currentSegment = [];
            }
          }
        }
        if (currentSegment.length > 0) {
          segments.push(currentSegment);
        }

        for (const seg of segments) {
          if (seg.length >= 2) {
            paths.push({
              d: this.buildSmoothPath(seg),
              color, thickness, opacity,
              strokeLinecap: 'round', strokeLinejoin: 'round',
              zIndex: 2
            });
          }
        }
      }
    }
    return paths;
  }

  /**
   * Generate the central medallion — a denser rosette motif at the
   * center of the pattern. Uses tighter rings and higher amplitude
   * modulation to create a focal point.
   */
  generateCentralMedallion(cx, cy, R, rng, points, viewport = {}) {
    const { yMin = -2, skipOptimization = true } = viewport;
    const innerR = 6 + rng() * 8;
    const outerR = innerR + 10 + rng() * 12;
    
    // Default config max outerR is 38. With cy = -45, y coordinate max is -7, completely off-screen.
    // Skip entirely if outerR is too small to reach the visible area
    if (!skipOptimization && cy + outerR + 2 < yMin) {
      return [];
    }

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
  generateRadialSpokes(cx, cy, R, rng, viewport = {}) {
    const { minDistance = 0, startTheta = 0, endTheta = Math.PI * 2, skipOptimization = true } = viewport;
    const count = 12 + Math.floor(rng() * 12);
    const paths = [];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + rng() * 0.1;
      
      // Normalize angle to [0, 2*Math.PI]
      let normAngle = angle % (Math.PI * 2);
      if (normAngle < 0) normAngle += Math.PI * 2;

      // Skip if the spoke is pointing away from the viewport sector
      if (!skipOptimization && (normAngle < startTheta || normAngle > endTheta)) {
        continue;
      }

      const innerR = 3 + rng() * 8;
      const outerR = R * (0.6 + rng() * 0.35);

      if (!skipOptimization && outerR < minDistance) {
        continue;
      }

      const thickness = 0.06 + rng() * 0.1;

      // Start the line at the edge of the viewport (or innerR if innerR is already larger)
      const effectiveInnerR = skipOptimization ? innerR : Math.max(innerR, minDistance);
      if (effectiveInnerR >= outerR) {
        continue;
      }

      const x1 = cx + effectiveInnerR * Math.cos(angle);
      const y1 = cy + effectiveInnerR * Math.sin(angle);
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
  generateMicroDots(cx, cy, R, rng, viewport = {}) {
    const { yMin = -2, yMax = 80, width = 210, minDistance = 0, startTheta = 0, endTheta = Math.PI * 2, skipOptimization = true } = viewport;
    const count = 50 + (this.seed % 80);
    let dots = '';
    for (let i = 0; i < count; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = 8 + rng() * (R - 12);

      if (!skipOptimization) {
        // Fast skip checks for distance and sector angle
        if (dist < minDistance - 5) continue;
        
        let normAngle = angle % (Math.PI * 2);
        if (normAngle < 0) normAngle += Math.PI * 2;
        if (normAngle < startTheta || normAngle > endTheta) continue;
      }

      const x = cx + dist * Math.cos(angle);
      const y = cy + dist * Math.sin(angle);

      // Final boundary check to make sure the dot is visible
      if (!skipOptimization && (x < 0 || x > width || y < yMin || y > yMax)) {
        continue;
      }

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
  generateMoireRings(cx, cy, R, rng, points, viewport = {}) {
    const { minDistance = 0, startTheta = 0, endTheta = Math.PI * 2, arcRatio = 1, skipOptimization = true } = viewport;
    const count = 3 + (this.seed % 3);
    const paths = [];

    for (let i = 0; i < count; i++) {
      const radius = 20 + i * ((R - 30) / count);
      
      // Skip if the ring never reaches viewport
      const maxWaveAmp = 1.3; // amp is 0.5 + rng() * 0.8 (max 1.3)
      if (!skipOptimization && radius + maxWaveAmp < minDistance) {
        continue;
      }

      const phase = rng() * Math.PI * 2;
      const freq = 15 + (this.seed % 10);
      const amp = 0.5 + rng() * 0.8;
      const thickness = 0.5 + rng() * 0.5;
      const opacity = 0.02 + rng() * 0.03;

      const pts = [];
      const numPts = skipOptimization ? points * 2 : Math.ceil(points * 2 * arcRatio);
      const thetaSpan = endTheta - startTheta;

      for (let j = 0; j <= numPts; j++) {
        const theta = startTheta + (j / numPts) * thetaSpan;
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

    const yMin = -2;
    const yMax = height;
    const minDistance = yMin - cy;

    let startTheta = 0;
    let endTheta = Math.PI * 2;
    let arcRatio = 1;
    let skipOptimization = false;

    // Only apply optimizations if the center is located above the viewport
    if (minDistance > 0) {
      const thetaMin = Math.atan2(minDistance, width - cx);
      const thetaMax = Math.atan2(minDistance, -cx);
      // Add a safety margin (0.2 radians) for waves & distortion
      startTheta = Math.max(0, thetaMin - 0.2);
      endTheta = Math.min(Math.PI, thetaMax + 0.2);
      arcRatio = (endTheta - startTheta) / (Math.PI * 2);
    } else {
      skipOptimization = true;
    }

    const viewport = {
      yMin,
      yMax,
      width,
      minDistance,
      startTheta,
      endTheta,
      arcRatio,
      skipOptimization
    };

    const allPaths = [];

    // Layer 1: Radial spokes (background starburst)
    allPaths.push(...this.generateRadialSpokes(cx, cy, R, rng, viewport));

    // Layer 2: Concentric rings with compound waves
    allPaths.push(...this.generateConcentricRings(cx, cy, R, rng, points, viewport));

    // Layer 3: Fine high-frequency rings
    allPaths.push(...this.generateFineRings(cx, cy, R, rng, points, viewport));

    // Layer 4: Cross-hatch intersecting rings
    allPaths.push(...this.generateCrossHatch(cx, cy, R, rng, points, viewport));

    // Layer 5: Spiral connectors bridging ring layers
    allPaths.push(...this.generateSpiralConnectors(cx, cy, R, rng, points, viewport));

    // Layer 6: Lissajous overlay curves
    allPaths.push(...this.generateLissajousCurves(cx, cy, R, rng, points, viewport));

    // Layer 7: Central medallion focal point
    allPaths.push(...this.generateCentralMedallion(cx, cy, R, rng, points, viewport));

    // Layer 8: Moiré interference rings
    allPaths.push(...this.generateMoireRings(cx, cy, R, rng, points, viewport));

    // Sort by zIndex so background elements render first
    allPaths.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    // Render all paths to SVG strings
    let svg = '';
    for (const p of allPaths) {
      svg += `<path d="${p.d}" fill="none" stroke="${p.color}" stroke-width="${p.thickness.toFixed(3)}" stroke-opacity="${p.opacity.toFixed(3)}" stroke-linecap="${p.strokeLinecap}" stroke-linejoin="${p.strokeLinejoin}" />\n`;
    }

    // Layer 9: Micro-dots (rendered as circles, not paths)
    svg += this.generateMicroDots(cx, cy, R, rng, viewport);

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
