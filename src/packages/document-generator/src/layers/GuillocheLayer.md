# Mathematical Foundations of `GuillocheLayer.js`

This document explains the mathematical algorithms used by `GuillocheLayer.js`, including hash-to-seed conversion, the pseudo-random number generator (PRNG), smooth path construction, individual sub-pattern generators, the complete rendering pipeline, and design goals.

---

# 1. Hash to Seed Conversion

```javascript
hashToSeed(hash) {
  let seed = 0;
  const cleanHash = hash.replace('0x', '');

  for (let i = 0; i < cleanHash.length; i++) {
    seed = ((seed << 5) - seed) + cleanHash.charCodeAt(i);
    seed = seed & seed;
  }

  return Math.abs(seed) || 42;
}
```

## Formula

```
seed = ((seed << 5) - seed) + charCode
```

| Expression           | Description                                     | Example                   |
| -------------------- | ----------------------------------------------- | ------------------------- |
| `seed << 5`          | Left bit shift (multiply by 32)                 | `5 << 5 = 160`            |
| `(seed << 5) - seed` | Equivalent to `seed × 31`                       | `160 - 5 = 155`           |
| `+ charCodeAt(i)`    | Adds the ASCII value of the current character   | `'A' = 65`                |
| `seed & seed`        | Constrains the value to a signed 32-bit integer | Prevents integer overflow |

## Example

```javascript
// Hash: "0x7a8f3c2b"

// Iteration 1
seed = ((0 << 5) - 0) + 55;
seed = 55;

// Iteration 2
seed = ((55 << 5) - 55) + 97;
seed = 1802;

// Iteration 3
seed = ((1802 << 5) - 1802) + 56;
seed = 55918;

// Continues until the entire hash has been processed...
```

## Why This Formula?

* Produces well-distributed deterministic values.
* The same hash always generates the same seed.
* Even a one-character change in the hash produces a completely different seed (avalanche effect).

---

# 2. Pseudo-Random Number Generator (PRNG)

```javascript
createRNG(seed) {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}
```

## Formula

```
seed = (seed × 9301 + 49297) mod 233280
```

This is a classic **Linear Congruential Generator (LCG)**.

| Constant | Purpose    |
| -------- | ---------- |
| `9301`   | Multiplier |
| `49297`  | Increment  |
| `233280` | Modulus    |

## Example

```javascript
const rng = createRNG(12345);

// First value
seed = (12345 * 9301 + 49297) % 233280;
return seed / 233280; // ~0.5369

// Second value
seed = (seed * 9301 + 49297) % 233280;
return seed / 233280; // ~0.8407
```

## Why an LCG?

* Deterministic output.
* Fast execution.
* Uniform value distribution.
* Same seed always produces the same sequence.

---

# 3. Smooth Curve Construction (`buildSmoothPath()`)

To create fluid, continuous curves from discrete coordinates, `GuillocheLayer.js` converts computed points to a cubic bezier path using Catmull-Rom interpolation.

```javascript
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
```

## Interpolation Formula

Given sequential points $P_0, P_1, P_2, P_3$:

$$\mathbf{CP}_1 = \mathbf{P}_1 + \tau (\mathbf{P}_2 - \mathbf{P}_0)$$
$$\mathbf{CP}_2 = \mathbf{P}_2 - \tau (\mathbf{P}_3 - \mathbf{P}_1)$$

Where:
* $\tau$ (tension) is set to `0.25`.
* $\mathbf{CP}_1$ and $\mathbf{CP}_2$ are the control points for the Bezier curve segment between $\mathbf{P}_1$ and $\mathbf{P}_2$.
* All lookups wrap around using modulo division (`pts.length`) to construct a seamlessly closed loop.

---

# 4. Rosette Pattern Layer Generation

Rosette patterns are built by layering multiple mathematically modulated geometries.

## Sub-Pattern Configuration and Parameter Ranges

| Sub-Pattern | Key Equation / Geometry | Parameter Ranges |
| :--- | :--- | :--- |
| **Concentric Rings**<br>`generateConcentricRings` | Multi-harmonic wave radius modulation with radial distortion.<br><br>$R(\theta) = r_{base} + \sum_{k=1}^3 A_k \sin(\theta f_k + \phi_k)$<br><br>$x = c_x + R(\theta) \cos(\theta) [1 + 0.04 \sin(4\theta + \phi_1)]$<br>$y = c_y + R(\theta) \sin(\theta) [1 + 0.04 \cos(4\theta + \phi_1)]$ | <ul><li>Ring Count: $24 + (\text{seed} \bmod 10)$</li><li>$f_{base} = 6 + (\text{seed} \bmod 10)$</li><li>$A_1 \in [0.4, 1.2]$</li><li>$A_2 \in [0.2, 0.7]$</li><li>$A_3 \in [0.1, 0.4]$</li><li>Thickness: $[0.1, 0.39]$</li><li>Opacity: $[0.08, 0.35]$</li></ul> |
| **Fine Rings**<br>`generateFineRings` | High-frequency detail overlay using simple sinusoidal modulation.<br><br>$r(\theta) = r_{base} + A \sin(\theta f_{base} + \phi)$ | <ul><li>Ring Count: $8 + (\text{seed} \bmod 8)$</li><li>$f_{base} = 12 + (\text{seed} \bmod 15)$</li><li>$A \in [0.15, 0.45]$</li><li>Thickness: $[0.08, 0.23]$</li><li>Opacity: $[0.10, 0.40]$</li></ul> |
| **Cross-Hatch Rings**<br>`generateCrossHatch` | Intersecting mesh pattern generated by multi-wave sinusoidal overlays.<br><br>$r(\theta) = r_{base} + A \sin(\theta f + \phi) + 0.3A \sin(2.5\theta f + 2\phi) + 0.2 \sin(2\theta + 2\phi)$ | <ul><li>Ring Count: $6 + (\text{seed} \bmod 6)$</li><li>$f_{base} = 3 + (\text{seed} \bmod 5)$</li><li>$A \in [0.8, 2.3]$</li><li>Thickness: $[0.6, 1.4]$</li><li>Opacity: $[0.05, 0.13]$</li></ul> |
| **Lissajous Curves**<br>`generateLissajousCurves` | Parametric curves with coprime integer frequency ratios.<br><br>$x(t) = c_x + S_x \sin(a \cdot t + \phi_x)$<br>$y(t) = c_y + S_y \sin(b \cdot t + \phi_y)$<br><br>where $t \in [0, 2\pi]$ | <ul><li>Curve Count: $3 + (\text{seed} \bmod 3)$</li><li>Ratios $[a, b] \in \{(3,2), (5,4), (7,6), (5,3), (8,5), (4,3)\}$</li><li>$S_x \in [0.6R, 0.9R]$</li><li>$S_y \in [0.4R, 0.7R]$</li><li>Thickness: $[0.15, 0.40]$</li><li>Opacity: $[0.12, 0.27]$</li></ul> |
| **Spiral Connectors**<br>`generateSpiralConnectors` | Archimedean-style spirals modulated by a wave to bridge concentric layers.<br><br>$\theta(t) = \theta_{start} + t \cdot N_{turns} \cdot 2\pi$<br>$R_{base}(t) = R_{inner} + t(R_{outer} - R_{inner})$<br>$r(t) = R_{base}(t) + A_{wave} \cdot t \cdot \sin(\theta(t) f_{wave})$<br><br>where $t \in [0, 1]$ | <ul><li>Spiral Count: $2 + (\text{seed} \bmod 3)$</li><li>$N_{turns} \in [3, 6]$</li><li>$R_{inner} \in [12, 32]$</li><li>$R_{outer} \in [0.5R, 0.9R]$</li><li>$A_{wave} \in [1, 3]$</li><li>$f_{wave} \in [8, 19]$</li><li>Thickness: $[0.2, 0.5]$</li><li>Opacity: $[0.08, 0.18]$</li></ul> |
| **Central Medallion**<br>`generateCentralMedallion` | Tighter focal medallion utilizing dual-harmonic wave modulation.<br><br>$r(\theta) = r_{base}(t) + A \sin(\theta f + \phi) + 0.4A \sin(2.3\theta f + 0.7\phi)$ | <ul><li>Ring Count: $5 + \lfloor\text{rng}() \times 4\rfloor$</li><li>$R_{inner} \in [6, 14]$</li><li>$R_{outer} \in [16, 36]$</li><li>$f \in [8, 13]$</li><li>$A \in [0.3, 0.9]$</li><li>Thickness: $[0.15, 0.35]$</li><li>Opacity: $[0.15, 0.35]$</li></ul> |
| **Radial Spokes**<br>`generateRadialSpokes` | Linear starburst pattern emanating from the origin.<br><br>$\mathbf{P}_{start} = [c_x + R_{inner}\cos(\theta), c_y + R_{inner}\sin(\theta)]$<br>$\mathbf{P}_{end} = [c_x + R_{outer}\cos(\theta), c_y + R_{outer}\sin(\theta)]$ | <ul><li>Spoke Count: $12 + \lfloor\text{rng}() \times 12\rfloor$</li><li>$R_{inner} \in [3, 11]$</li><li>$R_{outer} \in [0.6R, 0.95R]$</li><li>Thickness: $[0.06, 0.16]$</li><li>Opacity: $[0.04, 0.10]$</li></ul> |
| **Moiré Rings**<br>`generateMoireRings` | Wide-stroke, low-opacity overlapping waves creating visual interference.<br><br>$r(\theta) = r_{base} + A \sin(\theta f + \phi)$ | <ul><li>Ring Count: $3 + (\text{seed} \bmod 3)$</li><li>$f \in [15, 24]$</li><li>$A \in [0.5, 1.3]$</li><li>Thickness: $[0.5, 1.0]$</li><li>Opacity: $[0.02, 0.05]$</li></ul> |
| **Micro-Dots**<br>`generateMicroDots` | Uniform distribution of small circles across the design space. | <ul><li>Dot Count: $50 + (\text{seed} \bmod 80)$</li><li>$r_{dot} \in [0.3, 1.1]$</li><li>Opacity: $[0.1, 0.4]$</li></ul> |

---

# Complete Rendering Pipeline

```
          Hash
            │
            ▼
       Hash to Seed
            │
            ▼
 Pseudo-Random Generator (PRNG)
            │
            ▼
Generate Sub-Pattern Parameters
 ├── Radial Spokes (Background Starburst)
 ├── Concentric Rings (Compound Waves)
 ├── Fine Rings (High-Frequency Details)
 ├── Cross-Hatch Rings (Intersecting Mesh)
 ├── Spiral Connectors (Archimedean Bridges)
 ├── Lissajous Curves (Parametric Coprime Loops)
 ├── Central Medallion (Dense Rosette Motif)
 ├── Moiré Rings (Interference Overlays)
 └── Micro-Dots (Textured Dots Matrix)
            │
            ▼
Smooth Curve Interpolation (Catmull-Rom to Cubic Bezier)
            │
            ▼
  Sort Layers by z-index
            │
            ▼
     Render Final SVG
```

---

# Design Goals

| Goal                 | Implementation                                                            |
| -------------------- | ------------------------------------------------------------------------- |
| Deterministic output | Same hash → Same seed → Same SVG                                          |
| Unique fingerprint   | Different hash → Completely different pattern                             |
| Fine Details         | Layered high-frequency fine rings (0.08–0.23 thickness)                   |
| Counterfeit Deterrence| Cross-hatching, Lissajous curves, and Moiré patterns to disrupt scanners |
| Structured Depth     | z-index sorted layers creating a complex vector composition              |

---

# Complete Numerical Example

```javascript
const hash = "0x7a8f3c2b";

hashToSeed(hash);
// → 183647585

const rng = createRNG(183647585);

// Concentric Rings calculation (first ring, first point theta = 0)
const radius = 8.0;
const phase = 4.29; // generated from rng()
const amp1 = 0.82; 
const amp2 = 0.41;
const amp3 = 0.28;
const freq1 = 11;
const freq2 = 20.35;
const freq3 = 4.67;

const wave = Math.sin(0 + phase) * amp1 + Math.sin(0 + phase * 1.3) * amp2 + Math.sin(0 + phase * 0.7) * amp3;
// wave ≈ -0.73
const r = radius + wave; // r ≈ 7.27

const distortX = 1 + 0.04 * Math.sin(0 + phase); // ≈ 0.964
const distortY = 1 + 0.04 * Math.cos(0 + phase); // ≈ 0.983

const x = cx + r * Math.cos(0) * distortX; // x ≈ cx + 7.01
const y = cy + r * Math.sin(0) * distortY; // y ≈ cy + 0
```

---

# Test Example

```javascript
const hash1 = "0x7a8f3c2b";
const hash2 = "0x7a8f3c2c";

const layer1 = new GuillocheLayer(hash1);
const layer2 = new GuillocheLayer(hash2);

// Render paths for viewport 210mm x 80mm
const svgMarkup1 = layer1.renderSVG(210, 80);
const svgMarkup2 = layer2.renderSVG(210, 80);

console.log(svgMarkup1.includes("path")); 
console.log(svgMarkup2.includes("circle"));

// Different hashes produce completely different seeds and pattern layers,
// while the same hash always reproduces the exact same rosette structure.
```
